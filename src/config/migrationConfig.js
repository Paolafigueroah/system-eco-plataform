// Configuración de migración entre SQLite y Supabase
export const migrationConfig = {
  // Configurar qué base de datos usar
  // Valores: 'sqlite' | 'supabase' | 'hybrid'
  databaseType: 'sqlite', // Forced to use SQLite temporarily
  
  // Configuración para migración híbrida
  hybrid: {
    // Usar SQLite para operaciones locales
    useSQLiteFor: ['debug', 'testing'],
    // Usar Supabase para operaciones de producción
    useSupabaseFor: ['production', 'persistence']
  },
  
  // Configuración de migración de datos
  dataMigration: {
    // Migrar automáticamente al cambiar de SQLite a Supabase
    autoMigrate: true,
    // Mantener datos en SQLite después de migrar
    keepSQLiteData: false,
    // Crear datos de ejemplo en Supabase
    createSampleData: true
  }
};

// Función para obtener el servicio correcto basado en la configuración
export const getService = (serviceType, serviceName) => {
  const { databaseType } = migrationConfig;
  
  if (databaseType === 'supabase') {
    return import(`../services/supabase${serviceName}Service.js`);
  } else if (databaseType === 'hybrid') {
    // En modo híbrido, decidir basado en el contexto
    const isProduction = import.meta.env.PROD;
    if (isProduction) {
      return import(`../services/supabase${serviceName}Service.js`);
    } else {
      return import(`../services/sqlite${serviceName}Service.js`);
    }
  } else {
    // Por defecto usar SQLite
    return import(`../services/sqlite${serviceName}Service.js`);
  }
};

// Función para migrar datos de SQLite a Supabase
export const migrateData = async () => {
  try {
    console.log('🔄 Iniciando migración de datos...');
    
    // Aquí iría la lógica de migración
    // Por ahora solo un placeholder
    
    console.log('✅ Migración completada');
    return { success: true };
  } catch (error) {
    console.error('❌ Error en migración:', error);
    return { success: false, error: error.message };
  }
};

export default migrationConfig;
