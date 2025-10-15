import { supabase } from '../supabaseConfig';
import { supabaseUtils } from './mainServices';

export const supabaseReviewService = {
  // Crear nueva reseña
  createReview: async (reviewData) => {
    try {
      console.log('📝 Supabase: Creando reseña...', reviewData);
      
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          product_id: reviewData.productId,
          user_id: reviewData.userId,
          rating: reviewData.rating,
          title: reviewData.title,
          comment: reviewData.comment,
          recommend: reviewData.recommend,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Crear reseña');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Crear reseña');
    }
  },

  // Obtener reseñas de un producto
  getProductReviews: async (productId, limit = 50, offset = 0) => {
    try {
      console.log('📝 Supabase: Obteniendo reseñas del producto...', productId);
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:profiles!user_id(id, display_name, email, avatar_url)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Obtener reseñas del producto');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener reseñas del producto');
    }
  },

  // Obtener reseñas de un usuario
  getUserReviews: async (userId, limit = 50, offset = 0) => {
    try {
      console.log('📝 Supabase: Obteniendo reseñas del usuario...', userId);
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          product:products!product_id(id, title, image_url)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Obtener reseñas del usuario');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener reseñas del usuario');
    }
  },

  // Actualizar reseña
  updateReview: async (reviewId, reviewData) => {
    try {
      console.log('📝 Supabase: Actualizando reseña...', reviewId);
      
      const { data, error } = await supabase
        .from('reviews')
        .update({
          rating: reviewData.rating,
          title: reviewData.title,
          comment: reviewData.comment,
          recommend: reviewData.recommend,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Actualizar reseña');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Actualizar reseña');
    }
  },

  // Eliminar reseña
  deleteReview: async (reviewId) => {
    try {
      console.log('📝 Supabase: Eliminando reseña...', reviewId);
      
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      return supabaseUtils.handleSuccess(null, 'Eliminar reseña');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Eliminar reseña');
    }
  },

  // Marcar reseña como útil
  markReviewHelpful: async (reviewId, userId, helpful = true) => {
    try {
      console.log('📝 Supabase: Marcando reseña como útil...', reviewId);
      
      const { data, error } = await supabase
        .from('review_helpful')
        .upsert({
          review_id: reviewId,
          user_id: userId,
          helpful,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Marcar reseña como útil');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Marcar reseña como útil');
    }
  },

  // Obtener estadísticas de reseñas de un producto
  getProductReviewStats: async (productId) => {
    try {
      console.log('📝 Supabase: Obteniendo estadísticas de reseñas...', productId);
      
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId);

      if (error) throw error;

      const stats = {
        total: data.length,
        average: data.length > 0 ? data.reduce((sum, review) => sum + review.rating, 0) / data.length : 0,
        distribution: [5, 4, 3, 2, 1].map(rating => ({
          rating,
          count: data.filter(r => r.rating === rating).length
        }))
      };

      return supabaseUtils.handleSuccess(stats, 'Obtener estadísticas de reseñas');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener estadísticas de reseñas');
    }
  },

  // Verificar si el usuario ya escribió una reseña para el producto
  hasUserReviewed: async (productId, userId) => {
    try {
      console.log('📝 Supabase: Verificando si el usuario ya reseñó...', { productId, userId });
      
      const { data, error } = await supabase
        .from('reviews')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

      return supabaseUtils.handleSuccess(!!data, 'Verificar si el usuario ya reseñó');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Verificar si el usuario ya reseñó');
    }
  }
};

export default supabaseReviewService;
