import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Bell, BellOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { sqliteChatService as chatService } from '../services/sqliteChatService';

const ChatNotifications = ({ onOpenChat }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && notificationsEnabled) {
      // Cargar conversaciones del usuario
      const loadConversations = async () => {
        try {
          const result = await chatService.getUserConversations(user.id);
          if (result.success) {
            const newUnreadCount = result.conversations.reduce((count, conv) => {
              if (conv.lastMessage && conv.lastMessage.senderId !== user.id) {
                return count + 1;
              }
              return count;
            }, 0);

            setUnreadCount(newUnreadCount);

            // Mostrar notificación para nuevos mensajes
            if (newUnreadCount > unreadCount && unreadCount > 0) {
              showNewMessageNotification();
            }
          }
        } catch (error) {
          console.error('Error cargando conversaciones:', error);
        }
      };

      loadConversations();
      
      // No hay unsubscribe function, solo cargamos una vez
      return () => {};
    }
  }, [user, notificationsEnabled, unreadCount]);

  const showNewMessageNotification = () => {
    if (!notificationsEnabled) return;

    // Crear notificación del navegador si está disponible
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Nuevo mensaje', {
        body: 'Tienes un nuevo mensaje en el chat',
        icon: '/favicon.ico',
        tag: 'chat-message'
      });
    }

    // Mostrar notificación en la UI
    const notification = {
      id: Date.now(),
      message: 'Nuevo mensaje recibido',
      timestamp: new Date(),
      type: 'message'
    };

    setNotifications(prev => [notification, ...prev.slice(0, 4)]);

    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  };

  const toggleNotifications = () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
    } else {
      requestNotificationPermission();
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleOpenChat = () => {
    onOpenChat();
    setNotifications([]);
    setUnreadCount(0);
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative btn btn-ghost btn-sm p-2"
        title="Notificaciones del chat"
      >
        <MessageCircle className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-error text-error-content text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {showNotifications && (
        <div className="absolute right-0 top-12 w-80 bg-base-100 border border-base-300 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-base-300">
            <h3 className="font-semibold text-base-content">Notificaciones</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleNotifications}
                className="btn btn-ghost btn-xs p-1"
                title={notificationsEnabled ? 'Desactivar notificaciones' : 'Activar notificaciones'}
              >
                {notificationsEnabled ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => setShowNotifications(false)}
                className="btn btn-ghost btn-xs p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No hay notificaciones</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start space-x-3 p-3 bg-base-200 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <MessageCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-base-content">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="flex-shrink-0 btn btn-ghost btn-xs p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {unreadCount > 0 && (
            <div className="p-3 border-t border-base-300">
              <button
                onClick={handleOpenChat}
                className="btn btn-primary btn-sm w-full"
              >
                Ver {unreadCount} mensaje{unreadCount !== 1 ? 's' : ''} no leído{unreadCount !== 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay para cerrar notificaciones al hacer clic fuera */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};

export default ChatNotifications;
