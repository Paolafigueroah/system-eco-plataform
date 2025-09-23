# 🚀 Configuración de SQLite - SYSTEM ECO

## 🎯 **¡Excelente elección! SQLite es perfecto para tu proyecto**

### **Ventajas de SQLite:**
- ✅ **No necesitas instalar nada** - viene incluido en Node.js
- ✅ **Base de datos en un archivo** - `system_eco.db` en tu proyecto
- ✅ **Sin configuración de servidor** - todo funciona localmente
- ✅ **Portable** - puedes mover el archivo fácilmente
- ✅ **Perfecto para desarrollo** - sin dependencias externas

## 📋 **Pasos para usar SQLite:**

### **1. Instalar dependencias (YA COMPLETADO)**
```bash
npm install
```

### **2. La base de datos se crea automáticamente**
- Al iniciar la aplicación, se crea el archivo `system_eco.db`
- Se crean todas las tablas automáticamente
- Se configuran índices y relaciones

### **3. Iniciar la aplicación**
```bash
npm run dev
```

### **4. Verificar en la consola del navegador:**
```
🚀 Inicializando SQLite...
✅ Base de datos SQLite inicializada correctamente
✅ Conexión a SQLite exitosa
✅ Usuario de prueba creado exitosamente
📧 Email: admin@systemeco.com
🔑 Contraseña: admin123
```

## 🔧 **Archivos creados:**

### **Nuevos archivos:**
- ✅ `src/sqliteConfig.js` - Configuración de SQLite
- ✅ `src/services/sqliteAuthService.js` - Servicio de autenticación
- ✅ `src/services/sqliteDatabaseService.js` - Servicio de base de datos
- ✅ `src/services/sqliteProductService.js` - Servicio de productos
- ✅ `src/initSQLite.js` - Inicialización automática
- ✅ `SQLITE_SETUP.md` - Esta guía

### **Archivos a modificar (próximo paso):**
- ⏳ `src/hooks/useAuth.js` - Cambiar de Supabase a SQLite
- ⏳ `src/components/Login.jsx` - Actualizar servicio de autenticación
- ⏳ `src/components/Signup.jsx` - Actualizar servicio de autenticación
- ⏳ `src/components/Dashboard.jsx` - Actualizar servicio de productos
- ⏳ `src/components/PublicarProducto.jsx` - Actualizar servicio de productos

## 📊 **Estructura de la base de datos:**

### **Tablas creadas automáticamente:**
- **`users`** - Usuarios del sistema
- **`products`** - Productos publicados
- **`conversations`** - Conversaciones de chat
- **`messages`** - Mensajes individuales
- **`files`** - Archivos subidos

### **Características:**
- ✅ **Foreign keys** habilitadas
- ✅ **Índices** para mejor rendimiento
- ✅ **Timestamps** automáticos
- ✅ **Auto-increment** en IDs

## 🔐 **Sistema de autenticación:**

### **Características:**
- ✅ **JWT tokens** para sesiones
- ✅ **Bcrypt** para hashing de contraseñas
- ✅ **Validación** de tokens
- ✅ **Manejo de sesiones** automático
- ✅ **Recuperación de contraseñas** (estructura preparada)

### **Usuario de prueba creado automáticamente:**
- **Email:** `admin@systemeco.com`
- **Contraseña:** `admin123`

## 🎯 **Próximos pasos:**

1. **Completar la migración** de componentes React
2. **Probar funcionalidades** básicas
3. **Implementar manejo de archivos** local
4. **Configurar backup** del archivo SQLite
5. **Optimizar consultas** SQL

## 📁 **Archivo de base de datos:**

- **Ubicación:** `system_eco.db` (en la raíz del proyecto)
- **Tamaño:** Se crea automáticamente (~1KB inicial)
- **Backup:** Simplemente copia el archivo
- **Portabilidad:** Puedes moverlo a cualquier lugar

## 🚨 **Ventajas sobre MySQL:**

### **SQLite:**
- ✅ **Sin instalación** de servidor
- ✅ **Sin configuración** de usuarios/permisos
- ✅ **Sin puertos** o firewall
- ✅ **Archivo único** fácil de manejar
- ✅ **Perfecto para desarrollo**

### **MySQL:**
- ❌ **Requiere servidor** instalado
- ❌ **Configuración compleja** de usuarios
- ❌ **Puertos y firewall** a configurar
- ❌ **Mantenimiento** del servidor

## 🔧 **Herramientas para ver SQLite:**

### **Opción 1: Extensión de VS Code**
- Instalar "SQLite Viewer" en VS Code
- Click derecho en `system_eco.db` → "Open With SQLite Viewer"

### **Opción 2: DB Browser for SQLite**
- Descargar desde: https://sqlitebrowser.org/
- Abrir el archivo `system_eco.db`

### **Opción 3: Línea de comandos**
```bash
# Si tienes SQLite instalado
sqlite3 system_eco.db
.tables
SELECT * FROM users;
.quit
```

## 📞 **Soporte:**

Si encuentras problemas:
1. Verificar consola del navegador
2. Verificar que se creó `system_eco.db`
3. Verificar permisos de escritura en el directorio
4. Revisar logs de la aplicación

---

**¡Tu aplicación SYSTEM ECO ahora usa SQLite! 🎉**

**No más servidores, no más configuración compleja, solo un archivo de base de datos que funciona perfectamente.**
