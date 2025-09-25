-- Script para sincronizar usuarios reales de auth.users a profiles
-- Ejecutar DESPUÉS del script incremental

-- 1. Crear perfiles para todos los usuarios existentes en auth.users
INSERT INTO profiles (id, display_name, email, created_at, updated_at)
SELECT 
    au.id,
    COALESCE(
        au.raw_user_meta_data->>'display_name',
        au.raw_user_meta_data->>'full_name',
        au.email,
        'Usuario ' || SUBSTRING(au.id::text, 1, 8)
    ) as display_name,
    au.email,
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

-- 2. Verificar que se crearon los perfiles
SELECT 
    'Usuarios sincronizados:' as status,
    COUNT(*) as total_profiles
FROM profiles;

-- 3. Mostrar los usuarios disponibles para chat
SELECT 
    id,
    display_name,
    email,
    created_at
FROM profiles
ORDER BY created_at DESC;

-- 4. Crear algunos usuarios de prueba adicionales si no hay suficientes
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM profiles;
    
    -- Si hay menos de 3 usuarios, crear algunos de prueba
    IF user_count < 3 THEN
        INSERT INTO profiles (id, display_name, email, bio, location, created_at, updated_at) VALUES
        ('00000000-0000-0000-0000-000000000001', 'Ana García', 'ana.garcia@example.com', 'Vendedora de productos ecológicos', 'Ciudad de México', NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000002', 'Carlos López', 'carlos.lopez@example.com', 'Comprador frecuente', 'Guadalajara', NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000003', 'María Rodríguez', 'maria.rodriguez@example.com', 'Interesada en productos sostenibles', 'Monterrey', NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000004', 'Luis Hernández', 'luis.hernandez@example.com', 'Vendedor de artículos usados', 'Puebla', NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000005', 'Sofia Martínez', 'sofia.martinez@example.com', 'Compradora de productos orgánicos', 'Tijuana', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Usuarios de prueba creados';
    END IF;
END $$;

-- 5. Verificar el resultado final
SELECT 
    'Total de usuarios disponibles para chat:' as status,
    COUNT(*) as total_users
FROM profiles;

-- 6. Mostrar usuarios disponibles
SELECT 
    id,
    display_name,
    email,
    location,
    created_at
FROM profiles
ORDER BY display_name ASC;

-- Mensaje de confirmación
SELECT 'Usuarios sincronizados exitosamente. El chat ahora debería funcionar correctamente.' as message;
