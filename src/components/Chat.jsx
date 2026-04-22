import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  X,
  User,
  Search,
  Loader2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useLocation } from 'react-router-dom';
import { supabaseChatService as chatService, chatUtils } from '../services/supabaseChatService';
import { useRealtime } from '../hooks/useRealtime.jsx';
import ChatConversation from './ChatConversation';
import ChatConversationList from './ChatConversationList';
import EnhancedChatNotifications from './EnhancedChatNotifications';
import { logger } from '../utils/logger';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

const Chat = ({ onClose, initialProductShare = null }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const { subscribeToConversations, unsubscribe } = useRealtime();
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [productShareStatus, setProductShareStatus] = useState({
    state: 'idle',
    recipientName: '',
    error: ''
  });
  const [toast, setToast] = useState(null);
  const conversationsUnsubscribe = useRef(null);
  const productShareHandledRef = useRef(false);
  const lastProductShareRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  useEffect(() => {
    if (!user?.id) return;
    
    let isMounted = true;
    let subscription = null;
    let timeoutId = null;
    
    const setupSubscription = async () => {
      // Cargar conversaciones iniciales
      if (isMounted) {
        await loadConversations();
      }

      // Limpiar suscripción anterior si existe
      if (conversationsUnsubscribe.current) {
        unsubscribe(conversationsUnsubscribe.current);
        conversationsUnsubscribe.current = null;
      }

      // Crear nueva suscripción
      subscription = subscribeToConversations(user.id, (payload) => {
        if (!isMounted) return;
        
        logger.chat('Cambio detectado en conversaciones', payload);
        // Refrescar lista cuando haya cambios relevantes (nuevo mensaje, nueva conversación, etc.)
        // Usar un pequeño delay para evitar múltiples recargas
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          if (isMounted) {
            loadConversations();
          }
        }, 100);
      });
      
      conversationsUnsubscribe.current = subscription;
    };
    
    setupSubscription();

    // Cleanup function
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (conversationsUnsubscribe.current) {
        unsubscribe(conversationsUnsubscribe.current);
        conversationsUnsubscribe.current = null;
      }
      if (subscription) {
        unsubscribe(subscription);
      }
    };
  }, [user?.id, subscribeToConversations, unsubscribe]);

  useEffect(() => {
    const shareData = initialProductShare || location.state?.productShare;
    if (!user?.id || !shareData || productShareHandledRef.current) return;
    if (!shareData.recipientId || shareData.recipientId === user.id) return;

    const sendInitialProductShare = async (payload, isRetry = false) => {
      if (!isRetry) {
        productShareHandledRef.current = true;
      }
      lastProductShareRef.current = payload;
      setProductShareStatus({ state: 'sending', recipientName: '', error: '' });

      const conversationResult = await chatService.createConversation(
        user.id,
        payload.recipientId,
        payload.product?.id || payload.productId || null
      );

      if (!conversationResult.success || !conversationResult.data?.id) {
        setProductShareStatus({
          state: 'error',
          recipientName: '',
          error: conversationResult.error || 'No se pudo crear la conversación'
        });
        return;
      }

      const recipientName = conversationResult.data.other_user?.name || 'usuario';

      const sendResult = await chatService.sendProductShare(
        conversationResult.data.id,
        user.id,
        payload.product || {
          id: payload.productId,
          title: payload.title,
          price: payload.price,
          category: payload.category,
          images: payload.image ? [payload.image] : []
        }
      );

      if (!sendResult.success) {
        setProductShareStatus({
          state: 'error',
          recipientName,
          error: sendResult.error || 'No se pudo enviar el producto'
        });
        return;
      }

      await loadConversations();
      handleConversationSelect(conversationResult.data);
      setProductShareStatus({ state: 'success', recipientName, error: '' });
      showToast(`Producto compartido con ${recipientName}`);
    };

    sendInitialProductShare(shareData);
  }, [user?.id, initialProductShare, location.state]);

  const retryProductShare = async () => {
    if (!lastProductShareRef.current) return;
    const payload = lastProductShareRef.current;
    setProductShareStatus({ state: 'sending', recipientName: '', error: '' });

    const conversationResult = await chatService.createConversation(
      user.id,
      payload.recipientId,
      payload.product?.id || payload.productId || null
    );

    if (!conversationResult.success || !conversationResult.data?.id) {
      setProductShareStatus({
        state: 'error',
        recipientName: '',
        error: conversationResult.error || 'No se pudo crear la conversación'
      });
      return;
    }

    const recipientName = conversationResult.data.other_user?.name || 'usuario';
    const sendResult = await chatService.sendProductShare(
      conversationResult.data.id,
      user.id,
      payload.product || {
        id: payload.productId,
        title: payload.title,
        price: payload.price,
        category: payload.category,
        images: payload.image ? [payload.image] : []
      }
    );

    if (!sendResult.success) {
      setProductShareStatus({
        state: 'error',
        recipientName,
        error: sendResult.error || 'No se pudo enviar el producto'
      });
      return;
    }

    await loadConversations();
    handleConversationSelect(conversationResult.data);
    setProductShareStatus({ state: 'success', recipientName, error: '' });
    showToast(`Producto compartido con ${recipientName}`);
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      logger.chat('Cargando conversaciones para usuario', user.id);
      
      const result = await chatService.getUserConversations(user.id);
      
      if (result.success) {
        logger.chat('Conversaciones cargadas', result.data);
        setConversations(result.data);
        
        // Calcular mensajes no leídos
        setUnreadCount(0);
      } else {
        logger.error('Error al cargar conversaciones', result.error);
        setConversations([]);
      }
    } catch (error) {
      logger.error('Error cargando conversaciones', error);
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
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
  };

  const handleNewConversation = async () => {
    try {
      logger.chat('Iniciando nueva conversación', { userId: user.id });
      
      // Usar API expuesta por los servicios: getAllUsers
      const result = await chatService.getAllUsers(user.id);
      
      if (result.success) {
        logger.chat('Usuarios cargados exitosamente', result.data);
        setAvailableUsers(result.data);
        setShowNewConversationModal(true);
      } else {
        logger.error('Error al cargar usuarios', result.error);
        alert('Error al cargar usuarios: ' + result.error);
      }
    } catch (error) {
      logger.error('Error cargando usuarios', error);
      alert('Error cargando usuarios: ' + error.message);
    }
  };


  const handleStartConversation = async (otherUserId) => {
    try {
      logger.chat('Iniciando conversación con usuario', { currentUserId: user.id, otherUserId });
      
      if (!otherUserId || otherUserId === user.id) {
        alert('No puedes crear una conversación contigo mismo');
        return;
      }

      const result = await chatService.createConversation(user.id, otherUserId, null);
      
      if (result.success) {
        logger.chat('✅ Conversación creada exitosamente', result.data);
        
        // Cerrar el modal
        setShowNewConversationModal(false);
        
        // Recargar conversaciones para obtener la lista actualizada
        await loadConversations();
        
        // Seleccionar directamente la conversación creada
        const created = result.data;
        if (created && created.id) {
          // La conversación ya viene transformada del servicio con other_user
          handleConversationSelect(created);
        } else {
          // Fallback: buscar en la lista actualizada
          const updated = conversations.find(c => 
            (c.buyer_id === user.id && c.seller_id === otherUserId) ||
            (c.buyer_id === otherUserId && c.seller_id === user.id)
          );
          if (updated) {
            handleConversationSelect(updated);
          } else {
            // Si aún no aparece, esperar un momento y recargar
            setTimeout(async () => {
              await loadConversations();
              const found = conversations.find(c => 
                (c.buyer_id === user.id && c.seller_id === otherUserId) ||
                (c.buyer_id === otherUserId && c.seller_id === user.id)
              );
              if (found) {
                handleConversationSelect(found);
              }
            }, 1000);
          }
        }
      } else {
        logger.error('❌ Error al crear conversación', result.error);
        const errorMessage = result.error || result.userMessage || 'Error desconocido al crear la conversación';
        alert(`Error al crear conversación:\n${errorMessage}`);
      }
    } catch (error) {
      logger.error('Error creando conversación', error);
      alert('Error al crear conversación: ' + (error.message || 'Error desconocido'));
    }
  };

  const filteredConversations = React.useMemo(() => {
    const term = debouncedSearchTerm.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter(c => {
      const name = (c.other_user?.name || c.other_user?.email || '').toLowerCase();
      const last = (c.last_message || '').toLowerCase();
      return name.includes(term) || last.includes(term);
    });
  }, [conversations, debouncedSearchTerm]);

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
    <div className="flex h-full min-h-0 w-full flex-col bg-white dark:bg-gray-900 md:flex-row">
      {/* Lista: en móvil ocupa toda la altura; con conversación abierta se oculta hasta md (barra lateral en tablet+) */}
      <div
        className={`flex flex-col border-gray-200 dark:border-gray-700 md:border-r min-h-0 w-full md:w-80 lg:w-96 md:shrink-0 ${
          selectedConversation ? 'hidden md:flex' : 'flex flex-1 md:flex-none'
        }`}
      >
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
                  type="button"
                  onClick={() => onClose?.()}
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
            {productShareStatus.state !== 'idle' && (
              <div className={`mt-3 rounded-lg px-3 py-2 text-sm flex items-center justify-between gap-3 ${
                productShareStatus.state === 'error'
                  ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200'
                  : productShareStatus.state === 'sending'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
              }`}>
                <div className="flex items-center gap-2">
                  {productShareStatus.state === 'sending' && <Loader2 className="h-4 w-4 animate-spin" />}
                  {productShareStatus.state === 'success' && <CheckCircle2 className="h-4 w-4" />}
                  {productShareStatus.state === 'error' && <AlertTriangle className="h-4 w-4" />}
                  <span>
                    {productShareStatus.state === 'sending' && 'Enviando producto por chat...'}
                    {productShareStatus.state === 'success' && `Producto compartido con ${productShareStatus.recipientName}.`}
                    {productShareStatus.state === 'error' && `Error al compartir: ${productShareStatus.error}`}
                  </span>
                </div>
                {productShareStatus.state === 'error' && (
                  <button
                    type="button"
                    onClick={retryProductShare}
                    className="text-xs font-semibold underline"
                  >
                    Reintentar
                  </button>
                )}
              </div>
            )}
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
                  className="btn btn-primary w-full"
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

          {/* Botón de acción */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleNewConversation}
              className="w-full btn btn-primary btn-sm"
            >
              <User className="h-4 w-4 mr-2" />
              Nueva Conversación
            </button>
          </div>
      </div>

      {selectedConversation ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white dark:bg-gray-900">
          <ChatConversation
            conversation={selectedConversation}
            currentUser={user}
            onBack={handleBackToConversations}
            onClose={onClose}
          />
        </div>
      ) : (
        <div className="hidden min-h-0 flex-1 flex-col items-center justify-center bg-white dark:text-gray-300 dark:bg-gray-900 md:flex">
          <div className="text-center px-4">
            <MessageCircle className="mx-auto mb-6 h-24 w-24 text-gray-300 dark:text-gray-600" />
            <h2 className="mb-2 text-2xl font-bold text-gray-700 dark:text-gray-200">Selecciona una conversación</h2>
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
                {availableUsers.map((otherUser) => (
                  <button
                    key={otherUser.id}
                    onClick={() => handleStartConversation(otherUser.id)}
                    className="w-full flex items-center space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-semibold text-sm sm:text-base">
                      {chatUtils.getInitials(otherUser.display_name || otherUser.email)}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate text-gray-900 dark:text-white">{otherUser.display_name || 'Usuario'}</p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{otherUser.email}</p>
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

      {toast && (
        <div className="fixed right-4 bottom-4 z-[100]">
          <div className={`rounded-lg shadow-lg px-4 py-3 text-sm text-white ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
          }`}>
            {toast.message}
          </div>
        </div>
      )}

    </div>
  );
};

export default Chat;
