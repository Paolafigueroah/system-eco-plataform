import React, { useState, useEffect } from 'react';
import { executeQuery, executeQuerySingle } from '../sqliteConfig';

const DatabaseDebug = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const checkUsers = async () => {
    setIsLoading(true);
    try {
      const result = await executeQuery('SELECT id, email, display_name, created_at FROM users ORDER BY id');
      if (result.data) {
        setUsers(result.data);
      } else {
        console.error('Error obteniendo usuarios:', result.error);
      }
    } catch (error) {
      console.error('Error en checkUsers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSpecificUser = async (email) => {
    try {
      const result = await executeQuerySingle('SELECT * FROM users WHERE email = ?', [email]);
      console.log(`Usuario ${email}:`, result);
      return result;
    } catch (error) {
      console.error(`Error verificando usuario ${email}:`, error);
    }
  };

  const testPasswordHash = async () => {
    try {
      const result = await executeQuerySingle('SELECT password_hash FROM users WHERE email = ?', ['admin@systemeco.com']);
      if (result.data) {
        console.log('Hash de contraseña para admin:', result.data.password_hash);
        return result.data.password_hash;
      }
    } catch (error) {
      console.error('Error obteniendo hash:', error);
    }
  };

  useEffect(() => {
    checkUsers();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl mx-auto mt-8 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">🔍 Debug de Base de Datos</h2>
      
      <div className="space-y-4 mb-6">
        <button 
          onClick={checkUsers}
          disabled={isLoading}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Cargando...' : 'Verificar Usuarios'}
        </button>
        
        <button 
          onClick={() => checkSpecificUser('admin@systemeco.com')}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          Verificar Admin
        </button>
        
        <button 
          onClick={() => checkSpecificUser('usuario2@systemeco.com')}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          Verificar Usuario 2
        </button>
        
        <button 
          onClick={testPasswordHash}
          className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
        >
          Verificar Hash de Contraseña
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Usuarios en la Base de Datos ({users.length}):
        </h3>
        
        {users.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No hay usuarios en la base de datos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-600">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Creado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{user.id}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{user.email}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{user.display_name}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                      {new Date(user.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Instrucciones:</h4>
        <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
          <p>1. Haz clic en "Verificar Usuarios" para ver todos los usuarios en la base de datos</p>
          <p>2. Usa los botones de verificación específica para revisar usuarios individuales</p>
          <p>3. Revisa la consola del navegador para ver información detallada</p>
        </div>
      </div>
    </div>
  );
};

export default DatabaseDebug;
