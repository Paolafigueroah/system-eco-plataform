import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabaseFavoritesService } from '../services/supabaseFavoritesService';
import ProductCard from '../components/ProductCard';
import { Heart, BarChart3, Tag, DollarSign, Package } from 'lucide-react';

const Favorites = () => {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      loadFavorites();
      loadStats();
    }
  }, [isAuthenticated, user?.id]);

  // Recargar favoritos cuando se elimina uno
  useEffect(() => {
    if (isAuthenticated && user) {
      loadFavorites();
      loadStats();
    }
  }, [favorites.length]);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const result = await supabaseFavoritesService.getUserFavorites(user.id);
      if (result.success) {
        setFavorites(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error cargando favoritos:', error);
      setError('Error cargando favoritos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await supabaseFavoritesService.getFavoritesStats(user.id);
      if (result.success) {
        // Normalizar estructura para el UI actual
        const raw = result.data;
        const normalized = {
          total_favorites: raw.totalFavorites ?? raw.total_favorites ?? 0,
          categories: Array.isArray(raw.categories)
            ? raw.categories.map((category) => (
                typeof category === 'string'
                  ? { category, count: favorites.filter(f => f.category === category).length }
                  : category
              ))
            : [],
          transaction_types: raw.transaction_types || []
        };
        setStats(normalized);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleProductRemoved = async (productId) => {
    // Remover producto de la lista cuando se elimina de favoritos
    setFavorites(prev => prev.filter(fav => fav.id !== productId));
    // Recargar favoritos y estadísticas para asegurar sincronización
    await loadFavorites();
    await loadStats();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 dark:text-gray-400">Debes iniciar sesión para ver tus favoritos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center">
            <Heart className="w-8 h-8 mr-3 text-red-500" />
            Mis Favoritos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Productos que has guardado como favoritos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Estadísticas */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Estadísticas
              </h2>

              {stats ? (
                <div className="space-y-4">
                  {/* Total de favoritos */}
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-600 font-medium">Total Favoritos</p>
                        <p className="text-2xl font-bold text-red-800">{stats.total_favorites}</p>
                      </div>
                      <Heart className="w-8 h-8 text-red-600" />
                    </div>
                  </div>

                  {/* Categorías */}
                  {stats.categories.length > 0 && (
                    <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-3 flex items-center">
                        <Tag className="w-4 h-4 mr-1" />
                        Por Categoría
                      </h3>
                      <div className="space-y-2">
                        {stats.categories.map((category, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-purple-700 dark:text-purple-300">{category.category}</span>
                            <span className="font-medium text-purple-800 dark:text-purple-200">{category.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tipos de transacción */}
                  {stats.transaction_types.length > 0 && (
                    <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-3 flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Por Tipo
                      </h3>
                      <div className="space-y-2">
                        {stats.transaction_types.map((type, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-orange-700 dark:text-orange-300 capitalize">{type.transaction_type}</span>
                            <span className="font-medium text-orange-800 dark:text-orange-200">{type.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Cargando estadísticas...</p>
                </div>
              )}
            </div>
          </div>

          {/* Lista de favoritos */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Productos Favoritos
                </h2>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {isLoading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                      Cargando...
                    </span>
                  ) : (
                    `${favorites.length} producto${favorites.length !== 1 ? 's' : ''}`
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {favorites.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product}
                      onProductRemoved={handleProductRemoved}
                    />
                  ))}
                </div>
              ) : !isLoading ? (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tienes favoritos aún</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Explora productos y agrega los que te interesen a tus favoritos.
                  </p>
                  <a
                    href="/"
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center"
                  >
                    <Package className="w-5 h-5 mr-2" />
                    Explorar Productos
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Favorites;
