import React, { useState, useRef, useEffect } from 'react';
import { Smile, X } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const EmojiPicker = ({ onEmojiSelect, className = '' }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const pickerRef = useRef(null);

  // Emojis organizados por categorías
  const emojiCategories = {
    'Frecuentes': ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '❤️', '🔥', '💯'],
    'Caras': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙'],
    'Gestos': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎'],
    'Objetos': ['💎', '🔔', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '📱', '📞', '☎️', '📟', '📠', '📺', '📻'],
    'Naturaleza': ['🌱', '🌲', '🌳', '🌴', '🌵', '🌶️', '🌷', '🌸', '🌹', '🌺', '🌻', '🌼', '🌽', '🌾', '🌿', '🍀', '🍁', '🍂', '🍃', '🍄'],
    'Comida': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬']
  };

  // Filtrar emojis basado en búsqueda
  const filteredEmojis = Object.entries(emojiCategories).reduce((acc, [category, emojis]) => {
    const filtered = emojis.filter(emoji => 
      emoji.includes(searchTerm) || 
      category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {});

  // Cerrar picker al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleEmojiClick = (emoji) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      {/* Botón para abrir el picker */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
        title="Emojis"
      >
        <Smile className="h-4 w-4" />
      </button>

      {/* Picker de emojis */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-80 h-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Emojis</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Búsqueda */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Buscar emojis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Lista de emojis */}
          <div className="flex-1 overflow-y-auto p-3">
            {Object.keys(filteredEmojis).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 text-sm">No se encontraron emojis</p>
              </div>
            ) : (
              Object.entries(filteredEmojis).map(([category, emojis]) => (
                <div key={category} className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    {category}
                  </h4>
                  <div className="grid grid-cols-8 gap-1">
                    {emojis.map((emoji, index) => (
                      <button
                        key={`${category}-${index}`}
                        onClick={() => handleEmojiClick(emoji)}
                        className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200"
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
