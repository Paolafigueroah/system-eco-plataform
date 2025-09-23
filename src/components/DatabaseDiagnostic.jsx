import React, { useState, useEffect } from 'react';
import { executeQuery, executeQuerySingle } from '../sqliteConfig';

const DatabaseDiagnostic = () => {
  const [diagnostic, setDiagnostic] = useState({
    users: [],
    products: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    try {
      setDiagnostic(prev => ({ ...prev, loading: true, error: null }));

      // Verificar usuarios
      const usersResult = await executeQuery('SELECT id, email, display_name FROM users');
      const users = usersResult.data || [];

      // Verificar productos
      const productsResult = await executeQuery('SELECT id, title, price FROM products');
      const products = productsResult.data || [];

      setDiagnostic({
        users,
        products,
        loading: false,
        error: null
      });
    } catch (error) {
      setDiagnostic(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  const createTestUser = async () => {
    try {
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      const { executeQueryRun } = await import('../sqliteConfig');
      const result = await executeQueryRun(
        'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)',
        ['admin@systemeco.com', passwordHash, 'Administrador']
      );

      if (result.error) {
        alert('Error: ' + result.error);
      } else {
        alert('✅ Usuario creado exitosamente!');
        checkDatabase();
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  if (diagnostic.loading) {
    return <div className="p-4">Verificando base de datos...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl mx-auto mt-8 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">🔧 Diagnóstico de Base de Datos</h2>
      
      {diagnostic.error && (
        <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded mb-4 border border-red-200 dark:border-red-800">
          <strong className="text-red-800 dark:text-red-200">Error:</strong> <span className="text-red-700 dark:text-red-300">{diagnostic.error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">👥 Usuarios ({diagnostic.users.length})</h3>
          {diagnostic.users.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No hay usuarios en la base de datos</p>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
              {diagnostic.users.map((user, index) => (
                <div key={index} className="mb-2">
                  <strong>ID:</strong> {user.id} | 
                  <strong> Email:</strong> {user.email} | 
                  <strong> Nombre:</strong> {user.display_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold">📦 Productos ({diagnostic.products.length})</h3>
          {diagnostic.products.length === 0 ? (
            <p className="text-gray-600">No hay productos en la base de datos</p>
          ) : (
            <div className="bg-gray-50 p-3 rounded">
              {diagnostic.products.map((product, index) => (
                <div key={index} className="mb-2">
                  <strong>ID:</strong> {product.id} | 
                  <strong> Título:</strong> {product.title} | 
                  <strong> Precio:</strong> ${product.price}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={createTestUser}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Crear Usuario de Prueba
          </button>
          <button
            onClick={checkDatabase}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Verificar BD
          </button>
        </div>

        <div className="bg-blue-100 p-3 rounded">
          <strong>🔑 Credenciales de prueba:</strong>
          <br />
          📧 Email: admin@systemeco.com
          <br />
          🔑 Contraseña: admin123
        </div>
      </div>
    </div>
  );
};

export default DatabaseDiagnostic;
