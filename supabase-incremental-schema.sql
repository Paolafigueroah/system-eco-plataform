-- Script incremental para añadir solo lo que falta
-- Ejecutar en el SQL Editor de Supabase

-- 1. Crear tabla user_points si no existe
CREATE TABLE IF NOT EXISTS user_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. Crear tabla user_badges si no existe
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_name VARCHAR(100) NOT NULL,
    badge_description TEXT,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_name)
);

-- 3. Crear tabla notifications si no existe
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- 4. Crear tabla profiles si no existe
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    location VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);

-- 6. Crear políticas RLS solo si no existen
-- Para user_points
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_points' AND policyname = 'Users can view their own points') THEN
        CREATE POLICY "Users can view their own points" ON user_points
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_points' AND policyname = 'Users can update their own points') THEN
        CREATE POLICY "Users can update their own points" ON user_points
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Para user_badges
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'Users can view their own badges') THEN
        CREATE POLICY "Users can view their own badges" ON user_badges
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'Users can insert their own badges') THEN
        CREATE POLICY "Users can insert their own badges" ON user_badges
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Para notifications
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view their own notifications') THEN
        CREATE POLICY "Users can view their own notifications" ON notifications
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can update their own notifications') THEN
        CREATE POLICY "Users can update their own notifications" ON notifications
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Para profiles
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view all profiles') THEN
        CREATE POLICY "Users can view all profiles" ON profiles
            FOR SELECT USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON profiles
            FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
        CREATE POLICY "Users can insert their own profile" ON profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- 7. Crear funciones si no existen
-- Función para incrementar vistas
CREATE OR REPLACE FUNCTION increment_product_views(product_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE products 
    SET views = COALESCE(views, 0) + 1 
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para incrementar favoritos
CREATE OR REPLACE FUNCTION increment_product_favorites(product_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE products 
    SET favorites = COALESCE(favorites, 0) + 1 
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para decrementar favoritos
CREATE OR REPLACE FUNCTION decrement_product_favorites(product_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE products 
    SET favorites = GREATEST(COALESCE(favorites, 0) - 1, 0) 
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Crear triggers si no existen
-- Trigger para actualizar updated_at en user_points
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_points_updated_at') THEN
        CREATE TRIGGER update_user_points_updated_at
            BEFORE UPDATE ON user_points
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Trigger para actualizar updated_at en profiles
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
        CREATE TRIGGER update_profiles_updated_at
            BEFORE UPDATE ON profiles
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 9. Habilitar RLS en las tablas si no está habilitado
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 10. Crear función de actualización de updated_at si no existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Mensaje de confirmación
SELECT 'Script incremental ejecutado exitosamente. Se añadieron solo las tablas y políticas que faltaban.' as message;
