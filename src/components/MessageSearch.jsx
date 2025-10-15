import React, { useState, useRef, useEffect } from 'react';
import { Search, X, MessageCircle, Clock } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const MessageSearch = ({ messages, onMessageSelect, isOpen, onClose }) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);

  // Enfocar el input cuando se abre
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Buscar mensajes cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim()) {
      setIsSearching(true);
      const results = searchMessages(searchTerm.trim());
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, messages]);

  const searchMessages = (term) => {
    const lowerTerm = term.toLowerCase();
    return messages
      .filter(message => 
        message.content.toLowerCase().includes(lowerTerm) ||
        (message.sender && message.sender.display_name && 
         message.sender.display_name.toLowerCase().includes(lowerTerm))
      )
      .map(message => ({
        ...message,
        // Encontrar la posición del término en el contenido
        matchIndex: message.content.toLowerCase().indexOf(lowerTerm),
        matchLength: term.length
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 20); // Limitar a 20 resultados
  };

  const highlightMatch = (content, matchIndex, matchLength) => {
    if (matchIndex === -1) return content;
    
    const before = content.substring(0, matchIndex);
    const match = content.substring(matchIndex, matchIndex + matchLength);
    const after = content.substring(matchIndex + matchLength);
    
    return (
      <>
        {before}
        <mark className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {match}
        </mark>
        {after}
      </>
    );
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `Hace ${Math.floor(diffInMinutes / 1440)}d`;
    
    return date.toLocaleDateString();
  };

  const handleMessageClick = (message) => {
    onMessageSelect(message);
    onClose();
    setSearchTerm('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
      setSearchTerm('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Search className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Buscar mensajes</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Campo de búsqueda */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar en mensajes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Resultados */}
        <div className="flex-1 overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
              <span className="ml-2 text-gray-500 dark:text-gray-400">Buscando...</span>
            </div>
          ) : searchTerm && searchResults.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No se encontraron mensajes</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Intenta con otros términos de búsqueda
              </p>
            </div>
          ) : searchTerm && searchResults.length > 0 ? (
            <div className="p-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-2">
                {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
              </div>
              {searchResults.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleMessageClick(message)}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors duration-200"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {message.sender?.display_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {message.sender?.display_name || 'Usuario'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatMessageTime(message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                      {highlightMatch(message.content, message.matchIndex, message.matchLength)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Escribe para buscar mensajes</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Busca por contenido o nombre del remitente
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Presiona <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">Esc</kbd> para cerrar
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageSearch;
