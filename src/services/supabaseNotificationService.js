import { supabase, supabaseUtils } from '../supabaseConfig.js';

// Servicio de notificaciones con Supabase
export const supabaseNotificationService = {
  // Obtener notificaciones del usuario
  getUserNotifications: async (userId) => {
    try {
      console.log('🔔 Supabase: Obteniendo notificaciones...', userId);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Obtener notificaciones');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener notificaciones');
    }
  },

  // Crear notificación
  createNotification: async (userId, notificationData) => {
    try {
      console.log('🔔 Supabase: Creando notificación...', userId);
      
      const notification = {
        user_id: userId,
        ...notificationData,
        is_read: false,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Crear notificación');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Crear notificación');
    }
  },

  // Marcar notificación como leída
  markAsRead: async (notificationId) => {
    try {
      console.log('🔔 Supabase: Marcando notificación como leída...', notificationId);
      
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
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
        .eq('is_read', false);

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Marcar todas las notificaciones como leídas');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Marcar todas las notificaciones como leídas');
    }
  },

  // Eliminar notificación
  deleteNotification: async (notificationId) => {
    try {
      console.log('🔔 Supabase: Eliminando notificación...', notificationId);
      
      const { data, error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Eliminar notificación');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Eliminar notificación');
    }
  },

  // Obtener contador de notificaciones no leídas
  getUnreadCount: async (userId) => {
    try {
      console.log('🔔 Supabase: Obteniendo contador de notificaciones...', userId);
      
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      return supabaseUtils.handleSuccess({ count: count || 0 }, 'Obtener contador de notificaciones');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener contador de notificaciones');
    }
  }
};

export default supabaseNotificationService;