import { supabase, supabaseUtils } from '../supabaseConfig.js';

/**
 * Servicio de autenticación con Supabase
 * Proporciona funciones para registro, login, logout y gestión de usuarios
 * 
 * @namespace supabaseAuthService
 */
export const supabaseAuthService = {
  /**
   * Registrar nuevo usuario
   * 
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @param {string} displayName - Nombre a mostrar del usuario
   * @returns {Promise<Object>} Resultado de la operación con success, data y error
   * 
   * @example
   * const result = await supabaseAuthService.signUp('user@example.com', 'password123', 'John Doe');
   */
  signUp: async (email, password, displayName) => {
    try {
      console.log('🔐 Supabase: Registrando usuario...', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName
          }
        }
      });

      if (error) throw error;

      // Si el registro es exitoso, actualizar el perfil
      if (data.user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            display_name: displayName,
            email: email,
            updated_at: new Date().toISOString()
          });

        if (updateError) {
          console.warn('⚠️ Error actualizando perfil:', updateError);
        }
      }

      // Verificar si se requiere confirmación de email
      // En Supabase, si email_confirm es false, el usuario necesita confirmar su email
      const needsEmailConfirmation = data.user && !data.session;
      
      return supabaseUtils.handleSuccess({
        ...data,
        needsEmailConfirmation
      }, 'Registro de usuario');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Registro de usuario');
    }
  },

  /**
   * Iniciar sesión
   * 
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<Object>} Resultado de la operación con success, data y error
   * 
   * @example
   * const result = await supabaseAuthService.signIn('user@example.com', 'password123');
   */
  signIn: async (email, password) => {
    try {
      console.log('🔐 Supabase: Iniciando sesión...', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Retornar solo los datos básicos, el listener de auth state manejará el resto
      return supabaseUtils.handleSuccess({ user: data.user }, 'Inicio de sesión');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Inicio de sesión');
    }
  },

  // Cerrar sesión
  signOut: async () => {
    try {
      console.log('🔐 Supabase: Cerrando sesión...');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      return supabaseUtils.handleSuccess(null, 'Cierre de sesión');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Cierre de sesión');
    }
  },

  // Obtener usuario actual
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      if (user) {
        // Obtener perfil completo del usuario
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.warn('⚠️ Error obteniendo perfil:', profileError);
        }

        const userWithProfile = {
          id: user.id,
          email: user.email,
          display_name: profile?.display_name || user.user_metadata?.display_name || user.email,
          created_at: user.created_at,
          profile: profile
        };

        return supabaseUtils.handleSuccess(userWithProfile, 'Obtener usuario actual');
      }

      return supabaseUtils.handleSuccess(null, 'Obtener usuario actual');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener usuario actual');
    }
  },

  // Cambiar contraseña
  changePassword: async (newPassword) => {
    try {
      console.log('🔐 Supabase: Cambiando contraseña...');
      
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Cambio de contraseña');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Cambio de contraseña');
    }
  },

  // Restablecer contraseña
  resetPassword: async (email) => {
    try {
      console.log('🔐 Supabase: Restableciendo contraseña...', email);
      
      // Validar email
      if (!email || typeof email !== 'string' || !email.trim()) {
        return supabaseUtils.handleError(
          new Error('El correo electrónico es requerido'),
          'Restablecimiento de contraseña'
        );
      }

      // Construir URL de redirección
      const redirectUrl = `${window.location.origin}/reset-password`;
      console.log('🔐 URL de redirección:', redirectUrl);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl
      });

      if (error) {
        console.error('❌ Error de Supabase al restablecer contraseña:', error);
        throw error;
      }

      console.log('✅ Email de restablecimiento enviado exitosamente');
      return supabaseUtils.handleSuccess(
        { message: 'Se ha enviado un enlace de restablecimiento a tu correo electrónico' },
        'Restablecimiento de contraseña'
      );
    } catch (error) {
      console.error('❌ Error completo al restablecer contraseña:', error);
      return supabaseUtils.handleError(error, 'Restablecimiento de contraseña');
    }
  },

  // Obtener perfil de usuario
  getUserProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Obtener perfil de usuario');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener perfil de usuario');
    }
  },

  // Actualizar perfil de usuario
  updateUserProfile: async (userId, profileData) => {
    try {
      console.log('🔐 Supabase: Actualizando perfil...', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Actualizar perfil de usuario');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Actualizar perfil de usuario');
    }
  },

  // Autenticación con Google
  signInWithGoogle: async () => {
    try {
      console.log('🔐 Supabase: Iniciando sesión con Google...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Inicio de sesión con Google');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Inicio de sesión con Google');
    }
  },

  // Autenticación con Twitter
  signInWithTwitter: async () => {
    try {
      console.log('🔐 Supabase: Iniciando sesión con Twitter...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Inicio de sesión con Twitter');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Inicio de sesión con Twitter');
    }
  },

  // Obtener estadísticas del usuario
  getUserStats: async (userId) => {
    try {
      // Obtener conteo de productos
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Obtener conteo de favoritos
      const { count: favoriteCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const stats = {
        products: productCount || 0,
        favorites: favoriteCount || 0,
        views: 0, // Se puede calcular sumando views de productos
        messages: 0 // Se puede calcular contando mensajes en conversaciones
      };

      return supabaseUtils.handleSuccess(stats, 'Obtener estadísticas del usuario');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener estadísticas del usuario');
    }
  }
};

export default supabaseAuthService;
