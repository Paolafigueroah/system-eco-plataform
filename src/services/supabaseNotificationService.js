import { supabase, supabaseUtils } from '../supabaseConfig.js';

// Servicio de notificaciones con Supabase
export const supabaseNotificationService = {
  // Crear notificación
  createNotification: async (userId, type, title, message, data = {}) => {
    try {
      console.log('🔔 Supabase: Creando notificación...', { userId, type, title });
      
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type, // 'message', 'favorite', 'product_view', 'system'
          title,
          message,
          data,
          is_read: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(notification, 'Crear notificación');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Crear notificación');
    }
  },

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

      return supabaseUtils.handleSuccess(data, 'Obtener notificaciones');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener notificaciones');
    }
  },

  // Marcar notificación como leída
  markAsRead: async (notificationId) => {
    try {
      console.log('🔔 Supabase: Marcando notificación como leída...', notificationId);
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      return supabaseUtils.handleSuccess(null, 'Marcar como leída');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Marcar como leída');
    }
  },

  // Marcar todas las notificaciones como leídas
  markAllAsRead: async (userId) => {
    try {
      console.log('🔔 Supabase: Marcando todas las notificaciones como leídas...', userId);
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      return supabaseUtils.handleSuccess(null, 'Marcar todas como leídas');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Marcar todas como leídas');
    }
  },

  // Obtener conteo de notificaciones no leídas
  getUnreadCount: async (userId) => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      return supabaseUtils.handleSuccess(count || 0, 'Obtener conteo de no leídas');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener conteo de no leídas');
    }
  },

  // Eliminar notificación
  deleteNotification: async (notificationId) => {
    try {
      console.log('🔔 Supabase: Eliminando notificación...', notificationId);
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      return supabaseUtils.handleSuccess(null, 'Eliminar notificación');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Eliminar notificación');
    }
  },

  // Crear notificaciones automáticas
  notifyNewMessage: async (userId, senderName, messagePreview) => {
    return await supabaseNotificationService.createNotification(
      userId,
      'message',
      'Nuevo mensaje',
      `${senderName} te envió un mensaje: "${messagePreview}"`,
      { type: 'message' }
    );
  },

  notifyProductFavorited: async (userId, productTitle, userName) => {
    return await supabaseNotificationService.createNotification(
      userId,
      'favorite',
      'Producto agregado a favoritos',
      `${userName} agregó tu producto "${productTitle}" a sus favoritos`,
      { type: 'favorite' }
    );
  },

  notifyProductViewed: async (userId, productTitle, viewerName) => {
    return await supabaseNotificationService.createNotification(
      userId,
      'product_view',
      'Producto visto',
      `${viewerName} vio tu producto "${productTitle}"`,
      { type: 'product_view' }
    );
  }
};

export default supabaseNotificationService;
