# 🔧 Solución Error 401 - Políticas RLS

## ❌ **Problema Identificado:**
```
Failed to load resource: the server responded with a status of 401
Error actualizando perfil: Object
```

## 🎯 **Causa del Error:**
Las políticas RLS (Row Level Security) en Supabase no están configuradas correctamente, causando que los usuarios no puedan crear/actualizar sus perfiles después del registro.

## ✅ **Solución Paso a Paso:**

### 1. **Ejecutar el Fix de RLS Corregido**
Ve a **Supabase Dashboard → SQL Editor** y ejecuta el contenido completo de:
- `supabase-rls-fix-corrected.sql` (este corrige el error de columnas faltantes)

### 2. **Verificar que se Ejecutó Correctamente**
Después de ejecutar el SQL, deberías ver:
- ✅ Políticas creadas para todas las tablas
- ✅ Función `handle_new_user` creada
- ✅ Trigger `on_auth_user_created` activo

### 3. **Probar el Registro**
1. Ve a tu aplicación
2. Intenta registrarte con un nuevo usuario
3. Verifica que no aparezca el error 401
4. Confirma que el perfil se crea automáticamente

## 🔍 **Qué Hace el Fix:**

### **Corrección de Estructura de Base de Datos:**
- ✅ **Verifica columnas existentes** antes de crear políticas
- ✅ **Crea columnas faltantes** (seller_id, buyer_id, etc.)
- ✅ **Renombra columnas** si es necesario para consistencia
- ✅ **Evita errores de columnas inexistentes**

### **Políticas RLS Corregidas:**
- ✅ **profiles**: Los usuarios pueden ver todos los perfiles, pero solo modificar el suyo
- ✅ **products**: Cualquiera puede ver productos, pero solo el vendedor puede modificarlos
- ✅ **conversations**: Los usuarios solo ven sus propias conversaciones
- ✅ **messages**: Los usuarios solo ven mensajes de sus conversaciones
- ✅ **favorites**: Los usuarios solo ven sus propios favoritos
- ✅ **notifications**: Los usuarios solo ven sus propias notificaciones

### **Creación Automática de Perfil:**
- ✅ **Trigger automático**: Cuando un usuario se registra, se crea automáticamente su perfil
- ✅ **Datos por defecto**: Se asignan valores por defecto (bio, location)
- ✅ **Sin intervención manual**: No necesitas crear perfiles manualmente

## 🧪 **Verificación:**

### **Logs Esperados Después del Fix:**
```
✅ Registro de usuario exitoso: Object
✅ Perfil creado automáticamente
✅ Sin errores 401
```

### **En Supabase Dashboard:**
1. Ve a **Authentication → Users**
2. Verifica que el usuario esté registrado
3. Ve a **Table Editor → profiles**
4. Confirma que el perfil se creó automáticamente

## 🚨 **Si el Error Persiste:**

### **Verificar Variables de Entorno:**
```env
VITE_SUPABASE_URL=https://ruwvfemrgkqlxgrengbp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1d3ZmZW1yZ2txbHhncmVuZ2JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1ODU0NzAsImV4cCI6MjA3NDE2MTQ3MH0.PAJ24UTBwMb6BSk3jhlq6D_szJawLqy09VdBk1HL8Ms
VITE_DATABASE_TYPE=supabase
```

### **Verificar en Vercel:**
1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Confirma que las variables estén configuradas
4. Haz un redeploy

## 📞 **Soporte Adicional:**
Si el problema persiste después de ejecutar el fix:
1. Verifica que el SQL se ejecutó sin errores
2. Confirma que las políticas RLS están activas
3. Revisa los logs de Supabase para más detalles
4. Prueba con un usuario completamente nuevo
