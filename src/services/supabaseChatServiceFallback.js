import { supabase, supabaseUtils } from '../supabaseConfig.js';

// Servicio de chat con fallback para cuando no existen las tablas
export const supabaseChatServiceFallback = {
  // Crear nueva conversación (fallback)
  createConversation: async (buyerId, sellerId, productId = null) => {
    try {
      console.log('💬 Supabase: Creando conversación (fallback)...', { buyerId, sellerId, productId });
      
      // Crear conversación simple en memoria/localStorage como fallback
      const conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        buyer_id: buyerId,
        seller_id: sellerId,
        product_id: productId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString()
      };

      // Guardar en localStorage como fallback
      const conversations = JSON.parse(localStorage.getItem('fallback_conversations') || '[]');
      conversations.push(conversation);
      localStorage.setItem('fallback_conversations', JSON.stringify(conversations));

      return supabaseUtils.handleSuccess(conversation, 'Crear conversación (fallback)');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Crear conversación (fallback)');
    }
  },

  // Obtener conversaciones del usuario (fallback)
  getUserConversations: async (userId) => {
    try {
      console.log('💬 Supabase: Obteniendo conversaciones del usuario (fallback)...', userId);
      
      // Obtener desde localStorage
      const conversations = JSON.parse(localStorage.getItem('fallback_conversations') || '[]');
      const userConversations = conversations.filter(conv => 
        conv.buyer_id === userId || conv.seller_id === userId
      );

      return supabaseUtils.handleSuccess(userConversations, 'Obtener conversaciones (fallback)');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener conversaciones (fallback)');
    }
  },

  // Enviar mensaje (fallback)
  sendMessage: async (conversationId, senderId, content) => {
    try {
      console.log('💬 Supabase: Enviando mensaje (fallback)...', { conversationId, senderId, content });
      
      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        conversation_id: conversationId,
        sender_id: senderId,
        content: content,
        created_at: new Date().toISOString(),
        is_read: false
      };

      // Guardar mensaje en localStorage
      const messages = JSON.parse(localStorage.getItem('fallback_messages') || '[]');
      messages.push(message);
      localStorage.setItem('fallback_messages', JSON.stringify(messages));

      // Actualizar última actividad de conversación
      const conversations = JSON.parse(localStorage.getItem('fallback_conversations') || '[]');
      const conversationIndex = conversations.findIndex(conv => conv.id === conversationId);
      if (conversationIndex !== -1) {
        conversations[conversationIndex].last_message_at = new Date().toISOString();
        conversations[conversationIndex].updated_at = new Date().toISOString();
        localStorage.setItem('fallback_conversations', JSON.stringify(conversations));
      }

      return supabaseUtils.handleSuccess(message, 'Enviar mensaje (fallback)');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Enviar mensaje (fallback)');
    }
  },

  // Obtener mensajes de una conversación (fallback)
  getConversationMessages: async (conversationId) => {
    try {
      console.log('💬 Supabase: Obteniendo mensajes de conversación (fallback)...', conversationId);
      
      const messages = JSON.parse(localStorage.getItem('fallback_messages') || '[]');
      const conversationMessages = messages.filter(msg => msg.conversation_id === conversationId);

      return supabaseUtils.handleSuccess(conversationMessages, 'Obtener mensajes (fallback)');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener mensajes (fallback)');
    }
  },

  // Obtener usuarios disponibles para chat (fallback)
  getAvailableUsers: async (currentUserId) => {
    try {
      console.log('💬 Supabase: Obteniendo usuarios disponibles (fallback)...', currentUserId);
      
      // Obtener usuarios desde la tabla auth (si es posible)
      try {
        const { data: users, error } = await supabase.auth.admin.listUsers();
        if (!error && users?.users) {
          const availableUsers = users.users
            .filter(user => user.id !== currentUserId)
            .map(user => ({
              id: user.id,
              email: user.email,
              display_name: user.user_metadata?.display_name || user.email,
              created_at: user.created_at
            }));
          
          return supabaseUtils.handleSuccess(availableUsers, 'Obtener usuarios (fallback)');
        }
      } catch (adminError) {
        console.warn('No se pudo obtener usuarios desde admin API:', adminError);
      }

      // Fallback: usuarios simulados
      const mockUsers = [
        {
          id: 'user_1',
          email: 'usuario1@ejemplo.com',
          display_name: 'Usuario 1',
          created_at: new Date().toISOString()
        },
        {
          id: 'user_2', 
          email: 'usuario2@ejemplo.com',
          display_name: 'Usuario 2',
          created_at: new Date().toISOString()
        }
      ];

      return supabaseUtils.handleSuccess(mockUsers, 'Obtener usuarios (fallback - mock)');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener usuarios (fallback)');
    }
  }
};
