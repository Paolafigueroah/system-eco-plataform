import { useState, useEffect } from 'react';
import { migrationConfig, migrateData } from '../config/migrationConfig.js';

const DatabaseMigrator = () => {
  const [currentDatabase, setCurrentDatabase] = useState(migrationConfig.databaseType);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState('');

  const handleDatabaseChange = async (newDatabaseType) => {
    setIsMigrating(true);
    setMigrationStatus(`Cambiando a ${newDatabaseType}...`);
    
    try {
      // Aquí iría la lógica para cambiar la base de datos
      // Por ahora solo actualizamos el estado
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular migración
      
      setCurrentDatabase(newDatabaseType);
      setMigrationStatus(`✅ Migrado exitosamente a ${newDatabaseType}`);
      
      // Recargar la página para aplicar los cambios
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      setMigrationStatus(`❌ Error en migración: ${error.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  const getDatabaseInfo = () => {
    switch (currentDatabase) {
      case 'sqlite':
        return {
          name: 'SQLite',
          description: 'Base de datos local en el navegador',
          color: 'bg-blue-500',
          pros: ['Rápido', 'Sin configuración', 'Funciona offline'],
          cons: ['Datos no persistentes', 'Limitado por navegador']
        };
      case 'supabase':
        return {
          name: 'Supabase',
          description: 'Base de datos en la nube',
          color: 'bg-green-500',
          pros: ['Datos persistentes', 'Escalable', 'Tiempo real'],
          cons: ['Requiere configuración', 'Dependiente de internet']
        };
      case 'hybrid':
        return {
          name: 'Híbrido',
          description: 'SQLite para desarrollo, Supabase para producción',
          color: 'bg-purple-500',
          pros: ['Mejor de ambos mundos', 'Flexible'],
          cons: ['Más complejo']
        };
      default:
        return null;
    }
  };

  const currentInfo = getDatabaseInfo();

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl mx-auto border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        🗄️ Configuración de Base de Datos
      </h3>
      
      {/* Estado actual */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Base de datos actual:
        </h4>
        <div className={`${currentInfo?.color} text-white p-3 rounded-lg`}>
          <div className="font-bold">{currentInfo?.name}</div>
          <div className="text-sm opacity-90">{currentInfo?.description}</div>
        </div>
      </div>

      {/* Información de la base de datos */}
      {currentInfo && (
        <div className="mb-6 grid md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-semibold text-green-600 dark:text-green-400 mb-2">
              ✅ Ventajas:
            </h5>
            <ul className="text-sm text-gray-600 dark:text-gray-300">
              {currentInfo.pros.map((pro, index) => (
                <li key={index}>• {pro}</li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-red-600 dark:text-red-400 mb-2">
              ⚠️ Limitaciones:
            </h5>
            <ul className="text-sm text-gray-600 dark:text-gray-300">
              {currentInfo.cons.map((con, index) => (
                <li key={index}>• {con}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Opciones de migración */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Cambiar base de datos:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => handleDatabaseChange('sqlite')}
            disabled={isMigrating || currentDatabase === 'sqlite'}
            className={`p-3 rounded-lg border-2 transition-colors ${
              currentDatabase === 'sqlite'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                : 'border-gray-300 hover:border-blue-400'
            } ${isMigrating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="font-semibold text-blue-600">SQLite</div>
            <div className="text-xs text-gray-500">Local</div>
          </button>
          
          <button
            onClick={() => handleDatabaseChange('supabase')}
            disabled={isMigrating || currentDatabase === 'supabase'}
            className={`p-3 rounded-lg border-2 transition-colors ${
              currentDatabase === 'supabase'
                ? 'border-green-500 bg-green-50 dark:bg-green-900'
                : 'border-gray-300 hover:border-green-400'
            } ${isMigrating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="font-semibold text-green-600">Supabase</div>
            <div className="text-xs text-gray-500">Nube</div>
          </button>
          
          <button
            onClick={() => handleDatabaseChange('hybrid')}
            disabled={isMigrating || currentDatabase === 'hybrid'}
            className={`p-3 rounded-lg border-2 transition-colors ${
              currentDatabase === 'hybrid'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900'
                : 'border-gray-300 hover:border-purple-400'
            } ${isMigrating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="font-semibold text-purple-600">Híbrido</div>
            <div className="text-xs text-gray-500">Flexible</div>
          </button>
        </div>
      </div>

      {/* Estado de migración */}
      {isMigrating && (
        <div className="mb-4">
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-3"></div>
              <div className="text-yellow-800 dark:text-yellow-200">
                {migrationStatus}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instrucciones para Supabase */}
      {currentDatabase === 'supabase' && (
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            📋 Configuración requerida:
          </h5>
          <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>1. Crea un proyecto en <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">Supabase</a></li>
            <li>2. Ejecuta el script SQL en <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">supabase-schema.sql</code></li>
            <li>3. Configura las variables de entorno en <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">.env</code></li>
            <li>4. Recarga la aplicación</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default DatabaseMigrator;
