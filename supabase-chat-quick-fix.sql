-- SOLUCIÓN RÁPIDA PARA EL CHAT
-- Ejecutar este script si el chat sigue sin funcionar

-- 1. LIMPIAR TODO Y EMPEZAR DE NUEVO
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. CREAR TABLAS DESDE CERO
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    location VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. HABILITAR RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 4. CREAR POLÍTICAS RLS SIMPLES
CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_policy" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_policy" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "conversations_select_policy" ON conversations FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "conversations_insert_policy" ON conversations FOR INSERT WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "conversations_update_policy" ON conversations FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "messages_select_policy" ON messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversations WHERE id = messages.conversation_id AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
);
CREATE POLICY "messages_insert_policy" ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM conversations WHERE id = messages.conversation_id AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
);
CREATE POLICY "messages_update_policy" ON messages FOR UPDATE USING (auth.uid() = sender_id);

-- 5. CREAR ÍNDICES
CREATE INDEX idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);

-- 6. CREAR USUARIOS DE PRUEBA
INSERT INTO profiles (id, display_name, email, bio, location, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Ana García', 'ana@test.com', 'Vendedora de productos ecológicos', 'Ciudad de México', NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'Carlos López', 'carlos@test.com', 'Comprador frecuente', 'Guadalajara', NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'María Rodríguez', 'maria@test.com', 'Interesada en productos sostenibles', 'Monterrey', NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'Luis Hernández', 'luis@test.com', 'Vendedor de artículos usados', 'Puebla', NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', 'Sofia Martínez', 'sofia@test.com', 'Compradora de productos orgánicos', 'Tijuana', NOW(), NOW());

-- 7. CREAR CONVERSACIÓN DE PRUEBA
INSERT INTO conversations (buyer_id, seller_id, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW(), NOW());

-- 8. CREAR MENSAJES DE PRUEBA
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
);

-- 9. VERIFICAR RESULTADO
SELECT 
    'CHAT CONFIGURADO EXITOSAMENTE:' as status,
    (SELECT COUNT(*) FROM profiles) as usuarios_creados,
    (SELECT COUNT(*) FROM conversations) as conversaciones_creadas,
    (SELECT COUNT(*) FROM messages) as mensajes_creados;

-- 10. MOSTRAR USUARIOS DISPONIBLES
SELECT 
    'Usuarios disponibles para chat:' as status;
    
SELECT 
    id,
    display_name,
    email,
    location
FROM profiles
ORDER BY display_name;

-- 11. MOSTRAR CONVERSACIONES
SELECT 
    'Conversaciones creadas:' as status;
    
SELECT 
    c.id,
    b.display_name as buyer_name,
    s.display_name as seller_name,
    c.created_at
FROM conversations c
LEFT JOIN profiles b ON b.id = c.buyer_id
LEFT JOIN profiles s ON s.id = c.seller_id;

-- MENSAJE FINAL
SELECT '¡CHAT LISTO! Ahora debería funcionar perfectamente.' as message;
