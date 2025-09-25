import React from 'react';
import { useTheme } from '../hooks/useTheme';

const DarkModeTest = () => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg">
      <div className="text-sm space-y-2">
        <div className="font-semibold text-gray-900 dark:text-white">
          Modo Oscuro Test
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          Tema actual: <span className="font-mono">{theme}</span>
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          Es oscuro: <span className="font-mono">{isDark ? 'Sí' : 'No'}</span>
        </div>
        <button
          onClick={toggleTheme}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded text-xs"
        >
          Cambiar Tema
        </button>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Este div debería cambiar de color
        </div>
      </div>
    </div>
  );
};

export default DarkModeTest;
