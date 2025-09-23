import bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { executeQuery, executeQuerySingle, executeQueryRun } from '../sqliteConfig';

// Clave secreta para JWT (en producción debería estar en variables de entorno)
const JWT_SECRET = 'system_eco_secret_key_2024';

// Servicio de autenticación usando SQLite
export const sqliteAuthService = {
  
  // Registrar nuevo usuario
  async signUp(email, password, displayName) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await executeQuerySingle(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      
      if (existingUser.data) {
        return { 
          success: false, 
          error: 'El usuario ya existe con este email' 
        };
      }
      
      // Hashear la contraseña
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // Insertar nuevo usuario
      const result = await executeQueryRun(
        'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)',
        [email, passwordHash, displayName]
      );
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      // Obtener el usuario creado
      const newUser = await executeQuerySingle(
        'SELECT id, email, display_name, created_at FROM users WHERE id = ?',
        [result.data.lastInsertRowid]
      );
      
      if (!newUser.data) {
        return { 
          success: false, 
          error: 'Error al obtener el usuario creado' 
        };
      }
      
      // Generar token JWT
      const token = await new jose.SignJWT({ 
        userId: newUser.data.id, 
        email: newUser.data.email 
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(new TextEncoder().encode(JWT_SECRET));
      
      return {
        success: true,
        user: newUser.data,
        token
      };
      
    } catch (error) {
      console.error('Error en signUp:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  },
  
  // Iniciar sesión
  async signIn(email, password) {
    try {
      // Buscar usuario por email
      const result = await executeQuerySingle(
        'SELECT id, email, password_hash, display_name FROM users WHERE email = ?',
        [email]
      );
      
      if (result.error || !result.data) {
        return { 
          success: false, 
          error: 'Credenciales inválidas' 
        };
      }
      
      const user = result.data;
      
      if (!user || !user.password_hash) {
        return { 
          success: false, 
          error: 'Credenciales inválidas' 
        };
      }
      
      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isPasswordValid) {
        return { 
          success: false, 
          error: 'Credenciales inválidas' 
        };
      }
      
      // Generar token JWT
      const token = await new jose.SignJWT({ 
        userId: user.id, 
        email: user.email 
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(new TextEncoder().encode(JWT_SECRET));
      
      // Remover password_hash del objeto user
      const { password_hash, ...userWithoutPassword } = user;
      
      return {
        success: true,
        user: userWithoutPassword,
        token
      };
      
    } catch (error) {
      console.error('Error en signIn:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  },
  
  // Cerrar sesión (en JWT no hay que hacer nada en el servidor)
  async signOut() {
    return { success: true };
  },
  
  // Obtener usuario actual por token
  async getCurrentUser(token) {
    try {
      if (!token) {
        return { success: false, error: 'Token no proporcionado' };
      }
      
      // Verificar token
      const { payload } = await jose.jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      const decoded = payload;
      
      // Obtener usuario de la base de datos
      const result = await executeQuerySingle(
        'SELECT id, email, display_name, created_at FROM users WHERE id = ?',
        [decoded.userId]
      );
      
      if (result.error || !result.data) {
        return { success: false, error: 'Usuario no encontrado' };
      }
      
      return {
        success: true,
        user: result.data
      };
      
    } catch (error) {
      if (error.code === 'ERR_JWT_INVALID') {
        return { success: false, error: 'Token inválido' };
      }
      if (error.code === 'ERR_JWT_EXPIRED') {
        return { success: false, error: 'Token expirado' };
      }
      console.error('Error en getCurrentUser:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  },
  
  // Cambiar contraseña
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Obtener usuario actual
      const userResult = await executeQuerySingle(
        'SELECT password_hash FROM users WHERE id = ?',
        [userId]
      );
      
      if (userResult.error || !userResult.data) {
        return { success: false, error: 'Usuario no encontrado' };
      }
      
      const user = userResult.data;
      
      // Verificar contraseña actual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      
      if (!isCurrentPasswordValid) {
        return { success: false, error: 'Contraseña actual incorrecta' };
      }
      
      // Hashear nueva contraseña
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
      
      // Actualizar contraseña
      const updateResult = await executeQueryRun(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [newPasswordHash, userId]
      );
      
      if (updateResult.error) {
        return { success: false, error: updateResult.error };
      }
      
      return { success: true };
      
    } catch (error) {
      console.error('Error en changePassword:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  },
  
  // Restablecer contraseña (enviar email)
  async resetPassword(email) {
    try {
      // Verificar si el usuario existe
      const userResult = await executeQuerySingle(
        'SELECT id, display_name FROM users WHERE email = ?',
        [email]
      );
      
      if (userResult.error || !userResult.data) {
        return { success: false, error: 'Usuario no encontrado' };
      }
      
      // Generar token temporal para reset
      const resetToken = await new jose.SignJWT({ 
        userId: userResult.data.id, 
        email: email,
        type: 'reset'
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(new TextEncoder().encode(JWT_SECRET));
      
      // Aquí deberías enviar el email con el token
      // Por ahora solo retornamos el token
      console.log('Token de reset generado:', resetToken);
      
      return {
        success: true,
        message: 'Se ha enviado un email con instrucciones para restablecer la contraseña'
      };
      
    } catch (error) {
      console.error('Error en resetPassword:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  },
  
  // Verificar token de reset y cambiar contraseña
  async resetPasswordWithToken(token, newPassword) {
    try {
      // Verificar token
      const { payload } = await jose.jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      const decoded = payload;
      
      if (decoded.type !== 'reset') {
        return { success: false, error: 'Token inválido para reset de contraseña' };
      }
      
      // Hashear nueva contraseña
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
      
      // Actualizar contraseña
      const updateResult = await executeQueryRun(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [newPasswordHash, decoded.userId]
      );
      
      if (updateResult.error) {
        return { success: false, error: updateResult.error };
      }
      
      return { success: true };
      
    } catch (error) {
      if (error.code === 'ERR_JWT_INVALID') {
        return { success: false, error: 'Token inválido' };
      }
      if (error.code === 'ERR_JWT_EXPIRED') {
        return { success: false, error: 'Token expirado' };
      }
      console.error('Error en resetPasswordWithToken:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  },

  // Obtener perfil de usuario
  async getUserProfile(userId) {
    try {
      if (!userId) {
        return { success: false, error: 'ID de usuario requerido' };
      }

      const result = await executeQuerySingle(
        'SELECT id, email, display_name, created_at FROM users WHERE id = ?',
        [userId]
      );
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      if (!result.data) {
        return { success: false, error: 'Usuario no encontrado' };
      }
      
      return {
        success: true,
        user: result.data
      };
      
    } catch (error) {
      console.error('Error en getUserProfile:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  },

  // Actualizar perfil de usuario
  async updateUserProfile(userId, profileData) {
    try {
      if (!userId) {
        return { success: false, error: 'ID de usuario requerido' };
      }

      const { display_name, email } = profileData;
      
      if (!display_name || !email) {
        return { success: false, error: 'Nombre y email son requeridos' };
      }

      // Verificar si el email ya existe en otro usuario
      const emailCheck = await executeQuerySingle(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      
      if (emailCheck.error) {
        return { success: false, error: emailCheck.error };
      }
      
      if (emailCheck.data) {
        return { success: false, error: 'El email ya está en uso por otro usuario' };
      }

      // Actualizar perfil
      const updateResult = await executeQueryRun(
        'UPDATE users SET display_name = ?, email = ? WHERE id = ?',
        [display_name, email, userId]
      );
      
      if (updateResult.error) {
        return { success: false, error: updateResult.error };
      }
      
      // Obtener usuario actualizado
      const updatedUser = await executeQuerySingle(
        'SELECT id, email, display_name, created_at FROM users WHERE id = ?',
        [userId]
      );
      
      if (updatedUser.error) {
        return { success: false, error: updatedUser.error };
      }
      
      return {
        success: true,
        user: updatedUser.data
      };
      
    } catch (error) {
      console.error('Error en updateUserProfile:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  },

  // Obtener estadísticas del usuario
  async getUserStats(userId) {
    try {
      if (!userId) {
        return { success: false, error: 'ID de usuario requerido' };
      }

      // Obtener estadísticas de productos
      const productsResult = await executeQuery(
        'SELECT COUNT(*) as total_products FROM products WHERE user_id = ? AND status = "active"',
        [userId]
      );
      
      const viewsResult = await executeQuery(
        'SELECT SUM(views) as total_views FROM products WHERE user_id = ? AND status = "active"',
        [userId]
      );
      
      const categoriesResult = await executeQuery(
        'SELECT category, COUNT(*) as count FROM products WHERE user_id = ? AND status = "active" GROUP BY category',
        [userId]
      );
      
      const transactionTypesResult = await executeQuery(
        'SELECT transaction_type, COUNT(*) as count FROM products WHERE user_id = ? AND status = "active" GROUP BY transaction_type',
        [userId]
      );
      
      if (productsResult.error || viewsResult.error || categoriesResult.error || transactionTypesResult.error) {
        return { success: false, error: 'Error obteniendo estadísticas' };
      }
      
      const stats = {
        total_products: productsResult.data?.[0]?.total_products || 0,
        total_views: viewsResult.data?.[0]?.total_views || 0,
        categories: categoriesResult.data || [],
        transaction_types: transactionTypesResult.data || []
      };
      
      return {
        success: true,
        stats
      };
      
    } catch (error) {
      console.error('Error en getUserStats:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }
};

export default sqliteAuthService;
