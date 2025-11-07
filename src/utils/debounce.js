/**
 * Función debounce para optimizar el rendimiento de botones y eventos
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en milisegundos
 * @returns {Function} - Función debounced
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Función throttle para limitar la frecuencia de ejecución
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Tiempo límite en milisegundos
 * @returns {Function} - Función throttled
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Hook para optimizar botones con debounce
 * @param {Function} callback - Función a ejecutar
 * @param {number} delay - Tiempo de espera
 * @returns {Function} - Función optimizada
 */
export const useOptimizedButton = (callback, delay = 300) => {
  return debounce(callback, delay);
};

export default debounce;

