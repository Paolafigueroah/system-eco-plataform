# Configuración de Variables de Entorno en Vercel

## Variables que debes configurar en Vercel:

1. Ve a tu proyecto en Vercel Dashboard
2. Ve a Settings > Environment Variables
3. Agrega las siguientes variables:

### Variables de Producción:
```
VITE_SUPABASE_URL=https://ruwvfemrgkqlxgrengbp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1d3ZmZW1yZ2txbHhncmVuZ2JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1ODU0NzAsImV4cCI6MjA3NDE2MTQ3MH0.PAJ24UTBwMb6BSk3jhlq6D_szJawLqy09VdBk1HL8Ms
VITE_DATABASE_TYPE=supabase
```

### Variables de Preview (opcional):
```
VITE_SUPABASE_URL=https://ruwvfemrgkqlxgrengbp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1d3ZmZW1yZ2txbHhncmVuZ2JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1ODU0NzAsImV4cCI6MjA3NDE2MTQ3MH0.PAJ24UTBwMb6BSk3jhlq6D_szJawLqy09VdBk1HL8Ms
VITE_DATABASE_TYPE=supabase
```

## Pasos para configurar:

1. **Ir a Vercel Dashboard**: https://vercel.com/dashboard
2. **Seleccionar tu proyecto**: system-eco-plataform
3. **Ir a Settings**: Click en "Settings" en el menú superior
4. **Environment Variables**: Click en "Environment Variables" en el menú lateral
5. **Agregar variables**: Click en "Add New" y agrega cada variable
6. **Redeploy**: Después de agregar las variables, ve a "Deployments" y haz click en "Redeploy" en el último deployment

## Verificar configuración:

Después de configurar las variables y hacer redeploy, verifica que:
- El sitio carga correctamente
- La autenticación funciona
- El chat funciona
- Los productos se cargan

## Notas importantes:

- Las variables que empiezan con `VITE_` son públicas y se incluyen en el bundle del cliente
- La clave `VITE_SUPABASE_ANON_KEY` es segura para usar en el cliente
- Nunca uses la clave `service_role` en el cliente
