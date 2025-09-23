# Sistema de Gestión de Productos - React Firebase App

Este documento describe el sistema de gestión de productos implementado en la aplicación React con Firebase.

## 🎯 Características Principales

### Publicación de Productos
- **Formulario completo** con validación de campos
- **Subida de imágenes** (máximo 5) con previsualización
- **Categorización** por tipo de producto
- **Estados del producto** (Nuevo, Como Nuevo, Excelente, Bueno, Aceptable)
- **Tipos de transacción** (Venta, Intercambio, Donación, Alquiler)
- **Precio opcional** (requerido solo para ventas)
- **Ubicación** del producto

### Dashboard de Usuario
- **Estadísticas en tiempo real** (total productos, vistas, favoritos, vendidos)
- **Vista de productos** en modo grid o lista
- **Filtros avanzados** por categoría, estado y búsqueda de texto
- **Gestión de productos** (editar, eliminar)
- **Acceso rápido** al formulario de publicación

### Servicios de Productos
- **CRUD completo** para productos
- **Búsqueda y filtrado** avanzado
- **Estadísticas de usuario** automatizadas
- **Integración con Firebase Storage** para imágenes
- **Suscripciones en tiempo real** a cambios

## 📁 Estructura de Archivos

```
src/
├── components/
│   ├── PublicarProducto.jsx      # Formulario de publicación
│   └── ProductCard.jsx           # Tarjeta reutilizable de producto
├── pages/
│   └── Dashboard.jsx             # Página principal del dashboard
├── services/
│   └── productService.js         # Servicios específicos para productos
└── hooks/
    └── useAuth.js                # Hook de autenticación (existente)
```

## 🚀 Componentes Principales

### PublicarProducto.jsx
Componente modal para publicar nuevos productos.

**Props:**
- `onProductPublished`: Callback cuando se publica exitosamente
- `onClose`: Callback para cerrar el modal

**Características:**
- Formulario con validación en tiempo real
- Subida múltiple de imágenes con preview
- Integración con Firebase Storage
- Guardado en Firestore con metadatos del usuario

### ProductCard.jsx
Componente reutilizable para mostrar información de productos.

**Props:**
- `product`: Objeto del producto
- `viewMode`: 'grid' o 'list'
- `onEdit`: Callback para editar (opcional)
- `onDelete`: Callback para eliminar (opcional)
- `showActions`: Mostrar/ocultar menú de acciones

**Características:**
- Diseño responsive (grid/lista)
- Información completa del producto
- Badges de estado y categoría
- Contadores de vistas y favoritos
- Menú contextual de acciones

### Dashboard.jsx
Página principal para gestionar productos del usuario.

**Características:**
- Header personalizado con saludo
- Estadísticas en tarjetas
- Filtros de búsqueda y categoría
- Cambio de vista (grid/lista)
- Integración con PublicarProducto
- Gestión completa de productos

## 🔧 Servicios

### productService.js
Servicio principal para operaciones con productos.

**Métodos principales:**
```javascript
// CRUD básico
create(productData)           // Crear producto
get(productId)               // Obtener por ID
update(productId, data)      // Actualizar
delete(productId)            // Eliminar

// Consultas especializadas
getByUser(userId, options)   // Productos de usuario
getByCategory(category)      // Por categoría
getByTransactionType(type)   // Por tipo de transacción
search(searchTerm)           // Búsqueda por texto
getRecent(limit)             // Más recientes
getPopular(limit)            // Más populares

// Estadísticas
getUserStats(userId)         // Estadísticas del usuario
incrementViews(productId)    // Incrementar vistas
toggleFavorite(productId)    // Toggle favoritos
```

**Opciones de consulta:**
```javascript
{
  filters: [
    { field: 'categoria', operator: '==', value: 'Electrónicos' }
  ],
  orderBy: { field: 'fechaPublicacion', direction: 'desc' },
  limit: 20
}
```

### productUtils.js
Utilidades para formateo y validación de productos.

**Funciones:**
```javascript
formatPrice(price)           // Formatear precio en MXN
formatDate(date)             // Fecha relativa (Hoy, Ayer, etc.)
getStatusLabel(status)       // Etiqueta legible del estado
getTransactionTypeLabel(type) // Etiqueta del tipo de transacción
validateProduct(data)        // Validar datos del producto
```

## 🗄️ Estructura de Datos

### Producto en Firestore
```javascript
{
  id: "auto-generated",
  titulo: "string (requerido)",
  descripcion: "string (requerido, min 20 chars)",
  categoria: "string (requerido)",
  estado: "nuevo|como-nuevo|excelente|bueno|aceptable",
  tipoTransaccion: "venta|intercambio|donacion|alquiler",
  precio: "number|null (requerido para venta)",
  ubicacion: "string (opcional)",
  imagenes: ["url1", "url2", ...], // URLs de Firebase Storage
  usuarioId: "string (UID del usuario)",
  usuarioEmail: "string (email del usuario)",
  usuarioNombre: "string (nombre del usuario)",
  fechaPublicacion: "timestamp",
  estado: "activo|vendido|reservado",
  vistas: "number (contador)",
  favoritos: "number (contador)"
}
```

## 🔐 Seguridad y Validación

### Validación del Cliente
- **Campos requeridos** verificados antes del envío
- **Longitud mínima** para título (5 chars) y descripción (20 chars)
- **Validación de precio** para productos en venta
- **Límite de imágenes** (máximo 5)
- **Tipos de archivo** restringidos a imágenes

### Seguridad del Servidor
- **Autenticación requerida** para todas las operaciones
- **Propiedad de datos** (solo el propietario puede modificar)
- **Validación de permisos** en cada operación
- **Sanitización** de datos antes de guardar

## 🎨 UI/UX

### Diseño Responsive
- **Mobile-first** approach
- **Breakpoints** para diferentes tamaños de pantalla
- **Vistas adaptativas** (grid/lista)
- **Navegación móvil** optimizada

### Componentes DaisyUI
- **Cards** para productos
- **Stats** para estadísticas
- **Forms** con validación visual
- **Modals** para formularios
- **Dropdowns** para acciones
- **Badges** para estados y categorías

### Iconografía
- **Lucide React** para iconos consistentes
- **Iconos contextuales** para cada acción
- **Indicadores visuales** para estados

## 📱 Integración con la App

### Rutas Protegidas
```javascript
// App.jsx
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

### Navegación
- **Enlace en Navbar** para usuarios autenticados
- **Redirección automática** después de publicación
- **Breadcrumbs** para navegación contextual

### Estado Global
- **useAuth hook** para información del usuario
- **Context API** para estado de autenticación
- **Local state** para productos y estadísticas

## 🚀 Flujo de Uso

### 1. Acceso al Dashboard
```
Usuario autenticado → Click "Dashboard" → Página protegida
```

### 2. Publicar Producto
```
Click "Publicar Producto" → Modal de formulario → Llenar datos → 
Subir imágenes → Validar → Guardar → Confirmación → Lista actualizada
```

### 3. Gestión de Productos
```
Ver productos → Filtrar/Buscar → Cambiar vista → 
Editar/Eliminar → Estadísticas actualizadas
```

## 🧪 Casos de Prueba Recomendados

### Funcionalidad Básica
- [ ] Publicar producto con todos los campos
- [ ] Publicar producto sin precio (no venta)
- [ ] Subir múltiples imágenes
- [ ] Validación de campos requeridos
- [ ] Confirmación de publicación exitosa

### Dashboard
- [ ] Carga de estadísticas
- [ ] Filtros de búsqueda
- [ ] Cambio de vista (grid/lista)
- [ ] Eliminación de productos
- [ ] Actualización en tiempo real

### Edge Cases
- [ ] Usuario no autenticado
- [ ] Sin productos publicados
- [ ] Error de conexión
- [ ] Imágenes muy grandes
- [ ] Caracteres especiales en campos

## 🔮 Próximas Mejoras

### Funcionalidades Planificadas
1. **Edición de productos** en línea
2. **Galería de imágenes** con zoom
3. **Notificaciones** de cambios de estado
4. **Exportación** de datos de productos
5. **Bulk actions** para múltiples productos

### Mejoras Técnicas
1. **Lazy loading** de imágenes
2. **Paginación** para productos
3. **Cache** de datos en localStorage
4. **Offline support** con Service Workers
5. **Analytics** de uso del dashboard

### Integraciones Futuras
1. **Sistema de mensajería** entre usuarios
2. **Reviews y ratings** de productos
3. **Sistema de ofertas** para productos
4. **Integración con mapas** para ubicación
5. **Notificaciones push** para eventos importantes

## 📚 Recursos Adicionales

### Documentación
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Storage](https://firebase.google.com/docs/storage)
- [DaisyUI Components](https://daisyui.com/components/)
- [Lucide Icons](https://lucide.dev/)

### Mejores Prácticas
- **Validación** tanto en cliente como servidor
- **Manejo de errores** con mensajes claros
- **Loading states** para mejor UX
- **Optimización** de imágenes antes de subir
- **Cleanup** de recursos al desmontar componentes

---

Este sistema proporciona una base sólida para la gestión de productos, con arquitectura escalable y experiencia de usuario optimizada.
