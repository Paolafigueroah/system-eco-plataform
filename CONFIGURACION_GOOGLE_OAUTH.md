# 🔐 Configuración de Google OAuth en Supabase

## 📋 **Paso 1: Crear Proyecto en Google Cloud Console**

### 1.1 Acceder a Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Si no tienes un proyecto, crea uno nuevo:
   - Haz clic en el selector de proyectos (arriba)
   - Clic en "Nuevo proyecto"
   - Ingresa un nombre (ej: "BioConnect OAuth")
   - Haz clic en "Crear"

### 1.2 Habilitar Google+ API
1. En el menú lateral, ve a **APIs & Services → Library**
2. Busca "Google+ API" o "Google Identity"
3. Haz clic en "Enable" (Habilitar)

## 📋 **Paso 2: Crear Credenciales OAuth 2.0**

### 2.1 Crear OAuth Client ID
1. Ve a **APIs & Services → Credentials**
2. Haz clic en **"+ CREATE CREDENTIALS"** (arriba)
3. Selecciona **"OAuth client ID"**

### 2.2 Configurar Consent Screen (si es la primera vez)
Si es la primera vez, te pedirá configurar la pantalla de consentimiento:
1. Selecciona **"External"** (para usuarios externos)
2. Haz clic en **"CREATE"**
3. Completa el formulario:
   - **App name**: BioConnect (o el nombre que prefieras)
   - **User support email**: Tu email
   - **Developer contact information**: Tu email
4. Haz clic en **"SAVE AND CONTINUE"**
5. En "Scopes", haz clic en **"SAVE AND CONTINUE"**
6. En "Test users", haz clic en **"SAVE AND CONTINUE"**
7. Revisa y haz clic en **"BACK TO DASHBOARD"**

### 2.3 Crear OAuth Client ID
1. En **Application type**, selecciona **"Web application"**
2. En **Name**, ingresa: "BioConnect Web Client"
3. En **Authorized JavaScript origins**, agrega:
   ```
   https://ruwvfemrgkqlxgrengbp.supabase.co
   http://localhost:5173
   http://localhost:3000
   ```
   (Reemplaza `ruwvfemrgkqlxgrengbp` con tu proyecto de Supabase si es diferente)

4. En **Authorized redirect URIs**, agrega:
   ```
   https://ruwvfemrgkqlxgrengbp.supabase.co/auth/v1/callback
   ```
   (Reemplaza `ruwvfemrgkqlxgrengbp` con tu proyecto de Supabase)

5. Haz clic en **"CREATE"**

### 2.4 Copiar Credenciales
1. Se mostrará un popup con:
   - **Your Client ID**: Copia este valor
   - **Your Client Secret**: Copia este valor
2. **¡IMPORTANTE!** Guarda estas credenciales de forma segura

## 📋 **Paso 3: Configurar en Supabase**

### 3.1 Habilitar Google Provider
1. Ve a tu **Supabase Dashboard**
2. Selecciona tu proyecto
3. Ve a **Authentication → Providers**
4. Busca **"Google"** en la lista
5. Haz clic en el toggle para **habilitarlo** (debe cambiar a "Enabled")

### 3.2 Ingresar Credenciales
1. En la sección de Google, verás campos para:
   - **Client ID (for OAuth)**: Pega el **Client ID** que copiaste de Google Cloud Console
   - **Client Secret (for OAuth)**: Pega el **Client Secret** que copiaste de Google Cloud Console

2. Haz clic en **"Save"** o **"Update"**

### 3.3 Verificar Configuración
1. Asegúrate de que Google esté marcado como **"Enabled"**
2. Verifica que las credenciales estén guardadas correctamente

## 📋 **Paso 4: Configurar Site URL (Importante)**

### 4.1 Configurar URLs en Supabase
1. Ve a **Authentication → URL Configuration**
2. En **Site URL**, ingresa:
   - Para producción: `https://tu-dominio.vercel.app`
   - Para desarrollo: `http://localhost:5173` o `http://localhost:3000`
3. En **Redirect URLs**, agrega:
   ```
   https://tu-dominio.vercel.app/**
   http://localhost:5173/**
   http://localhost:3000/**
   ```
4. Haz clic en **"Save"**

## ✅ **Paso 5: Probar la Configuración**

### 5.1 Probar en tu Aplicación
1. Ve a tu aplicación (local o en Vercel)
2. Haz clic en el botón **"Continuar con Google"**
3. Deberías ser redirigido a la página de Google para iniciar sesión
4. Después de autorizar, deberías ser redirigido de vuelta a tu aplicación

### 5.2 Solución de Problemas

**Si el botón no funciona:**
- Verifica que Google esté habilitado en Supabase
- Verifica que las credenciales sean correctas
- Verifica que las URLs de redirección coincidan exactamente

**Si aparece un error de "redirect_uri_mismatch":**
- Verifica que la URL en "Authorized redirect URIs" en Google Cloud Console sea exactamente:
  ```
  https://ruwvfemrgkqlxgrengbp.supabase.co/auth/v1/callback
  ```
- Asegúrate de que no haya espacios o caracteres extra

**Si aparece un error de "invalid_client":**
- Verifica que el Client ID y Client Secret sean correctos
- Asegúrate de haber copiado los valores completos sin espacios

## 📝 **Notas Importantes**

1. **Client Secret**: Mantén este valor seguro y nunca lo compartas públicamente
2. **URLs de Producción**: Cuando despliegues en producción, actualiza las URLs en Google Cloud Console y Supabase
3. **Límites de Prueba**: Si tu app está en modo de prueba, solo los usuarios agregados en "Test users" podrán iniciar sesión
4. **Verificación de App**: Para producción, necesitarás verificar tu app con Google (proceso más largo)

## 🔗 **Enlaces Útiles**

- [Google Cloud Console](https://console.cloud.google.com/)
- [Supabase Dashboard](https://app.supabase.com/)
- [Documentación de Supabase Auth](https://supabase.com/docs/guides/auth)

