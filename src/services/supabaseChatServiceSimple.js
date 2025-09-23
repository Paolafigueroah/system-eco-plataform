import { supabase, supabaseUtils } from '../supabaseConfig.js';

// Servicio de chat simplificado con Supabase
export const supabaseChatServiceSimple = {
  // Crear nueva conversación
  createConversation: async (buyerId, sellerId, productId = null) => {
    try {
      console.log('💬 Supabase: Creando conversación...', { buyerId, sellerId, productId });
      
      // Verificar si ya existe una conversación entre estos usuarios
      const { data: existingConversation, error: checkError } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(buyer_id.eq.${buyerId},seller_id.eq.${sellerId}),and(buyer_id.eq.${sellerId},seller_id.eq.${buyerId})`)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
        throw checkError;
      }

      if (existingConversation) {
        return supabaseUtils.handleSuccess(existingConversation, 'Conversación ya existe');
      }

      // Crear nueva conversación
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          buyer_id: buyerId,
          seller_id: sellerId,
          product_id: productId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Crear conversación');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Crear conversación');
    }
  },

  // Obtener conversaciones del usuario (versión simplificada)
  getUserConversations: async (userId) => {
    try {
      console.log('💬 Supabase: Obteniendo conversaciones del usuario...', userId);
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Obtener perfiles por separado para evitar errores de relaciones
      const conversations = data || [];
      for (let conv of conversations) {
        try {
          // Obtener perfil del comprador
          if (conv.buyer_id) {
            const { data: buyerData } = await supabase
              .from('profiles')
              .select('id, display_name, email')
              .eq('id', conv.buyer_id)
              .single();
            conv.buyer = buyerData;
          }
          
          // Obtener perfil del vendedor
          if (conv.seller_id) {
            const { data: sellerData } = await supabase
              .from('profiles')
              .select('id, display_name, email')
              .eq('id', conv.seller_id)
              .single();
            conv.seller = sellerData;
          }
        } catch (profileError) {
          console.warn('Error obteniendo perfil:', profileError);
          // Crear datos por defecto
          conv.buyer = conv.buyer || { id: conv.buyer_id, display_name: 'Usuario', email: 'usuario@ejemplo.com' };
          conv.seller = conv.seller || { id: conv.seller_id, display_name: 'Usuario', email: 'usuario@ejemplo.com' };
        }
      }

      // Transformar datos para compatibilidad con el frontend
      const transformedData = conversations.map(conversation => {
        const isBuyer = conversation.buyer_id === userId;
        const otherUser = isBuyer ? conversation.seller : conversation.buyer;
        
        return {
          ...conversation,
          other_user: {
            id: otherUser?.id,
            name: otherUser?.display_name || 'Usuario',
            email: otherUser?.email
          }
        };
      });

      return supabaseUtils.handleSuccess(transformedData, 'Obtener conversaciones del usuario');
    } catch (error) {
      console.error('Error al cargar conversaciones:', error.message);
      return supabaseUtils.handleError(error, 'Obtener conversaciones del usuario');
    }
  },

  // Obtener mensajes de una conversación
  getMessages: async (conversationId) => {
    try {
      console.log('💬 Supabase: Obteniendo mensajes...', conversationId);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return supabaseUtils.handleSuccess(data || [], 'Obtener mensajes');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener mensajes');
    }
  },

  // Enviar mensaje
  sendMessage: async (conversationId, senderId, content, messageType = 'text') => {
    try {
      console.log('💬 Supabase: Enviando mensaje...', { conversationId, senderId, content });

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content,
          message_type: messageType,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Actualizar última mensaje en la conversación
      await supabase
        .from('conversations')
        .update({
          last_message: content,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      return supabaseUtils.handleSuccess(data, 'Enviar mensaje');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Enviar mensaje');
    }
  },

  // Marcar mensajes como leídos
  markMessagesAsRead: async (conversationId, userId) => {
    try {
      console.log('💬 Supabase: Marcando mensajes como leídos...', { conversationId, userId });

      const { data, error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('is_read', false)
        .select();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Marcar mensajes como leídos');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Marcar mensajes como leídos');
    }
  },

  // Obtener estadísticas del chat
  getChatStats: async (userId) => {
    try {
      console.log('💬 Supabase: Obteniendo estadísticas del chat...', userId);

      const { count: conversationsCount, error: conversationsError } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

      if (conversationsError) throw conversationsError;

      const { count: unreadCount, error: unreadError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', 
          supabase
            .from('conversations')
            .select('id')
            .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        )
        .neq('sender_id', userId)
        .eq('is_read', false);

      if (unreadError) throw unreadError;

      return supabaseUtils.handleSuccess({
        total_conversations: conversationsCount || 0,
        unread_messages: unreadCount || 0
      }, 'Obtener estadísticas del chat');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener estadísticas del chat');
    }
  },

  // Obtener todos los usuarios (simplificado)
  getAllUsers: async (currentUserId) => {
    try {
      console.log('💬 Supabase: Obteniendo usuarios...', currentUserId);

      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .neq('id', currentUserId);

      if (error) throw error;

      return supabaseUtils.handleSuccess(data || [], 'Obtener usuarios');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener usuarios');
    }
  }
};
