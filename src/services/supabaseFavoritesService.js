import { supabase, supabaseUtils } from '../supabaseConfig.js';

// Servicio de favoritos con Supabase
export const supabaseFavoritesService = {
  // Agregar a favoritos
  addToFavorites: async (productId) => {
    try {
      console.log('❤️ Supabase: Agregando a favoritos...', productId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          product_id: productId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Incrementar contador de favoritos en el producto
      await supabaseFavoritesService.incrementFavoriteCount(productId);

      return supabaseUtils.handleSuccess(data, 'Agregar a favoritos');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Agregar a favoritos');
    }
  },

  // Remover de favoritos
  removeFromFavorites: async (productId) => {
    try {
      console.log('❤️ Supabase: Removiendo de favoritos...', productId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .select()
        .single();

      if (error) throw error;

      // Decrementar contador de favoritos en el producto
      await supabaseFavoritesService.decrementFavoriteCount(productId);

      return supabaseUtils.handleSuccess(data, 'Remover de favoritos');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Remover de favoritos');
    }
  },

  // Verificar si un producto está en favoritos
  isFavorite: async (productId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: true, data: false, error: null };

      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      return supabaseUtils.handleSuccess(!!data, 'Verificar favorito');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Verificar favorito');
    }
  },

  // Obtener favoritos del usuario
  getUserFavorites: async (userId) => {
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

      // Extraer solo los productos
      const products = data.map(favorite => favorite.product).filter(Boolean);

      return supabaseUtils.handleSuccess(products, 'Obtener favoritos del usuario');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener favoritos del usuario');
    }
  },

  // Obtener conteo de favoritos de un producto
  getProductFavoriteCount: async (productId) => {
    try {
      const { count, error } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId);

      if (error) throw error;

      return supabaseUtils.handleSuccess(count || 0, 'Obtener conteo de favoritos');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener conteo de favoritos');
    }
  },

  // Obtener estadísticas de favoritos del usuario
  getFavoritesStats: async (userId) => {
    try {
      console.log('❤️ Supabase: Obteniendo estadísticas de favoritos...', userId);
      
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      // Calcular estadísticas
      const totalFavorites = data.length;
      const totalValue = data.reduce((sum, fav) => {
        return sum + (fav.product?.price || 0);
      }, 0);
      const categories = [...new Set(data.map(fav => fav.product?.category).filter(Boolean))];

      const stats = {
        totalFavorites,
        totalValue,
        categoriesCount: categories.length,
        categories
      };

      return supabaseUtils.handleSuccess(stats, 'Obtener estadísticas de favoritos');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener estadísticas de favoritos');
    }
  },

  // Alternar favorito (agregar o quitar)
  toggleFavorite: async (productId) => {
    try {
      console.log('❤️ Supabase: Alternando favorito...', productId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Verificar si ya es favorito
      const { data: existingFavorite, error: checkError } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingFavorite) {
        // Ya es favorito, removerlo
        return await supabaseFavoritesService.removeFromFavorites(productId);
      } else {
        // No es favorito, agregarlo
        return await supabaseFavoritesService.addToFavorites(productId);
      }
    } catch (error) {
      return supabaseUtils.handleError(error, 'Alternar favorito');
    }
  },

  // Incrementar contador de favoritos
  incrementFavoriteCount: async (productId) => {
    try {
      const { error } = await supabase.rpc('increment_favorites', {
        product_id: productId
      });

      if (error) {
        // Si la función no existe, hacer el incremento manual
        const { error: updateError } = await supabase
          .from('products')
          .update({ favorites: supabase.raw('favorites + 1') })
          .eq('id', productId);

        if (updateError) throw updateError;
      }

      return { success: true, error: null };
    } catch (error) {
      console.warn('⚠️ Error incrementando favoritos:', error);
      return { success: false, error: error.message };
    }
  },

  // Decrementar contador de favoritos
  decrementFavoriteCount: async (productId) => {
    try {
      const { error } = await supabase.rpc('decrement_favorites', {
        product_id: productId
      });

      if (error) {
        // Si la función no existe, hacer el decremento manual
        const { error: updateError } = await supabase
          .from('products')
          .update({ favorites: supabase.raw('GREATEST(favorites - 1, 0)') })
          .eq('id', productId);

        if (updateError) throw updateError;
      }

      return { success: true, error: null };
    } catch (error) {
      console.warn('⚠️ Error decrementando favoritos:', error);
      return { success: false, error: error.message };
    }
  },

  // Limpiar favoritos del usuario (para testing)
  clearUserFavorites: async (userId) => {
    try {
      console.log('❤️ Supabase: Limpiando favoritos del usuario...', userId);
      
      const { data, error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .select();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Limpiar favoritos del usuario');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Limpiar favoritos del usuario');
    }
  }
};

export default supabaseFavoritesService;
