import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Bell, BellOff, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabaseChatService as chatService } from '../services/supabaseChatService';
import { useTheme } from '../hooks/useTheme';

const EnhancedChatNotifications = ({ onOpenChat }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastNotificationTime, setLastNotificationTime] = useState(0);
  const audioRef = useRef(null);

  // Cargar preferencias del localStorage
  useEffect(() => {
    const savedNotifications = localStorage.getItem('chatNotificationsEnabled');
    const savedSounds = localStorage.getItem('chatSoundsEnabled');
    
    if (savedNotifications !== null) {
      setNotificationsEnabled(JSON.parse(savedNotifications));
    }
    if (savedSounds !== null) {
      setSoundsEnabled(JSON.parse(savedSounds));
    }
  }, []);

  // Guardar preferencias en localStorage
  useEffect(() => {
    localStorage.setItem('chatNotificationsEnabled', JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem('chatSoundsEnabled', JSON.stringify(soundsEnabled));
  }, [soundsEnabled]);

  // Cargar notificaciones iniciales
  useEffect(() => {
    if (user && notificationsEnabled) {
      loadUnreadCount();
      
      // Verificar notificaciones cada 30 segundos
      const interval = setInterval(loadUnreadCount, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user, notificationsEnabled]);

  const loadUnreadCount = async () => {
    try {
      const result = await chatService.getUserConversations(user.id);
      if (result.success) {
        let newUnreadCount = 0;
        const newNotifications = [];

        result.data.forEach(conv => {
          if (conv.unread_count > 0) {
            newUnreadCount += conv.unread_count;
            newNotifications.push({
              id: conv.id,
              type: 'message',
              title: `Nuevo mensaje de ${conv.other_user?.display_name || 'Usuario'}`,
              message: conv.last_message || 'Nuevo mensaje',
              timestamp: new Date(conv.last_message_at || conv.updated_at),
              conversationId: conv.id,
              is_read: false
            });
          }
        });

        // Solo mostrar notificación si hay nuevos mensajes
        if (newUnreadCount > unreadCount && unreadCount > 0) {
          showNewMessageNotification(newNotifications[0]);
        }

        setUnreadCount(newUnreadCount);
        setNotifications(newNotifications.slice(0, 10)); // Mantener solo las 10 más recientes
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  };

  const showNewMessageNotification = (notification) => {
    if (!notificationsEnabled) return;

    // Evitar spam de notificaciones (máximo 1 cada 5 segundos)
    const now = Date.now();
    if (now - lastNotificationTime < 5000) return;
    setLastNotificationTime(now);

    // Notificación del navegador
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: 'chat-message',
        requireInteraction: false,
        silent: !soundsEnabled
      });

      // Auto-cerrar después de 5 segundos
      setTimeout(() => {
        browserNotification.close();
      }, 5000);

      // Abrir chat al hacer clic
      browserNotification.onclick = () => {
        window.focus();
        onOpenChat();
        browserNotification.close();
      };
    }

    // Reproducir sonido si está habilitado
    if (soundsEnabled) {
      playNotificationSound();
    }

    // Agregar a la lista de notificaciones
    const newNotification = {
      id: Date.now(),
      ...notification,
      timestamp: new Date()
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
  };

  const playNotificationSound = () => {
    try {
      // Crear un sonido de notificación simple usando Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('No se pudo reproducir el sonido de notificación:', error);
    }
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

  const toggleSounds = () => {
    setSoundsEnabled(!soundsEnabled);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleOpenChat = () => {
    onOpenChat();
    setNotifications([]);
    setUnreadCount(0);
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return time.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative btn btn-ghost btn-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
        title="Notificaciones del chat"
      >
        <MessageCircle className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {showNotifications && (
        <div className="absolute right-0 top-12 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-96 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notificaciones</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleSounds}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                title={soundsEnabled ? 'Desactivar sonidos' : 'Activar sonidos'}
              >
                {soundsEnabled ? (
                  <Volume2 className="h-4 w-4 text-green-500" />
                ) : (
                  <VolumeX className="h-4 w-4 text-gray-400" />
                )}
              </button>
              <button
                onClick={toggleNotifications}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                title={notificationsEnabled ? 'Desactivar notificaciones' : 'Activar notificaciones'}
              >
                {notificationsEnabled ? (
                  <Bell className="h-4 w-4 text-green-500" />
                ) : (
                  <BellOff className="h-4 w-4 text-gray-400" />
                )}
              </button>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No hay notificaciones</p>
              </div>
            ) : (
              <div className="p-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer ${
                      !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => {
                      markAsRead(notification.id);
                      handleOpenChat();
                    }}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                        <MessageCircle className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className="flex-shrink-0 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
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
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleOpenChat}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
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

export default EnhancedChatNotifications;
