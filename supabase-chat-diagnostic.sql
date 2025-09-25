-- Script de diagnóstico completo para el chat
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar que las tablas existen
SELECT 
    'Verificando tablas...' as status;

SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('profiles', 'conversations', 'messages', 'user_points', 'user_badges', 'notifications') 
        THEN '✓ Existe'
        ELSE '✗ No existe'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'conversations', 'messages', 'user_points', 'user_badges', 'notifications');

-- 2. Verificar usuarios en auth.users
SELECT 
    'Usuarios en auth.users:' as status,
    COUNT(*) as total_users
FROM auth.users;

-- 3. Verificar usuarios en profiles
SELECT 
    'Usuarios en profiles:' as status,
    COUNT(*) as total_profiles
FROM profiles;

-- 4. Mostrar usuarios disponibles
SELECT 
    'Usuarios disponibles para chat:' as status;
    
SELECT 
    id,
    display_name,
    email,
    created_at
FROM profiles
ORDER BY created_at DESC;

-- 5. Verificar conversaciones existentes
SELECT 
    'Conversaciones existentes:' as status,
    COUNT(*) as total_conversations
FROM conversations;

-- 6. Mostrar conversaciones con detalles
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
    c.created_at
FROM conversations c
LEFT JOIN profiles b ON b.id = c.buyer_id
LEFT JOIN profiles s ON s.id = c.seller_id
ORDER BY c.created_at DESC;

-- 7. Verificar mensajes existentes
SELECT 
    'Mensajes existentes:' as status,
    COUNT(*) as total_messages
FROM messages;

-- 8. Verificar políticas RLS
SELECT 
    'Verificando políticas RLS...' as status;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'conversations', 'messages')
ORDER BY tablename, policyname;

-- 9. Verificar si RLS está habilitado
SELECT 
    'Verificando RLS...' as status;

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'conversations', 'messages');

-- 10. Crear usuarios de prueba si no hay suficientes
DO $$
DECLARE
    user_count INTEGER;
    current_user_id UUID;
BEGIN
    SELECT COUNT(*) INTO user_count FROM profiles;
    
    -- Si hay menos de 2 usuarios, crear algunos de prueba
    IF user_count < 2 THEN
        -- Crear usuarios de prueba
        INSERT INTO profiles (id, display_name, email, bio, location, created_at, updated_at) VALUES
        ('11111111-1111-1111-1111-111111111111', 'Usuario Prueba 1', 'usuario1@test.com', 'Usuario de prueba para chat', 'Ciudad de México', NOW(), NOW()),
        ('22222222-2222-2222-2222-222222222222', 'Usuario Prueba 2', 'usuario2@test.com', 'Usuario de prueba para chat', 'Guadalajara', NOW(), NOW()),
        ('33333333-3333-3333-3333-333333333333', 'Usuario Prueba 3', 'usuario3@test.com', 'Usuario de prueba para chat', 'Monterrey', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Usuarios de prueba creados';
    END IF;
END $$;

-- 11. Crear una conversación de prueba
DO $$
DECLARE
    conv_count INTEGER;
    user1_id UUID;
    user2_id UUID;
    new_conv_id UUID;
BEGIN
    SELECT COUNT(*) INTO conv_count FROM conversations;
    
    -- Si no hay conversaciones, crear una de prueba
    IF conv_count = 0 THEN
        -- Obtener los primeros dos usuarios
        SELECT id INTO user1_id FROM profiles ORDER BY created_at ASC LIMIT 1;
        SELECT id INTO user2_id FROM profiles ORDER BY created_at ASC OFFSET 1 LIMIT 1;
        
        -- Si hay al menos 2 usuarios, crear una conversación de prueba
        IF user1_id IS NOT NULL AND user2_id IS NOT NULL THEN
            INSERT INTO conversations (buyer_id, seller_id, created_at, updated_at)
            VALUES (user1_id, user2_id, NOW(), NOW())
            RETURNING id INTO new_conv_id;
            
            -- Crear un mensaje de prueba
            INSERT INTO messages (conversation_id, sender_id, content, message_type, created_at)
            VALUES (new_conv_id, user1_id, 'Hola! Este es un mensaje de prueba.', 'text', NOW());
            
            RAISE NOTICE 'Conversación de prueba creada con ID: %', new_conv_id;
        END IF;
    END IF;
END $$;

-- 12. Verificar el estado final
SELECT 
    'ESTADO FINAL:' as status,
    (SELECT COUNT(*) FROM profiles) as usuarios_disponibles,
    (SELECT COUNT(*) FROM conversations) as conversaciones_activas,
    (SELECT COUNT(*) FROM messages) as mensajes_totales;

-- 13. Mostrar resumen final
SELECT 
    'RESUMEN FINAL:' as status;

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
SELECT 'Diagnóstico completado. Revisa los resultados arriba para identificar problemas.' as message;
