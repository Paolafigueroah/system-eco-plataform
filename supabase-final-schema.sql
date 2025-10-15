-- Esquema final y completo para Supabase - System Eco
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- 1. CREAR TABLAS PRINCIPALES
-- =====================================================

-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT,
    email TEXT UNIQUE NOT NULL,
    bio TEXT DEFAULT 'Usuario de System Eco',
    location TEXT DEFAULT 'Colombia',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    condition_product TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sell', 'exchange', 'donate')),
    price DECIMAL(10,2) DEFAULT 0,
    location TEXT,
    images TEXT[] DEFAULT '{}',
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de conversaciones
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(buyer_id, seller_id, product_id)
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mensajes leídos
CREATE TABLE IF NOT EXISTS message_reads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Tabla de favoritos
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('message', 'favorite', 'product', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
    UNIQUE(product_id, user_id)
);

-- Tabla para tracking de votos útiles/no útiles
CREATE TABLE IF NOT EXISTS review_helpful (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);

-- =====================================================
-- 2. CREAR ÍNDICES PARA RENDIMIENTO
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_product_id ON conversations(product_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- =====================================================
-- 3. CREAR FUNCIONES DE UTILIDAD
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Función para crear perfil automáticamente después del registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, email, bio, location)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
        NEW.email,
        'Usuario de System Eco',
        'Colombia'
    )
    ON CONFLICT (id) DO UPDATE SET
        display_name = COALESCE(NEW.raw_user_meta_data->>'display_name', profiles.display_name),
        email = NEW.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- =====================================================
-- 4. CREAR TRIGGERS
-- =====================================================

-- Trigger para actualizar updated_at en profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en conversations
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en reviews
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para actualizar contadores de helpful
DROP TRIGGER IF EXISTS update_review_helpful_count_trigger ON review_helpful;
CREATE TRIGGER update_review_helpful_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON review_helpful
    FOR EACH ROW
    EXECUTE FUNCTION update_review_helpful_count();

-- =====================================================
-- 5. CONFIGURAR RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREAR POLÍTICAS RLS
-- =====================================================

-- Políticas para profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para products
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Users can insert their own products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;

CREATE POLICY "Anyone can view products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own products" ON products
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own products" ON products
    FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own products" ON products
    FOR DELETE USING (auth.uid() = seller_id);

-- Políticas para conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;

CREATE POLICY "Users can view their own conversations" ON conversations
    FOR SELECT USING (
        buyer_id = auth.uid() OR seller_id = auth.uid()
    );

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (
        buyer_id = auth.uid() OR seller_id = auth.uid()
    );

CREATE POLICY "Users can update their own conversations" ON conversations
    FOR UPDATE USING (
        buyer_id = auth.uid() OR seller_id = auth.uid()
    );

-- Políticas para messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;

CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert messages in their conversations" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
    );

-- Políticas para message_reads
DROP POLICY IF EXISTS "Users can view their own message reads" ON message_reads;
DROP POLICY IF EXISTS "Users can insert their own message reads" ON message_reads;

CREATE POLICY "Users can view their own message reads" ON message_reads
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own message reads" ON message_reads
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Políticas para favorites
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

CREATE POLICY "Users can view their own favorites" ON favorites
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own favorites" ON favorites
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own favorites" ON favorites
    FOR DELETE USING (user_id = auth.uid());

-- Políticas para notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own notifications" ON notifications
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Políticas para reviews
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Users can insert their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;

CREATE POLICY "Reviews are viewable by everyone" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para review_helpful
DROP POLICY IF EXISTS "Review helpful votes are viewable by everyone" ON review_helpful;
DROP POLICY IF EXISTS "Users can insert their own votes" ON review_helpful;
DROP POLICY IF EXISTS "Users can update their own votes" ON review_helpful;
DROP POLICY IF EXISTS "Users can delete their own votes" ON review_helpful;

CREATE POLICY "Review helpful votes are viewable by everyone" ON review_helpful
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own votes" ON review_helpful
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON review_helpful
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON review_helpful
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 7. VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que las tablas existen y tienen RLS habilitado
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled' 
        ELSE '❌ RLS Disabled' 
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'products', 'conversations', 'messages', 'favorites', 'notifications', 'reviews', 'review_helpful')
ORDER BY tablename;

-- Mostrar las políticas creadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Comentarios para documentación
COMMENT ON TABLE profiles IS 'Perfiles de usuarios de la plataforma';
COMMENT ON TABLE products IS 'Productos disponibles para intercambio';
COMMENT ON TABLE conversations IS 'Conversaciones entre compradores y vendedores';
COMMENT ON TABLE messages IS 'Mensajes en las conversaciones';
COMMENT ON TABLE favorites IS 'Productos favoritos de los usuarios';
COMMENT ON TABLE notifications IS 'Notificaciones del sistema';
COMMENT ON TABLE reviews IS 'Reseñas y calificaciones de productos';
COMMENT ON FUNCTION public.handle_new_user() IS 'Crea automáticamente un perfil cuando se registra un nuevo usuario';
