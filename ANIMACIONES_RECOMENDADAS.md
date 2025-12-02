# 🎨 Guía de Animaciones Recomendadas

## 📦 Instalación

```bash
npm install framer-motion
```

## 🎯 Animaciones por Componente

### 1. ProductCard - Animaciones de Hover y Entrada

```jsx
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="product-card"
    >
      {/* Contenido */}
    </motion.div>
  );
};
```

### 2. Chat - Mensajes con Slide In

```jsx
const ChatMessage = ({ message, isOwn }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: isOwn ? 50 : -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`message ${isOwn ? 'own' : 'other'}`}
    >
      {message.content}
    </motion.div>
  );
};
```

### 3. Formularios - Validación con Shake

```jsx
const InputField = ({ error }) => {
  return (
    <motion.input
      animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.5 }}
      className={error ? 'error' : ''}
    />
  );
};
```

### 4. Loading Spinner Mejorado

```jsx
const LoadingSpinner = () => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="spinner"
    />
  );
};
```

### 5. Notificaciones - Bounce In

```jsx
const Notification = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.3 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="notification"
    >
      {message}
    </motion.div>
  );
};
```

### 6. Transiciones de Página

```jsx
import { AnimatePresence, motion } from 'framer-motion';

const App = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Home />
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  );
};
```

### 7. Botones con Ripple Effect

```jsx
const Button = ({ children, onClick }) => {
  const [ripple, setRipple] = useState(null);
  
  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipple({ x, y });
    setTimeout(() => setRipple(null), 600);
    onClick?.(e);
  };
  
  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="button"
    >
      {children}
      {ripple && (
        <motion.span
          className="ripple"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 4, opacity: 0 }}
          style={{ left: ripple.x, top: ripple.y }}
        />
      )}
    </motion.button>
  );
};
```

### 8. Skeleton Loaders

```jsx
const SkeletonCard = () => {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="skeleton-card"
    >
      <div className="skeleton-image" />
      <div className="skeleton-text" />
      <div className="skeleton-text short" />
    </motion.div>
  );
};
```

### 9. Modal con Backdrop

```jsx
const Modal = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="backdrop"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="modal"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
```

### 10. Lista con Stagger

```jsx
const ProductList = ({ products }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {products.map(product => (
        <motion.div key={product.id} variants={item}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
};
```

## 🎨 CSS Animations (Alternativa sin librería)

Si prefieres no usar framer-motion, puedes usar Tailwind CSS:

```css
/* En index.css o tailwind.config.js */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

.animate-pulse-slow {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## 📝 Implementación Recomendada

1. **Empezar con framer-motion** para componentes clave
2. **Agregar animaciones CSS** para efectos simples
3. **Priorizar**: ProductCard, Chat, Formularios, Modales
4. **Mantener consistencia** en duraciones (0.2s - 0.5s)

## ⚡ Performance

- Usar `will-change` CSS para elementos animados
- Evitar animar propiedades que causan reflow (width, height)
- Preferir `transform` y `opacity` para mejor performance
- Usar `useMemo` y `useCallback` en componentes animados

