import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const ToggleTheme = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center
        w-14 h-7 rounded-full transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-offset-2
        border-2
        ${isDark 
          ? 'bg-emerald-600 border-emerald-500 focus:ring-emerald-400' 
          : 'bg-gray-300 border-gray-400 focus:ring-gray-500'
        }
        ${className}
      `}
      aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
    >
      <span
        className={`
          inline-flex items-center justify-center
          w-6 h-6 rounded-full shadow-lg
          transform transition-all duration-300
          ${isDark 
            ? 'translate-x-3 bg-white' 
            : '-translate-x-3 bg-yellow-400'
          }
        `}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-emerald-600" />
        ) : (
          <Sun className="w-4 h-4 text-yellow-600" />
        )}
      </span>
    </button>
  );
};

export default ToggleTheme;
