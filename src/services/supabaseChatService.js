import { supabase, supabaseUtils } from '../supabaseConfig.js';

// Servicio de chat con Supabase
export const supabaseChatService = {
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

  // Obtener conversaciones del usuario
  getUserConversations: async (userId) => {
    try {
      console.log('💬 Supabase: Obteniendo conversaciones del usuario...', userId);
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          buyer:profiles!buyer_id(id, display_name, email),
          seller:profiles!seller_id(id, display_name, email)
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;

      console.log('💬 Datos obtenidos de Supabase:', data);

      // Transformar datos para compatibilidad con el frontend
      const transformedData = data.map(conversation => {
        const isBuyer = conversation.buyer_id === userId;
        const otherUser = isBuyer ? conversation.seller : conversation.buyer;
        
        console.log('💬 Transformando conversación:', {
          conversationId: conversation.id,
          isBuyer,
          otherUser,
          buyer: conversation.buyer,
          seller: conversation.seller
        });
        
        return {
          ...conversation,
          other_user: {
            id: otherUser?.id,
            name: otherUser?.display_name,
            email: otherUser?.email
          }
        };
      });

      console.log('💬 Conversaciones transformadas:', transformedData);

      return supabaseUtils.handleSuccess(transformedData, 'Obtener conversaciones del usuario');
    } catch (error) {
      console.error('💬 Error obteniendo conversaciones:', error);
      return supabaseUtils.handleError(error, 'Obtener conversaciones del usuario');
    }
  },

  // Enviar mensaje
  sendMessage: async (conversationId, senderId, content, messageType = 'text') => {
    try {
      console.log('💬 Supabase: Enviando mensaje...', { conversationId, senderId });
      
      // Crear el mensaje
      const { data: message, error: messageError } = await supabase
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

      if (messageError) throw messageError;

      // Actualizar la conversación con el último mensaje
      const { error: updateError } = await supabase
        .from('conversations')
        .update({
          last_message: content,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (updateError) {
        console.warn('⚠️ Error actualizando conversación:', updateError);
      }

      return supabaseUtils.handleSuccess(message, 'Enviar mensaje');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Enviar mensaje');
    }
  },

  // Obtener mensajes de una conversación
  getConversationMessages: async (conversationId) => {
    try {
      console.log('💬 Supabase: Obteniendo mensajes...', conversationId);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(id, display_name, email)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Obtener mensajes de conversación');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener mensajes de conversación');
    }
  },

  // Marcar mensajes como leídos
  markMessagesAsRead: async (conversationId, userId) => {
    try {
      console.log('💬 Supabase: Marcando mensajes como leídos...', { conversationId, userId });
      
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId); // No marcar como leídos los propios mensajes

      if (error) throw error;

      return supabaseUtils.handleSuccess(null, 'Marcar mensajes como leídos');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Marcar mensajes como leídos');
    }
  },

  // Obtener estadísticas de chat
  getChatStats: async (userId) => {
    try {
      console.log('💬 Supabase: Obteniendo estadísticas de chat...', userId);
      
      // Obtener conteo de conversaciones
      const { count: conversationCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

      // Obtener conteo de mensajes no leídos
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .neq('sender_id', userId);

      const stats = {
        conversations: conversationCount || 0,
        unread_messages: unreadCount || 0
      };

      return supabaseUtils.handleSuccess(stats, 'Obtener estadísticas de chat');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener estadísticas de chat');
    }
  },

  // Obtener todos los usuarios (para iniciar conversaciones)
  getAllUsers: async (currentUserId) => {
    try {
      console.log('💬 Supabase: Obteniendo usuarios...', currentUserId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, email, created_at')
        .neq('id', currentUserId)
        .order('display_name', { ascending: true });

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Obtener usuarios');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener usuarios');
    }
  },

  // Crear conversación grupal
  createGroupConversation: async (groupName, groupDescription, adminId, participantIds) => {
    try {
      console.log('💬 Supabase: Creando conversación grupal...', { groupName, adminId });
      
      const { data, error } = await supabase.rpc('create_group_conversation', {
        group_name_param: groupName,
        group_description_param: groupDescription,
        admin_id_param: adminId,
        participant_ids: participantIds
      });

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Crear conversación grupal');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Crear conversación grupal');
    }
  },

  // Obtener participantes de un grupo
  getGroupParticipants: async (conversationId) => {
    try {
      console.log('💬 Supabase: Obteniendo participantes del grupo...', conversationId);
      
      const { data, error } = await supabase
        .from('group_participants')
        .select(`
          *,
          user:profiles!user_id(id, display_name, email, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Obtener participantes del grupo');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener participantes del grupo');
    }
  },

  // Agregar participante a grupo
  addGroupParticipant: async (conversationId, userId, inviterId) => {
    try {
      console.log('💬 Supabase: Agregando participante al grupo...', { conversationId, userId });
      
      const { data, error } = await supabase.rpc('add_group_participant', {
        conversation_id_param: conversationId,
        user_id_param: userId,
        inviter_id_param: inviterId
      });

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Agregar participante al grupo');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Agregar participante al grupo');
    }
  },

  // Remover participante de grupo
  removeGroupParticipant: async (conversationId, userId, removerId) => {
    try {
      console.log('💬 Supabase: Removiendo participante del grupo...', { conversationId, userId });
      
      const { data, error } = await supabase.rpc('remove_group_participant', {
        conversation_id_param: conversationId,
        user_id_param: userId,
        remover_id_param: removerId
      });

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Remover participante del grupo');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Remover participante del grupo');
    }
  },

  // Cambiar rol de participante
  changeParticipantRole: async (conversationId, userId, newRole, changerId) => {
    try {
      console.log('💬 Supabase: Cambiando rol de participante...', { conversationId, userId, newRole });
      
      const { data, error } = await supabase
        .from('group_participants')
        .update({ role: newRole })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Cambiar rol de participante');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Cambiar rol de participante');
    }
  },

  // Actualizar información del grupo
  updateGroupInfo: async (conversationId, groupName, groupDescription, updaterId) => {
    try {
      console.log('💬 Supabase: Actualizando información del grupo...', { conversationId, groupName });
      
      const { data, error } = await supabase
        .from('conversations')
        .update({
          group_name: groupName,
          group_description: groupDescription,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Actualizar información del grupo');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Actualizar información del grupo');
    }
  }
};

// Utilidades para el chat
export const chatUtils = {
  // Obtener iniciales de un nombre
  getInitials: (name) => {
    if (!name) return '?';
    return name.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  },

  // Formatear fecha de mensaje
  formatMessageDate: (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes < 1 ? 'Ahora' : `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 168) { // 7 días
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
    } else {
      return date.toLocaleDateString();
    }
  },

  // Truncar texto
  truncateText: (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  },

  // Validar mensaje
  validateMessage: (content) => {
    if (!content || content.trim().length === 0) {
      return { valid: false, error: 'El mensaje no puede estar vacío' };
    }
    if (content.length > 1000) {
      return { valid: false, error: 'El mensaje es demasiado largo' };
    }
    return { valid: true, error: null };
  }
};

export default supabaseChatService;
