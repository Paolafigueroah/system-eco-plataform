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
  MessageCircle
} from 'lucide-react';
import { supabaseChatService as chatService } from '../services/supabaseChatService';
import { useRealtime } from '../hooks/useRealtime.jsx';
import ChatMessage from './ChatMessage';

const ChatConversation = ({ conversation, currentUser, onBack, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesUnsubscribe = useRef(null);
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
      const result = await chatService.getConversationMessages(conversation.id);
      
      if (result.success) {
        setMessages(result.data);
      } else {
        console.error('Error al cargar mensajes:', result.error);
      }
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    if (!newMessage.trim()) {
      alert('El mensaje no puede estar vacío');
      return;
    }

    setSending(true);
    
    try {
      const result = await chatService.sendMessage(conversation.id, currentUser.id, newMessage.trim());
      
      if (result.success) {
        setNewMessage('');
        // Marcar mensajes como leídos
        chatService.markMessagesAsRead(conversation.id, currentUser.id);
      } else {
        alert('Error al enviar mensaje: ' + result.error);
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      alert('Error al enviar mensaje');
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Conversación no encontrada</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-base-100">
      {/* Header de la conversación */}
      <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="btn btn-ghost btn-sm p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          {/* Avatar del participante */}
          <div className="w-10 h-10 bg-primary text-primary-content rounded-full flex items-center justify-center font-semibold">
            {getParticipantName(getOtherParticipant()).charAt(0).toUpperCase()}
          </div>
          
          <div>
            <h3 className="font-semibold text-base-content">
              {getParticipantName(getOtherParticipant())}
            </h3>
            <p className="text-sm text-gray-500">
              {getOtherParticipant().email}
            </p>
          </div>
        </div>

        {/* Acciones de la conversación */}
        <div className="flex items-center space-x-2">
          <button className="btn btn-ghost btn-sm p-2">
            <Phone className="h-4 w-4" />
          </button>
          <button className="btn btn-ghost btn-sm p-2">
            <Video className="h-4 w-4" />
          </button>
          <div className="dropdown dropdown-end">
            <button className="btn btn-ghost btn-sm p-2">
              <MoreVertical className="h-4 w-4" />
            </button>
            <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32">
              <li>
                <button className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Ver perfil</span>
                </button>
              </li>
              <li>
                <button className="flex items-center space-x-2 text-error">
                  <X className="h-4 w-4" />
                  <span>Eliminar chat</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay mensajes aún
            </h3>
            <p className="text-gray-500">
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
      <div className="p-3 sm:p-4 border-t border-base-300 bg-base-100">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          {/* Botones de acción */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              className="btn btn-ghost btn-sm p-2"
              title="Adjuntar archivo"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm p-2"
              title="Enviar imagen"
            >
              <ImageIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm p-2"
              title="Emojis"
            >
              <Smile className="h-4 w-4" />
            </button>
          </div>

          {/* Campo de texto */}
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className="textarea textarea-bordered w-full resize-none dark:placeholder-gray-400"
              rows={1}
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {newMessage.length}/1000
            </div>
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={`btn btn-primary btn-sm p-3 ${
              !newMessage.trim() || sending ? 'btn-disabled' : ''
            }`}
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatConversation;
