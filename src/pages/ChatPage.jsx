import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Chat from '../components/Chat';
import { migrationConfig } from '../config/migrationConfig';

const ChatPage = () => {
  const { user } = useAuth();
  const [showChat, setShowChat] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
          <p className="text-gray-600">Debes iniciar sesión para acceder al chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-focus text-primary-content py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Chat en Tiempo Real
              </h1>
              <p className="text-primary-content/80">
                Conecta y conversa con otros usuarios de la plataforma
              </p>
            </div>
            <button
              onClick={() => setShowChat(!showChat)}
              className="btn btn-secondary btn-lg mt-4 md:mt-0 flex items-center space-x-2"
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
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              ¡Comienza a chatear!
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Haz clic en "Abrir Chat" para acceder a tus conversaciones y comenzar a 
              comunicarte con otros usuarios de la plataforma.
            </p>
            <button
              onClick={() => setShowChat(true)}
              className="btn btn-primary btn-lg"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Abrir Chat
            </button>
          </div>
        ) : (
          <div className="bg-base-100 rounded-lg shadow-lg border border-base-300 h-[600px]">
            <Chat onClose={() => setShowChat(false)} />
          </div>
        )}

        {/* Información del chat */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-base-200 rounded-lg p-6 text-center">
            <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chat en Tiempo Real</h3>
            <p className="text-gray-600">
              Mensajes instantáneos con actualizaciones en tiempo real usando Firebase
            </p>
          </div>

          <div className="bg-base-200 rounded-lg p-6 text-center">
            <div className="h-12 w-12 bg-secondary text-secondary-content rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold">🔒</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Conversaciones Privadas</h3>
            <p className="text-gray-600">
              Solo tú y el destinatario pueden ver vuestros mensajes
            </p>
          </div>

          <div className="bg-base-200 rounded-lg p-6 text-center">
            <div className="h-12 w-12 bg-accent text-accent-content rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold">📱</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Diseño Responsive</h3>
            <p className="text-gray-600">
              Funciona perfectamente en dispositivos móviles y de escritorio
            </p>
          </div>
        </div>
      </div>

      {/* Chat Modal para pantallas pequeñas */}
      {showChat && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
          <div className="absolute inset-0 bg-base-100">
            <div className="flex items-center justify-between p-4 border-b border-base-300">
              <h2 className="text-lg font-semibold">Chat</h2>
              <button
                onClick={() => setShowChat(false)}
                className="btn btn-ghost btn-sm"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 h-[calc(100vh-80px)]">
              <Chat onClose={() => setShowChat(false)} useFallback={migrationConfig.databaseType === 'supabase'} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
