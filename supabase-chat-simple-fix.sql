-- Script simple y directo para arreglar el chat
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar si existen usuarios en auth.users
SELECT 'Usuarios en auth.users:' as status, COUNT(*) as count FROM auth.users;

-- 2. Sincronizar usuarios de auth.users a profiles
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

-- 3. Crear usuarios de prueba si no hay suficientes
DO $$
DECLARE
    user_count INT;
    test_user_id1 uuid;
    test_user_id2 uuid;
    test_user_id3 uuid;
BEGIN
    SELECT COUNT(*) INTO user_count FROM profiles;

    IF user_count < 3 THEN
        RAISE NOTICE 'Creando usuarios de prueba adicionales...';

        -- Crear usuario de prueba 1
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_generated_at, email_change_token_new, email_change, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, updated_at, created_at)
        VALUES (
            '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'testuser1@example.com', 'password_hash', NOW(), '', NOW(), '', '', NOW(), '{"provider":"email"}', '{"display_name":"Test User 1"}', FALSE, NOW(), NOW()
        ) ON CONFLICT (email) DO NOTHING RETURNING id INTO test_user_id1;

        INSERT INTO profiles (id, display_name, email, bio, location, created_at, updated_at)
        VALUES (test_user_id1, 'Test User 1', 'testuser1@example.com', 'Usuario de prueba', 'Ciudad de Prueba', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name, email = EXCLUDED.email, updated_at = NOW();

        -- Crear usuario de prueba 2
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_generated_at, email_change_token_new, email_change, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, updated_at, created_at)
        VALUES (
            '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'testuser2@example.com', 'password_hash', NOW(), '', NOW(), '', '', NOW(), '{"provider":"email"}', '{"display_name":"Test User 2"}', FALSE, NOW(), NOW()
        ) ON CONFLICT (email) DO NOTHING RETURNING id INTO test_user_id2;

        INSERT INTO profiles (id, display_name, email, bio, location, created_at, updated_at)
        VALUES (test_user_id2, 'Test User 2', 'testuser2@example.com', 'Usuario de prueba', 'Ciudad de Prueba', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name, email = EXCLUDED.email, updated_at = NOW();

        -- Crear usuario de prueba 3
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_generated_at, email_change_token_new, email_change, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, updated_at, created_at)
        VALUES (
            '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'testuser3@example.com', 'password_hash', NOW(), '', NOW(), '', '', NOW(), '{"provider":"email"}', '{"display_name":"Test User 3"}', FALSE, NOW(), NOW()
        ) ON CONFLICT (email) DO NOTHING RETURNING id INTO test_user_id3;

        INSERT INTO profiles (id, display_name, email, bio, location, created_at, updated_at)
        VALUES (test_user_id3, 'Test User 3', 'testuser3@example.com', 'Usuario de prueba', 'Ciudad de Prueba', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name, email = EXCLUDED.email, updated_at = NOW();
    END IF;
END $$;

-- 4. Crear una conversación de prueba
DO $$
DECLARE
    p_id1 uuid;
    p_id2 uuid;
    conv_id uuid;
BEGIN
    -- Obtener IDs de dos usuarios para crear una conversación de prueba
    SELECT id INTO p_id1 FROM profiles ORDER BY created_at ASC LIMIT 1;
    SELECT id INTO p_id2 FROM profiles WHERE id != p_id1 ORDER BY created_at ASC LIMIT 1;

    IF p_id1 IS NOT NULL AND p_id2 IS NOT NULL THEN
        -- Crear una conversación de prueba si no existe
        INSERT INTO conversations (buyer_id, seller_id, last_message, last_message_at, created_at, updated_at)
        VALUES (p_id1, p_id2, 'Hola, ¿cómo estás?', NOW(), NOW(), NOW())
        ON CONFLICT DO NOTHING
        RETURNING id INTO conv_id;

        -- Insertar mensajes de prueba si la conversación fue creada o ya existía
        IF conv_id IS NOT NULL THEN
            INSERT INTO messages (conversation_id, sender_id, content, created_at)
            VALUES
                (conv_id, p_id1, 'Hola, ¿cómo estás?', NOW() - INTERVAL '5 minutes'),
                (conv_id, p_id2, '¡Todo bien! ¿Y tú?', NOW() - INTERVAL '3 minutes'),
                (conv_id, p_id1, 'Aquí andamos, ¿qué tal el proyecto?', NOW() - INTERVAL '1 minute')
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
END $$;

-- 5. Verificación final
SELECT 'VERIFICACIÓN FINAL:' as status;

SELECT
    'Usuarios en profiles:' as metric,
    COUNT(*) as value
FROM profiles;

SELECT
    'Conversaciones activas:' as metric,
    COUNT(*) as value
FROM conversations;

SELECT
    'Mensajes totales:' as metric,
    COUNT(*) as value
FROM messages;

SELECT 'Chat configurado y listo para usar. Por favor, recarga la aplicación.' as message;
