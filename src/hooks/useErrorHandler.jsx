import { useState, useCallback } from 'react';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleError = useCallback((error, context = '') => {
    console.error(`Error en ${context}:`, error);
    
    // Determinar el tipo de error y mensaje apropiado
    let errorMessage = 'Ha ocurrido un error inesperado';
    
    if (error.message) {
      if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Error de conexión. Verifica tu internet y vuelve a intentar.';
      } else if (error.message.includes('auth') || error.message.includes('unauthorized')) {
        errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
      } else if (error.message.includes('permission') || error.message.includes('forbidden')) {
        errorMessage = 'No tienes permisos para realizar esta acción.';
      } else if (error.message.includes('not found')) {
        errorMessage = 'El recurso solicitado no fue encontrado.';
      } else {
        errorMessage = error.message;
      }
    }
    
    setError(errorMessage);
    setLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeAsync = useCallback(async (asyncFunction, context = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      setLoading(false);
      return result;
    } catch (error) {
      handleError(error, context);
      throw error;
    }
  }, [handleError]);

  return {
    error,
    loading,
    handleError,
    clearError,
    executeAsync
  };
};

export default useErrorHandler;
