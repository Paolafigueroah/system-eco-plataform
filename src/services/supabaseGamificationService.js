import { supabase, supabaseUtils } from '../supabaseConfig.js';

// Servicio de gamificación con Supabase
export const supabaseGamificationService = {
  // Obtener puntos del usuario
  getUserPoints: async (userId) => {
    try {
      console.log('🎮 Supabase: Obteniendo puntos del usuario...', userId);
      
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      const points = data ? data.total_points : 0;
      return supabaseUtils.handleSuccess({ points, userId }, 'Obtener puntos del usuario');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener puntos del usuario');
    }
  },

  // Agregar puntos al usuario
  addPoints: async (userId, points, action, description = '') => {
    try {
      console.log('🎮 Supabase: Agregando puntos...', { userId, points, action });
      
      // Verificar si el usuario ya tiene registro de puntos
      const { data: existingPoints, error: checkError } = await supabase
        .from('user_points')
        .select('total_points')
        .eq('user_id', userId)
        .single();

      let newTotalPoints = points;
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingPoints) {
        newTotalPoints = existingPoints.total_points + points;
      }

      // Actualizar o crear registro de puntos
      const { data, error } = await supabase
        .from('user_points')
        .upsert({
          user_id: userId,
          total_points: newTotalPoints,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      // Registrar la acción en el historial
      await supabaseGamificationService.recordAction(userId, action, points, description);

      return supabaseUtils.handleSuccess({ 
        totalPoints: newTotalPoints, 
        pointsAdded: points,
        action 
      }, 'Agregar puntos');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Agregar puntos');
    }
  },

  // Registrar acción del usuario
  recordAction: async (userId, action, points, description = '') => {
    try {
      console.log('🎮 Supabase: Registrando acción...', { userId, action, points });
      
      const { data, error } = await supabase
        .from('user_actions')
        .insert({
          user_id: userId,
          action,
          points_earned: points,
          description,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Registrar acción');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Registrar acción');
    }
  },

  // Obtener historial de acciones del usuario
  getUserActions: async (userId, limit = 20) => {
    try {
      console.log('🎮 Supabase: Obteniendo historial de acciones...', userId);
      
      const { data, error } = await supabase
        .from('user_actions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Obtener historial de acciones');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener historial de acciones');
    }
  },

  // Obtener badges del usuario
  getUserBadges: async (userId) => {
    try {
      console.log('🎮 Supabase: Obteniendo badges...', userId);
      
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Obtener badges');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener badges');
    }
  },

  // Otorgar badge al usuario
  grantBadge: async (userId, badgeId) => {
    try {
      console.log('🎮 Supabase: Otorgando badge...', { userId, badgeId });
      
      // Verificar si ya tiene el badge
      const { data: existingBadge, error: checkError } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_id', badgeId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingBadge) {
        return supabaseUtils.handleSuccess(null, 'Usuario ya tiene este badge');
      }

      const { data, error } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: badgeId,
          earned_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Otorgar badge');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Otorgar badge');
    }
  },

  // Verificar y otorgar badges automáticamente
  checkAndGrantBadges: async (userId) => {
    try {
      console.log('🎮 Supabase: Verificando badges...', userId);
      
      const { data: pointsData } = await supabaseGamificationService.getUserPoints(userId);
      const { data: actionsData } = await supabaseGamificationService.getUserActions(userId, 100);
      
      if (!pointsData.success || !actionsData.success) {
        return supabaseUtils.handleSuccess([], 'Verificar badges');
      }

      const totalPoints = pointsData.data.points;
      const actions = actionsData.data;
      
      const badgesToGrant = [];

      // Badge por puntos totales
      if (totalPoints >= 100 && !await hasBadge(userId, 'points_100')) {
        badgesToGrant.push({ badgeId: 'points_100', name: 'Primeros 100 puntos' });
      }
      if (totalPoints >= 500 && !await hasBadge(userId, 'points_500')) {
        badgesToGrant.push({ badgeId: 'points_500', name: 'Coleccionista' });
      }
      if (totalPoints >= 1000 && !await hasBadge(userId, 'points_1000')) {
        badgesToGrant.push({ badgeId: 'points_1000', name: 'Experto' });
      }

      // Badge por acciones específicas
      const publishedProducts = actions.filter(a => a.action === 'publish_product').length;
      if (publishedProducts >= 5 && !await hasBadge(userId, 'publisher_5')) {
        badgesToGrant.push({ badgeId: 'publisher_5', name: 'Publicador' });
      }

      const favoritedProducts = actions.filter(a => a.action === 'favorite_product').length;
      if (favoritedProducts >= 10 && !await hasBadge(userId, 'collector_10')) {
        badgesToGrant.push({ badgeId: 'collector_10', name: 'Coleccionista de Favoritos' });
      }

      // Otorgar badges
      for (const badge of badgesToGrant) {
        await supabaseGamificationService.grantBadge(userId, badge.badgeId);
      }

      return supabaseUtils.handleSuccess(badgesToGrant, 'Verificar badges');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Verificar badges');
    }
  },

  // Obtener ranking de usuarios
  getUserRanking: async (limit = 10) => {
    try {
      console.log('🎮 Supabase: Obteniendo ranking...');
      
      const { data, error } = await supabase
        .from('user_points')
        .select(`
          *,
          user:profiles!user_id(display_name, email)
        `)
        .order('total_points', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Obtener ranking');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener ranking');
    }
  }
};

// Función auxiliar para verificar si el usuario tiene un badge
const hasBadge = async (userId, badgeId) => {
  const { data } = await supabase
    .from('user_badges')
    .select('id')
    .eq('user_id', userId)
    .eq('badge_id', badgeId)
    .single();
  
  return !!data;
};

export default supabaseGamificationService;
