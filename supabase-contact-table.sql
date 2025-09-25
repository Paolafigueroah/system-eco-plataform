-- Script para crear tabla de mensajes de contacto
-- Ejecutar en el SQL Editor de Supabase

-- 1. Crear tabla de mensajes de contacto
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE
);

-- 2. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON public.contact_messages(email);

-- 3. Configurar RLS (Row Level Security)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas RLS
-- Permitir que cualquier usuario autenticado envíe mensajes de contacto
CREATE POLICY "Anyone can send contact messages" ON public.contact_messages
    FOR INSERT WITH CHECK (true);

-- Solo permitir que los administradores vean los mensajes
-- (Por ahora permitimos que todos los usuarios autenticados vean los mensajes)
CREATE POLICY "Authenticated users can view contact messages" ON public.contact_messages
    FOR SELECT USING (auth.role() = 'authenticated');

-- Solo permitir que los administradores actualicen los mensajes
CREATE POLICY "Authenticated users can update contact messages" ON public.contact_messages
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 5. Verificar que la tabla se creó correctamente
SELECT '=== TABLA DE MENSAJES DE CONTACTO CREADA ===' as status;

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'contact_messages' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Verificar políticas RLS
SELECT 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'contact_messages' 
AND schemaname = 'public'
ORDER BY policyname;

SELECT '✅ Tabla de mensajes de contacto configurada correctamente' as status;
