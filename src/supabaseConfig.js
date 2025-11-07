import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
// Las credenciales deben estar en variables de entorno (.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar que las variables de entorno estén configuradas
if (!supabaseUrl) {
  throw new Error(
    '❌ VITE_SUPABASE_URL no está configurada. ' +
    'Por favor, crea un archivo .env con VITE_SUPABASE_URL=tu-url'
  );
}

if (!supabaseKey) {
  throw new Error(
    '❌ VITE_SUPABASE_ANON_KEY no está configurada. ' +
    'Por favor, crea un archivo .env con VITE_SUPABASE_ANON_KEY=tu-clave'
  );
}

// Debug solo en desarrollo
if (import.meta.env.DEV) {
  console.log('🔧 Supabase Config (Development):');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configurada' : '❌ Faltante');
}

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// Funciones de utilidad para Supabase
export const supabaseUtils = {
  // Función para manejar errores de Supabase
  handleError: (error, operation) => {
    console.error(`❌ Error en ${operation}:`, error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  },

  // Función para manejar respuestas exitosas
  handleSuccess: (data, operation) => {
    console.log(`✅ ${operation} exitoso:`, data);
    return {
      success: true,
      error: null,
      data
    };
  },

  // Función para verificar si el usuario está autenticado
  isAuthenticated: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error obteniendo sesión:', error);
        return false;
      }
      return session !== null;
    } catch (error) {
      console.error('Error en isAuthenticated:', error);
      return false;
    }
  },

  // Función para obtener el usuario actual
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { success: true, data: user, error: null };
    } catch (error) {
      return supabaseUtils.handleError(error, 'getCurrentUser');
    }
  }
};

export default supabase;
