-- Schema para el sistema de reviews y ratings
-- Ejecutar en Supabase SQL Editor

-- Tabla de reviews
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT NOT NULL,
    recommend BOOLEAN DEFAULT true,
    helpful INTEGER DEFAULT 0,
    not_helpful INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Evitar reseñas duplicadas del mismo usuario para el mismo producto
    UNIQUE(product_id, user_id)
);

-- Tabla para tracking de votos útiles/no útiles
CREATE TABLE IF NOT EXISTS review_helpful (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Un usuario solo puede votar una vez por reseña
    UNIQUE(review_id, user_id)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_helpful_review_id ON review_helpful(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpful_user_id ON review_helpful(user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en reviews
CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar contadores de helpful/not_helpful
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.helpful THEN
            UPDATE reviews SET helpful = helpful + 1 WHERE id = NEW.review_id;
        ELSE
            UPDATE reviews SET not_helpful = not_helpful + 1 WHERE id = NEW.review_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Si cambió el voto, actualizar ambos contadores
        IF OLD.helpful != NEW.helpful THEN
            IF OLD.helpful THEN
                UPDATE reviews SET helpful = helpful - 1 WHERE id = NEW.review_id;
                UPDATE reviews SET not_helpful = not_helpful + 1 WHERE id = NEW.review_id;
            ELSE
                UPDATE reviews SET not_helpful = not_helpful - 1 WHERE id = NEW.review_id;
                UPDATE reviews SET helpful = helpful + 1 WHERE id = NEW.review_id;
            END IF;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.helpful THEN
            UPDATE reviews SET helpful = helpful - 1 WHERE id = OLD.review_id;
        ELSE
            UPDATE reviews SET not_helpful = not_helpful - 1 WHERE id = OLD.review_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger para actualizar contadores automáticamente
CREATE TRIGGER update_review_helpful_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON review_helpful
    FOR EACH ROW
    EXECUTE FUNCTION update_review_helpful_count();

-- RLS (Row Level Security) Policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful ENABLE ROW LEVEL SECURITY;

-- Políticas para reviews
CREATE POLICY "Reviews are viewable by everyone" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para review_helpful
CREATE POLICY "Review helpful votes are viewable by everyone" ON review_helpful
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own votes" ON review_helpful
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON review_helpful
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON review_helpful
    FOR DELETE USING (auth.uid() = user_id);

-- Función para obtener estadísticas de reviews de un producto
CREATE OR REPLACE FUNCTION get_product_review_stats(product_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total', COUNT(*),
        'average', ROUND(AVG(rating)::numeric, 2),
        'distribution', json_agg(
            json_build_object(
                'rating', rating,
                'count', rating_count
            )
        )
    ) INTO result
    FROM (
        SELECT 
            rating,
            COUNT(*) as rating_count
        FROM reviews 
        WHERE product_id = product_uuid
        GROUP BY rating
        ORDER BY rating DESC
    ) stats;
    
    RETURN COALESCE(result, '{"total": 0, "average": 0, "distribution": []}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios para documentación
COMMENT ON TABLE reviews IS 'Reseñas y calificaciones de productos';
COMMENT ON TABLE review_helpful IS 'Votos de útil/no útil para reseñas';
COMMENT ON FUNCTION get_product_review_stats(UUID) IS 'Obtiene estadísticas de reviews para un producto específico';

-- Datos de ejemplo (opcional)
-- INSERT INTO reviews (product_id, user_id, rating, title, comment, recommend) VALUES
-- ('product-uuid-1', 'user-uuid-1', 5, 'Excelente producto', 'Muy satisfecho con la calidad', true),
-- ('product-uuid-1', 'user-uuid-2', 4, 'Buen producto', 'Cumple con las expectativas', true),
-- ('product-uuid-1', 'user-uuid-3', 3, 'Regular', 'Podría ser mejor', false);
