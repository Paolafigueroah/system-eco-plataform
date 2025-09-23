import React, { useState, useEffect } from 'react';
import { migrationConfig } from '../config/migrationConfig.js';
import { initSQLite, createTestUser, createSampleProducts, showDatabaseInfo } from '../initSQLite';
import { executeQuery, executeQuerySingle } from '../sqliteConfig';
import { supabase } from '../supabaseConfig.js';
import { createSampleData } from '../supabaseInitializer.js';
import AuthTest from './AuthTest';
import DatabaseDebug from './DatabaseDebug';
import AuthDiagnostic from './AuthDiagnostic';
import UserRecreation from './UserRecreation';
import QuickFix from './QuickFix';

const DebugInfo = () => {
           const [dbStatus, setDbStatus] = useState('Verificando...');
         const [userCount, setUserCount] = useState(0);
         const [productCount, setProductCount] = useState(0);
         const [testUser, setTestUser] = useState(null);

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    try {
      setDbStatus('Verificando...');
      
      if (migrationConfig.databaseType === 'supabase') {
        // Verificar Supabase
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id')
          .limit(1);
        
        if (!usersError && !productsError) {
          setDbStatus('✅ Supabase funcionando correctamente');
          
          // Crear productos de ejemplo si no existen
          await createSampleData();
          
          // Contar usuarios y productos
          const { count: userCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });
          
          const { count: productCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });
          
          setUserCount(userCount || 0);
          setProductCount(productCount || 0);
          setTestUser(null); // No hay usuarios de prueba en Supabase
        } else {
          setDbStatus('❌ Error en Supabase: ' + (usersError?.message || productsError?.message));
        }
      } else {
        // Inicializar SQLite
        const sqliteInitialized = await initSQLite();
        
        if (sqliteInitialized) {
          setDbStatus('✅ SQLite funcionando correctamente');
          
          // Crear usuario de prueba (maneja duplicados internamente)
          await createTestUser();
          
          // Crear productos de ejemplo
          await createSampleProducts();
          
          // Contar usuarios
          const users = await executeQuerySingle('SELECT COUNT(*) as count FROM users');
          if (users.data) {
            setUserCount(users.data.count);
          }
          
          // Contar productos
          const products = await executeQuerySingle('SELECT COUNT(*) as count FROM products');
          if (products.data) {
            setProductCount(products.data.count);
          }
          
          // Verificar usuario de prueba
          const testUserResult = await executeQuerySingle('SELECT email, display_name FROM users WHERE email = ?', ['admin@systemeco.com']);
          if (testUserResult.data) {
            setTestUser(testUserResult.data);
          }
          
          // Mostrar información completa
          await showDatabaseInfo();
        } else {
          setDbStatus('❌ Error inicializando base de datos');
        }
      }
    } catch (error) {
      console.error('Error verificando base de datos:', error);
      setDbStatus('❌ Error: ' + error.message);
    }
  };

  const createUser = async () => {
    try {
      const result = await createTestUser();
      if (result) {
        alert('✅ Usuario de prueba creado exitosamente!\n\n📧 Email: admin@systemeco.com\n🔑 Contraseña: admin123');
        checkDatabase();
      } else {
        alert('❌ Error creando usuario de prueba');
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  const clearSupabaseSession = async () => {
    try {
      // Limpiar la sesión de Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        alert('Error cerrando sesión: ' + error.message);
      } else {
        alert('✅ Sesión de Supabase cerrada. Recarga la página.');
        window.location.reload();
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const resetDatabase = async () => {
    if (confirm('⚠️ ¿Estás seguro de que quieres resetear la base de datos? Esto eliminará todos los datos.')) {
      try {
        // Limpiar todas las tablas
        await executeQueryRun('DELETE FROM messages');
        await executeQueryRun('DELETE FROM conversations');
        await executeQueryRun('DELETE FROM products');
        await executeQueryRun('DELETE FROM users');
        await executeQueryRun('DELETE FROM favorites');
        
        // Eliminar tablas problemáticas
        await executeQueryRun('DROP TABLE IF EXISTS conversations_new');
        await executeQueryRun('DROP TABLE IF EXISTS conversations_backup');
        
        alert('✅ Base de datos reseteada. Recarga la página para reinicializar.');
        window.location.reload();
      } catch (error) {
        alert('❌ Error reseteando base de datos: ' + error.message);
      }
    }
  };

  const addMoreProducts = async () => {
    try {
      if (migrationConfig.databaseType === 'supabase') {
        const result = await createSampleData();
        if (result) {
          alert('✅ Productos de ejemplo agregados exitosamente!');
          checkDatabase();
        } else {
          alert('❌ Error agregando productos');
        }
      } else {
        const { createSampleProducts } = await import('../initSQLite.js');
        const result = await createSampleProducts();
        if (result) {
          alert('✅ Productos de ejemplo agregados exitosamente!');
          checkDatabase();
        } else {
          alert('❌ Error agregando productos');
        }
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Debug Info Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">🔧 Debug Info</h2>
        
        <div className="space-y-4">
          <div className="text-gray-700 dark:text-gray-300">
            <strong>Estado de la BD:</strong> {dbStatus}
          </div>
          
          <div className="text-gray-700 dark:text-gray-300">
            <strong>Usuarios en BD:</strong> {userCount}
          </div>
          
          <div className="text-gray-700 dark:text-gray-300">
            <strong>Productos en BD:</strong> {productCount}
          </div>
          
          {testUser && (
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800">
              <strong className="text-green-800 dark:text-green-200">✅ Usuario de prueba encontrado:</strong>
              <br />
              <span className="text-green-700 dark:text-green-300">📧 Email: {testUser.email}</span>
              <br />
              <span className="text-green-700 dark:text-green-300">👤 Nombre: {testUser.display_name}</span>
            </div>
          )}
          
          <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
            <strong className="text-blue-800 dark:text-blue-200">🔑 Credenciales de prueba:</strong>
            <br />
            <span className="text-blue-700 dark:text-blue-300">📧 Email: admin@systemeco.com</span>
            <br />
            <span className="text-blue-700 dark:text-blue-300">🔑 Contraseña: admin123</span>
          </div>
          
          <button 
            onClick={createUser}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Crear Usuario de Prueba
          </button>
          
          <button 
            onClick={checkDatabase}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Verificar BD
          </button>
          
          <button 
            onClick={addMoreProducts}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            📦 Agregar Productos
          </button>
          
          <button 
            onClick={clearSupabaseSession}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 mb-2"
          >
            🔓 Cerrar Sesión Supabase
          </button>
          <button 
            onClick={resetDatabase}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            🗑️ Resetear BD
          </button>
        </div>
      </div>

      {/* Auth Test Component */}
      <AuthTest />

      {/* Database Debug Component */}
      <DatabaseDebug />

      {/* Auth Diagnostic Component */}
      <AuthDiagnostic />

      {/* User Recreation Component */}
      <UserRecreation />

      {/* Quick Fix Component */}
      <QuickFix />
    </div>
  );
};

export default DebugInfo;
