import { supabase, supabaseUtils } from '../supabaseConfig.js';

// Servicio de favoritos simplificado con Supabase
export const supabaseFavoritesServiceSimple = {
  // Agregar producto a favoritos
  addFavorite: async (userId, productId) => {
    try {
      console.log('❤️ Supabase: Agregando a favoritos...', { userId, productId });

      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: userId,
          product_id: productId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Agregar a favoritos');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Agregar a favoritos');
    }
  },

  // Remover producto de favoritos
  removeFavorite: async (userId, productId) => {
    try {
      console.log('❤️ Supabase: Removiendo de favoritos...', { userId, productId });

      const { data, error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId)
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Remover de favoritos');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Remover de favoritos');
    }
  },

  // Obtener favoritos del usuario
  getFavorites: async (userId) => {
    try {
      console.log('❤️ Supabase: Obteniendo favoritos del usuario...', userId);

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return supabaseUtils.handleSuccess(data || [], 'Obtener favoritos del usuario');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener favoritos del usuario');
    }
  },

  // Verificar si un producto está en favoritos
  isFavorite: async (userId, productId) => {
    try {
      console.log('❤️ Supabase: Verificando favorito...', { userId, productId });

      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      const isFavorite = !!data;
      return supabaseUtils.handleSuccess(isFavorite, 'Verificar favorito');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Verificar favorito');
    }
  },

  // Alternar favorito (agregar si no existe, remover si existe)
  toggleFavorite: async (userId, productId) => {
    try {
      console.log('❤️ Supabase: Alternando favorito...', { userId, productId });

      // Verificar si ya es favorito
      const isFavoriteResult = await supabaseFavoritesServiceSimple.isFavorite(userId, productId);
      
      if (!isFavoriteResult.success) {
        return isFavoriteResult;
      }

      const isFavorite = isFavoriteResult.data;

      if (isFavorite) {
        // Remover de favoritos
        return await supabaseFavoritesServiceSimple.removeFavorite(userId, productId);
      } else {
        // Agregar a favoritos
        return await supabaseFavoritesServiceSimple.addFavorite(userId, productId);
      }
    } catch (error) {
      return supabaseUtils.handleError(error, 'Alternar favorito');
    }
  },

  // Obtener estadísticas de favoritos
  getFavoritesStats: async (userId) => {
    try {
      console.log('❤️ Supabase: Obteniendo estadísticas de favoritos...', userId);

      const { count, error } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;

      return supabaseUtils.handleSuccess({
        total_favorites: count || 0
      }, 'Obtener estadísticas de favoritos');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener estadísticas de favoritos');
    }
  }
};
