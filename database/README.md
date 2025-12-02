# Scripts de Base de Datos

Esta carpeta contiene los scripts SQL necesarios para configurar la base de datos en Supabase.

## Archivos

### 1. `schema.sql` - Esquema Principal
**Ejecutar primero**

Contiene:
- Todas las tablas principales (profiles, products, conversations, messages, etc.)
- Índices para optimización
- Funciones y triggers
- Políticas RLS (Row Level Security)
- Configuración completa del esquema

**Cómo usar:**
1. Abre el SQL Editor en tu proyecto de Supabase
2. Copia y pega el contenido de `schema.sql`
3. Ejecuta el script completo

### 2. `fixes.sql` - Correcciones y Mejoras
**Ejecutar después de schema.sql**

Contiene:
- Función RPC `increment_views` para contar vistas de productos
- Corrección de permisos en `message_reads`
- Tablas de gamificación (user_points, badges, user_badges, user_actions)
- Políticas RLS para gamificación

**Cómo usar:**
1. Ejecuta primero `schema.sql`
2. Luego ejecuta `fixes.sql` en el SQL Editor de Supabase

### 3. `storage.sql` - Configuración de Storage
**Opcional - Solo si necesitas almacenar imágenes**

Contiene:
- Configuración del bucket `products` para imágenes
- Políticas de acceso público

**Cómo usar:**
1. Ejecuta en el SQL Editor de Supabase
2. También configura el bucket manualmente en Storage → Buckets si es necesario

### 4. `realtime.sql` - Habilitar Realtime para Chat
**IMPORTANTE - Requerido para chat en tiempo real**

Contiene:
- Habilitación de Realtime para la tabla `messages`
- Habilitación de Realtime para la tabla `conversations`
- Habilitación de Realtime para la tabla `message_reads`

**Cómo usar:**
1. Ejecuta en el SQL Editor de Supabase
2. Verifica que las tablas aparezcan en la publicación `supabase_realtime`
3. También puedes habilitarlo manualmente en Database → Replication en el dashboard de Supabase

## Orden de Ejecución Recomendado

1. **schema.sql** - Base de datos completa
2. **fixes.sql** - Correcciones y gamificación
3. **realtime.sql** - Habilitar chat en tiempo real ⚡
4. **storage.sql** - Storage para imágenes (opcional)

## Notas

- Todos los scripts son idempotentes (puedes ejecutarlos múltiples veces)
- Los scripts usan `IF NOT EXISTS` y `DROP IF EXISTS` para evitar errores
- Las políticas RLS están configuradas para seguridad

## Troubleshooting

Si encuentras errores:
1. Verifica que ejecutaste `schema.sql` primero
2. Revisa la consola de Supabase para mensajes de error específicos
3. Asegúrate de tener permisos de administrador en el proyecto

