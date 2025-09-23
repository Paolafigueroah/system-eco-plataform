import React, { useState } from 'react';
import { executeQuerySingle } from '../sqliteConfig';
import bcrypt from 'bcryptjs';
import { sqliteAuthService } from '../services/sqliteAuthService';

const LoginDebug = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message, success = true) => {
    setResults(prev => [...prev, { 
      message, 
      success, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const debugLogin = async () => {
    setIsLoading(true);
    clearResults();
    
    try {
      addResult('🔍 Iniciando debug de login...');
      
      const email = 'admin@systemeco.com';
      const password = 'admin123';
      
      // Paso 1: Verificar si el usuario existe
      addResult(`📧 Buscando usuario: ${email}`);
      const userResult = await executeQuerySingle(
        'SELECT id, email, password_hash, display_name FROM users WHERE email = ?',
        [email]
      );
      
      if (userResult.error) {
        addResult(`❌ Error en consulta: ${userResult.error}`, false);
        return;
      }
      
      if (!userResult.data) {
        addResult('❌ Usuario no encontrado en la base de datos', false);
        return;
      }
      
      addResult(`✅ Usuario encontrado: ${userResult.data.display_name}`);
      addResult(`🆔 ID: ${userResult.data.id}`);
      addResult(`📧 Email: ${userResult.data.email}`);
      addResult(`🔐 Password hash existe: ${userResult.data.password_hash ? 'Sí' : 'No'}`);
      
      if (userResult.data.password_hash) {
        addResult(`🔐 Hash length: ${userResult.data.password_hash.length} caracteres`);
        addResult(`🔐 Hash preview: ${userResult.data.password_hash.substring(0, 20)}...`);
      }
      
      // Paso 2: Probar hash de la contraseña
      addResult(`🔑 Probando contraseña: ${password}`);
      const testHash = await bcrypt.hash(password, 10);
      addResult(`🔑 Test hash generado: ${testHash.substring(0, 20)}...`);
      
      // Paso 3: Comparar contraseñas
      addResult('🔄 Comparando contraseñas...');
      const isPasswordValid = await bcrypt.compare(password, userResult.data.password_hash);
      addResult(`✅ Contraseña válida: ${isPasswordValid ? 'Sí' : 'No'}`);
      
      if (!isPasswordValid) {
        addResult('❌ La contraseña no coincide con el hash almacenado', false);
        
        // Probar con diferentes variaciones
        addResult('🔍 Probando variaciones de contraseña...');
        const variations = ['admin123', 'Admin123', 'ADMIN123', 'admin', '123'];
        
        for (const variation of variations) {
          const isValid = await bcrypt.compare(variation, userResult.data.password_hash);
          if (isValid) {
            addResult(`✅ Contraseña correcta encontrada: "${variation}"`, true);
            break;
          }
        }
      }
      
      // Paso 4: Probar el servicio de autenticación completo
      addResult('🔐 Probando servicio de autenticación completo...');
      const authResult = await sqliteAuthService.signIn(email, password);
      
      if (authResult.success) {
        addResult('✅ Autenticación exitosa con el servicio', true);
        addResult(`👤 Usuario: ${authResult.user.display_name}`);
        addResult(`🎫 Token generado: ${authResult.token ? 'Sí' : 'No'}`);
      } else {
        addResult(`❌ Error en autenticación: ${authResult.error}`, false);
      }
      
    } catch (error) {
      addResult(`❌ Error durante debug: ${error.message}`, false);
      console.error('Error en debug:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const recreateAdminUser = async () => {
    setIsLoading(true);
    clearResults();
    
    try {
      addResult('🗑️ Eliminando usuario admin existente...');
      await executeQuerySingle('DELETE FROM users WHERE email = ?', ['admin@systemeco.com']);
      
      addResult('👤 Creando nuevo usuario admin...');
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      const result = await executeQuerySingle(
        'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)',
        ['admin@systemeco.com', passwordHash, 'Administrador']
      );
      
      if (result.error) {
        addResult(`❌ Error creando usuario: ${result.error}`, false);
      } else {
        addResult('✅ Usuario admin recreado exitosamente', true);
        addResult(`🔐 Hash generado: ${passwordHash.substring(0, 20)}...`);
      }
      
    } catch (error) {
      addResult(`❌ Error recreando usuario: ${error.message}`, false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl mx-auto border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">🔍 Debug de Login</h2>
      
      <div className="space-y-4 mb-6">
        <button 
          onClick={debugLogin}
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? '🔍 Debuggeando...' : '🔍 Debug Login'}
        </button>
        
        <button 
          onClick={recreateAdminUser}
          disabled={isLoading}
          className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
        >
          {isLoading ? '🔄 Recreando...' : '🔄 Recrear Usuario Admin'}
        </button>
        
        <button 
          onClick={clearResults}
          className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          🗑️ Limpiar Resultados
        </button>
      </div>
      
      {results.length > 0 && (
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg max-h-96 overflow-y-auto">
          <h3 className="font-bold text-gray-800 dark:text-white mb-2">Resultados del Debug:</h3>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`p-2 rounded text-sm ${
                  result.success 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                    : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                }`}
              >
                <span className="font-mono text-xs opacity-70">{result.timestamp}</span> {result.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginDebug;

