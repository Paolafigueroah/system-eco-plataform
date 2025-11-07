/**
 * Sistema de logging condicional
 * Solo muestra logs en desarrollo, errores siempre se muestran
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

/**
 * Logger centralizado para la aplicación
 * - En desarrollo: muestra todos los logs
 * - En producción: solo muestra errores
 */
export const logger = {
  /**
   * Log de información general (solo en desarrollo)
   * @param {...any} args - Argumentos a loggear
   */
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log de errores (siempre visible)
   * @param {...any} args - Argumentos a loggear
   */
  error: (...args) => {
    console.error(...args);
    
    // En producción, podrías enviar a un servicio de monitoreo
    if (isProduction) {
      // TODO: Integrar con Sentry o similar
      // Sentry.captureException(new Error(args.join(' ')));
    }
  },

  /**
   * Log de advertencias (solo en desarrollo)
   * @param {...any} args - Argumentos a loggear
   */
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log de información (solo en desarrollo)
   * @param {...any} args - Argumentos a loggear
   */
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * Log de debug (solo en desarrollo)
   * @param {...any} args - Argumentos a loggear
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  /**
   * Log con contexto (útil para tracking de operaciones)
   * @param {string} context - Contexto de la operación
   * @param {string} message - Mensaje
   * @param {any} data - Datos adicionales (opcional)
   */
  context: (context, message, data = null) => {
    if (isDevelopment) {
      console.log(`[${context}] ${message}`, data || '');
    }
  },

  /**
   * Log de operaciones de Supabase (solo en desarrollo)
   * @param {string} operation - Nombre de la operación
   * @param {any} data - Datos (opcional)
   */
  supabase: (operation, data = null) => {
    if (isDevelopment) {
      console.log(`📦 Supabase: ${operation}`, data || '');
    }
  },

  /**
   * Log de autenticación (solo en desarrollo)
   * @param {string} operation - Nombre de la operación
   * @param {any} data - Datos (opcional)
   */
  auth: (operation, data = null) => {
    if (isDevelopment) {
      console.log(`🔐 Auth: ${operation}`, data || '');
    }
  },

  /**
   * Log de chat (solo en desarrollo)
   * @param {string} operation - Nombre de la operación
   * @param {any} data - Datos (opcional)
   */
  chat: (operation, data = null) => {
    if (isDevelopment) {
      console.log(`💬 Chat: ${operation}`, data || '');
    }
  }
};

export default logger;

