-- SCRIPT FINAL PARA ARREGLAR EL CHAT DEFINITIVAMENTE
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar estado actual
SELECT 'VERIFICANDO ESTADO ACTUAL...' as status;

SELECT 
    'Usuarios en auth.users:' as item,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Usuarios en profiles:' as item,
    COUNT(*) as count
FROM profiles
UNION ALL
SELECT 
    'Conversaciones:' as item,
    COUNT(*) as count
FROM conversations
UNION ALL
SELECT 
    'Mensajes:' as item,
    COUNT(*) as count
FROM messages;

-- 2. Sincronizar TODOS los usuarios de auth.users a profiles
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

-- 3. Verificar que las políticas RLS están correctas
-- Eliminar políticas existentes
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "conversations_select_policy" ON conversations;
DROP POLICY IF EXISTS "conversations_insert_policy" ON conversations;
DROP POLICY IF EXISTS "conversations_update_policy" ON conversations;
DROP POLICY IF EXISTS "messages_select_policy" ON messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON messages;
DROP POLICY IF EXISTS "messages_update_policy" ON messages;

-- Crear políticas nuevas
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

-- 4. Mostrar usuarios disponibles para chat
SELECT 'USUARIOS DISPONIBLES PARA CHAT:' as status;

SELECT 
    id,
    display_name,
    email,
    created_at
FROM profiles
ORDER BY display_name;

-- 5. Mostrar conversaciones existentes con detalles
SELECT 'CONVERSACIONES EXISTENTES:' as status;

SELECT 
    c.id as conversation_id,
    c.buyer_id,
    c.seller_id,
    b.display_name as buyer_name,
    b.email as buyer_email,
    s.display_name as seller_name,
    s.email as seller_email,
    c.last_message,
    c.created_at
FROM conversations c
LEFT JOIN profiles b ON b.id = c.buyer_id
LEFT JOIN profiles s ON s.id = c.seller_id
ORDER BY c.created_at DESC;

-- 6. Mostrar mensajes existentes
SELECT 'MENSAJES EXISTENTES:' as status;

SELECT 
    m.id as message_id,
    m.conversation_id,
    m.sender_id,
    p.display_name as sender_name,
    p.email as sender_email,
    m.content,
    m.created_at
FROM messages m
LEFT JOIN profiles p ON p.id = m.sender_id
ORDER BY m.created_at DESC;

-- 7. Estado final
SELECT 'ESTADO FINAL:' as status;

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

-- Mensaje final
SELECT 'CHAT ARREGLADO DEFINITIVAMENTE. Ahora debería funcionar correctamente.' as message;
