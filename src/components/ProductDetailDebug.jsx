import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabaseProductService } from '../services/supabaseProductService';
import { migrationConfig } from '../config/migrationConfig';

const ProductDetailDebug = () => {
  const { id } = useParams();
  const [debugData, setDebugData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDebug = async () => {
      try {
        setLoading(true);
        const data = {};

        // 1. Verificar parámetro ID
        data.productId = id;
        data.hasId = !!id;

        // 2. Verificar configuración de migración
        data.migrationConfig = migrationConfig;

        // 3. Verificar servicio de productos
        data.productService = {
          available: !!supabaseProductService,
          hasGetProductById: !!supabaseProductService?.getProductById
        };

        // 4. Intentar obtener el producto
        if (id && supabaseProductService) {
          try {
            console.log('🔍 Debug: Intentando obtener producto con ID:', id);
            const result = await supabaseProductService.getProductById(id);
            
            data.productResult = {
              success: result.success,
              data: result.data,
              error: result.error,
              message: result.message
            };

            if (result.success) {
              data.productData = {
                id: result.data?.id,
                title: result.data?.title,
                description: result.data?.description,
                price: result.data?.price,
                category: result.data?.category,
                status: result.data?.status,
                created_at: result.data?.created_at
              };
            }
          } catch (error) {
            data.productResult = {
              success: false,
              error: error.message,
              stack: error.stack
            };
          }
        }

        // 5. Verificar conexión a Supabase
        try {
          const { data: testData, error: testError } = await supabase
            .from('products')
            .select('count')
            .limit(1);
          data.supabaseConnection = {
            success: !testError,
            error: testError?.message
          };
        } catch (error) {
          data.supabaseConnection = {
            success: false,
            error: error.message
          };
        }

        setDebugData(data);
      } catch (error) {
        console.error('Error en debug:', error);
        setDebugData({ error: error.message });
      } finally {
        setLoading(false);
      }
    };

    runDebug();
  }, [id]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="loading loading-spinner loading-lg"></div>
        <p>Ejecutando diagnóstico...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold mb-4">🔍 Diagnóstico de ProductDetail</h2>
      
      {/* ID del producto */}
      <div className="card bg-base-200 p-4">
        <h3 className="text-lg font-semibold mb-2">📋 Parámetro ID</h3>
        <pre className="text-sm bg-base-100 p-2 rounded overflow-auto">
          {JSON.stringify({
            productId: debugData.productId,
            hasId: debugData.hasId
          }, null, 2)}
        </pre>
      </div>

      {/* Configuración de migración */}
      <div className="card bg-base-200 p-4">
        <h3 className="text-lg font-semibold mb-2">⚙️ Configuración de Migración</h3>
        <pre className="text-sm bg-base-100 p-2 rounded overflow-auto">
          {JSON.stringify(debugData.migrationConfig, null, 2)}
        </pre>
      </div>

      {/* Servicio de productos */}
      <div className="card bg-base-200 p-4">
        <h3 className="text-lg font-semibold mb-2">
          🔧 Servicio de Productos
          <span className={`badge ml-2 ${debugData.productService?.available ? 'badge-success' : 'badge-error'}`}>
            {debugData.productService?.available ? 'OK' : 'ERROR'}
          </span>
        </h3>
        <pre className="text-sm bg-base-100 p-2 rounded overflow-auto">
          {JSON.stringify(debugData.productService, null, 2)}
        </pre>
      </div>

      {/* Conexión a Supabase */}
      <div className="card bg-base-200 p-4">
        <h3 className="text-lg font-semibold mb-2">
          🔌 Conexión a Supabase
          <span className={`badge ml-2 ${debugData.supabaseConnection?.success ? 'badge-success' : 'badge-error'}`}>
            {debugData.supabaseConnection?.success ? 'OK' : 'ERROR'}
          </span>
        </h3>
        <pre className="text-sm bg-base-100 p-2 rounded overflow-auto">
          {JSON.stringify(debugData.supabaseConnection, null, 2)}
        </pre>
      </div>

      {/* Resultado de obtener producto */}
      <div className="card bg-base-200 p-4">
        <h3 className="text-lg font-semibold mb-2">
          📦 Resultado de Obtener Producto
          <span className={`badge ml-2 ${debugData.productResult?.success ? 'badge-success' : 'badge-error'}`}>
            {debugData.productResult?.success ? 'OK' : 'ERROR'}
          </span>
        </h3>
        <pre className="text-sm bg-base-100 p-2 rounded overflow-auto max-h-60">
          {JSON.stringify(debugData.productResult, null, 2)}
        </pre>
      </div>

      {/* Datos del producto */}
      {debugData.productData && (
        <div className="card bg-base-200 p-4">
          <h3 className="text-lg font-semibold mb-2">📋 Datos del Producto</h3>
          <pre className="text-sm bg-base-100 p-2 rounded overflow-auto">
            {JSON.stringify(debugData.productData, null, 2)}
          </pre>
        </div>
      )}

      {/* Error general */}
      {debugData.error && (
        <div className="alert alert-error">
          <span>❌ Error general: {debugData.error}</span>
        </div>
      )}
    </div>
  );
};

export default ProductDetailDebug;
