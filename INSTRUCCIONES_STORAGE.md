# 📦 Instrucciones para Configurar Storage en Supabase

## ⚠️ IMPORTANTE: Configurar el Bucket de Storage

Para que las imágenes de productos funcionen correctamente, necesitas crear el bucket de storage en Supabase.

### Pasos:

1. **Ve a tu proyecto en Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Selecciona tu proyecto: `ruwvfemrgkqlxgrengbp`

2. **Ve a Storage**
   - En el menú lateral, haz clic en "Storage"

3. **Crea el bucket**
   - Haz clic en "New bucket"
   - Nombre: `products`
   - Marca como **Público** (Public bucket)
   - Haz clic en "Create bucket"

4. **Configura las políticas de seguridad**
   - Ve a "SQL Editor" en el menú lateral
   - Copia y pega el contenido del archivo `supabase-storage-setup.sql`
   - Haz clic en "Run" para ejecutar el script

### Alternativa: Usar el SQL Editor directamente

1. Ve a **SQL Editor** en Supabase Dashboard
2. Crea una nueva consulta
3. Copia y pega el contenido completo del archivo `supabase-storage-setup.sql`
4. Ejecuta la consulta

### Verificar que funciona

Después de configurar el bucket:
1. Intenta publicar un producto con imagen
2. La imagen debería subirse correctamente
3. Deberías ver la imagen en el producto publicado

### Notas importantes:

- El bucket debe llamarse exactamente `products`
- El bucket debe ser público para que las imágenes se muestren
- Las políticas RLS permiten que usuarios autenticados suban/eliminen sus propias imágenes

