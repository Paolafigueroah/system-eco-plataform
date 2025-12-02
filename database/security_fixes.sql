-- =====================================================
-- FIXES DE SEGURIDAD - System Eco
-- Corrige el problema de "role mutable search_path" en funciones SECURITY DEFINER
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- IMPORTANTE: Este script corrige el problema de seguridad donde las funciones
-- con SECURITY DEFINER tienen un search_path mutable, lo cual puede ser un
-- vector de ataque. Establecemos un search_path fijo para cada función.

-- =====================================================
-- 1. CORREGIR increment_views
-- =====================================================
-- Eliminar la función existente si tiene un tipo de retorno diferente
DROP FUNCTION IF EXISTS increment_views(UUID);

CREATE OR REPLACE FUNCTION increment_views(product_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE public.products
    SET views = views + 1
    WHERE id = product_id;
END;
$$;

COMMENT ON FUNCTION increment_views(UUID) IS 'Incrementa el contador de vistas de un producto';

-- =====================================================
-- 2. CORREGIR handle_new_user
-- =====================================================
-- Primero eliminar el trigger que depende de la función
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Eliminar la función existente si tiene un tipo de retorno diferente
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recrear la función con search_path fijo
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, email, bio, location)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
        NEW.email,
        'Usuario de System Eco',
        'Colombia'
    )
    ON CONFLICT (id) DO UPDATE SET
        display_name = COALESCE(NEW.raw_user_meta_data->>'display_name', public.profiles.display_name),
        email = NEW.email;
    RETURN NEW;
END;
$$;

-- Recrear el trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Crea automáticamente un perfil cuando se registra un nuevo usuario';

-- =====================================================
-- 3. CORREGIR update_review_helpful_count
-- =====================================================
-- Primero eliminar el trigger que depende de la función
DROP TRIGGER IF EXISTS update_review_helpful_count_trigger ON review_helpful;

-- Eliminar la función existente si tiene un tipo de retorno diferente
DROP FUNCTION IF EXISTS update_review_helpful_count();

-- Recrear la función con search_path fijo
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.helpful THEN
            UPDATE public.reviews SET helpful = helpful + 1 WHERE id = NEW.review_id;
        ELSE
            UPDATE public.reviews SET not_helpful = not_helpful + 1 WHERE id = NEW.review_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.helpful != NEW.helpful THEN
            IF OLD.helpful THEN
                UPDATE public.reviews SET helpful = helpful - 1 WHERE id = NEW.review_id;
                UPDATE public.reviews SET not_helpful = not_helpful + 1 WHERE id = NEW.review_id;
            ELSE
                UPDATE public.reviews SET not_helpful = not_helpful - 1 WHERE id = NEW.review_id;
                UPDATE public.reviews SET helpful = helpful + 1 WHERE id = NEW.review_id;
            END IF;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.helpful THEN
            UPDATE public.reviews SET helpful = helpful - 1 WHERE id = OLD.review_id;
        ELSE
            UPDATE public.reviews SET not_helpful = not_helpful - 1 WHERE id = OLD.review_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Recrear el trigger
CREATE TRIGGER update_review_helpful_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON review_helpful
    FOR EACH ROW
    EXECUTE FUNCTION update_review_helpful_count();

-- =====================================================
-- 4. CREAR/CORREGIR increment_product_favorites (si existe)
-- =====================================================
-- Eliminar la función existente si tiene un tipo de retorno diferente
DROP FUNCTION IF EXISTS increment_product_favorites(UUID);

-- Esta función puede no existir, pero la creamos por si acaso
CREATE OR REPLACE FUNCTION increment_product_favorites(product_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE public.products
    SET favorites_count = COALESCE(favorites_count, 0) + 1
    WHERE id = product_id;
END;
$$;

COMMENT ON FUNCTION increment_product_favorites(UUID) IS 'Incrementa el contador de favoritos de un producto';

-- =====================================================
-- 5. CREAR/CORREGIR decrement_product_favorites (si existe)
-- =====================================================
-- Eliminar la función existente si tiene un tipo de retorno diferente
DROP FUNCTION IF EXISTS decrement_product_favorites(UUID);

CREATE OR REPLACE FUNCTION decrement_product_favorites(product_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE public.products
    SET favorites_count = GREATEST(COALESCE(favorites_count, 0) - 1, 0)
    WHERE id = product_id;
END;
$$;

COMMENT ON FUNCTION decrement_product_favorites(UUID) IS 'Decrementa el contador de favoritos de un producto';

-- =====================================================
-- 6. CREAR/CORREGIR get_product_review_stats (si existe)
-- =====================================================
-- Eliminar la función existente si tiene un tipo de retorno diferente
DROP FUNCTION IF EXISTS get_product_review_stats(UUID);

CREATE OR REPLACE FUNCTION get_product_review_stats(product_id UUID)
RETURNS TABLE (
    total_reviews BIGINT,
    average_rating NUMERIC,
    rating_distribution JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_reviews,
        COALESCE(AVG(rating)::NUMERIC(3,2), 0) as average_rating,
        jsonb_build_object(
            '1', COUNT(*) FILTER (WHERE rating = 1),
            '2', COUNT(*) FILTER (WHERE rating = 2),
            '3', COUNT(*) FILTER (WHERE rating = 3),
            '4', COUNT(*) FILTER (WHERE rating = 4),
            '5', COUNT(*) FILTER (WHERE rating = 5)
        ) as rating_distribution
    FROM public.reviews
    WHERE product_id = get_product_review_stats.product_id;
END;
$$;

COMMENT ON FUNCTION get_product_review_stats(UUID) IS 'Obtiene estadísticas de reseñas de un producto';

-- =====================================================
-- 7. VERIFICACIÓN
-- =====================================================
-- Verificar que todas las funciones tienen search_path fijo
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) LIKE '%SET search_path%' as has_fixed_search_path,
    CASE 
        WHEN pg_get_functiondef(p.oid) LIKE '%SET search_path%' THEN '✅ Seguro'
        ELSE '❌ Necesita corrección'
    END as security_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prosecdef = true  -- Solo funciones con SECURITY DEFINER
AND p.proname IN (
    'increment_views',
    'handle_new_user',
    'update_review_helpful_count',
    'increment_product_favorites',
    'decrement_product_favorites',
    'get_product_review_stats'
)
ORDER BY p.proname;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. SET search_path = public, pg_temp asegura que las funciones
--    solo busquen objetos en el schema 'public' y en 'pg_temp'
-- 2. Esto previene ataques de inyección de search_path
-- 3. Todas las referencias a tablas deben usar el prefijo 'public.'
-- 4. Ejecutar este script después de cualquier cambio en las funciones

