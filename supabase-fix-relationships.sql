-- Script para arreglar las relaciones entre tablas
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar que las tablas existen
SELECT '=== VERIFICANDO TABLAS ===' as section;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'conversations', 'messages')
ORDER BY table_name;

-- 2. Verificar las columnas de las tablas
SELECT '=== COLUMNAS DE PROFILES ===' as section;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '=== COLUMNAS DE CONVERSATIONS ===' as section;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'conversations' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '=== COLUMNAS DE MESSAGES ===' as section;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'messages' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar las foreign keys existentes
SELECT '=== FOREIGN KEYS EXISTENTES ===' as section;
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
AND tc.table_name IN ('profiles', 'conversations', 'messages')
ORDER BY tc.table_name, kcu.column_name;

-- 4. Eliminar foreign keys existentes si hay problemas
ALTER TABLE IF EXISTS conversations DROP CONSTRAINT IF EXISTS conversations_buyer_id_fkey;
ALTER TABLE IF EXISTS conversations DROP CONSTRAINT IF EXISTS conversations_seller_id_fkey;
ALTER TABLE IF EXISTS conversations DROP CONSTRAINT IF EXISTS conversations_product_id_fkey;
ALTER TABLE IF EXISTS messages DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;
ALTER TABLE IF EXISTS messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

-- 5. Recrear las foreign keys correctamente
ALTER TABLE conversations 
ADD CONSTRAINT conversations_buyer_id_fkey 
FOREIGN KEY (buyer_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE conversations 
ADD CONSTRAINT conversations_seller_id_fkey 
FOREIGN KEY (seller_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE messages 
ADD CONSTRAINT messages_conversation_id_fkey 
FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;

ALTER TABLE messages 
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 6. Verificar que las foreign keys se crearon correctamente
SELECT '=== FOREIGN KEYS CREADAS ===' as section;
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
AND tc.table_name IN ('profiles', 'conversations', 'messages')
ORDER BY tc.table_name, kcu.column_name;

-- 7. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- 8. Verificar que todo funciona con una consulta de prueba
SELECT '=== PRUEBA DE RELACIONES ===' as section;
SELECT 
    c.id as conversation_id,
    c.buyer_id,
    c.seller_id,
    b.display_name as buyer_name,
    b.email as buyer_email,
    s.display_name as seller_name,
    s.email as seller_email
FROM conversations c
LEFT JOIN profiles b ON c.buyer_id = b.id
LEFT JOIN profiles s ON c.seller_id = s.id
LIMIT 3;

-- 9. Verificar mensajes con relaciones
SELECT '=== PRUEBA DE MENSAJES ===' as section;
SELECT 
    m.id as message_id,
    m.conversation_id,
    m.content,
    m.created_at,
    p.display_name as sender_name,
    p.email as sender_email
FROM messages m
LEFT JOIN profiles p ON m.sender_id = p.id
LIMIT 3;

SELECT '✅ Relaciones configuradas correctamente' as status;
