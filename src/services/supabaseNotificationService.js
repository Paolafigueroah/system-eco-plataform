import { supabase, supabaseUtils } from '../supabaseConfig.js';

// Servicio de notificaciones con Supabase
export const supabaseNotificationService = {
  // Obtener notificaciones del usuario
  getUserNotifications: async (userId, limit = 20) => {
    try {
      console.log('🔔 Supabase: Obteniendo notificaciones...', userId);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return supabaseUtils.handleSuccess(data || [], 'Obtener notificaciones');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener notificaciones');
    }
  },

  // Crear notificación
  createNotification: async (userId, title, message, type = 'info') => {
    try {
      console.log('🔔 Supabase: Creando notificación...', { userId, title, type });

      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Crear notificación');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Crear notificación');
    }
  },

  // Marcar notificación como leída
  markAsRead: async (notificationId, userId) => {
    try {
      console.log('🔔 Supabase: Marcando notificación como leída...', notificationId);

      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Marcar notificación como leída');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Marcar notificación como leída');
    }
  },

  // Marcar todas las notificaciones como leídas
  markAllAsRead: async (userId) => {
    try {
      console.log('🔔 Supabase: Marcando todas las notificaciones como leídas...', userId);

      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Marcar todas las notificaciones como leídas');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Marcar todas las notificaciones como leídas');
    }
  },

  // Obtener conteo de notificaciones no leídas
  getUnreadCount: async (userId) => {
    try {
      console.log('🔔 Supabase: Obteniendo conteo de notificaciones no leídas...', userId);

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      return supabaseUtils.handleSuccess(count || 0, 'Obtener conteo de notificaciones no leídas');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener conteo de notificaciones no leídas');
    }
  },

  // Eliminar notificación
  deleteNotification: async (notificationId, userId) => {
    try {
      console.log('🔔 Supabase: Eliminando notificación...', notificationId);

      const { data, error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Eliminar notificación');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Eliminar notificación');
    }
  },

  // Crear notificaciones de ejemplo
  createSampleNotifications: async (userId) => {
    try {
      console.log('🔔 Supabase: Creando notificaciones de ejemplo...', userId);

      const sampleNotifications = [
        {
          user_id: userId,
          title: '¡Bienvenido!',
          message: 'Gracias por unirte a System Eco. ¡Comienza explorando productos!',
          type: 'success'
        },
        {
          user_id: userId,
          title: 'Nuevo producto en tu categoría',
          message: 'Se ha publicado un nuevo producto que podría interesarte.',
          type: 'info'
        }
      ];

      const { data, error } = await supabase
        .from('notifications')
        .insert(sampleNotifications)
        .select();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Crear notificaciones de ejemplo');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Crear notificaciones de ejemplo');
    }
  }
};