-- Script de diagnóstico completo del chat
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar usuarios en auth.users
SELECT '=== USUARIOS EN AUTH.USERS ===' as section;
SELECT id, email, created_at, raw_user_meta_data FROM auth.users ORDER BY created_at DESC;

-- 2. Verificar usuarios en profiles
SELECT '=== USUARIOS EN PROFILES ===' as section;
SELECT id, display_name, email, created_at FROM profiles ORDER BY created_at DESC;

-- 3. Verificar conversaciones
SELECT '=== CONVERSACIONES ===' as section;
SELECT 
    c.id, 
    c.buyer_id, 
    c.seller_id, 
    c.last_message,
    c.last_message_at,
    b.display_name as buyer_name,
    b.email as buyer_email,
    s.display_name as seller_name,
    s.email as seller_email
FROM conversations c
LEFT JOIN profiles b ON c.buyer_id = b.id
LEFT JOIN profiles s ON c.seller_id = s.id
ORDER BY c.created_at DESC;

-- 4. Verificar mensajes
SELECT '=== MENSAJES ===' as section;
SELECT 
    m.id,
    m.conversation_id,
    m.sender_id,
    m.content,
    m.created_at,
    p.display_name as sender_name,
    p.email as sender_email
FROM messages m
LEFT JOIN profiles p ON m.sender_id = p.id
ORDER BY m.created_at DESC;

-- 5. Verificar políticas RLS
SELECT '=== POLÍTICAS RLS ===' as section;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('profiles', 'conversations', 'messages')
ORDER BY tablename, policyname;

-- 6. Verificar permisos de usuario actual
SELECT '=== USUARIO ACTUAL ===' as section;
SELECT auth.uid() as current_user_id;

-- 7. Verificar si el usuario actual puede ver profiles
SELECT '=== PERFILES VISIBLES PARA USUARIO ACTUAL ===' as section;
SELECT id, display_name, email FROM profiles WHERE id = auth.uid();

-- 8. Verificar si el usuario actual puede ver conversaciones
SELECT '=== CONVERSACIONES VISIBLES PARA USUARIO ACTUAL ===' as section;
SELECT 
    c.id, 
    c.buyer_id, 
    c.seller_id,
    b.display_name as buyer_name,
    s.display_name as seller_name
FROM conversations c
LEFT JOIN profiles b ON c.buyer_id = b.id
LEFT JOIN profiles s ON c.seller_id = s.id
WHERE c.buyer_id = auth.uid() OR c.seller_id = auth.uid();

-- 9. Verificar si el usuario actual puede ver mensajes
SELECT '=== MENSAJES VISIBLES PARA USUARIO ACTUAL ===' as section;
SELECT 
    m.id,
    m.conversation_id,
    m.content,
    m.created_at
FROM messages m
WHERE EXISTS (
    SELECT 1 FROM conversations c 
    WHERE c.id = m.conversation_id 
    AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
);

-- 10. Resumen final
SELECT '=== RESUMEN FINAL ===' as section;
SELECT 
    'Usuarios en auth.users' as tabla,
    COUNT(*) as registros
FROM auth.users
UNION ALL
SELECT 
    'Usuarios en profiles' as tabla,
    COUNT(*) as registros
FROM profiles
UNION ALL
SELECT 
    'Conversaciones' as tabla,
    COUNT(*) as registros
FROM conversations
UNION ALL
SELECT 
    'Mensajes' as tabla,
    COUNT(*) as registros
FROM messages;
