-- Script para sincronizar usuarios reales existentes
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar usuarios existentes en auth.users
SELECT 
    'Usuarios en auth.users:' as status,
    COUNT(*) as total_users
FROM auth.users;

-- 2. Mostrar usuarios de auth.users
SELECT 
    id,
    email,
    raw_user_meta_data->>'display_name' as display_name,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- 3. Sincronizar usuarios reales a la tabla profiles
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
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL
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

-- 4. Verificar usuarios en profiles después de la sincronización
SELECT 
    'Usuarios en profiles después de sincronización:' as status,
    COUNT(*) as total_profiles
FROM profiles;

-- 5. Mostrar usuarios disponibles para chat
SELECT 
    'Usuarios disponibles para chat:' as status;
    
SELECT 
    id,
    display_name,
    email,
    location,
    created_at
FROM profiles
ORDER BY display_name;

-- 6. Verificar conversaciones existentes
SELECT 
    'Conversaciones existentes:' as status,
    COUNT(*) as total_conversations
FROM conversations;

-- 7. Mostrar conversaciones con detalles de usuarios
SELECT 
    'Detalles de conversaciones:' as status;
    
SELECT 
    c.id,
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

-- 8. Verificar mensajes existentes
SELECT 
    'Mensajes existentes:' as status,
    COUNT(*) as total_messages
FROM messages;

-- 9. Mostrar mensajes con detalles
SELECT 
    'Detalles de mensajes:' as status;
    
SELECT 
    m.id,
    m.conversation_id,
    m.sender_id,
    p.display_name as sender_name,
    p.email as sender_email,
    m.content,
    m.created_at
FROM messages m
LEFT JOIN profiles p ON p.id = m.sender_id
ORDER BY m.created_at DESC;

-- 10. Estado final
SELECT 
    'ESTADO FINAL DEL CHAT:' as status,
    (SELECT COUNT(*) FROM profiles) as usuarios_disponibles,
    (SELECT COUNT(*) FROM conversations) as conversaciones_activas,
    (SELECT COUNT(*) FROM messages) as mensajes_totales;

-- Mensaje final
SELECT 'Usuarios reales sincronizados exitosamente. El chat ahora debería mostrar usuarios reales.' as message;
