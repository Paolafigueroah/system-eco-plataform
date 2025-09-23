import React, { useState } from 'react';
import { executeQueryRun, executeQuerySingle } from '../sqliteConfig';
import bcrypt from 'bcryptjs';

const EmergencyFix = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const emergencyFix = async () => {
    setIsLoading(true);
    setMessage('Iniciando solución de emergencia...');
    
    try {
      // Paso 1: Verificar estado actual
      setMessage('Verificando estado actual...');
      const userCount = await executeQuerySingle('SELECT COUNT(*) as count FROM users');
      console.log('Usuarios actuales:', userCount.data?.count);
      
      // Paso 2: Limpiar todo
      setMessage('Limpiando base de datos...');
      await executeQueryRun('DELETE FROM users');
      await executeQueryRun('DELETE FROM products');
      await executeQueryRun('DELETE FROM conversations');
      await executeQueryRun('DELETE FROM chat_messages');
      await executeQueryRun('DELETE FROM favorites');
      
      // Paso 3: Crear usuarios de prueba
      setMessage('Creando usuarios de prueba...');
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      // Usuario admin
      const adminResult = await executeQueryRun(
        'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)',
        ['admin@systemeco.com', passwordHash, 'Administrador']
      );
      
      if (adminResult.error) {
        throw new Error(`Error creando admin: ${adminResult.error}`);
      }
      
      // Usuario 2
      const user2Result = await executeQueryRun(
        'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)',
        ['usuario2@systemeco.com', passwordHash, 'Usuario Prueba 2']
      );
      
      if (user2Result.error) {
        throw new Error(`Error creando usuario 2: ${user2Result.error}`);
      }
      
      // Paso 4: Verificar
      setMessage('Verificando usuarios creados...');
      const adminCheck = await executeQuerySingle('SELECT * FROM users WHERE email = ?', ['admin@systemeco.com']);
      const user2Check = await executeQuerySingle('SELECT * FROM users WHERE email = ?', ['usuario2@systemeco.com']);
      
      if (!adminCheck.data || !user2Check.data) {
        throw new Error('Error en la verificación de usuarios');
      }
      
      // Paso 5: Probar contraseña
      setMessage('Probando contraseña...');
      const isPasswordValid = await bcrypt.compare('admin123', adminCheck.data.password_hash);
      
      if (!isPasswordValid) {
        throw new Error('Error en la verificación de contraseña');
      }
      
      setMessage('✅ ¡Solución de emergencia completada! Los usuarios están listos para usar.');
      
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 glass-effect p-6 rounded-2xl shadow-2xl max-w-sm z-50 animate-fade-in-up">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mr-3">
          <span className="text-red-600 dark:text-red-400 text-lg">🚨</span>
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Solución de Emergencia</h3>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
        Si tienes problemas de login, usa esta solución rápida.
      </p>
      
      <button 
        onClick={emergencyFix}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 text-sm font-semibold"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Procesando...
          </span>
        ) : (
          '🔧 Solucionar Login'
        )}
      </button>
      
      {message && (
        <div className="mt-4 p-3 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl text-xs">
          <div className="flex items-start">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
            <span className="text-gray-700 dark:text-gray-300">{message}</span>
          </div>
        </div>
      )}
      
      <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
        <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 mb-1">Credenciales:</p>
        <p className="text-xs text-emerald-700 dark:text-emerald-300 font-mono">admin@systemeco.com</p>
        <p className="text-xs text-emerald-700 dark:text-emerald-300 font-mono">admin123</p>
      </div>
    </div>
  );
};

export default EmergencyFix;
