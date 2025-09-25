-- Script para forzar la configuración completa del chat
-- Ejecutar si el diagnóstico muestra problemas

-- 1. Asegurar que las tablas existen
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

CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas RLS (eliminar existentes primero)
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- Crear políticas nuevas
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own conversations" ON conversations
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can update their own conversations" ON conversations
    FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE id = messages.conversation_id 
            AND (buyer_id = auth.uid() OR seller_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages in their conversations" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE id = messages.conversation_id 
            AND (buyer_id = auth.uid() OR seller_id = auth.uid())
        )
    );

CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- 4. Crear índices
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- 5. Crear usuarios de prueba
INSERT INTO profiles (id, display_name, email, bio, location, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Ana García', 'ana@test.com', 'Vendedora de productos ecológicos', 'Ciudad de México', NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'Carlos López', 'carlos@test.com', 'Comprador frecuente', 'Guadalajara', NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'María Rodríguez', 'maria@test.com', 'Interesada en productos sostenibles', 'Monterrey', NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'Luis Hernández', 'luis@test.com', 'Vendedor de artículos usados', 'Puebla', NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', 'Sofia Martínez', 'sofia@test.com', 'Compradora de productos orgánicos', 'Tijuana', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    email = EXCLUDED.email,
    updated_at = NOW();

-- 6. Crear conversación de prueba
INSERT INTO conversations (buyer_id, seller_id, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 7. Crear mensajes de prueba
INSERT INTO messages (conversation_id, sender_id, content, message_type, created_at) VALUES
(
    (SELECT id FROM conversations LIMIT 1),
    '11111111-1111-1111-1111-111111111111',
    'Hola! ¿Está disponible este producto?',
    'text',
    NOW()
),
(
    (SELECT id FROM conversations LIMIT 1),
    '22222222-2222-2222-2222-222222222222',
    'Sí, está disponible. ¿Te interesa?',
    'text',
    NOW()
)
ON CONFLICT DO NOTHING;

-- 8. Verificar el resultado
SELECT 
    'CONFIGURACIÓN COMPLETADA:' as status,
    (SELECT COUNT(*) FROM profiles) as usuarios_creados,
    (SELECT COUNT(*) FROM conversations) as conversaciones_creadas,
    (SELECT COUNT(*) FROM messages) as mensajes_creados;

-- 9. Mostrar usuarios disponibles
SELECT 
    'Usuarios disponibles para chat:' as status;
    
SELECT 
    id,
    display_name,
    email,
    location
FROM profiles
ORDER BY display_name;

-- Mensaje final
SELECT 'Chat configurado exitosamente. Ahora debería funcionar correctamente.' as message;
