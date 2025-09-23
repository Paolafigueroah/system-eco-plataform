import React, { useState } from 'react';
import { sqliteAuthService } from '../services/sqliteAuthService';
import { executeQuerySingle } from '../sqliteConfig';
import bcrypt from 'bcryptjs';

const AuthDiagnostic = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test, success, message, details = null) => {
    setResults(prev => [...prev, { 
      test, 
      success, 
      message, 
      details,
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const runDiagnostic = async () => {
    setIsLoading(true);
    setResults([]);

    try {
      // Test 1: Verificar si la base de datos está funcionando
      addResult('Database Check', 'running', 'Verificando conexión a la base de datos...');
      const dbTest = await executeQuerySingle('SELECT 1 as test');
      if (dbTest.data) {
        addResult('Database Check', 'success', '✅ Base de datos funcionando correctamente');
      } else {
        addResult('Database Check', 'error', '❌ Error en la base de datos', dbTest.error);
        return;
      }

      // Test 2: Verificar si existen usuarios
      addResult('Users Check', 'running', 'Verificando usuarios existentes...');
      const usersCheck = await executeQuerySingle('SELECT COUNT(*) as count FROM users');
      if (usersCheck.data) {
        addResult('Users Check', 'success', `✅ Encontrados ${usersCheck.data.count} usuarios en la base de datos`);
      } else {
        addResult('Users Check', 'error', '❌ Error contando usuarios', usersCheck.error);
      }

      // Test 3: Verificar usuario admin específico
      addResult('Admin User Check', 'running', 'Verificando usuario admin...');
      const adminCheck = await executeQuerySingle('SELECT * FROM users WHERE email = ?', ['admin@systemeco.com']);
      if (adminCheck.data) {
        addResult('Admin User Check', 'success', '✅ Usuario admin encontrado', {
          id: adminCheck.data.id,
          email: adminCheck.data.email,
          display_name: adminCheck.data.display_name,
          has_password_hash: !!adminCheck.data.password_hash
        });
      } else {
        addResult('Admin User Check', 'error', '❌ Usuario admin no encontrado', adminCheck.error);
      }

      // Test 4: Verificar hash de contraseña
      if (adminCheck.data && adminCheck.data.password_hash) {
        addResult('Password Hash Check', 'running', 'Verificando hash de contraseña...');
        try {
          const isPasswordValid = await bcrypt.compare('admin123', adminCheck.data.password_hash);
          if (isPasswordValid) {
            addResult('Password Hash Check', 'success', '✅ Hash de contraseña válido');
          } else {
            addResult('Password Hash Check', 'error', '❌ Hash de contraseña inválido');
          }
        } catch (hashError) {
          addResult('Password Hash Check', 'error', '❌ Error verificando hash', hashError.message);
        }
      }

      // Test 5: Probar login directo
      addResult('Direct Login Test', 'running', 'Probando login directo...');
      const loginResult = await sqliteAuthService.signIn('admin@systemeco.com', 'admin123');
      if (loginResult.success) {
        addResult('Direct Login Test', 'success', '✅ Login directo exitoso', {
          user_id: loginResult.user.id,
          user_name: loginResult.user.display_name
        });
      } else {
        addResult('Direct Login Test', 'error', '❌ Login directo falló', loginResult.error);
      }

      // Test 6: Crear usuario de prueba
      addResult('Create Test User', 'running', 'Creando usuario de prueba...');
      const testEmail = `test_${Date.now()}@systemeco.com`;
      const createResult = await sqliteAuthService.signUp(testEmail, 'test123', 'Usuario Prueba');
      if (createResult.success) {
        addResult('Create Test User', 'success', '✅ Usuario de prueba creado exitosamente', {
          user_id: createResult.user.id,
          email: createResult.user.email
        });
      } else {
        addResult('Create Test User', 'error', '❌ Error creando usuario de prueba', createResult.error);
      }

    } catch (error) {
      addResult('General Error', 'error', '❌ Error general en diagnóstico', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl mx-auto mt-8 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">🔬 Diagnóstico de Autenticación</h2>
      
      <div className="space-y-4 mb-6">
        <button 
          onClick={runDiagnostic}
          disabled={isLoading}
          className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
        >
          {isLoading ? 'Ejecutando diagnóstico...' : 'Ejecutar Diagnóstico Completo'}
        </button>
        
        <button 
          onClick={clearResults}
          className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          Limpiar Resultados
        </button>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Resultados del Diagnóstico:</h3>
        {results.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No hay resultados aún. Ejecuta el diagnóstico para ver los resultados.</p>
        ) : (
          results.map((result, index) => (
            <div 
              key={index}
              className={`p-4 rounded border-l-4 ${
                result.success === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
                  : result.success === 'error'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <strong className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {result.test}
                  </strong>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {result.message}
                  </p>
                  {result.details && (
                    <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                      <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                        {typeof result.details === 'object' 
                          ? JSON.stringify(result.details, null, 2)
                          : result.details
                        }
                      </pre>
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                  {result.timestamp}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Información del Diagnóstico:</h4>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <p>• Este diagnóstico verifica cada paso del proceso de autenticación</p>
          <p>• Revisa la conexión a la base de datos, usuarios existentes y hashes de contraseña</p>
          <p>• Prueba el login directo y la creación de nuevos usuarios</p>
          <p>• Los detalles técnicos se muestran en las cajas grises</p>
        </div>
      </div>
    </div>
  );
};

export default AuthDiagnostic;