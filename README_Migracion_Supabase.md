# 🚀 Migración a Supabase

Esta guía te ayudará a migrar tu aplicación de SQLite local a Supabase para tener una base de datos en la nube más robusta y escalable.

## 📋 Pasos para la Migración

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Anota tu URL del proyecto y la clave anónima

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
VITE_DATABASE_TYPE=supabase
```

### 3. Ejecutar Script SQL

1. Ve al SQL Editor en tu dashboard de Supabase
2. Copia y ejecuta el contenido de `supabase-schema.sql`
3. Esto creará todas las tablas necesarias y configurará las políticas de seguridad

### 4. Configurar Storage (Opcional)

Si planeas subir imágenes de productos:

1. Ve a Storage en tu dashboard de Supabase
2. Crea un bucket llamado `products`
3. Configúralo como público

### 5. Migrar Datos Existentes

Si tienes datos en SQLite que quieres migrar:

1. Ve a `/debug` en tu aplicación
2. Usa el componente "Database Migrator"
3. Selecciona "Supabase" como base de datos
4. Los datos se migrarán automáticamente

## 🔧 Configuración Avanzada

### Modo Híbrido

Puedes configurar la aplicación para usar SQLite en desarrollo y Supabase en producción:

```env
VITE_DATABASE_TYPE=hybrid
```

### Políticas de Seguridad

El esquema incluye Row Level Security (RLS) configurado para:
- Usuarios solo pueden ver/editar sus propios productos
- Conversaciones privadas entre usuarios
- Favoritos personales

## 🚨 Solución de Problemas

### Error de Autenticación
- Verifica que las variables de entorno estén configuradas correctamente
- Asegúrate de que la clave anónima sea válida

### Error de Tablas
- Ejecuta el script SQL completo en Supabase
- Verifica que todas las tablas se hayan creado correctamente

### Error de Políticas
- Las políticas RLS están configuradas en el script SQL
- Verifica que estén habilitadas en tu dashboard

## 📊 Comparación de Bases de Datos

| Característica | SQLite | Supabase |
|---|---|---|
| **Velocidad** | ⚡ Muy rápida | 🚀 Rápida |
| **Persistencia** | ❌ Solo en navegador | ✅ Permanente |
| **Escalabilidad** | ❌ Limitada | ✅ Ilimitada |
| **Configuración** | ✅ Ninguna | ⚙️ Requerida |
| **Tiempo Real** | ❌ No | ✅ Sí |
| **Autenticación** | 🔧 Manual | 🔐 Integrada |
| **Storage** | ❌ No | ✅ Sí |

## 🎯 Ventajas de Supabase

1. **Persistencia Real**: Los datos se mantienen entre sesiones
2. **Escalabilidad**: Maneja miles de usuarios sin problemas
3. **Tiempo Real**: Actualizaciones instantáneas
4. **Autenticación**: Sistema robusto integrado
5. **Storage**: Subida de archivos e imágenes
6. **APIs**: Endpoints automáticos generados

## 🔄 Migración de Datos

El sistema incluye funciones automáticas para migrar:
- ✅ Usuarios y perfiles
- ✅ Productos y categorías
- ✅ Conversaciones y mensajes
- ✅ Favoritos
- ✅ Configuraciones

## 📞 Soporte

Si encuentras problemas durante la migración:

1. Revisa los logs en la consola del navegador
2. Verifica la configuración en `/debug`
3. Consulta la documentación de Supabase
4. Revisa las políticas de seguridad en tu dashboard

¡La migración a Supabase te dará una base de datos mucho más robusta y escalable! 🚀
