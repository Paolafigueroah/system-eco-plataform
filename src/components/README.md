# Componentes - System Eco

Documentación de los componentes principales de la aplicación.

## Componentes de Autenticación

### Login
**Archivo:** `Login.jsx`

Componente de inicio de sesión con:
- Validación de formularios
- Rate limiting
- Remember me
- Reset de contraseña
- OAuth con Google

**Props:**
- `onSwitchToSignup`: Función para cambiar a la vista de registro

### Signup
**Archivo:** `Signup.jsx`

Componente de registro con:
- Validación de contraseña segura
- Indicador de fortaleza de contraseña
- Validación de email
- OAuth con Google

**Props:**
- `onSwitchToLogin`: Función para cambiar a la vista de login

## Componentes de Productos

### ProductCard
**Archivo:** `ProductCard.jsx`

Tarjeta de producto con:
- Animaciones con framer-motion
- Información completa del producto
- Botones de acción (favoritos, editar, eliminar)
- Optimizado con React.memo

**Props:**
- `product`: Objeto con datos del producto
- `onEdit`: Callback para editar (opcional)
- `onDelete`: Callback para eliminar (opcional)
- `onProductRemoved`: Callback cuando se remueve de favoritos (opcional)

### ProductReviews
**Archivo:** `ProductReviews.jsx`

Sistema de reviews y ratings para productos.

## Componentes de Chat

### Chat
**Archivo:** `Chat.jsx`

Componente principal del chat con:
- Lista de conversaciones
- Selección de conversación
- Modal para nueva conversación

### ChatConversation
**Archivo:** `ChatConversation.jsx`

Conversación individual con:
- Mensajes en tiempo real
- Indicador de escritura
- Búsqueda de mensajes
- Emojis
- Estados de conexión

### ChatMessage
**Archivo:** `ChatMessage.jsx`

Mensaje individual con:
- Animaciones de entrada
- Estados de lectura
- Timestamps formateados
- Optimizado con React.memo

## Componentes de UI

### LoadingSpinner
**Archivo:** `LoadingSpinner.jsx`

Spinner de carga con:
- Animaciones con framer-motion
- Múltiples tamaños
- Modo fullscreen opcional

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `text`: Texto a mostrar
- `fullScreen`: Boolean para modo pantalla completa

### SkeletonLoader
**Archivo:** `SkeletonLoader.jsx`

Placeholder animado para contenido en carga.

**Props:**
- `variant`: 'card' | 'list' | 'text' | 'image'
- `count`: Número de elementos (para listas)
- `className`: Clases CSS adicionales

### Navbar
**Archivo:** `Navbar.jsx`

Barra de navegación con:
- Animaciones de scroll
- Menú móvil animado
- Notificaciones
- Búsqueda
- Toggle de tema

### ErrorBoundary
**Archivo:** `ErrorBoundary.jsx`

Manejo de errores de React con UI amigable.

## Componentes de Formularios

### AddProductForm
**Archivo:** `AddProductForm.jsx`

Formulario para agregar productos con validación completa.

### PasswordStrengthIndicator
**Archivo:** `PasswordStrengthIndicator.jsx`

Indicador visual de fortaleza de contraseña.

## Hooks Personalizados

### useAuth
**Archivo:** `../hooks/useAuth.jsx`

Hook para autenticación con:
- Estado de usuario
- Funciones de login/signup/logout
- OAuth con Google

### useRealtime
**Archivo:** `../hooks/useRealtime.jsx`

Hook para suscripciones en tiempo real con Supabase.

### useTheme
**Archivo:** `../hooks/useTheme.jsx`

Hook para manejo de tema (dark/light mode).

## Optimizaciones

Todos los componentes principales están optimizados con:
- `React.memo` para evitar re-renders innecesarios
- `useMemo` y `useCallback` para valores y funciones
- Lazy loading de rutas
- Animaciones con framer-motion

