-- SCRIPT COMPLETO PARA ARREGLAR EL CHAT EN TIEMPO REAL
-- Ejecutar en el SQL Editor de Supabase

-- 1. LIMPIAR TODO Y EMPEZAR DE NUEVO
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. CREAR TABLAS DESDE CERO CON CONFIGURACIÓN CORRECTA
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name VARCHAR(100),
    email VARCHAR(255),
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

-- 4. CREAR POLÍTICAS RLS CORRECTAS
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

-- 5. CREAR ÍNDICES PARA OPTIMIZACIÓN
CREATE INDEX idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- 6. SINCRONIZAR USUARIOS REALES
INSERT INTO profiles (id, display_name, email, bio, location, created_at, updated_at)
SELECT 
    au.id,
    COALESCE(
        au.raw_user_meta_data->>'display_name',
        au.raw_user_meta_data->>'full_name',
        au.email,
        'Usuario ' || SUBSTRING(au.id::text, 1, 8)
    ) as display_name,
    au.email,
    'Usuario de System Eco' as bio,
    'Ubicación no especificada' as location,
    au.created_at,
    NOW()
FROM auth.users au
ON CONFLICT (id) DO UPDATE SET
    display_name = COALESCE(
        EXCLUDED.display_name,
        profiles.display_name
    ),
    email = COALESCE(
        EXCLUDED.email,
        profiles.email
    ),
    updated_at = NOW();

-- 7. CREAR CONVERSACIÓN DE PRUEBA
INSERT INTO conversations (buyer_id, seller_id, created_at, updated_at) VALUES
(
    (SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1),
    (SELECT id FROM profiles ORDER BY created_at ASC OFFSET 1 LIMIT 1),
    NOW(),
    NOW()
);

-- 8. CREAR MENSAJES DE PRUEBA
INSERT INTO messages (conversation_id, sender_id, content, message_type, created_at) VALUES
(
    (SELECT id FROM conversations LIMIT 1),
    (SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1),
    'Hola! Este es un mensaje de prueba.',
    'text',
    NOW()
),
(
    (SELECT id FROM conversations LIMIT 1),
    (SELECT id FROM profiles ORDER BY created_at ASC OFFSET 1 LIMIT 1),
    'Hola! ¿Cómo estás?',
    'text',
    NOW()
);

-- 9. ACTUALIZAR CONVERSACIÓN CON ÚLTIMO MENSAJE
UPDATE conversations 
SET 
    last_message = 'Hola! ¿Cómo estás?',
    last_message_at = NOW(),
    updated_at = NOW()
WHERE id = (SELECT id FROM conversations LIMIT 1);

-- 10. VERIFICAR RESULTADO
SELECT 'CHAT CONFIGURADO EXITOSAMENTE:' as status;

SELECT 
    'Usuarios disponibles:' as item,
    COUNT(*) as count
FROM profiles
UNION ALL
SELECT 
    'Conversaciones activas:' as item,
    COUNT(*) as count
FROM conversations
UNION ALL
SELECT 
    'Mensajes totales:' as item,
    COUNT(*) as count
FROM messages;

-- 11. MOSTRAR USUARIOS DISPONIBLES
SELECT 'USUARIOS DISPONIBLES PARA CHAT:' as status;

SELECT 
    id,
    display_name,
    email,
    created_at
FROM profiles
ORDER BY display_name;

-- 12. MOSTRAR CONVERSACIONES
SELECT 'CONVERSACIONES CREADAS:' as status;

SELECT 
    c.id as conversation_id,
    b.display_name as buyer_name,
    s.display_name as seller_name,
    c.last_message,
    c.created_at
FROM conversations c
LEFT JOIN profiles b ON b.id = c.buyer_id
LEFT JOIN profiles s ON s.id = c.seller_id;

-- 13. MOSTRAR MENSAJES
SELECT 'MENSAJES CREADOS:' as status;

SELECT 
    m.id as message_id,
    p.display_name as sender_name,
    m.content,
    m.created_at
FROM messages m
LEFT JOIN profiles p ON p.id = m.sender_id;

-- MENSAJE FINAL
SELECT '¡CHAT EN TIEMPO REAL CONFIGURADO EXITOSAMENTE!' as message;
