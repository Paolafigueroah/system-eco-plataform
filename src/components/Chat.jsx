import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  X,
  User
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { supabaseChatService as chatService, chatUtils } from '../services/supabaseChatService';
import { useRealtime } from '../hooks/useRealtime.jsx';
import ChatConversation from './ChatConversation';
import ChatConversationList from './ChatConversationList';
import EnhancedChatNotifications from './EnhancedChatNotifications';

const Chat = ({ onClose }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { subscribeToConversations, unsubscribe } = useRealtime();
  
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

      // Suscripción a cambios en conversaciones (nuevo mensaje, creación, etc.)
      if (conversationsUnsubscribe.current) {
        unsubscribe(conversationsUnsubscribe.current);
        conversationsUnsubscribe.current = null;
      }
      const sub = subscribeToConversations(user.id, () => {
        // Refrescar lista cuando haya cambios relevantes
        loadConversations();
      });
      conversationsUnsubscribe.current = sub;
    }
    return () => {
      if (conversationsUnsubscribe.current) {
        unsubscribe(conversationsUnsubscribe.current);
        conversationsUnsubscribe.current = null;
      }
    };
  }, [user, subscribeToConversations, unsubscribe]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando conversaciones para usuario:', user.id);
      
      const result = await chatService.getUserConversations(user.id);
      
      console.log('🔄 Resultado de conversaciones:', result);
      
      if (result.success) {
        console.log('✅ Conversaciones cargadas:', result.data);
        setConversations(result.data);
        
        // Calcular mensajes no leídos
        setUnreadCount(0);
      } else {
        console.error('❌ Error al cargar conversaciones:', result.error);
        setConversations([]);
      }
    } catch (error) {
      console.error('❌ Error cargando conversaciones:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationSelect = (conversation) => {
    // Normalizar id: si viene como conv_... (fallback), no permitir envío
    if (conversation && typeof conversation.id === 'string' && conversation.id.startsWith('conv_')) {
      alert('Esta conversación es temporal. Crea una nueva conversación válida para chatear.');
      return;
    }
    setSelectedConversation(conversation);
    setShowConversationList(false);
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
    setShowConversationList(true);
  };

  const handleNewConversation = async () => {
    try {
      console.log('🔍 Iniciando nueva conversación...', { userId: user.id });
      
      // Usar API expuesta por los servicios: getAllUsers
      const result = await chatService.getAllUsers(user.id);
      
      console.log('🔍 Resultado de getAllUsers:', result);
      
      if (result.success) {
        console.log('✅ Usuarios cargados exitosamente:', result.data);
        setAvailableUsers(result.data);
        setShowNewConversationModal(true);
      } else {
        console.error('❌ Error al cargar usuarios:', result.error);
        alert('Error al cargar usuarios: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Error cargando usuarios:', error);
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
        
        // Seleccionar directamente la conversación creada si viene en data
        const created = result.data;
        if (created && created.id && (!String(created.id).startsWith('conv_'))) {
          handleConversationSelect(created);
          return;
        }
        // Fallback: buscarla en lista actualizada
        const updated = (prev => prev)(conversations).find(c => 
          (c.buyer_id === user.id && c.seller_id === otherUserId) ||
          (c.buyer_id === otherUserId && c.seller_id === user.id)
        );
        if (updated && (!String(updated.id).startsWith('conv_'))) handleConversationSelect(updated);
      } else {
        console.error('Error al crear conversación:', result.error);
      }
    } catch (error) {
      console.error('Error creando conversación:', error);
    }
  };

  const filteredConversations = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter(c => {
      const name = (c.other_user?.name || c.other_user?.email || '').toLowerCase();
      const last = (c.last_message || '').toLowerCase();
      return name.includes(term) || last.includes(term);
    });
  }, [conversations, searchTerm]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Acceso Denegado</h3>
          <p className="text-gray-500 dark:text-gray-400">Debes iniciar sesión para acceder al chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white dark:bg-gray-900">
      {/* Lista de Conversaciones */}
      {showConversationList && (
        <div className="w-full sm:w-80 lg:w-96 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Chat</h2>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={handleNewConversation}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 p-2"
                  title="Nueva conversación"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No hay conversaciones
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
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
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
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
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
          <div className="text-center">
            <MessageCircle className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              Selecciona una conversación
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Elige una conversación de la lista para comenzar a chatear
            </p>
          </div>
        </div>
      )}

      {/* Modal para nueva conversación */}
      {showNewConversationModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Nueva Conversación 
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 ml-1 sm:ml-2">({availableUsers.length})</span>
              </h3>
              <button
                onClick={() => setShowNewConversationModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            
            <div className="p-3 sm:p-4 overflow-y-auto max-h-[70vh] sm:max-h-[60vh]">
              <div className="space-y-2">
                {availableUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleStartConversation(user.id)}
                    className="w-full flex items-center space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-semibold text-sm sm:text-base">
                      {chatUtils.getInitials(user.display_name || user.email)}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate text-gray-900 dark:text-white">{user.display_name || 'Usuario'}</p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
              
              {availableUsers.length === 0 && (
                <div className="text-center py-6 sm:py-8">
                  <User className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No hay otros usuarios disponibles</p>
                  <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-2">Los usuarios aparecerán aquí cuando se registren en la plataforma</p>
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
