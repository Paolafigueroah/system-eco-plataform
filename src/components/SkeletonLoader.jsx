import React from 'react';
import { motion } from 'framer-motion';

/**
 * Componente SkeletonLoader
 * Muestra un placeholder animado mientras se carga el contenido
 * 
 * @param {string} variant - Tipo de skeleton: 'card', 'list', 'text', 'image'
 * @param {number} count - Número de elementos a mostrar (para listas)
 * @param {string} className - Clases CSS adicionales
 */
const SkeletonLoader = ({ variant = 'card', count = 1, className = '' }) => {
  const pulseAnimation = {
    animate: { opacity: [0.5, 1, 0.5] },
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
  };

  if (variant === 'card') {
    return (
      <motion.div
        {...pulseAnimation}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 ${className}`}
      >
        <div className="h-48 sm:h-56 bg-gray-200 dark:bg-gray-700" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          <div className="flex justify-between mt-4">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: count }).map((_, index) => (
          <motion.div
            key={index}
            {...pulseAnimation}
            className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: count }).map((_, index) => (
          <motion.div
            key={index}
            {...pulseAnimation}
            className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${
              index === count - 1 ? 'w-3/4' : 'w-full'
            }`}
          />
        ))}
      </div>
    );
  }

  if (variant === 'image') {
    return (
      <motion.div
        {...pulseAnimation}
        className={`bg-gray-200 dark:bg-gray-700 rounded ${className}`}
        style={{ aspectRatio: '16/9' }}
      />
    );
  }

  return null;
};

export default SkeletonLoader;

