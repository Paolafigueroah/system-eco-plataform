import React from 'react';
import { MessageCircle, Circle } from 'lucide-react';
import { chatUtils } from '../services/sqliteChatService';

const ChatConversationList = ({ 
  conversations, 
  currentUserId, 
  onSelectConversation,
  unreadCount 
}) => {
  const getOtherParticipant = (conversation) => {
    // Usar la información del otro usuario que ya tenemos
    return conversation.other_user || { id: 'unknown', name: 'Usuario', email: 'usuario@example.com' };
  };

  const getParticipantName = (participant) => {
    if (participant.id === currentUserId) {
      return 'Tú';
    }
    
    return participant.name || participant.email || 'Usuario';
  };

  const isUnread = (conversation) => {
    return conversation.lastMessage && 
           conversation.lastMessage.senderId !== currentUserId;
  };

  const getLastMessagePreview = (conversation) => {
    if (!conversation.last_message) return 'Sin mensajes';
    
    // Truncar el mensaje si es muy largo
    const message = conversation.last_message.length > 30 
      ? conversation.last_message.substring(0, 30) + '...'
      : conversation.last_message;
    
    return message;
  };

  return (
    <div className="space-y-1 p-2">
      {conversations.map((conversation) => {
        const otherParticipant = getOtherParticipant(conversation);
        const participantName = getParticipantName(otherParticipant);
        const unread = isUnread(conversation);
        
        return (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-base-200 ${
              unread ? 'bg-primary/5 border-l-4 border-l-primary' : ''
            }`}
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-12 h-12 bg-primary text-primary-content rounded-full flex items-center justify-center font-semibold text-lg">
                {chatUtils.getInitials(participantName)}
              </div>
              {unread && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <Circle className="w-2 h-2 text-white fill-current" />
                </div>
              )}
            </div>

            {/* Información de la conversación */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-base-content truncate">
                  {participantName}
                </h4>
                {conversation.last_message_at && (
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {chatUtils.formatMessageDate(conversation.last_message_at)}
                  </span>
                )}
              </div>
              
              <p className={`text-sm truncate ${
                unread ? 'text-base-content font-medium' : 'text-gray-500'
              }`}>
                {getLastMessagePreview(conversation)}
              </p>
            </div>

            {/* Indicador de mensajes no leídos */}
            {unread && (
              <div className="flex-shrink-0">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChatConversationList;
