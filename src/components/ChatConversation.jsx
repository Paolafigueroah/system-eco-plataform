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
  AlertCircle,
  Search
} from 'lucide-react';
import { supabaseChatService as chatService } from '../services/supabaseChatService';
import { useRealtime } from '../hooks/useRealtime.jsx';
import ChatMessage from './ChatMessage';
import EmojiPicker from './EmojiPicker';
import MessageSearch from './MessageSearch';
import { useTheme } from '../hooks/useTheme';
import { logger } from '../utils/logger';
import { performanceMetrics } from '../utils/performanceMetrics';

const PAGE_SIZE = 40;

const ChatConversation = ({ conversation, currentUser, onBack, onClose }) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [lastMessageStatus, setLastMessageStatus] = useState('sent');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const messagesUnsubscribe = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { subscribeToMessages, unsubscribe } = useRealtime();

  useEffect(() => {
    if (!conversation || !currentUser?.id) return;
    
    let isMounted = true;
    let subscription = null;
    let reconnectTimeout = null;
    let reconnectAttempts = 0;
    
    const setupSubscription = async () => {
      // Cargar mensajes iniciales
      if (isMounted) {
        await loadMessages({ reset: true });
        // Marcar mensajes como leídos
        chatService.markMessagesAsRead(conversation.id, currentUser.id);
      }

      // Limpiar suscripción anterior si existe
      if (messagesUnsubscribe.current && messagesUnsubscribe.current.subscription) {
        unsubscribe(messagesUnsubscribe.current.subscription);
        messagesUnsubscribe.current = null;
      }

      setConnectionStatus('connecting');

      // Crear nueva suscripción
      subscription = subscribeToMessages(conversation.id, {
        onMessage: (payload) => {
        if (!isMounted) return;
        
        logger.chat('📨 Payload recibido en tiempo real', payload);
        
        let newMsg = null;
        
        if (payload) {
          newMsg = payload.new || payload.record || payload;
          if (payload.eventType === 'DELETE') {
            const deletedId = payload.old?.id;
            if (deletedId) {
              setMessages((prev) => prev.filter((message) => message.id !== deletedId));
            }
            return;
          }

          if (newMsg && !newMsg.id && !newMsg.conversation_id) {
            newMsg = payload.new?.id ? payload.new : 
                    payload.record?.id ? payload.record : 
                    null;
          }
        }
        
        if (!newMsg || !newMsg.id) {
          logger.warn('⚠️ Payload sin datos válidos, recargando mensajes...', payload);
          if (isMounted) {
            setTimeout(() => {
              if (isMounted) {
                loadMessages({ reset: true });
              }
            }, 500);
          }
          return;
        }
        
        // Verificar que el mensaje pertenece a esta conversación
        if (newMsg.conversation_id !== conversation.id) {
          logger.warn('⚠️ Mensaje de otra conversación, ignorando', newMsg.conversation_id);
          return;
        }
        
        // Evitar duplicados cuando llegan eventos simultáneos
        setMessages((prev) => {
          const exists = prev.some(msg => msg.id === newMsg.id);
          if (exists) {
            if (payload.eventType === 'UPDATE') {
              return prev.map((msg) => (msg.id === newMsg.id ? { ...msg, ...newMsg } : msg));
            }
            return prev;
          }
          const updated = [...prev, newMsg].sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateA - dateB;
          });
          return updated;
        });
        
        // Marcar como leído automáticamente si es un mensaje recibido
        if (newMsg.sender_id !== currentUser.id && isMounted) {
          chatService.markMessagesAsRead(conversation.id, currentUser.id);
        }
        
        setTimeout(() => {
          if (isMounted) {
            scrollToBottom();
          }
        }, 100);
      },
        onStatus: (status) => {
          if (!isMounted) return;
          if (status === 'SUBSCRIBED') {
            reconnectAttempts = 0;
            setConnectionStatus('connected');
            return;
          }
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            setConnectionStatus('disconnected');
            if (reconnectAttempts < 3 && !reconnectTimeout) {
              reconnectAttempts += 1;
              reconnectTimeout = setTimeout(() => {
                if (isMounted) {
                  reconnectTimeout = null;
                  setupSubscription();
                }
              }, 1500 * reconnectAttempts);
            }
            return;
          }
          setConnectionStatus('connecting');
        }
      });

      if (subscription) {
        messagesUnsubscribe.current = { subscription };
      } else {
        setConnectionStatus('disconnected');
        logger.error('❌ No se pudo crear la suscripción');
      }
    };
    
    setupSubscription();

    // Cleanup function
    return () => {
      isMounted = false;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (messagesUnsubscribe.current) {
        if (messagesUnsubscribe.current.subscription) {
          unsubscribe(messagesUnsubscribe.current.subscription);
        }
        messagesUnsubscribe.current = null;
      }
      if (subscription) {
        unsubscribe(subscription);
      }
    };
  }, [conversation?.id, currentUser?.id, subscribeToMessages, unsubscribe]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async ({ reset = false } = {}) => {
    try {
      if (reset) {
        setLoading(true);
        setHasMoreMessages(true);
      }
      logger.chat('Cargando mensajes para conversación', conversation.id);
      const endTimer = performanceMetrics.startTimer('chat.load_messages');
      
      const result = await chatService.getConversationMessages(conversation.id, {
        limit: PAGE_SIZE
      });
      
      if (result.success) {
        logger.chat('Mensajes cargados', result.data);
        setMessages(result.data);
        setHasMoreMessages((result.data || []).length === PAGE_SIZE);
        endTimer({ conversationId: conversation.id, reset });
      } else {
        logger.error('Error al cargar mensajes', result.error);
        setMessages([]);
        setHasMoreMessages(false);
        endTimer({ conversationId: conversation.id, reset, error: result.error });
      }
    } catch (error) {
      logger.error('Error cargando mensajes', error);
      setMessages([]);
      setHasMoreMessages(false);
    } finally {
      setLoading(false);
    }
  };

  const loadOlderMessages = async () => {
    if (loadingMore || !hasMoreMessages || messages.length === 0) return;

    const oldest = messages[0]?.created_at;
    if (!oldest) return;

    const container = messagesContainerRef.current;
    const previousScrollHeight = container?.scrollHeight || 0;

    try {
      setLoadingMore(true);
      const endTimer = performanceMetrics.startTimer('chat.load_older_messages');
      const result = await chatService.getConversationMessages(conversation.id, {
        before: oldest,
        limit: PAGE_SIZE
      });

      if (!result.success) {
        endTimer({ conversationId: conversation.id, error: result.error });
        return;
      }

      const older = result.data || [];
      setHasMoreMessages(older.length === PAGE_SIZE);

      setMessages((prev) => {
        const merged = [...older, ...prev];
        const unique = new Map();
        merged.forEach((msg) => {
          if (msg?.id) unique.set(msg.id, msg);
        });
        return Array.from(unique.values()).sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateA - dateB;
        });
      });

      endTimer({ conversationId: conversation.id, count: older.length });

      requestAnimationFrame(() => {
        if (!container) return;
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - previousScrollHeight;
      });
    } catch (error) {
      logger.error('Error cargando mensajes antiguos', error);
    } finally {
      setLoadingMore(false);
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
      logger.chat('Enviando mensaje', {
        conversationId: conversation.id,
        senderId: currentUser.id,
        content: messageContent
      });
      
      const result = await chatService.sendMessage(conversation.id, currentUser.id, messageContent);
      
      if (result.success) {
        logger.chat('Mensaje enviado exitosamente', result.data);
        setLastMessageStatus('sent');
        
        // Agregar el mensaje localmente inmediatamente para mejor UX
        if (result.data) {
          setMessages((prev) => {
            const exists = prev.some(msg => msg.id === result.data.id);
            if (exists) {
              return prev;
            }
            return [...prev, result.data];
          });
        }
        
        // Marcar mensajes como leídos
        await chatService.markMessagesAsRead(conversation.id, currentUser.id);
      } else {
        logger.error('Error al enviar mensaje', result.error);
        setLastMessageStatus('error');
        alert('Error al enviar mensaje: ' + result.error);
        setNewMessage(messageContent); // Restaurar mensaje si falló
      }
    } catch (error) {
      logger.error('Error al enviar mensaje', error);
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
                  <Wifi className="h-3 w-3 text-green-500 animate-pulse" title="Conectado en tiempo real" />
                ) : connectionStatus === 'connecting' ? (
                  <Loader2 className="h-3 w-3 text-yellow-500 animate-spin" title="Conectando..." />
                ) : (
                  <WifiOff className="h-3 w-3 text-red-500" title="Desconectado - Los mensajes pueden no llegar en tiempo real" />
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
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-white dark:bg-gray-900"
      >
        {!loading && hasMoreMessages && (
          <div className="flex justify-center pb-2">
            <button
              type="button"
              onClick={loadOlderMessages}
              disabled={loadingMore}
              className="text-xs sm:text-sm px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loadingMore ? 'Cargando mensajes anteriores...' : 'Cargar mensajes anteriores'}
            </button>
          </div>
        )}
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
              aria-label="Escribe un mensaje"
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
