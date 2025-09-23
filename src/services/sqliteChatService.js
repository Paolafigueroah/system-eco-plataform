import { executeQuery, executeQuerySingle, executeQueryRun } from '../sqliteConfig';

// Servicio de chat para SQLite
const sqliteChatService = {
  // Crear una nueva conversación
  async createConversation(userId1, userId2) {
    try {
      // Verificar si ya existe una conversación entre estos usuarios
      const existingConversation = await executeQuerySingle(
        'SELECT * FROM conversations WHERE (buyer_id = ? AND seller_id = ?) OR (buyer_id = ? AND seller_id = ?)',
        [userId1, userId2, userId2, userId1]
      );

      if (existingConversation.data) {
        return { success: true, data: existingConversation.data };
      }

      const result = await executeQueryRun(
        'INSERT INTO conversations (buyer_id, seller_id, created_at, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        [userId1, userId2]
      );

      if (result.error) {
        return { success: false, error: result.error };
      }

      // Obtener la conversación creada
      const conversation = await executeQuerySingle(
        'SELECT * FROM conversations WHERE id = ?',
        [result.data.lastInsertRowid]
      );

      return { success: true, data: conversation.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obtener conversaciones de un usuario
  async getUserConversations(userId) {
    try {
      const result = await executeQuery(
        `SELECT c.*, 
                u1.display_name as buyer_name, u1.email as buyer_email,
                u2.display_name as seller_name, u2.email as seller_email
         FROM conversations c
         JOIN users u1 ON c.buyer_id = u1.id
         JOIN users u2 ON c.seller_id = u2.id
         WHERE c.buyer_id = ? OR c.seller_id = ?
         ORDER BY c.updated_at DESC`,
        [userId, userId]
      );

      if (result.error) {
        return { success: false, error: result.error };
      }

      // Transformar los datos para que coincidan con lo que espera el componente
      const conversations = (result.data || []).map(conv => ({
        id: conv.id,
        buyer_id: conv.buyer_id,
        seller_id: conv.seller_id,
        buyer_name: conv.buyer_name,
        seller_name: conv.seller_name,
        buyer_email: conv.buyer_email,
        seller_email: conv.seller_email,
        last_message: conv.last_message,
        last_message_at: conv.last_message_at,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        // Agregar información del otro usuario
        other_user: {
          id: conv.buyer_id === userId ? conv.seller_id : conv.buyer_id,
          name: conv.buyer_id === userId ? conv.seller_name : conv.buyer_name,
          email: conv.buyer_id === userId ? conv.seller_email : conv.buyer_email
        }
      }));

      return { success: true, data: conversations };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obtener mensajes de una conversación
  async getConversationMessages(conversationId) {
    try {
      const result = await executeQuery(
        'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
        [conversationId]
      );

      if (result.error) {
        return { success: false, error: result.error };
      }

      return { success: true, data: result.data || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Enviar un mensaje
  async sendMessage(conversationId, senderId, content, messageType = 'text') {
    try {
      const result = await executeQueryRun(
        'INSERT INTO messages (conversation_id, sender_id, content, message_type, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [conversationId, senderId, content, messageType]
      );

      if (result.error) {
        return { success: false, error: result.error };
      }

      // Actualizar la conversación con el último mensaje
      await executeQueryRun(
        'UPDATE conversations SET last_message = ?, last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [content, conversationId]
      );

      // Obtener el mensaje enviado
      const message = await executeQuerySingle(
        'SELECT * FROM messages WHERE id = ?',
        [result.lastInsertRowid]
      );

      return { success: true, data: message.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Marcar mensajes como leídos
  async markMessagesAsRead(conversationId, userId) {
    try {
      const result = await executeQueryRun(
        'UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?',
        [conversationId, userId]
      );

      if (result.error) {
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obtener conversación por ID
  async getConversationById(conversationId) {
    try {
      const result = await executeQuerySingle(
        `SELECT c.*, p.title as product_title, p.price, p.image_url,
                u1.display_name as buyer_name, u2.display_name as seller_name
         FROM conversations c
         JOIN products p ON c.product_id = p.id
         JOIN users u1 ON c.buyer_id = u1.id
         JOIN users u2 ON c.seller_id = u2.id
         WHERE c.id = ?`,
        [conversationId]
      );

      if (result.error) {
        return { success: false, error: result.error };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obtener estadísticas de chat
  async getChatStats(userId) {
    try {
      const totalConversations = await executeQuerySingle(
        'SELECT COUNT(*) as count FROM conversations WHERE buyer_id = ? OR seller_id = ?',
        [userId, userId]
      );

      const unreadMessages = await executeQuerySingle(
        `SELECT COUNT(*) as count FROM messages m
         JOIN conversations c ON m.conversation_id = c.id
         WHERE (c.buyer_id = ? OR c.seller_id = ?) AND m.sender_id != ? AND m.is_read = 0`,
        [userId, userId, userId]
      );

      return {
        success: true,
        data: {
          totalConversations: totalConversations.data?.count || 0,
          unreadMessages: unreadMessages.data?.count || 0
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obtener todos los usuarios (para crear nuevas conversaciones)
  async getAllUsers(currentUserId) {
    try {
      const result = await executeQuery(
        'SELECT id, email, display_name FROM users WHERE id != ? ORDER BY display_name',
        [currentUserId]
      );

      if (result.error) {
        return { success: false, error: result.error };
      }

      return { success: true, data: result.data || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Utilidades de chat
const chatUtils = {
  // Formatear fecha para mostrar
  formatMessageDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Ahora';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 168) { // 7 días
      return `${Math.floor(diffInHours / 24)}d`;
    } else {
      return date.toLocaleDateString();
    }
  },

  // Verificar si un mensaje es del usuario actual
  isOwnMessage(message, currentUserId) {
    return message.sender_id === currentUserId;
  },

  // Obtener el nombre del remitente
  getSenderName(message, currentUserId, conversation) {
    if (message.sender_id === currentUserId) {
      return 'Tú';
    }
    return conversation.buyer_id === message.sender_id 
      ? conversation.buyer_name 
      : conversation.seller_name;
  },

  // Obtener iniciales de un nombre
  getInitials(name) {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  },

  // Truncar texto
  truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  },

  // Validar mensaje
  validateMessage(message) {
    if (!message || message.trim().length === 0) {
      return { isValid: false, error: 'El mensaje no puede estar vacío' };
    }
    if (message.length > 1000) {
      return { isValid: false, error: 'El mensaje es demasiado largo (máximo 1000 caracteres)' };
    }
    return { isValid: true };
  }
};

export { sqliteChatService, chatUtils };
export default sqliteChatService;
