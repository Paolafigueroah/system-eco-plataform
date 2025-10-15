import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { chatUtils } from '../services/sqliteChatService';
import { useTheme } from '../hooks/useTheme';

const ChatMessage = ({ message, isOwnMessage, currentUser }) => {
  const { theme } = useTheme();
  const getMessageStatus = () => {
    if (isOwnMessage) {
      if (message.read) {
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      } else {
        return <Check className="h-3 w-3 text-gray-400" />;
      }
    }
    return null;
  };

  const getMessageTime = () => {
    return chatUtils.formatMessageDate(message.created_at);
  };

  const getSenderName = () => {
    if (isOwnMessage) return 'Tú';
    
    // Convertir sender_id a string y tomar los primeros 8 caracteres
    const senderId = String(message.sender_id || 'unknown');
    return `Usuario ${senderId.slice(0, 8)}`;
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`} data-message-id={message.id}>
      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        {/* Nombre del remitente (solo para mensajes de otros) */}
        {!isOwnMessage && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-2">
            {getSenderName()}
          </div>
        )}
        
        {/* Mensaje */}
        <div
          className={`rounded-lg px-4 py-2 shadow-sm ${
            isOwnMessage
              ? 'bg-emerald-500 text-white rounded-br-md'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        
        {/* Información del mensaje */}
        <div className={`flex items-center space-x-1 mt-1 ${
          isOwnMessage ? 'justify-end' : 'justify-start'
        }`}>
          {/* Timestamp */}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {getMessageTime()}
          </span>
          
          {/* Estado del mensaje */}
          {getMessageStatus()}
        </div>
      </div>
      
      {/* Avatar (solo para mensajes de otros) */}
      {!isOwnMessage && (
        <div className="order-1 ml-2">
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
            {chatUtils.getInitials(getSenderName())}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
