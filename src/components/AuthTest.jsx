import React, { useState } from 'react';
import { sqliteAuthService } from '../services/sqliteAuthService';

const AuthTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test, success, message) => {
    setTestResults(prev => [...prev, { test, success, message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runAuthTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    try {
      // Test 1: Login with admin user
      addResult('Login Admin', 'running', 'Probando login con admin@systemeco.com...');
      const loginResult = await sqliteAuthService.signIn('admin@systemeco.com', 'admin123');
      if (loginResult.success) {
        addResult('Login Admin', 'success', `✅ Login exitoso. Usuario: ${loginResult.user.display_name}`);
      } else {
        addResult('Login Admin', 'error', `❌ Error: ${loginResult.error}`);
      }

      // Test 2: Get current user
      if (loginResult.success) {
        addResult('Get Current User', 'running', 'Obteniendo usuario actual...');
        const currentUserResult = await sqliteAuthService.getCurrentUser(loginResult.token);
        if (currentUserResult.success) {
          addResult('Get Current User', 'success', `✅ Usuario actual: ${currentUserResult.user.display_name}`);
        } else {
          addResult('Get Current User', 'error', `❌ Error: ${currentUserResult.error}`);
        }
      }

      // Test 3: Create new user
      addResult('Create User', 'running', 'Creando nuevo usuario de prueba...');
      const newUserEmail = `test_${Date.now()}@systemeco.com`;
      const signUpResult = await sqliteAuthService.signUp(newUserEmail, 'test123', 'Usuario Prueba');
      if (signUpResult.success) {
        addResult('Create User', 'success', `✅ Usuario creado: ${signUpResult.user.display_name}`);
      } else {
        addResult('Create User', 'error', `❌ Error: ${signUpResult.error}`);
      }

      // Test 4: Login with new user
      if (signUpResult.success) {
        addResult('Login New User', 'running', 'Probando login con nuevo usuario...');
        const newUserLoginResult = await sqliteAuthService.signIn(newUserEmail, 'test123');
        if (newUserLoginResult.success) {
          addResult('Login New User', 'success', `✅ Login con nuevo usuario exitoso`);
        } else {
          addResult('Login New User', 'error', `❌ Error: ${newUserLoginResult.error}`);
        }
      }

    } catch (error) {
      addResult('General Error', 'error', `❌ Error general: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl mx-auto mt-8 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">🧪 Pruebas de Autenticación</h2>
      
      <div className="space-y-4 mb-6">
        <button 
          onClick={runAuthTests}
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Ejecutando pruebas...' : 'Ejecutar Pruebas de Autenticación'}
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
        {testResults.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No hay resultados aún. Ejecuta las pruebas para ver los resultados.</p>
        ) : (
          testResults.map((result, index) => (
            <div 
              key={index}
              className={`p-3 rounded border-l-4 ${
                result.success === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
                  : result.success === 'error'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <strong className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {result.test}
                  </strong>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Credenciales de Prueba:</h4>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <p><strong>Admin:</strong> admin@systemeco.com / admin123</p>
          <p><strong>Usuario 2:</strong> usuario2@systemeco.com / admin123</p>
        </div>
      </div>
    </div>
  );
};

export default AuthTest;