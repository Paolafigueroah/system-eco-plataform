import { supabase, supabaseUtils } from '../supabaseConfig.js';
import { PRODUCTS_OWNER_COLUMN } from '../config/productSchema.js';

// Servicio de características en tiempo real con Supabase
export const supabaseRealtimeService = {
  // Suscribirse a cambios en productos
  subscribeToProducts: (callback, userId = null) => {
    try {
      console.log('⚡ Supabase: Suscribiéndose a cambios de productos...');
      
      const subscription = supabase
        .channel(userId ? `products_changes_${userId}` : 'products_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'products',
          ...(userId ? { filter: `${PRODUCTS_OWNER_COLUMN}=eq.${userId}` } : {})
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
      
      if (!conversationId) {
        console.error('❌ conversationId es requerido para suscribirse a mensajes');
        return null;
      }

      const channelName = `messages_${conversationId}`;
      const channel = supabase.channel(channelName, {
        config: {
          broadcast: { self: true },
          presence: { key: conversationId }
        }
      });

      // Suscribirse a cambios en mensajes (insert/update/delete)
      channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        console.log('💬 Mensaje en tiempo real:', payload);
        if (typeof callback === 'function') {
          callback(payload);
          return;
        }
        if (callback?.onMessage) {
          callback.onMessage(payload);
        }
      });

      // Manejar estado de suscripción
      channel.subscribe((status) => {
        console.log(`📡 Estado de suscripción a mensajes (${conversationId}):`, status);
        if (callback?.onStatus) {
          callback.onStatus(status);
        }
        if (status === 'SUBSCRIBED') {
          console.log('✅ Suscrito exitosamente a mensajes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error en el canal de mensajes');
        } else if (status === 'TIMED_OUT') {
          console.warn('⏱️ Timeout al suscribirse a mensajes');
        } else if (status === 'CLOSED') {
          console.warn('🔒 Canal de mensajes cerrado');
        }
      });

      return channel;
    } catch (error) {
      console.error('❌ Error suscribiéndose a mensajes:', error);
      return null;
    }
  },

  // Suscribirse a cambios en conversaciones
  subscribeToConversations: (userId, callback) => {
    try {
      console.log('⚡ Supabase: Suscribiéndose a conversaciones...', userId);
      
      if (!userId) {
        console.error('❌ userId es requerido para suscribirse a conversaciones');
        return null;
      }

      // Crear un canal para conversaciones
      const channelName = `conversations_${userId}`;
      const channel = supabase.channel(channelName, {
        config: {
          broadcast: { self: true },
          presence: { key: userId }
        }
      });
      
      // Suscribirse a conversaciones donde el usuario es buyer
      channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `buyer_id=eq.${userId}`
      }, (payload) => {
        console.log('💬 Conversación actualizada en tiempo real (buyer):', payload);
        if (callback) callback(payload);
      });

      // Suscribirse a conversaciones donde el usuario es seller
      channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `seller_id=eq.${userId}`
      }, (payload) => {
        console.log('💬 Conversación actualizada en tiempo real (seller):', payload);
        if (callback) callback(payload);
      });
      
      // También suscribirse a cambios en mensajes que puedan afectar las conversaciones
      // Esto asegura que cuando llega un nuevo mensaje, se actualice la lista de conversaciones
      channel.on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        console.log('💬 Nuevo mensaje detectado (puede afectar conversaciones):', payload);
        // Verificar si el mensaje pertenece a una conversación del usuario
        if (payload.new?.conversation_id && callback) {
          // Llamar al callback para refrescar la lista
          callback({ type: 'message_insert', conversation_id: payload.new.conversation_id });
        }
      });

      // Manejar estado de suscripción
      channel.subscribe((status) => {
        console.log(`📡 Estado de suscripción a conversaciones (${userId}):`, status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Suscrito exitosamente a conversaciones');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error en el canal de conversaciones');
        } else if (status === 'TIMED_OUT') {
          console.warn('⏱️ Timeout al suscribirse a conversaciones');
        } else if (status === 'CLOSED') {
          console.warn('🔒 Canal de conversaciones cerrado');
        }
      });

      return channel;
    } catch (error) {
      console.error('❌ Error suscribiéndose a conversaciones:', error);
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
      try {
        console.log('🔌 Desuscribiéndose del canal...');
        supabase.removeChannel(subscription);
        console.log('✅ Canal removido exitosamente');
      } catch (error) {
        console.error('❌ Error al desuscribirse:', error);
      }
    }
  },

  // Desuscribirse de todos los canales
  unsubscribeAll: () => {
    supabase.removeAllChannels();
  },

  // Verificar estado de conexión
  getConnectionStatus: () => {
    const channels = supabase.realtime.getChannels();
    const hasChannels = channels.length > 0;
    console.log(`📊 Estado de conexión: ${hasChannels ? 'Conectado' : 'Desconectado'} (${channels.length} canales activos)`);
    return hasChannels;
  },

  // Verificar si Realtime está habilitado para una tabla
  checkRealtimeEnabled: async (tableName) => {
    try {
      // Intentar crear una suscripción de prueba
      const testChannel = supabase.channel(`test_${Date.now()}`);
      testChannel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: tableName
      }, () => {});
      
      const status = await new Promise((resolve) => {
        testChannel.subscribe((status) => {
          testChannel.unsubscribe();
          supabase.removeChannel(testChannel);
          resolve(status);
        });
      });

      return status === 'SUBSCRIBED';
    } catch (error) {
      console.error(`❌ Error verificando Realtime para ${tableName}:`, error);
      return false;
    }
  }
};

export default supabaseRealtimeService;
