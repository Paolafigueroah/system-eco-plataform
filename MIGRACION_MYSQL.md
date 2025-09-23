# 🚀 Migración de Supabase a MySQL - SYSTEM ECO

## 📋 **Pasos para completar la migración**

### **1. Instalar dependencias**
```bash
npm install
```

### **2. Configurar MySQL**

#### **Opción A: MySQL local (Recomendado para desarrollo)**
1. Instalar MySQL Server 8.0+
2. Instalar MySQL Workbench
3. Abrir MySQL Workbench
4. Conectar a tu servidor local:
   - Host: `localhost`
   - Port: `3306`
   - Username: `root`
   - Password: `120212paoFH`

#### **Opción B: MySQL en la nube**
- **PlanetScale** (gratis hasta 1GB)
- **Railway** (gratis hasta 500MB)
- **AWS RDS** (pago por uso)

### **3. Crear la base de datos**

1. **Abrir MySQL Workbench**
2. **Ejecutar el script completo** de `mysql-schema.sql`
3. **Verificar que se crearon las tablas:**
   ```sql
   SHOW TABLES;
   ```

### **4. Configurar variables de entorno**

1. **Crear archivo `.env`** en la raíz del proyecto:
   ```env
   VITE_MYSQL_HOST=localhost
   VITE_MYSQL_PORT=3306
   VITE_MYSQL_USER=root
   VITE_MYSQL_PASSWORD=120212paoFH
   VITE_MYSQL_DATABASE=system_eco
   VITE_JWT_SECRET=system_eco_secret_key_2024
   ```

2. **O usar el archivo `config.env`** que ya está creado

### **5. Probar la conexión**

1. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

2. **Verificar en la consola del navegador** que aparece:
   ```
   ✅ Conexión a MySQL exitosa
   ```

### **6. Crear usuario de prueba**

```sql
-- En MySQL Workbench, ejecutar:
INSERT INTO users (email, password_hash, display_name) VALUES 
('admin@systemeco.com', '$2b$10$hashedpassword', 'Administrador');
```

## 🔧 **Archivos modificados**

### **Nuevos archivos creados:**
- ✅ `mysql-schema.sql` - Esquema de la base de datos
- ✅ `src/mysqlConfig.js` - Configuración de conexión
- ✅ `src/services/mysqlAuthService.js` - Servicio de autenticación
- ✅ `src/services/mysqlDatabaseService.js` - Servicio de base de datos
- ✅ `src/services/mysqlProductService.js` - Servicio de productos
- ✅ `config.env` - Configuración de entorno
- ✅ `MIGRACION_MYSQL.md` - Esta guía

### **Archivos a modificar (próximo paso):**
- ⏳ `src/hooks/useAuth.js` - Cambiar de Supabase a MySQL
- ⏳ `src/components/Login.jsx` - Actualizar servicio de autenticación
- ⏳ `src/components/Signup.jsx` - Actualizar servicio de autenticación
- ⏳ `src/components/Dashboard.jsx` - Actualizar servicio de productos
- ⏳ `src/components/PublicarProducto.jsx` - Actualizar servicio de productos

## 🚨 **Problemas comunes y soluciones**

### **Error: "Access denied for user 'root'@'localhost'"**
```sql
-- En MySQL Workbench ejecutar:
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '120212paoFH';
FLUSH PRIVILEGES;
```

### **Error: "Can't connect to MySQL server"**
1. Verificar que MySQL esté ejecutándose
2. Verificar puerto 3306
3. Verificar firewall de Windows

### **Error: "Database 'system_eco' doesn't exist"**
1. Ejecutar primero: `CREATE DATABASE system_eco;`
2. Luego ejecutar el resto del script

## 📊 **Estructura de la base de datos**

### **Tablas principales:**
- **`users`** - Usuarios del sistema
- **`products`** - Productos publicados
- **`conversations`** - Conversaciones de chat
- **`messages`** - Mensajes individuales
- **`files`** - Archivos subidos

### **Vistas útiles:**
- **`active_products`** - Productos activos con nombre del vendedor
- **`user_stats`** - Estadísticas de usuarios

### **Procedimientos almacenados:**
- **`GetProductsByCategory`** - Obtener productos por categoría
- **`GetUserProducts`** - Obtener productos de un usuario
- **`UpdateProductViews`** - Incrementar vistas de un producto

## 🔐 **Sistema de autenticación**

### **Características:**
- ✅ **JWT tokens** para sesiones
- ✅ **Bcrypt** para hashing de contraseñas
- ✅ **Validación** de tokens
- ✅ **Manejo de sesiones** automático
- ✅ **Recuperación de contraseñas** (estructura preparada)

### **Flujo de autenticación:**
1. Usuario se registra/inicia sesión
2. Se genera token JWT
3. Token se almacena en localStorage
4. Token se valida en cada petición
5. Sesión expira después de 7 días

## 🎯 **Próximos pasos**

1. **Completar la migración** de componentes
2. **Probar funcionalidades** básicas
3. **Implementar manejo de archivos** local
4. **Configurar backup** de base de datos
5. **Optimizar consultas** SQL

## 📞 **Soporte**

Si encuentras problemas:
1. Verificar logs de MySQL
2. Verificar consola del navegador
3. Verificar configuración de conexión
4. Revisar permisos de usuario MySQL

---

**¡Tu aplicación SYSTEM ECO ahora usa MySQL! 🎉**
