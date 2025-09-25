import React, { useState, useEffect } from 'react';
import { supabaseProductService } from '../services/supabaseProductService';

const ProductListDebug = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Obteniendo lista de productos...');
      const result = await supabaseProductService.getAllProducts();
      console.log('Resultado de getAllProducts:', result);
      
      if (result.success) {
        setProducts(result.data);
        console.log('Productos obtenidos:', result.data.length);
      } else {
        setError(result.error);
        console.error('Error obteniendo productos:', result.error);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error inesperado:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🔍 Diagnóstico de Lista de Productos</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Esta sección muestra todos los productos disponibles en la base de datos.
      </p>
      
      <button 
        onClick={fetchProducts} 
        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg mb-4"
        disabled={loading}
      >
        {loading ? 'Cargando...' : 'Refrescar Lista'}
      </button>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg mb-4">
          <h4 className="font-semibold text-red-800 dark:text-red-200">❌ Error</h4>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Cargando productos...</p>
        </div>
      )}

      {!loading && !error && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Productos encontrados: {products.length}
          </h3>
          
          {products.length === 0 ? (
            <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">⚠️ No hay productos</h4>
              <p className="text-yellow-700 dark:text-yellow-300">
                No se encontraron productos en la base de datos. Esto podría explicar por qué "Ver detalles" no funciona.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {products.map((product) => (
                <div key={product.id} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{product.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{product.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        ID: {product.id} | Categoría: {product.category} | Estado: {product.status}
                      </p>
                    </div>
                    <div className="ml-4">
                      <a 
                        href={`/product/${product.id}`}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded text-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver Detalles
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductListDebug;
