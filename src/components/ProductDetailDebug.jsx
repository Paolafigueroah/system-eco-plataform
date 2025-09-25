import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabaseProductService } from '../services/supabaseProductService';
import { migrationConfig } from '../config/migrationConfig';

const ProductDetailDebug = () => {
  const { id } = useParams();
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      const info = {
        productId: id,
        migrationConfig: migrationConfig,
        timestamp: new Date().toISOString()
      };

      // Verificar si el servicio está disponible
      if (migrationConfig.databaseType === 'supabase') {
        try {
          console.log('🔍 Diagnosticando ProductDetail...');
          console.log('ID del producto:', id);
          console.log('Configuración de migración:', migrationConfig);
          
          const result = await supabaseProductService.getProductById(id);
          console.log('Resultado del servicio:', result);
          
          info.serviceResult = result;
          
          if (result.success) {
            info.productData = result.data;
            info.status = 'success';
          } else {
            info.error = result.error;
            info.status = 'error';
          }
        } catch (error) {
          console.error('Error en el servicio:', error);
          info.serviceError = error.message;
          info.status = 'service_error';
        }
      } else {
        info.status = 'no_service';
        info.error = 'Servicio no configurado para este tipo de base de datos';
      }

      setDebugInfo(info);
    } catch (error) {
      console.error('Error en diagnóstico:', error);
      setDebugInfo({
        error: error.message,
        status: 'diagnostic_error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      runDiagnostic();
    }
  }, [id]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🔍 Diagnóstico de ProductDetail</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Esta sección muestra información de diagnóstico para la carga de productos.
      </p>
      
      <button 
        onClick={runDiagnostic} 
        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg mb-4"
        disabled={loading}
      >
        {loading ? 'Ejecutando...' : 'Ejecutar Diagnóstico'}
      </button>

      {debugInfo && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Información del Diagnóstico:</h3>
            <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-sm overflow-x-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
          
          {debugInfo.status === 'success' && (
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-200">✅ Producto cargado exitosamente</h4>
              <p className="text-green-700 dark:text-green-300">
                El producto se cargó correctamente desde la base de datos.
              </p>
            </div>
          )}
          
          {debugInfo.status === 'error' && (
            <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
              <h4 className="font-semibold text-red-800 dark:text-red-200">❌ Error al cargar producto</h4>
              <p className="text-red-700 dark:text-red-300">
                Error: {debugInfo.error}
              </p>
            </div>
          )}
          
          {debugInfo.status === 'service_error' && (
            <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">⚠️ Error en el servicio</h4>
              <p className="text-yellow-700 dark:text-yellow-300">
                Error del servicio: {debugInfo.serviceError}
              </p>
            </div>
          )}
          
          {debugInfo.status === 'no_service' && (
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">ℹ️ Servicio no disponible</h4>
              <p className="text-blue-700 dark:text-blue-300">
                {debugInfo.error}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductDetailDebug;