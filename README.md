# System Eco - Plataforma de Intercambio

Una aplicación React moderna construida con Tailwind CSS y soporte para múltiples bases de datos (SQLite local y Supabase en la nube). Esta plataforma permite a los usuarios intercambiar, vender y donar productos de manera sostenible.

## 🚀 Características

### ✨ Funcionalidades Principales
- **React 18** con hooks modernos y patrones actuales
- **Vite** para desarrollo y construcción rápida
- **Tailwind CSS** para estilos utility-first
- **Múltiples bases de datos**: SQLite local y Supabase en la nube
- **Autenticación completa** con registro e inicio de sesión
- **Sistema de productos** con CRUD completo
- **Chat en tiempo real** con funcionalidades avanzadas
- **Sistema de favoritos** para productos
- **Sistema de reviews y ratings** para productos
- **Categorización** de productos por tipo
- **Filtros avanzados** y búsqueda
- **Diseño responsivo** que funciona en todos los dispositivos
- **UI/UX moderna** con animaciones suaves
- **Migración automática** entre bases de datos
- **Modo híbrido** para desarrollo y producción

### 💬 Chat Privado Mejorado
- **Conversaciones 1:1** entre comprador y vendedor
- **Indicadores de escritura** en tiempo real
- **Estados de conexión** visuales
- **Selector de emojis** integrado
- **Búsqueda de mensajes** avanzada
- **Notificaciones push** con sonidos
- **Feedback visual** mejorado

### 📱 PWA y Optimización
- **Aplicación Web Progresiva** (PWA)
- **Modo offline** con indicadores
- **Lazy loading** de imágenes
- **Optimización de rendimiento**
- **Instalación en dispositivos**

## 🛠️ Stack Tecnológico

### Frontend
- React 18.2.0
- Vite 5.0.8
- React Router DOM 6.8.1
- Tailwind CSS
- Lucide React Icons

### Bases de Datos
- **SQLite** (local) - Para desarrollo rápido
- **Supabase** (nube) - Para producción escalable
- **Modo Híbrido** - SQLite para dev, Supabase para prod

### Styling
- Tailwind CSS 3.3.6
- DaisyUI
- PostCSS

## 🚀 **SITIO EN VIVO**

**🌐 URL del sitio**: [https://system-eco-plataform.vercel.app](https://system-eco-plataform.vercel.app)

**✅ Estado**: ✅ **DEPLOYADO Y FUNCIONANDO**

---

## ⚡ Configuración Rápida

### 1. Instalación
```bash
npm install
```

### 2. Configuración de Base de Datos

#### Opción A: SQLite (Rápido para desarrollo)
```bash
# No requiere configuración adicional
npm run dev
```

#### Opción B: Supabase (Recomendado para producción)
1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Copia `env.example` a `.env`
3. Configura tus credenciales:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
VITE_DATABASE_TYPE=supabase
```
4. Ejecuta el script SQL en `supabase-schema.sql`
5. Inicia la aplicación:
```bash
npm run dev
```

### 3. Cambiar Base de Datos
Ve a `/debug` en tu aplicación y usa el "Database Migrator" para cambiar entre SQLite y Supabase.
- Autoprefixer

### Backend
- Firebase 10.7.1
  - Authentication
  - Firestore Database
  - Storage
  - Analytics

### Development Tools
- ESLint
- PostCSS
- Hot Reload

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx      # Navigation component
│   ├── Login.jsx       # Login form component
│   ├── Signup.jsx      # Signup form component
│   ├── AuthContainer.jsx # Authentication container
│   ├── ProtectedRoute.jsx # Route protection component
│   ├── PublicarProducto.jsx # Product publication form
│   └── ProductCard.jsx # Reusable product card
├── pages/              # Page components
│   ├── Home.jsx        # Landing page
│   ├── About.jsx       # About page
│   ├── Contact.jsx     # Contact page
│   ├── Auth.jsx        # Authentication page
│   └── Dashboard.jsx   # User dashboard for products
├── services/           # Firebase and external services
│   ├── authService.js  # Authentication services
│   ├── firestoreService.js # Firestore operations
│   └── productService.js # Product-specific services
├── utils/              # Utility functions and helpers
│   ├── validation.js   # Form validation utilities
│   └── helpers.js      # General helper functions
├── hooks/              # Custom React hooks
│   └── useAuth.js      # Authentication context and hook
├── assets/             # Static assets (images, icons, etc.)
│   └── logo.svg        # Application logo
├── App.jsx             # Main application component
├── main.jsx            # Application entry point
├── index.css           # Global styles
└── firebaseConfig.js   # Firebase configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd react-firebase-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication, Firestore, Storage, and Analytics
   - Copy your Firebase configuration
   - Update `src/firebaseConfig.js` with your credentials

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Firebase Setup

1. **Authentication**
   - Enable Email/Password authentication
   - Configure sign-up methods as needed

2. **Firestore Database**
   - Create a database in test mode
   - Set up security rules

3. **Storage**
   - Enable Cloud Storage
   - Configure security rules

4. **Update Configuration**
   ```javascript
   // src/firebaseConfig.js
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "your-messaging-sender-id",
     appId: "your-app-id",
     measurementId: "your-measurement-id"
   };
   ```

### Tailwind CSS Configuration

The project includes a custom Tailwind configuration with:
- Custom color palette
- DaisyUI integration
- Custom component classes
- Responsive design utilities

## 📱 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Customization

### Colors and Themes

The application uses a custom color palette defined in `tailwind.config.js`. You can customize:

- Primary colors
- Secondary colors
- Accent colors
- Base colors for light/dark themes

### Components

All components are built with Tailwind CSS and can be easily customized by modifying the utility classes.

### Styling

Global styles are defined in `src/index.css` with custom component classes for:
- Buttons
- Cards
- Input fields
- Common UI elements

## 🔐 Authentication

The application includes a complete authentication system with:

- User registration and login
- Password reset functionality
- Authentication state management with React Context
- Protected routes implementation
- User profile management
- Secure logout functionality

## 📦 Product Management System

A comprehensive product management system with:

- **Product Publication**: Complete form with image uploads
- **Dashboard**: User statistics and product management
- **CRUD Operations**: Create, read, update, delete products
- **Image Storage**: Firebase Storage integration
- **Advanced Filtering**: Search, category, and status filters
- **Real-time Updates**: Live statistics and product lists
- **Responsive Design**: Grid and list view modes

## 🗄️ Database Operations

Firestore service provides:

- CRUD operations
- Real-time listeners
- Query building
- Error handling
- Timestamp management

## 📝 Form Validation

Comprehensive validation utilities for:

- Email validation
- Password strength
- Required fields
- Custom validation rules
- Form validation helpers

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**
   ```bash
   firebase init hosting
   ```

4. **Deploy**
   ```bash
   firebase deploy
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Firebase documentation](https://firebase.google.com/docs)
2. Review the [Tailwind CSS documentation](https://tailwindcss.com/docs)
3. Open an issue in the repository

## 📚 Additional Documentation

For detailed information about specific systems:

- **[Authentication System](README_Auth.md)** - Complete guide to the authentication system
- **[Product Management](README_Productos.md)** - Comprehensive guide to the product management system

## 🚀 Quick Start Guide

1. **Authentication**: Users can register/login at `/auth`
2. **Dashboard**: Access user dashboard at `/dashboard` (requires authentication)
3. **Products**: Publish and manage products through the dashboard
4. **Navigation**: Use the navbar to access different sections

## 🔮 Future Enhancements

- [x] Complete authentication system
- [x] User profile management
- [x] File upload functionality
- [x] Advanced search and filtering
- [x] Product management dashboard
- [x] Dark mode toggle
- [x] Real-time chat features
- [x] PWA capabilities
- [x] Unit and integration tests
- [x] CI/CD pipeline
- [x] Product editing functionality
- [x] Image gallery with modal view
- [x] User notifications system
- [x] Gamification system (points, badges)
- [x] Service Worker for offline support
- [x] Error boundaries and error handling
- [x] Responsive design
- [x] Lazy loading and performance optimization

---

Built with ❤️ using React, Tailwind CSS, and Firebase
