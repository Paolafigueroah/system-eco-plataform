import { logger } from '../utils/logger';

/**
 * Servicio centralizado para manejo de errores
 * Proporciona mensajes amigables al usuario y logging estructurado
 */

// Mapeo de errores de Supabase a mensajes amigables
const errorMessages = {
  // Errores de autenticación
  'Invalid login credentials': 'Email o contraseña incorrectos. Por favor, verifica tus credenciales.',
  'Email already registered': 'Este email ya está registrado. ¿Quieres iniciar sesión?',
  'User already registered': 'Este email ya está registrado.',
  'Email not confirmed': 'Por favor, verifica tu email antes de iniciar sesión.',
  'Invalid email': 'El formato del email no es válido.',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
  'Signup is disabled': 'El registro está deshabilitado temporalmente.',
  'User not found': 'No existe una cuenta con este correo electrónico.',
  'For security purposes, you can only request this once every 60 seconds': 'Por seguridad, solo puedes solicitar esto una vez cada 60 segundos. Por favor espera un momento.',
  'Email rate limit exceeded': 'Demasiados intentos. Por favor espera unos minutos antes de intentar de nuevo.',
  
  // Errores de base de datos
  'duplicate key value violates unique constraint': 'Este registro ya existe.',
  'foreign key constraint fails': 'No se puede realizar esta operación debido a dependencias.',
  'column does not exist': 'Error en la estructura de datos. Por favor, contacta al soporte.',
  'relation does not exist': 'Error en la base de datos. Por favor, contacta al soporte.',
  
  // Errores de permisos
  'permission denied': 'No tienes permisos para realizar esta acción.',
  'new row violates row-level security policy': 'No tienes permisos para realizar esta acción.',
  
  // Errores de red
  'Failed to fetch': 'Error de conexión. Por favor, verifica tu internet e intenta de nuevo.',
  'Network request failed': 'Error de conexión. Por favor, verifica tu internet.',
  'timeout': 'La solicitud tardó demasiado. Por favor, intenta de nuevo.',
  
  // Errores genéricos
  'Internal server error': 'Error interno del servidor. Por favor, intenta más tarde.',
  'Bad Request': 'Solicitud inválida. Por favor, verifica los datos ingresados.',
  'Unauthorized': 'No estás autenticado. Por favor, inicia sesión.',
  'Forbidden': 'No tienes permisos para realizar esta acción.',
  'Not Found': 'El recurso solicitado no fue encontrado.',
};

/**
 * Obtiene un mensaje amigable para el usuario basado en el error
 * @param {Error|string} error - Error o mensaje de error
 * @returns {string} Mensaje amigable para el usuario
 */
export const getUserFriendlyMessage = (error) => {
  if (!error) {
    return 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.';
  }

  const errorMessage = typeof error === 'string' ? error : error.message || error.toString();
  const errorLower = errorMessage.toLowerCase();

  // Buscar coincidencia exacta primero
  for (const [key, message] of Object.entries(errorMessages)) {
    if (errorMessage.includes(key) || errorLower.includes(key.toLowerCase())) {
      return message;
    }
  }

  // Si es un error de validación personalizado, retornarlo tal cual
  if (errorMessage.includes('es requerido') || 
      errorMessage.includes('debe ser') || 
      errorMessage.includes('no puede')) {
    return errorMessage;
  }

  // Mensaje genérico si no hay coincidencia
  return 'Ha ocurrido un error. Por favor, intenta de nuevo o contacta al soporte si el problema persiste.';
};

/**
 * Maneja un error de forma centralizada
 * @param {Error|string} error - Error a manejar
 * @param {string} context - Contexto donde ocurrió el error
 * @param {object} options - Opciones adicionales
 * @returns {object} Objeto con información del error
 */
export const handleError = (error, context = 'Operación', options = {}) => {
  const {
    showNotification = true,
    logToConsole = true,
    logToService = true
  } = options;

  const errorMessage = typeof error === 'string' ? error : error.message || 'Error desconocido';
  const userMessage = getUserFriendlyMessage(error);

  // Logging
  if (logToConsole) {
    logger.error(`❌ Error en ${context}:`, {
      error: errorMessage,
      context,
      stack: error?.stack,
      ...options.metadata
    });
  }

  // En producción, los errores se loggean en consola
  // Para monitoreo avanzado, se puede integrar un servicio externo aquí
  if (logToService && import.meta.env.PROD) {
    // Los errores ya se loggean arriba con logger.error
  }

  // Mostrar notificación al usuario (si está disponible)
  if (showNotification && typeof window !== 'undefined') {
    // Si hay un sistema de notificaciones, usarlo
    // Por ahora, solo loggear
    logger.warn(`Notificación para usuario: ${userMessage}`);
  }

  return {
    success: false,
    error: errorMessage,
    userMessage,
    context
  };
};

/**
 * Maneja errores de Supabase específicamente
 * @param {Error} error - Error de Supabase
 * @param {string} operation - Operación que falló
 * @returns {object} Objeto con información del error
 */
export const handleSupabaseError = (error, operation) => {
  let errorMessage = 'Error desconocido';
  
  if (error?.message) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  // Errores específicos de Supabase
  if (error?.code) {
    switch (error.code) {
      case 'PGRST116':
        // No rows found - no es necesariamente un error
        return {
          success: true,
          data: null,
          error: null
        };
      case '23505':
        errorMessage = 'Este registro ya existe.';
        break;
      case '23503':
        errorMessage = 'No se puede realizar esta operación debido a dependencias.';
        break;
      case '42501':
        errorMessage = 'No tienes permisos para realizar esta acción.';
        break;
    }
  }

  return handleError(errorMessage, operation);
};

/**
 * Valida y sanitiza un error antes de mostrarlo
 * @param {any} error - Error a validar
 * @returns {Error} Error validado
 */
export const sanitizeError = (error) => {
  if (error instanceof Error) {
    return error;
  }
  
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  if (error && typeof error === 'object' && error.message) {
    return new Error(error.message);
  }
  
  return new Error('Error desconocido');
};

export default {
  handleError,
  handleSupabaseError,
  getUserFriendlyMessage,
  sanitizeError
};

