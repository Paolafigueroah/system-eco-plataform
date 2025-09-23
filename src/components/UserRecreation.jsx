import React, { useState } from 'react';
import { executeQueryRun, executeQuerySingle } from '../sqliteConfig';
import bcrypt from 'bcryptjs';

const UserRecreation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);

  const addResult = (message, success = true) => {
    setResults(prev => [...prev, { 
      message, 
      success, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const clearUsers = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      addResult('🗑️ Eliminando usuarios existentes...');
      
      // Eliminar usuarios de prueba
      await executeQueryRun('DELETE FROM users WHERE email IN (?, ?)', [
        'admin@systemeco.com', 
        'usuario2@systemeco.com'
      ]);
      
      addResult('✅ Usuarios eliminados correctamente');
      
    } catch (error) {
      addResult(`❌ Error eliminando usuarios: ${error.message}`, false);
    } finally {
      setIsLoading(false);
    }
  };

  const recreateUsers = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      addResult('🚀 Iniciando recreación de usuarios...');
      
      // Verificar si los usuarios ya existen
      const adminExists = await executeQuerySingle('SELECT id FROM users WHERE email = ?', ['admin@systemeco.com']);
      const user2Exists = await executeQuerySingle('SELECT id FROM users WHERE email = ?', ['usuario2@systemeco.com']);
      
      if (adminExists.data || user2Exists.data) {
        addResult('⚠️ Usuarios ya existen, eliminando primero...');
        await clearUsers();
      }
      
      // Crear hash de contraseña
      addResult('🔐 Generando hash de contraseña...');
      const passwordHash = await bcrypt.hash('admin123', 10);
      addResult('✅ Hash generado correctamente');
      
      // Crear usuario admin
      addResult('👤 Creando usuario admin...');
      const adminResult = await executeQueryRun(
        'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)',
        ['admin@systemeco.com', passwordHash, 'Administrador']
      );
      
      if (adminResult.error) {
        addResult(`❌ Error creando admin: ${adminResult.error}`, false);
      } else {
        addResult('✅ Usuario admin creado exitosamente');
      }
      
      // Crear segundo usuario
      addResult('👤 Creando usuario 2...');
      const user2Result = await executeQueryRun(
        'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)',
        ['usuario2@systemeco.com', passwordHash, 'Usuario Prueba 2']
      );
      
      if (user2Result.error) {
        addResult(`❌ Error creando usuario 2: ${user2Result.error}`, false);
      } else {
        addResult('✅ Usuario 2 creado exitosamente');
      }
      
      // Verificar usuarios creados
      addResult('🔍 Verificando usuarios creados...');
      const finalAdminCheck = await executeQuerySingle('SELECT * FROM users WHERE email = ?', ['admin@systemeco.com']);
      const finalUser2Check = await executeQuerySingle('SELECT * FROM users WHERE email = ?', ['usuario2@systemeco.com']);
      
      if (finalAdminCheck.data && finalUser2Check.data) {
        addResult('✅ Ambos usuarios verificados correctamente');
        addResult(`📧 Admin: ${finalAdminCheck.data.email} (ID: ${finalAdminCheck.data.id})`);
        addResult(`📧 Usuario 2: ${finalUser2Check.data.email} (ID: ${finalUser2Check.data.id})`);
      } else {
        addResult('❌ Error en la verificación final', false);
      }
      
    } catch (error) {
      addResult(`❌ Error general: ${error.message}`, false);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    setIsLoading(true);
    
    try {
      addResult('🔐 Probando login con usuario admin...');
      
      // Verificar usuario
      const userCheck = await executeQuerySingle(
        'SELECT * FROM users WHERE email = ?', 
        ['admin@systemeco.com']
      );
      
      if (!userCheck.data) {
        addResult('❌ Usuario admin no encontrado', false);
        return;
      }
      
      addResult(`✅ Usuario encontrado: ${userCheck.data.display_name}`);
      
      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare('admin123', userCheck.data.password_hash);
      
      if (isPasswordValid) {
        addResult('✅ Contraseña válida');
      } else {
        addResult('❌ Contraseña inválida', false);
      }
      
    } catch (error) {
      addResult(`❌ Error en test de login: ${error.message}`, false);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl mx-auto mt-8 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">🔄 Recreación de Usuarios</h2>
      
      <div className="space-y-4 mb-6">
        <button 
          onClick={recreateUsers}
          disabled={isLoading}
          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? 'Procesando...' : 'Recrear Usuarios de Prueba'}
        </button>
        
        <button 
          onClick={clearUsers}
          disabled={isLoading}
          className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Eliminar Usuarios Existentes
        </button>
        
        <button 
          onClick={testLogin}
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Probar Login
        </button>
        
        <button 
          onClick={clearResults}
          className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          Limpiar Resultados
        </button>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Resultados:</h3>
        {results.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No hay resultados aún. Ejecuta una acción para ver los resultados.</p>
        ) : (
          results.map((result, index) => (
            <div 
              key={index}
              className={`p-3 rounded border-l-4 ${
                result.success 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-500'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {result.message}
                  </p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {result.timestamp}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
        <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">⚠️ Advertencia:</h4>
        <div className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
          <p>• Esta herramienta elimina y recrea los usuarios de prueba</p>
          <p>• Úsala solo si hay problemas con la autenticación</p>
          <p>• Los usuarios recreados tendrán las credenciales: admin@systemeco.com / admin123</p>
        </div>
      </div>
    </div>
  );
};

export default UserRecreation;
