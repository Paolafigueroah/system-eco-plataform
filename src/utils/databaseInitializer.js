import { initSupabase, createSampleData } from '../supabaseInitializer.js';

// Variable para controlar si ya se inicializó
let isInitialized = false;
let initializationPromise = null;

// Función para inicializar la base de datos de forma segura
export const initializeDatabase = async () => {
  // Si ya se está inicializando, esperar a que termine
  if (initializationPromise) {
    return await initializationPromise;
  }

  // Si ya está inicializada, retornar true
  if (isInitialized) {
    return true;
  }

  // Crear la promesa de inicialización
  initializationPromise = (async () => {
    try {
      console.log('🚀 Iniciando base de datos...');
      console.log('🗄️ Tipo de base de datos: supabase');
      
      // Inicializar Supabase
      const dbSuccess = await initSupabase();
      
      if (!dbSuccess) {
        throw new Error('Error inicializando Supabase');
      }

      console.log('ℹ️ Usuarios se crean mediante registro en Supabase');

      // Crear productos de ejemplo
      console.log('📦 Creando productos de ejemplo...');
      try {
        await createSampleData();
      } catch (error) {
        console.error('❌ Error creando productos de ejemplo:', error);
      }

      console.log('ℹ️ Conversaciones se crean automáticamente en Supabase');

      // Marcar como inicializada
      isInitialized = true;
      console.log('✅ Base de datos inicializada correctamente');
      
      return true;
    } catch (error) {
      console.error('❌ Error inicializando base de datos:', error);
      isInitialized = false;
      initializationPromise = null;
      return false;
    }
  })();

  return await initializationPromise;
};

// Función para verificar si la base de datos está inicializada
export const isDatabaseInitialized = () => {
  return isInitialized;
};

// Función para resetear el estado de inicialización (útil para testing)
export const resetInitialization = () => {
  isInitialized = false;
  initializationPromise = null;
};
