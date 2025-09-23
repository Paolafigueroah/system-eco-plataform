import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
// Reemplaza estas variables con tus credenciales de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ruwvfemrgkqlxgrengbp.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1d3ZmZW1yZ2txbHhncmVuZ2JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1ODU0NzAsImV4cCI6MjA3NDE2MTQ3MH0.PAJ24UTBwMb6BSk3jhlq6D_szJawLqy09VdBk1HL8Ms';

// Debug: Mostrar las variables cargadas
console.log('🔧 Supabase Config Debug (Updated):');
console.log('VITE_SUPABASE_URL:', supabaseUrl);
console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Loaded' : 'Missing');
console.log('Environment variables:', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing'
});

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
  isAuthenticated: () => {
    const session = supabase.auth.getSession();
    return session !== null;
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
