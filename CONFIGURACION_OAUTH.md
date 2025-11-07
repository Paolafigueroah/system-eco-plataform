# 🔐 Configuración OAuth - Google y Twitter

## 📋 **Para que funcionen los botones de Google y Twitter, necesitas configurar los proveedores OAuth en Supabase:**

### 🚀 **Paso 1: Configurar Google OAuth**

#### **1.1 Crear Proyecto en Google Cloud Console:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google+ API**

#### **1.2 Configurar OAuth 2.0:**
1. Ve a **APIs & Services → Credentials**
2. Haz clic en **"Create Credentials" → "OAuth 2.0 Client IDs"**
3. Selecciona **"Web application"**
4. Agrega las URLs autorizadas:
   - **Authorized JavaScript origins:**
     - `https://ruwvfemrgkqlxgrengbp.supabase.co`
     - `http://localhost:3000` (para desarrollo)
   - **Authorized redirect URIs:**
     - `https://ruwvfemrgkqlxgrengbp.supabase.co/auth/v1/callback`

#### **1.3 Configurar en Supabase:**
1. Ve a tu **Supabase Dashboard**
2. **Authentication → Providers**
3. Habilita **Google**
4. Ingresa:
   - **Client ID:** (de Google Cloud Console)
   - **Client Secret:** (de Google Cloud Console)

### 🐦 **Paso 2: Configurar Twitter OAuth**

#### **2.1 Crear App en Twitter Developer:**
1. Ve a [Twitter Developer Portal](https://developer.twitter.com/)
2. Crea una nueva app
3. En **App Settings → Authentication**, configura:
   - **Callback URLs:**
     - `https://ruwvfemrgkqlxgrengbp.supabase.co/auth/v1/callback`
   - **Website URL:**
     - `https://ruwvfemrgkqlxgrengbp.supabase.co`

#### **2.2 Configurar en Supabase:**
1. En **Supabase Dashboard → Authentication → Providers**
2. Habilita **Twitter**
3. Ingresa:
   - **API Key:** (de Twitter Developer Portal)
   - **API Secret:** (de Twitter Developer Portal)

### ⚙️ **Paso 3: Configuración Adicional**

#### **3.1 Site URL en Supabase:**
1. Ve a **Authentication → URL Configuration**
2. Configura:
   - **Site URL:** `https://tu-dominio.vercel.app`
   - **Redirect URLs:** 
     - `https://tu-dominio.vercel.app/dashboard`
     - `https://tu-dominio.vercel.app/auth`

#### **3.2 Email Templates (Opcional):**
1. Ve a **Authentication → Email Templates**
2. Personaliza los templates de:
   - Confirmación de email
   - Restablecimiento de contraseña
   - Invitación

### 🧪 **Paso 4: Probar la Configuración**

#### **4.1 Probar Google OAuth:**
1. Ve a tu aplicación
2. Haz clic en **"Google"** en el login
3. Debería redirigir a Google para autenticación
4. Después del login, debería regresar a `/dashboard`

#### **4.2 Probar Twitter OAuth:**
1. Haz clic en **"Twitter"** en el login
2. Debería redirigir a Twitter para autenticación
3. Después del login, debería regresar a `/dashboard`

#### **4.3 Probar Forgot Password:**
1. Haz clic en **"¿Olvidaste tu contraseña?"**
2. Ingresa un email válido
3. Revisa el email para el enlace de restablecimiento
4. El enlace debería llevar a `/reset-password`

### 🔧 **Troubleshooting**

#### **Error: "OAuth provider not configured"**
- Verifica que el proveedor esté habilitado en Supabase
- Confirma que las credenciales sean correctas

#### **Error: "Redirect URI mismatch"**
- Verifica que las URLs de redirect coincidan exactamente
- Incluye tanto HTTP como HTTPS si es necesario

#### **Error: "Invalid client"**
- Verifica que el Client ID y Secret sean correctos
- Asegúrate de que el proyecto esté activo

### 📱 **URLs de Producción**

Para tu aplicación en Vercel, usa estas URLs:
- **Site URL:** `https://system-eco-plataform.vercel.app`
- **Redirect URLs:** 
  - `https://system-eco-plataform.vercel.app/dashboard`
  - `https://system-eco-plataform.vercel.app/auth`

### ✅ **Estado Actual**

- ✅ **Código implementado** - OAuth functions en el frontend
- ✅ **UI completa** - Botones funcionales en Login y Signup
- ✅ **Página de reset** - ResetPassword.jsx creada
- ⏳ **Pendiente:** Configurar proveedores en Supabase Dashboard

### 🎯 **Después de la Configuración**

Una vez configurados los proveedores OAuth:
1. **Google y Twitter** funcionarán automáticamente
2. **Forgot Password** enviará emails de restablecimiento
3. **Reset Password** permitirá cambiar contraseñas
4. **Perfiles automáticos** se crearán para usuarios OAuth

¡Tu sistema de autenticación estará **100% completo**! 🎉

