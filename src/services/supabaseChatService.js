import { supabase, supabaseUtils } from '../supabaseConfig.js';

/**
 * Servicio de chat con Supabase
 * Proporciona funciones para conversaciones y mensajes en tiempo real
 * 
 * @namespace supabaseChatService
 */
export const supabaseChatService = {
  /**
   * Crear una nueva conversación entre comprador y vendedor
   * 
   * @param {string} buyerId - ID del comprador (UUID)
   * @param {string} sellerId - ID del vendedor (UUID)
   * @param {string|null} [productId=null] - ID del producto relacionado (opcional)
   * @returns {Promise<Object>} Resultado con success, data (conversación) y error
   * 
   * @example
   * const result = await supabaseChatService.createConversation(buyerId, sellerId, productId);
   */
  createConversation: async (buyerId, sellerId, productId = null) => {
    try {
      // Validación de parámetros
      if (!buyerId || typeof buyerId !== 'string') {
        return supabaseUtils.handleError(
          new Error('buyerId es requerido y debe ser un string'),
          'Crear conversación'
        );
      }
      
      if (!sellerId || typeof sellerId !== 'string') {
        return supabaseUtils.handleError(
          new Error('sellerId es requerido y debe ser un string'),
          'Crear conversación'
        );
      }
      
      if (buyerId === sellerId) {
        return supabaseUtils.handleError(
          new Error('No puedes crear una conversación contigo mismo'),
          'Crear conversación'
        );
      }
      
      // Validar formato UUID básico (Supabase usa UUIDs)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(buyerId) || !uuidRegex.test(sellerId)) {
        return supabaseUtils.handleError(
          new Error('buyerId y sellerId deben ser UUIDs válidos'),
          'Crear conversación'
        );
      }
      
      if (productId && !uuidRegex.test(productId)) {
        return supabaseUtils.handleError(
          new Error('productId debe ser un UUID válido'),
          'Crear conversación'
        );
      }
      
      console.log('💬 Supabase: Creando conversación...', { buyerId, sellerId, productId });
      
      // Verificar si ya existe una conversación entre estos usuarios
      const { data: existingConversation, error: checkError } = await supabase
        .from('conversations')
        .select('*')
        .or(`buyer_id.eq.${buyerId}.seller_id.eq.${sellerId},buyer_id.eq.${sellerId}.seller_id.eq.${buyerId}`)
        .maybeSingle();

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
      // Validación de parámetros
      if (!userId || typeof userId !== 'string') {
        return supabaseUtils.handleError(
          new Error('userId es requerido y debe ser un string'),
          'Obtener conversaciones del usuario'
        );
      }
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        return supabaseUtils.handleError(
          new Error('userId debe ser un UUID válido'),
          'Obtener conversaciones del usuario'
        );
      }
      
      console.log('💬 Supabase: Obteniendo conversaciones del usuario...', userId);
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          buyer:profiles!buyer_id(id, display_name, email),
          seller:profiles!seller_id(id, display_name, email)
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('last_message_at', { ascending: false, nullsLast: true });

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
      // Validación de parámetros
      if (!conversationId || typeof conversationId !== 'string') {
        return supabaseUtils.handleError(
          new Error('conversationId es requerido y debe ser un string'),
          'Enviar mensaje'
        );
      }
      
      if (!senderId || typeof senderId !== 'string') {
        return supabaseUtils.handleError(
          new Error('senderId es requerido y debe ser un string'),
          'Enviar mensaje'
        );
      }
      
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return supabaseUtils.handleError(
          new Error('El contenido del mensaje es requerido y no puede estar vacío'),
          'Enviar mensaje'
        );
      }
      
      if (content.length > 5000) {
        return supabaseUtils.handleError(
          new Error('El mensaje no puede exceder 5000 caracteres'),
          'Enviar mensaje'
        );
      }
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(conversationId) || !uuidRegex.test(senderId)) {
        return supabaseUtils.handleError(
          new Error('conversationId y senderId deben ser UUIDs válidos'),
          'Enviar mensaje'
        );
      }
      
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
      // Validación de parámetros
      if (!conversationId || typeof conversationId !== 'string') {
        return supabaseUtils.handleError(
          new Error('conversationId es requerido y debe ser un string'),
          'Obtener mensajes de conversación'
        );
      }
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(conversationId)) {
        return supabaseUtils.handleError(
          new Error('conversationId debe ser un UUID válido'),
          'Obtener mensajes de conversación'
        );
      }
      
      console.log('💬 Supabase: Obteniendo mensajes...', conversationId);
      
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      // Obtener mensajes con información del remitente
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(id, display_name, email)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Si hay un usuario autenticado, verificar qué mensajes ha leído
      if (currentUserId && messages && messages.length > 0) {
        const messageIds = messages.map(m => m.id);
        
        const { data: reads, error: readsError } = await supabase
          .from('message_reads')
          .select('message_id')
          .in('message_id', messageIds)
          .eq('user_id', currentUserId);

        if (!readsError && reads) {
          const readMessageIds = new Set(reads.map(r => r.message_id));
          messages.forEach(msg => {
            msg.is_read = readMessageIds.has(msg.id) || msg.sender_id === currentUserId;
          });
        }
      }

      return supabaseUtils.handleSuccess(messages || [], 'Obtener mensajes de conversación');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener mensajes de conversación');
    }
  },

  // Marcar mensajes como leídos
  markMessagesAsRead: async (conversationId, userId) => {
    try {
      // Validación de parámetros
      if (!conversationId || typeof conversationId !== 'string') {
        return supabaseUtils.handleError(
          new Error('conversationId es requerido y debe ser un string'),
          'Marcar mensajes como leídos'
        );
      }
      
      if (!userId || typeof userId !== 'string') {
        return supabaseUtils.handleError(
          new Error('userId es requerido y debe ser un string'),
          'Marcar mensajes como leídos'
        );
      }
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(conversationId) || !uuidRegex.test(userId)) {
        return supabaseUtils.handleError(
          new Error('conversationId y userId deben ser UUIDs válidos'),
          'Marcar mensajes como leídos'
        );
      }
      
      console.log('💬 Supabase: Marcando mensajes como leídos...', { conversationId, userId });
      
      // Obtener todos los mensajes no leídos de la conversación que no son del usuario
      const { data: unreadMessages, error: fetchError } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId);

      if (fetchError) throw fetchError;

      if (!unreadMessages || unreadMessages.length === 0) {
        return supabaseUtils.handleSuccess(null, 'Marcar mensajes como leídos');
      }

      // Insertar registros en message_reads para cada mensaje no leído
      const readsToInsert = unreadMessages.map(msg => ({
        message_id: msg.id,
        user_id: userId,
        read_at: new Date().toISOString()
      }));

      // Usar upsert para evitar duplicados
      const { error: insertError } = await supabase
        .from('message_reads')
        .upsert(readsToInsert, {
          onConflict: 'message_id,user_id',
          ignoreDuplicates: false
        });

      if (insertError) throw insertError;

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
      const { count: conversationCount, error: convError } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

      if (convError) throw convError;

      // Obtener conteo de mensajes no leídos usando message_reads
      // Primero obtener todos los mensajes de las conversaciones del usuario
      const { data: conversations, error: convsError } = await supabase
        .from('conversations')
        .select('id')
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

      if (convsError) throw convsError;

      let unreadCount = 0;
      if (conversations && conversations.length > 0) {
        const conversationIds = conversations.map(c => c.id);
        
        // Obtener mensajes no leídos (mensajes que no son del usuario y no están en message_reads)
        const { data: unreadMessages, error: unreadError } = await supabase
          .from('messages')
          .select(`
            id,
            message_reads!left(message_id)
          `)
          .in('conversation_id', conversationIds)
          .neq('sender_id', userId)
          .is('message_reads.message_id', null);

        if (!unreadError && unreadMessages) {
          unreadCount = unreadMessages.length;
        }
      }

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
