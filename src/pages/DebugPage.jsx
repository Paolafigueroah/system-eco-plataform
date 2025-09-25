import React from 'react';
import DebugInfo from '../components/DebugInfo';
import LoginDebug from '../components/LoginDebug';
import DatabaseMigrator from '../components/DatabaseMigrator';
import ChatDiagnostic from '../components/ChatDiagnostic';
import ProductDetailDebug from '../components/ProductDetailDebug';

const DebugPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🔧 Panel de Diagnóstico
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Herramientas de diagnóstico y debug para desarrolladores
          </p>
        </div>
        
        <DebugInfo />
        
        <div className="mt-8">
          <DatabaseMigrator />
        </div>
        
        <div className="mt-8">
          <LoginDebug />
        </div>
        
        <div className="mt-8">
          <ChatDiagnostic />
        </div>
        
        <div className="mt-8">
          <ProductDetailDebug />
        </div>
      </div>
    </div>
  );
};

export default DebugPage;
