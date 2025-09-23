import { migrationConfig } from '../config/migrationConfig.js';
import { initDatabase, executeQuerySingle, executeQueryRun } from '../sqliteConfig';
import { createTestUser, createSampleProducts, createSampleConversations } from '../initSQLite';
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
      console.log(`🗄️ Tipo de base de datos: ${migrationConfig.databaseType}`);
      
      let dbSuccess = false;
      
      if (migrationConfig.databaseType === 'supabase') {
        // Inicializar Supabase
        dbSuccess = await initSupabase();
        if (!dbSuccess) {
          console.warn('⚠️ Fallback a SQLite debido a error en Supabase');
          dbSuccess = await initDatabase();
        }
      } else {
        // Inicializar SQLite
        dbSuccess = await initDatabase();
      }
      
      if (!dbSuccess) {
        throw new Error('Error inicializando la base de datos');
      }

      // Crear usuarios de prueba (solo para SQLite)
      if (migrationConfig.databaseType !== 'supabase') {
        console.log('👤 Creando usuarios de prueba...');
        try {
          await createTestUser();
        } catch (error) {
          // Los errores de UNIQUE constraint son esperados y se manejan internamente
          if (!error.message.includes('UNIQUE constraint failed')) {
            console.error('❌ Error inesperado creando usuarios de prueba:', error);
          }
        }
      } else {
        console.log('ℹ️ Usuarios se crean mediante registro en Supabase');
      }

      // Crear productos de ejemplo
      console.log('📦 Creando productos de ejemplo...');
      try {
        if (migrationConfig.databaseType === 'supabase') {
          await createSampleData();
        } else {
          await createSampleProducts();
        }
      } catch (error) {
        console.error('❌ Error creando productos de ejemplo:', error);
      }

      // Crear conversaciones de ejemplo (solo para SQLite)
      if (migrationConfig.databaseType !== 'supabase') {
        console.log('💬 Creando conversaciones de ejemplo...');
        try {
          await createSampleConversations();
        } catch (error) {
          console.error('❌ Error creando conversaciones de ejemplo:', error);
        }
      } else {
        console.log('ℹ️ Conversaciones se crean automáticamente en Supabase');
      }

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
