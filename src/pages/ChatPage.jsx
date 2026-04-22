import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Chat from '../components/Chat';
import { migrationConfig } from '../config/migrationConfig';

const ChatPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [showChat, setShowChat] = useState(false);
  const initialProductShare = location.state?.productShare || null;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Acceso Denegado</h2>
          <p className="text-gray-600 dark:text-gray-400">Debes iniciar sesión para acceder al chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Chat en Tiempo Real
              </h1>
              <p className="text-white/80">
                Conecta y conversa con otros usuarios de la plataforma
              </p>
            </div>
            <button
              onClick={() => setShowChat(!showChat)}
              className="btn-secondary mt-4 md:mt-0 flex items-center space-x-2"
            >
              <MessageCircle className="h-5 w-5" />
              <span>{showChat ? 'Cerrar Chat' : 'Abrir Chat'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {!showChat ? (
          <div className="text-center py-12">
            <MessageCircle className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              ¡Comienza a chatear!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Haz clic en "Abrir Chat" para acceder a tus conversaciones y comenzar a 
              comunicarte con otros usuarios de la plataforma.
            </p>
            <button
              onClick={() => setShowChat(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Abrir Chat
            </button>
          </div>
        ) : (
          <div className="hidden md:flex md:flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 h-[70vh] min-h-[560px] overflow-hidden">
            <Chat onClose={() => setShowChat(false)} initialProductShare={initialProductShare} />
          </div>
        )}

        {!showChat && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
              <MessageCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Chat en Tiempo Real</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Mensajes instantáneos con actualizaciones en tiempo real usando Supabase
              </p>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
              <div className="h-12 w-12 bg-sky-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">🔒</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Conversaciones Privadas</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Solo tú y el destinatario pueden ver vuestros mensajes
              </p>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
              <div className="h-12 w-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">📱</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Diseño Responsive</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Funciona perfectamente en dispositivos móviles y de escritorio
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chat Modal para pantallas pequeñas */}
      {showChat && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
          <div className="absolute inset-0 bg-white dark:bg-gray-900 flex flex-col min-h-0">
            <div className="flex shrink-0 items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat</h2>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <Chat
                onClose={() => setShowChat(false)}
                useFallback={migrationConfig.databaseType !== 'supabase'}
                initialProductShare={initialProductShare}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
