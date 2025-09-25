-- Script para crear usuarios de prueba en la tabla profiles
-- Ejecutar DESPUÉS del script incremental

-- Insertar usuarios de prueba en la tabla profiles
-- Nota: Estos usuarios deben existir en auth.users primero

-- Crear perfiles para usuarios existentes (si no existen)
INSERT INTO profiles (id, display_name, bio, location, created_at)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'display_name', au.email, 'Usuario ' || SUBSTRING(au.id::text, 1, 8)),
    'Usuario de prueba en System Eco',
    'Ciudad de México',
    NOW()
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Si no hay usuarios en auth.users, crear algunos de prueba
-- (Esto solo funcionará si tienes permisos para crear usuarios)
DO $$
BEGIN
    -- Verificar si hay usuarios en profiles
    IF (SELECT COUNT(*) FROM profiles) = 0 THEN
        -- Crear algunos perfiles de prueba con IDs ficticios
        -- Estos solo funcionarán si los usuarios existen en auth.users
        INSERT INTO profiles (id, display_name, bio, location, phone, created_at) VALUES
        ('00000000-0000-0000-0000-000000000001', 'Ana García', 'Vendedora de productos ecológicos', 'Ciudad de México', '+52 55 1234 5678', NOW()),
        ('00000000-0000-0000-0000-000000000002', 'Carlos López', 'Comprador frecuente', 'Guadalajara', '+52 33 9876 5432', NOW()),
        ('00000000-0000-0000-0000-000000000003', 'María Rodríguez', 'Interesada en productos sostenibles', 'Monterrey', '+52 81 5555 1234', NOW()),
        ('00000000-0000-0000-0000-000000000004', 'Luis Hernández', 'Vendedor de artículos usados', 'Puebla', '+52 222 333 4444', NOW()),
        ('00000000-0000-0000-0000-000000000005', 'Sofia Martínez', 'Compradora de productos orgánicos', 'Tijuana', '+52 664 777 8888', NOW())
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- Verificar que se crearon los perfiles
SELECT 
    id,
    display_name,
    email,
    location,
    created_at
FROM profiles
ORDER BY created_at DESC;

-- Mensaje de confirmación
SELECT 'Usuarios de prueba creados exitosamente en la tabla profiles.' as message;
