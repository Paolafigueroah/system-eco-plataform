import { supabase, supabaseUtils } from '../supabaseConfig.js';

// Servicio de perfiles de usuario con Supabase
export const supabaseProfileService = {
  // Obtener perfil de usuario
  getProfile: async (userId) => {
    try {
      console.log('👤 Supabase: Obteniendo perfil...', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Si no existe el perfil, crear uno básico
        if (error.code === 'PGRST116') {
          return await supabaseProfileService.createProfile(userId, {
            display_name: '',
            bio: '',
            location: '',
            phone: '',
            website: ''
          });
        }
        throw error;
      }

      return supabaseUtils.handleSuccess(data, 'Obtener perfil');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener perfil');
    }
  },

  // Crear perfil de usuario
  createProfile: async (userId, profileData) => {
    try {
      console.log('👤 Supabase: Creando perfil...', userId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const profile = {
        id: userId,
        display_name: profileData.display_name || user.user_metadata?.display_name || user.email,
        email: user.email,
        bio: profileData.bio || '',
        location: profileData.location || '',
        phone: profileData.phone || '',
        website: profileData.website || '',
        avatar_url: profileData.avatar_url || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Crear perfil');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Crear perfil');
    }
  },

  // Actualizar perfil de usuario
  updateProfile: async (userId, updateData) => {
    try {
      console.log('👤 Supabase: Actualizando perfil...', userId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Solo permitir actualizar el propio perfil
      if (user.id !== userId) {
        throw new Error('No tienes permisos para actualizar este perfil');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Actualizar perfil');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Actualizar perfil');
    }
  },

  // Obtener todos los perfiles (para búsqueda)
  getAllProfiles: async () => {
    try {
      console.log('👤 Supabase: Obteniendo todos los perfiles...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Obtener todos los perfiles');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener todos los perfiles');
    }
  },

  // Buscar perfiles
  searchProfiles: async (searchTerm) => {
    try {
      console.log('👤 Supabase: Buscando perfiles...', searchTerm);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`display_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Buscar perfiles');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Buscar perfiles');
    }
  },

  // Subir avatar
  uploadAvatar: async (userId, file) => {
    try {
      console.log('👤 Supabase: Subiendo avatar...', userId);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { data, error } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      // Actualizar perfil con nueva URL de avatar
      const updateResult = await supabaseProfileService.updateProfile(userId, {
        avatar_url: publicUrl
      });

      if (updateResult.success) {
        return supabaseUtils.handleSuccess({ url: publicUrl }, 'Subir avatar');
      } else {
        throw new Error(updateResult.error);
      }
    } catch (error) {
      return supabaseUtils.handleError(error, 'Subir avatar');
    }
  },

  // Eliminar perfil
  deleteProfile: async (userId) => {
    try {
      console.log('👤 Supabase: Eliminando perfil...', userId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Solo permitir eliminar el propio perfil
      if (user.id !== userId) {
        throw new Error('No tienes permisos para eliminar este perfil');
      }

      const { data, error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Eliminar perfil');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Eliminar perfil');
    }
  }
};

export default supabaseProfileService;