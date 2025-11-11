# Organización del Proyecto

## Estructura de Carpetas

### 📁 `database/`
Contiene todos los scripts SQL organizados:
- **schema.sql** - Esquema principal completo de la base de datos
- **fixes.sql** - Correcciones y mejoras (función increment_views, gamificación)
- **storage.sql** - Configuración de storage para imágenes
- **README.md** - Documentación de cómo usar los scripts

### 📁 `src/tests/`
Contiene todos los tests unitarios:
- **setup.js** - Configuración de tests
- **validation.test.js** - Tests de validación
- **helpers.test.js** - Tests de funciones helper
- **LoadingSpinner.test.jsx** - Tests del componente LoadingSpinner

### 📁 `e2e/`
Contiene tests end-to-end (Playwright):
- **home.spec.js** - Tests de la página principal
- **auth.spec.js** - Tests de autenticación

## Archivos Eliminados

✅ **Sentry eliminado completamente:**
- `src/config/sentry.js` - Eliminado
- `SENTRY_SETUP.md` - Eliminado
- Referencias a Sentry removidas de todos los archivos
- Paquete `@sentry/react` desinstalado

✅ **SQL duplicados eliminados:**
- `supabase-fixes.sql` - Eliminado (duplicado)
- `supabase-fixes-safe.sql` - Eliminado (duplicado)
- `supabase-reviews-schema.sql` - Eliminado (ya incluido en schema.sql)

## Cómo Usar los Scripts SQL

1. Ve a tu proyecto en Supabase
2. Abre el **SQL Editor**
3. Ejecuta en este orden:
   - Primero: `database/schema.sql`
   - Segundo: `database/fixes.sql`
   - Opcional: `database/storage.sql` (solo si necesitas storage)

## Ejecutar Tests

```bash
# Tests unitarios
npm run test

# Tests E2E
npm run test:e2e

# Tests con UI
npm run test:ui
npm run test:e2e:ui
```

## Estado del Proyecto

✅ Proyecto limpio y organizado
✅ Sin dependencias innecesarias
✅ Archivos SQL organizados
✅ Tests organizados
✅ Listo para desarrollo académico

