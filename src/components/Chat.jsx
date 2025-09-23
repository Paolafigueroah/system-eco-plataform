import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Image as ImageIcon,
  Paperclip,
  Smile,
  X,
  User,
  Circle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabaseChatService as chatService } from '../services/supabaseChatService';
import ChatConversation from './ChatConversation';
import ChatConversationList from './ChatConversationList';

const Chat = ({ onClose }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConversationList, setShowConversationList] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const conversationsUnsubscribe = useRef(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const result = await chatService.getUserConversations(user.id);
      
      if (result.success) {
        setConversations(result.data);
        
        // Calcular mensajes no leídos (por ahora no implementado completamente)
        setUnreadCount(0);
      } else {
        console.error('Error al cargar conversaciones:', result.error);
      }
    } catch (error) {
      console.error('Error cargando conversaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setShowConversationList(false);
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
    setShowConversationList(true);
  };

  const handleNewConversation = async () => {
    try {
      const result = await chatService.getAllUsers(user.id);
      
      if (result.success) {
        setAvailableUsers(result.data);
        setShowNewConversationModal(true);
      } else {
        console.error('Error al cargar usuarios:', result.error);
        alert('Error al cargar usuarios: ' + result.error);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      alert('Error cargando usuarios: ' + error.message);
    }
  };

  const handleStartConversation = async (otherUserId) => {
    try {
      const result = await chatService.createConversation(user.id, otherUserId, null);
      if (result.success) {
        // Recargar conversaciones
        await loadConversations();
        setShowNewConversationModal(false);
        
        // Seleccionar la nueva conversación
        const newConversation = conversations.find(c => 
          (c.buyer_id === user.id && c.seller_id === otherUserId) ||
          (c.buyer_id === otherUserId && c.seller_id === user.id)
        );
        
        if (newConversation) {
          handleConversationSelect(newConversation);
        }
      } else {
        console.error('Error al crear conversación:', result.error);
      }
    } catch (error) {
      console.error('Error creando conversación:', error);
    }
  };

  const filteredConversations = conversations.filter(conversation => {
    // Filtrar por búsqueda (implementar lógica de búsqueda por nombre de usuario)
    return true; // Por ahora mostrar todas
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso Denegado</h3>
          <p className="text-gray-500">Debes iniciar sesión para acceder al chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-base-100">
      {/* Lista de Conversaciones */}
      {showConversationList && (
        <div className="w-full md:w-80 border-r border-base-300 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-base-300 bg-base-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-base-content">Chat</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleNewConversation}
                  className="btn btn-sm btn-primary"
                  title="Nueva conversación"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
                <button
                  onClick={onClose}
                  className="btn btn-sm btn-ghost"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar conversaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered w-full pl-10"
              />
            </div>
          </div>

          {/* Lista de conversaciones */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="loading loading-spinner loading-lg"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay conversaciones
                </h3>
                <p className="text-gray-500 mb-4">
                  Inicia una conversación para comenzar a chatear
                </p>
                <button
                  onClick={handleNewConversation}
                  className="btn btn-primary"
                >
                  Nueva Conversación
                </button>
              </div>
            ) : (
              <ChatConversationList
                conversations={filteredConversations}
                currentUserId={user.id}
                onSelectConversation={handleConversationSelect}
                unreadCount={unreadCount}
              />
            )}
          </div>
        </div>
      )}

      {/* Conversación Seleccionada */}
      {selectedConversation && (
        <div className="flex-1 flex flex-col">
          <ChatConversation
            conversation={selectedConversation}
            currentUser={user}
            onBack={handleBackToConversations}
            onClose={onClose}
          />
        </div>
      )}

      {/* Vista de Bienvenida (cuando no hay conversación seleccionada en desktop) */}
      {!showConversationList && !selectedConversation && (
        <div className="flex-1 flex items-center justify-center bg-base-100">
          <div className="text-center">
            <MessageCircle className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Selecciona una conversación
            </h2>
            <p className="text-gray-500">
              Elige una conversación de la lista para comenzar a chatear
            </p>
          </div>
        </div>
      )}

      {/* Modal para nueva conversación */}
      {showNewConversationModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-base-100 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-base-300">
              <h3 className="text-lg font-semibold">
                Nueva Conversación 
                <span className="text-sm text-gray-500 ml-2">({availableUsers.length} usuarios)</span>
              </h3>
              <button
                onClick={() => setShowNewConversationModal(false)}
                className="btn btn-ghost btn-sm"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-2">
                {availableUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleStartConversation(user.id)}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
                  >
                    <div className="w-10 h-10 bg-primary text-primary-content rounded-full flex items-center justify-center font-semibold">
                      {chatUtils.getInitials(user.display_name || user.email)}
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{user.display_name || 'Usuario'}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
              
              {availableUsers.length === 0 && (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay otros usuarios disponibles</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
