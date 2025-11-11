-- =====================================================
-- FIXES PARA SUPABASE - System Eco (Versión Limpia)
-- Ejecutar en Supabase SQL Editor
-- ADVERTENCIA: Esto eliminará las tablas de gamificación si existen
-- =====================================================

-- 1. CREAR FUNCIÓN RPC increment_views
-- =====================================================
CREATE OR REPLACE FUNCTION increment_views(product_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE products
    SET views = views + 1
    WHERE id = product_id;
END;
$$;

COMMENT ON FUNCTION increment_views(UUID) IS 'Incrementa el contador de vistas de un producto';

-- =====================================================
-- 2. CORREGIR PERMISOS DE message_reads
-- =====================================================

DROP POLICY IF EXISTS "Users can update their own message reads" ON message_reads;
CREATE POLICY "Users can update their own message reads" ON message_reads
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can upsert their own message reads" ON message_reads;
CREATE POLICY "Users can upsert their own message reads" ON message_reads
    FOR ALL USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 3. CREAR TABLAS PARA GAMIFICACIÓN (Versión Limpia)
-- =====================================================

-- Eliminar tablas existentes si tienen problemas
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS user_actions CASCADE;
DROP TABLE IF EXISTS user_points CASCADE;

-- Tabla de puntos de usuario
CREATE TABLE user_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    total_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de badges
CREATE TABLE badges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    points_required INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de badges de usuario
CREATE TABLE user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    badge_id TEXT REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Tabla de acciones del usuario
CREATE TABLE user_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_user_points_user_id ON user_points(user_id);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX idx_user_actions_created_at ON user_actions(created_at DESC);

-- Habilitar RLS
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- user_points
CREATE POLICY "Users can view their own points" ON user_points
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own points" ON user_points
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own points" ON user_points
    FOR UPDATE USING (user_id = auth.uid());

-- badges
CREATE POLICY "Anyone can view badges" ON badges
    FOR SELECT USING (true);

-- user_badges
CREATE POLICY "Users can view their own badges" ON user_badges
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own badges" ON user_badges
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- user_actions
CREATE POLICY "Users can view their own actions" ON user_actions
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own actions" ON user_actions
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Trigger para updated_at
CREATE TRIGGER update_user_points_updated_at 
    BEFORE UPDATE ON user_points 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar badges iniciales
INSERT INTO badges (id, name, description, icon, points_required) VALUES
    ('points_100', 'Primeros 100 puntos', 'Has alcanzado tus primeros 100 puntos', 'Trophy', 100),
    ('points_500', 'Coleccionista', 'Has alcanzado 500 puntos', 'Award', 500),
    ('points_1000', 'Experto', 'Has alcanzado 1000 puntos', 'Crown', 1000),
    ('publisher_5', 'Publicador', 'Has publicado 5 productos', 'Gift', 0),
    ('collector_10', 'Coleccionista de Favoritos', 'Has agregado 10 productos a favoritos', 'Heart', 0),
    ('first_product', 'Primer Producto', 'Publicaste tu primer producto', 'Gift', 0),
    ('eco_warrior', 'Eco Warrior', 'Ayudaste al medio ambiente', 'Leaf', 0);

-- Verificación
SELECT 'Función increment_views creada' as status
WHERE EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'increment_views'
);

SELECT 'Tablas de gamificación creadas' as status
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name IN ('badges', 'user_badges', 'user_points', 'user_actions')
);

