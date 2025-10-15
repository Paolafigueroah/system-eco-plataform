import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Image as ImageIcon,
  Paperclip,
  Smile,
  X,
  User,
  MessageCircle,
  Wifi,
  WifiOff,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { supabaseChatService as chatService } from '../services/supabaseChatService';
import { useRealtime } from '../hooks/useRealtime.jsx';
import ChatMessage from './ChatMessage';
import EmojiPicker from './EmojiPicker';
import MessageSearch from './MessageSearch';
import { useTheme } from '../hooks/useTheme';

const ChatConversation = ({ conversation, currentUser, onBack, onClose }) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [lastMessageStatus, setLastMessageStatus] = useState('sent');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesUnsubscribe = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { subscribeToMessages, unsubscribe } = useRealtime();

  useEffect(() => {
    if (conversation) {
      loadMessages();
      // Marcar mensajes como leídos
      chatService.markMessagesAsRead(conversation.id, currentUser.id);

      // Suscripción en tiempo real a nuevos mensajes
      if (messagesUnsubscribe.current) {
        unsubscribe(messagesUnsubscribe.current);
        messagesUnsubscribe.current = null;
      }
      const sub = subscribeToMessages(conversation.id, (payload) => {
        const newMsg = payload?.new;
        if (!newMsg) {
          loadMessages();
          return;
        }
        // Evitar duplicados cuando llegan eventos simultáneos
        setMessages((prev) => {
          if (prev.length && prev[prev.length - 1]?.id === newMsg.id) return prev;
          return [...prev, newMsg];
        });
      });
      messagesUnsubscribe.current = sub;
    }
    return () => {
      if (messagesUnsubscribe.current) {
        unsubscribe(messagesUnsubscribe.current);
        messagesUnsubscribe.current = null;
      }
    };
  }, [conversation, currentUser.id, subscribeToMessages, unsubscribe]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando mensajes para conversación:', conversation.id);
      
      const result = await chatService.getConversationMessages(conversation.id);
      
      console.log('🔄 Resultado de mensajes:', result);
      
      if (result.success) {
        console.log('✅ Mensajes cargados:', result.data);
        setMessages(result.data);
      } else {
        console.error('❌ Error al cargar mensajes:', result.error);
        setMessages([]);
      }
    } catch (error) {
      console.error('❌ Error cargando mensajes:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Manejar estado de escritura
  const handleTyping = useCallback(() => {
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  }, []);

  // Manejar cambios en el input
  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
    handleTyping();
  };

  // Manejar selección de emoji
  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    handleTyping();
  };

  // Manejar selección de mensaje desde búsqueda
  const handleMessageSelect = (message) => {
    // Scroll al mensaje seleccionado
    const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Destacar el mensaje temporalmente
      messageElement.classList.add('bg-yellow-100', 'dark:bg-yellow-900');
      setTimeout(() => {
        messageElement.classList.remove('bg-yellow-100', 'dark:bg-yellow-900');
      }, 2000);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    if (!newMessage.trim()) {
      alert('El mensaje no puede estar vacío');
      return;
    }

    setSending(true);
    setLastMessageStatus('sending');
    const messageContent = newMessage.trim();
    setNewMessage(''); // Limpiar inmediatamente para mejor UX
    setIsTyping(false);
    
    try {
      console.log('📤 Enviando mensaje:', {
        conversationId: conversation.id,
        senderId: currentUser.id,
        content: messageContent
      });
      
      const result = await chatService.sendMessage(conversation.id, currentUser.id, messageContent);
      
      console.log('📤 Resultado de envío:', result);
      
      if (result.success) {
        console.log('✅ Mensaje enviado exitosamente');
        setLastMessageStatus('sent');
        // Marcar mensajes como leídos
        await chatService.markMessagesAsRead(conversation.id, currentUser.id);
      } else {
        console.error('❌ Error al enviar mensaje:', result.error);
        setLastMessageStatus('error');
        alert('Error al enviar mensaje: ' + result.error);
        setNewMessage(messageContent); // Restaurar mensaje si falló
      }
    } catch (error) {
      console.error('❌ Error al enviar mensaje:', error);
      setLastMessageStatus('error');
      alert('Error al enviar mensaje');
      setNewMessage(messageContent); // Restaurar mensaje si falló
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = () => {
    if (conversation.other_user) {
      return conversation.other_user;
    }
    
    // Si no hay other_user, intentar obtenerlo de buyer/seller
    const isBuyer = conversation.buyer_id === currentUser.id;
    if (isBuyer && conversation.seller) {
      return {
        id: conversation.seller.id,
        name: conversation.seller.display_name,
        email: conversation.seller.email
      };
    } else if (!isBuyer && conversation.buyer) {
      return {
        id: conversation.buyer.id,
        name: conversation.buyer.display_name,
        email: conversation.buyer.email
      };
    }
    
    // Fallback si no hay datos
    return { id: 'unknown', name: 'Usuario', email: 'usuario@example.com' };
  };

  const getParticipantName = (participant) => {
    return participant.name || participant.email || 'Usuario';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Conversación no encontrada</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header de la conversación */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          
          {/* Avatar del participante */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-semibold text-sm sm:text-base flex-shrink-0">
            {getParticipantName(getOtherParticipant()).charAt(0).toUpperCase()}
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                {getParticipantName(getOtherParticipant())}
              </h3>
              {/* Indicador de estado de conexión */}
              <div className="flex items-center space-x-1">
                {connectionStatus === 'connected' ? (
                  <Wifi className="h-3 w-3 text-green-500" title="Conectado" />
                ) : (
                  <WifiOff className="h-3 w-3 text-red-500" title="Desconectado" />
                )}
                {isTyping && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>escribiendo...</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
              {getOtherParticipant().email}
            </p>
          </div>
        </div>

        {/* Acciones de la conversación */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <button 
            onClick={() => setShowSearch(true)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            title="Buscar mensajes"
          >
            <Search className="h-4 w-4" />
          </button>
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 hidden sm:flex">
            <Phone className="h-4 w-4" />
          </button>
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 hidden sm:flex">
            <Video className="h-4 w-4" />
          </button>
          <div className="dropdown dropdown-end">
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
              <MoreVertical className="h-4 w-4" />
            </button>
            <ul className="dropdown-content menu p-2 shadow bg-white dark:bg-gray-800 rounded-lg w-32 border border-gray-200 dark:border-gray-700">
              <li>
                <button className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded">
                  <User className="h-4 w-4" />
                  <span>Ver perfil</span>
                </button>
              </li>
              <li>
                <button className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded">
                  <X className="h-4 w-4" />
                  <span>Eliminar chat</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-white dark:bg-gray-900">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay mensajes aún
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Envía el primer mensaje para comenzar la conversación
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isOwnMessage={message.sender_id === currentUser.id}
              currentUser={currentUser}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Formulario de envío de mensajes */}
      <div className="p-2 sm:p-3 lg:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2 sm:space-x-3">
          {/* Botones de acción - ocultos en móvil */}
          <div className="hidden sm:flex items-center space-x-1">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              title="Adjuntar archivo"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              title="Enviar imagen"
            >
              <ImageIcon className="h-4 w-4" />
            </button>
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          </div>

          {/* Campo de texto */}
          <div className="flex-1 min-w-0">
            <textarea
              value={newMessage}
              onChange={handleMessageChange}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              rows={1}
              maxLength={1000}
              disabled={sending}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
              {newMessage.length}/1000
            </div>
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={`bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 p-2 sm:p-3 flex-shrink-0 flex items-center justify-center ${
              !newMessage.trim() || sending ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
            }`}
            title={sending ? 'Enviando...' : 'Enviar mensaje'}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            ) : lastMessageStatus === 'error' ? (
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : lastMessageStatus === 'sent' ? (
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </button>
        </form>
      </div>

      {/* Componente de búsqueda de mensajes */}
      <MessageSearch
        messages={messages}
        onMessageSelect={handleMessageSelect}
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
      />

    </div>
  );
};

export default ChatConversation;
