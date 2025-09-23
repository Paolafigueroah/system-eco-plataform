import React, { useState } from 'react';
import { executeQueryRun, executeQuerySingle } from '../sqliteConfig';
import bcrypt from 'bcryptjs';

const QuickFix = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);

  const addResult = (message, success = true) => {
    setResults(prev => [...prev, { 
      message, 
      success, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const quickFix = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      addResult('🚀 Iniciando solución rápida...');
      
      // Paso 1: Limpiar completamente la base de datos
      addResult('🗑️ Limpiando base de datos...');
      await executeQueryRun('DELETE FROM users');
      await executeQueryRun('DELETE FROM products');
      await executeQueryRun('DELETE FROM conversations');
      await executeQueryRun('DELETE FROM chat_messages');
      await executeQueryRun('DELETE FROM favorites');
      addResult('✅ Base de datos limpiada');
      
      // Paso 2: Crear usuarios de prueba
      addResult('👤 Creando usuarios de prueba...');
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      // Usuario admin
      const adminResult = await executeQueryRun(
        'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)',
        ['admin@systemeco.com', passwordHash, 'Administrador']
      );
      
      if (adminResult.error) {
        addResult(`❌ Error creando admin: ${adminResult.error}`, false);
      } else {
        addResult('✅ Usuario admin creado');
      }
      
      // Usuario 2
      const user2Result = await executeQueryRun(
        'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)',
        ['usuario2@systemeco.com', passwordHash, 'Usuario Prueba 2']
      );
      
      if (user2Result.error) {
        addResult(`❌ Error creando usuario 2: ${user2Result.error}`, false);
      } else {
        addResult('✅ Usuario 2 creado');
      }
      
      // Paso 3: Crear productos de ejemplo
      addResult('📦 Creando productos de ejemplo...');
      const sampleProducts = [
        {
          title: 'iPhone 12 en excelente estado',
          description: 'iPhone 12 de 128GB en color azul, sin rayones, con cargador original.',
          category: 'Electrónica',
          condition_product: 'excelente',
          transaction_type: 'venta',
          price: 450.00,
          location: 'Ciudad de México',
          user_email: 'admin@systemeco.com',
          user_name: 'Administrador'
        },
        {
          title: 'Libros de programación',
          description: 'Colección de libros sobre React, JavaScript y desarrollo web.',
          category: 'Libros y educación',
          condition_product: 'muy_bueno',
          transaction_type: 'intercambio',
          price: 0,
          location: 'Guadalajara',
          user_email: 'admin@systemeco.com',
          user_name: 'Administrador'
        }
      ];
      
      for (const product of sampleProducts) {
        await executeQueryRun(
          `INSERT INTO products (
            title, description, category, condition_product, transaction_type,
            price, location, user_email, user_name, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            product.title,
            product.description,
            product.category,
            product.condition_product,
            product.transaction_type,
            product.price,
            product.location,
            product.user_email,
            product.user_name,
            new Date().toISOString()
          ]
        );
      }
      
      addResult('✅ Productos de ejemplo creados');
      
      // Paso 4: Verificar todo
      addResult('🔍 Verificando resultados...');
      const userCount = await executeQuerySingle('SELECT COUNT(*) as count FROM users');
      const productCount = await executeQuerySingle('SELECT COUNT(*) as count FROM products');
      
      addResult(`✅ Verificación completa: ${userCount.data.count} usuarios, ${productCount.data.count} productos`);
      
      // Paso 5: Probar login
      addResult('🔐 Probando login...');
      const adminCheck = await executeQuerySingle('SELECT * FROM users WHERE email = ?', ['admin@systemeco.com']);
      if (adminCheck.data) {
        const isPasswordValid = await bcrypt.compare('admin123', adminCheck.data.password_hash);
        if (isPasswordValid) {
          addResult('✅ Login funcionando correctamente');
        } else {
          addResult('❌ Problema con la contraseña', false);
        }
      } else {
        addResult('❌ Usuario admin no encontrado', false);
      }
      
      addResult('🎉 ¡Solución rápida completada!');
      
    } catch (error) {
      addResult(`❌ Error: ${error.message}`, false);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl mx-auto mt-8 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">⚡ Solución Rápida</h2>
      
      <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
        <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">⚠️ Advertencia:</h4>
        <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
          <p>• Esta herramienta elimina TODOS los datos de la base de datos</p>
          <p>• Crea usuarios y productos de prueba desde cero</p>
          <p>• Úsala solo si hay problemas serios con la base de datos</p>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <button 
          onClick={quickFix}
          disabled={isLoading}
          className="w-full bg-red-600 text-white py-3 px-4 rounded hover:bg-red-700 disabled:opacity-50 text-lg font-semibold"
        >
          {isLoading ? 'Ejecutando solución...' : '🚀 Ejecutar Solución Rápida'}
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
          <p className="text-gray-500 dark:text-gray-400">No hay resultados aún. Ejecuta la solución rápida para ver los resultados.</p>
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
    </div>
  );
};

export default QuickFix;
