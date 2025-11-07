import { supabase, supabaseUtils } from '../supabaseConfig.js';

// Servicio de características en tiempo real con Supabase
export const supabaseRealtimeService = {
  // Suscribirse a cambios en productos
  subscribeToProducts: (callback) => {
    try {
      console.log('⚡ Supabase: Suscribiéndose a cambios de productos...');
      
      const subscription = supabase
        .channel('products_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'products'
        }, (payload) => {
          console.log('📦 Producto actualizado en tiempo real:', payload);
          callback(payload);
        })
        .subscribe();

      return subscription;
    } catch (error) {
      console.error('Error suscribiéndose a productos:', error);
      return null;
    }
  },

  // Suscribirse a cambios en favoritos
  subscribeToFavorites: (userId, callback) => {
    try {
      console.log('⚡ Supabase: Suscribiéndose a favoritos...', userId);
      
      const subscription = supabase
        .channel('favorites_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${userId}`
        }, (payload) => {
          console.log('❤️ Favorito actualizado en tiempo real:', payload);
          callback(payload);
        })
        .subscribe();

      return subscription;
    } catch (error) {
      console.error('Error suscribiéndose a favoritos:', error);
      return null;
    }
  },

  // Suscribirse a cambios en mensajes de chat
  subscribeToMessages: (conversationId, callback) => {
    try {
      console.log('⚡ Supabase: Suscribiéndose a mensajes...', conversationId);
      
      const subscription = supabase
        .channel(`messages_${conversationId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        }, (payload) => {
          console.log('💬 Nuevo mensaje en tiempo real:', payload);
          callback(payload);
        })
        .subscribe();

      return subscription;
    } catch (error) {
      console.error('Error suscribiéndose a mensajes:', error);
      return null;
    }
  },

  // Suscribirse a cambios en conversaciones
  subscribeToConversations: (userId, callback) => {
    try {
      console.log('⚡ Supabase: Suscribiéndose a conversaciones...', userId);
      
      // Crear dos canales separados para buyer_id y seller_id
      const channel = supabase.channel(`conversations_${userId}`);
      
      // Suscribirse a conversaciones donde el usuario es buyer
      channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `buyer_id=eq.${userId}`
      }, (payload) => {
        console.log('💬 Conversación actualizada en tiempo real (buyer):', payload);
        callback(payload);
      });

      // Suscribirse a conversaciones donde el usuario es seller
      channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `seller_id=eq.${userId}`
      }, (payload) => {
        console.log('💬 Conversación actualizada en tiempo real (seller):', payload);
        callback(payload);
      });

      channel.subscribe();

      return channel;
    } catch (error) {
      console.error('Error suscribiéndose a conversaciones:', error);
      return null;
    }
  },

  // Suscribirse a cambios en notificaciones
  subscribeToNotifications: (userId, callback) => {
    try {
      console.log('⚡ Supabase: Suscribiéndose a notificaciones...', userId);
      
      const subscription = supabase
        .channel(`notifications_${userId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        }, (payload) => {
          console.log('🔔 Nueva notificación en tiempo real:', payload);
          callback(payload);
        })
        .subscribe();

      return subscription;
    } catch (error) {
      console.error('Error suscribiéndose a notificaciones:', error);
      return null;
    }
  },

  // Suscribirse a cambios en puntos de gamificación
  subscribeToUserPoints: (userId, callback) => {
    try {
      console.log('⚡ Supabase: Suscribiéndose a puntos...', userId);
      
      const subscription = supabase
        .channel(`user_points_${userId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_points',
          filter: `user_id=eq.${userId}`
        }, (payload) => {
          console.log('🎮 Puntos actualizados en tiempo real:', payload);
          callback(payload);
        })
        .subscribe();

      return subscription;
    } catch (error) {
      console.error('Error suscribiéndose a puntos:', error);
      return null;
    }
  },

  // Desuscribirse de un canal
  unsubscribe: (subscription) => {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  },

  // Desuscribirse de todos los canales
  unsubscribeAll: () => {
    supabase.removeAllChannels();
  },

  // Verificar estado de conexión
  getConnectionStatus: () => {
    return supabase.realtime.getChannels().length > 0;
  }
};

export default supabaseRealtimeService;
