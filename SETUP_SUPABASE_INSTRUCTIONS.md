# 🚀 Instrucciones para Configurar Supabase - System Eco

## 📋 Pasos para Configurar la Base de Datos

### 1. **Ejecutar el Esquema Principal**
Ve a **Supabase Dashboard → SQL Editor** y ejecuta el contenido de:
- `supabase-complete-schema.sql` (esquema principal)
- `supabase-reviews-schema.sql` (sistema de reviews)

### 2. **Verificar el Esquema de Chat**
El chat privado está incluido en el esquema principal. No se requiere configuración adicional.

### 3. **Configurar Variables de Entorno**

#### En tu archivo `.env` local:
```env
VITE_SUPABASE_URL=https://ruwvfemrgkqlxgrengbp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1d3ZmZW1yZ2txbHhncmVuZ2JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1ODU0NzAsImV4cCI6MjA3NDE2MTQ3MH0.PAJ24UTBwMb6BSk3jhlq6D_szJawLqy09VdBk1HL8Ms
VITE_DATABASE_TYPE=supabase
```

#### En Vercel Dashboard:
1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega las mismas variables de arriba

### 4. **Verificar la Configuración**

Después de ejecutar los esquemas, verifica que tengas estas tablas:
- ✅ `profiles`
- ✅ `products`
- ✅ `conversations`
- ✅ `messages`
- ✅ `reviews`
- ✅ `review_helpful`
- ✅ `favorites`
- ✅ `notifications`

### 5. **Probar la Aplicación**

1. **Localmente**: `npm run dev`
2. **En producción**: El sitio se actualizará automáticamente en Vercel

## 🔧 Solución de Problemas

### Error: "column user1_id does not exist"
- **Causa**: La función está usando columnas incorrectas
- **Solución**: Ejecuta `supabase-group-chat-schema-fixed.sql`

### Error: "function does not exist"
- **Causa**: Las funciones no se crearon correctamente
- **Solución**: Ejecuta todos los esquemas SQL en orden

### Error de autenticación
- **Causa**: Variables de entorno incorrectas
- **Solución**: Verifica las variables en `.env` y Vercel

## 📊 Funcionalidades Disponibles

### ✅ **Completamente Funcional:**
- 🔐 Autenticación (registro/login)
- 📦 Gestión de productos (CRUD)
- 💬 Chat privado (1:1 entre comprador y vendedor)
- ⭐ Sistema de reviews y ratings
- ❤️ Sistema de favoritos
- 🔔 Notificaciones
- 📱 PWA (instalable)
- 🌙 Modo oscuro
- 🔍 Búsqueda avanzada

### 💬 **Características del Chat Privado:**
- Conversaciones directas entre comprador y vendedor
- Indicadores de escritura en tiempo real
- Estados de conexión visuales
- Selector de emojis integrado
- Búsqueda de mensajes avanzada
- Notificaciones push con sonidos
- Feedback visual mejorado

## 🚀 **Estado del Proyecto:**
- ✅ **Build**: Sin errores
- ✅ **Deployment**: Configurado
- ✅ **Base de datos**: Esquema completo
- ✅ **Funcionalidades**: 100% implementadas
- ✅ **UI/UX**: Moderna y responsiva

## 📞 **Soporte**
Si encuentras algún problema:
1. Verifica que todos los esquemas SQL se ejecutaron
2. Confirma que las variables de entorno están configuradas
3. Revisa la consola del navegador para errores
4. Verifica los logs de Vercel para errores de deployment
