import { supabase, supabaseUtils } from '../supabaseConfig.js';

// Servicio de perfiles con Supabase
export const supabaseProfileService = {
  // Obtener perfil del usuario
  getUserProfile: async (userId) => {
    try {
      console.log('👤 Supabase: Obteniendo perfil de usuario...', userId);

      // Primero intentar obtener el perfil desde la tabla profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.warn('Error obteniendo perfil desde tabla profiles:', error);
        
        // Si no existe la tabla profiles, usar datos del usuario de auth
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        const defaultProfile = {
          id: userId,
          display_name: userData.user?.user_metadata?.display_name || userData.user?.email || 'Usuario',
          email: userData.user?.email || 'usuario@ejemplo.com',
          bio: 'Usuario de System Eco',
          location: 'Ubicación no especificada'
        };

        return supabaseUtils.handleSuccess(defaultProfile, 'Obtener perfil de usuario (desde auth)');
      }

      if (!data) {
        // Crear perfil por defecto si no existe
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        const defaultProfile = {
          id: userId,
          display_name: userData.user?.user_metadata?.display_name || userData.user?.email || 'Usuario',
          email: userData.user?.email || 'usuario@ejemplo.com',
          bio: 'Usuario de System Eco',
          location: 'Ubicación no especificada',
          created_at: new Date().toISOString()
        };

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert(defaultProfile)
          .select()
          .single();

        if (createError) {
          console.warn('Error creando perfil:', createError);
          return supabaseUtils.handleSuccess(defaultProfile, 'Obtener perfil de usuario (por defecto)');
        }

        return supabaseUtils.handleSuccess(newProfile, 'Obtener perfil de usuario');
      }

      return supabaseUtils.handleSuccess(data, 'Obtener perfil de usuario');
    } catch (error) {
      console.warn('Error obteniendo perfil, usando datos por defecto:', error);
      
      // Retornar perfil por defecto en caso de error
      const defaultProfile = {
        id: userId,
        display_name: 'Usuario',
        email: 'usuario@ejemplo.com',
        bio: 'Usuario de System Eco',
        location: 'Ubicación no especificada'
      };

      return supabaseUtils.handleSuccess(defaultProfile, 'Obtener perfil de usuario (por defecto)');
    }
  },

  // Actualizar perfil del usuario
  updateUserProfile: async (userId, profileData) => {
    try {
      console.log('👤 Supabase: Actualizando perfil de usuario...', { userId, profileData });

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Actualizar perfil de usuario');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Actualizar perfil de usuario');
    }
  },

  // Crear perfil inicial
  createInitialProfile: async (userId, userData) => {
    try {
      console.log('👤 Supabase: Creando perfil inicial...', { userId, userData });

      const profileData = {
        id: userId,
        display_name: userData.display_name || userData.full_name || 'Usuario',
        email: userData.email,
        bio: 'Usuario de System Eco',
        location: 'Ubicación no especificada',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Crear perfil inicial');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Crear perfil inicial');
    }
  },

  // Obtener estadísticas del usuario
  getUserStats: async (userId) => {
    try {
      console.log('👤 Supabase: Obteniendo estadísticas del usuario...', userId);

      // Obtener conteo de productos
      const { count: productsCount, error: productsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (productsError) throw productsError;

      // Obtener conteo de favoritos
      const { count: favoritesCount, error: favoritesError } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (favoritesError) throw favoritesError;

      // Obtener conteo de conversaciones
      const { count: conversationsCount, error: conversationsError } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

      if (conversationsError) throw conversationsError;

      return supabaseUtils.handleSuccess({
        total_products: productsCount || 0,
        total_favorites: favoritesCount || 0,
        total_conversations: conversationsCount || 0
      }, 'Obtener estadísticas del usuario');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener estadísticas del usuario');
    }
  }
};
