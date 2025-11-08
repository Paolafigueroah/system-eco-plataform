import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabaseProductService } from '../services/supabaseProductService';
import { useRealtime } from '../hooks/useRealtime';
import { supabaseRealtimeService } from '../services/supabaseRealtimeService';
import { migrationConfig } from '../config/migrationConfig';
import { logger } from '../utils/logger';
import { 
  Package, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  Calendar, 
  Plus,
  Edit,
  Trash2,
  MessageCircle,
  Award,
  Leaf,
  X
} from 'lucide-react';
import AddProductForm from '../components/AddProductForm';
import EditarProducto from '../components/EditarProducto';
import ProductCard from '../components/ProductCard';
import GamificationPanel from '../components/GamificationPanel';

import ConfirmDelete from '../components/ConfirmDelete';
import UserProfile from '../components/UserProfile';

const Dashboard = () => {
  const { user } = useAuth();
  const { subscribeToProducts, subscribeToUserPoints } = useRealtime();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [userProducts, setUserProducts] = useState([]);

  // Función para obtener el servicio correcto
  const getProductService = () => {
    return migrationConfig.databaseType === 'supabase' ? supabaseProductService : null;
  };

  // Función para agregar más productos (deshabilitada para Supabase)
  const handleAddMoreProducts = async () => {
    alert('Esta función no está disponible en modo Supabase');
  };
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalViews: 0,
    totalFavorites: 0,
    activeProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (user && user.id) {
      // Suscribirse a cambios en productos en tiempo real (una sola vez por usuario)
      const productsSubscription = subscribeToProducts((payload) => {
        logger.log('Producto actualizado en tiempo real', payload);
        // Recargar productos cuando haya cambios
        loadUserData();
      });

      // Suscribirse a cambios en puntos en tiempo real
      const pointsSubscription = subscribeToUserPoints(user.id, (payload) => {
        logger.log('Puntos actualizados en tiempo real', payload);
        // Aquí podrías actualizar el estado de puntos si fuera necesario
      });

      // Cleanup al desmontar
      return () => {
        if (productsSubscription) {
          supabaseRealtimeService.unsubscribe(productsSubscription);
        }
        if (pointsSubscription) {
          supabaseRealtimeService.unsubscribe(pointsSubscription);
        }
      };
    }
  }, [user?.id]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }
      
      // Cargar productos del usuario
      const productService = getProductService();
      const productsResult = migrationConfig.databaseType === 'supabase' 
        ? await productService.getProductsByUserId(user.id)
        : await productService.getProductsByUser(user.id);
      
      if (productsResult.success && productsResult.data) {
        setUserProducts(productsResult.data || []);
        
        // Calcular estadísticas
        const totalViews = (productsResult.data || []).reduce((sum, product) => sum + (product.views || 0), 0);
        const totalFavorites = (productsResult.data || []).reduce((sum, product) => sum + (product.favorites || 0), 0);
        const activeProducts = (productsResult.data || []).filter(product => product.status === 'active').length;
        
        setStats({
          totalProducts: productsResult.data.length,
          totalViews,
          totalFavorites,
          activeProducts
        });
      }
    } catch (error) {
      logger.error('Error cargando datos del usuario', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductAdded = (newProduct) => {
    setUserProducts(prev => [newProduct, ...prev]);
    setStats(prev => ({
      ...prev,
      totalProducts: prev.totalProducts + 1,
      activeProducts: prev.activeProducts + 1
    }));
  };

  const handleProductDeleted = (productId) => {
    setUserProducts(prev => prev.filter(product => product.id !== productId));
    setStats(prev => ({
      ...prev,
      totalProducts: prev.totalProducts - 1,
      activeProducts: prev.activeProducts - 1
    }));
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowEditProduct(true);
  };

  const goToProfile = () => {
    window.location.href = '/profile';
  };

  const goToFavorites = () => {
    window.location.href = '/favorites';
  };

  const handleProductUpdated = (updatedProduct) => {
    setUserProducts(prev => 
      prev.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
    setShowEditProduct(false);
    setEditingProduct(null);
  };

  const handleUpdateStatus = async (productId, status) => {
    try {
      const productService = getProductService();
      if (!productService || !productService.updateProductStatus) {
        logger.error('Servicio no disponible o método no implementado');
        return;
      }

      const result = await productService.updateProductStatus(productId, status);
      
      if (result.success) {
        // Actualizar el producto en la lista
        setUserProducts(prev =>
          prev.map(product =>
            product.id === productId ? { ...product, status: status } : product
          )
        );
        logger.log('Estado del producto actualizado', { productId, status });
      } else {
        logger.error('Error actualizando estado del producto', result.error);
        alert('Error al actualizar el estado: ' + result.error);
      }
    } catch (error) {
      logger.error('Error actualizando estado del producto', error);
      alert('Error al actualizar el estado del producto');
    }
  };

  const handleDeleteProduct = (product) => {
    setDeletingProduct(product);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct || !user) return;

    try {
      const productService = getProductService();
      const result = await productService.deleteProduct(deletingProduct.id);
      
      if (result.success) {
        // Remover el producto de la lista
        setUserProducts(prev => prev.filter(product => product.id !== deletingProduct.id));
        
        // Actualizar estadísticas
        setStats(prev => ({
          ...prev,
          totalProducts: prev.totalProducts - 1,
          activeProducts: prev.activeProducts - 1
        }));
        
        // Cerrar modal
        setShowDeleteConfirm(false);
        setDeletingProduct(null);
      } else {
        logger.error('Error eliminando producto', result.error);
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    } catch (error) {
      logger.error('Error eliminando producto', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'venta':
        return 'Venta';
      case 'intercambio':
        return 'Intercambio';
      case 'donacion':
        return 'Donación';
      default:
        return type;
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'venta':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'intercambio':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'donacion':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Debug info - temporal
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error: Usuario no encontrado</h1>
          <p className="text-gray-600 dark:text-gray-400">No se pudo cargar la información del usuario.</p>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <div className="dashboard-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Bienvenido de vuelta, {user.displayName}</p>
            </div>
          <div className="dashboard-buttons flex flex-col sm:flex-row gap-3 sm:space-x-3">

            <button
              onClick={goToProfile}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 inline-flex items-center space-x-2"
            >
              <Users size={20} />
              <span>Mi Perfil</span>
            </button>
            <button
              onClick={() => setShowAddProduct(true)}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Publicar Producto</span>
            </button>
            {migrationConfig.databaseType === 'sqlite' && (
              <button
                onClick={handleAddMoreProducts}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 inline-flex items-center space-x-2"
              >
                <Package size={20} />
                <span>+ Productos</span>
              </button>
            )}
          </div>
        </div>
      </div>

          {/* Stats Cards */}
          <div className="stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Package className="text-emerald-600" size={20} />
              </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Productos Activos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeProducts}</p>
            </div>
          </div>
            </div>
            
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="text-blue-600" size={24} />
              </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Vistas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalViews}</p>
            </div>
              </div>
            </div>
            
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Heart className="text-purple-600" size={24} />
              </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Favoritos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalFavorites}</p>
            </div>
          </div>
              </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="text-green-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Puntos Ganados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">150</p>
            </div>
          </div>
        </div>
      </div>

      {/* Impacto Ambiental */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Leaf className="text-emerald-600 dark:text-emerald-400 mr-2" size={24} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Tu Impacto Ambiental</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">12.5 kg</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">CO₂ Ahorrado</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">8</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Productos Reutilizados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">3</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Donaciones Realizadas</div>
          </div>
        </div>
      </div>

      {/* Gamificación */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <GamificationPanel />
      </div>

      {/* User Products */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mis Productos</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {userProducts.length} producto{userProducts.length !== 1 ? 's' : ''}
          </div>
        </div>

        {userProducts.length > 0 ? (
          <div className="products-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userProducts.map((product) => (
              <div key={product.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{product.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(product.transaction_type)}`}>
                    {getTransactionTypeLabel(product.transaction_type)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{product.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Categoría:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{product.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Precio:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {product.price === 0 ? 'Gratis' : `$${product.price}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Vistas:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{product.views || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Publicado:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatDate(product.created_at)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Estado:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {product.status === 'sold' ? 'Vendido' : 
                       product.status === 'inactive' ? 'No Disponible' : 
                       'Disponible'}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-3">
                  {product.status === 'sold' && (
                    <span className="inline-block bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded-full text-xs font-medium">
                      Vendido
                    </span>
                  )}
                  {product.status === 'inactive' && (
                    <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium">
                      No Disponible
                    </span>
                  )}
                  {(!product.status || product.status === 'active') && (
                    <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                      Disponible
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.status !== 'sold' && (
                    <button 
                      onClick={() => handleUpdateStatus(product.id, 'sold')}
                      className="flex-1 bg-orange-600 text-white py-2 px-3 rounded-lg hover:bg-orange-700 transition-colors text-sm"
                      title="Marcar como vendido"
                    >
                      Vendido
                    </button>
                  )}
                  {product.status !== 'inactive' && (
                    <button 
                      onClick={() => handleUpdateStatus(product.id, 'inactive')}
                      className="flex-1 bg-gray-600 text-white py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                      title="Marcar como no disponible"
                    >
                      No Disponible
                    </button>
                  )}
                  {(product.status === 'sold' || product.status === 'inactive') && (
                    <button 
                      onClick={() => handleUpdateStatus(product.id, 'active')}
                      className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      title="Marcar como disponible"
                    >
                      Disponible
                    </button>
                  )}
                  <button 
                    onClick={() => handleEditProduct(product)}
                    className="bg-emerald-600 text-white py-2 px-3 rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                  >
                    <Edit size={14} className="inline mr-1" />
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product)}
                    className="bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    <Trash2 size={14} className="inline mr-1" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes productos publicados
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Comienza a contribuir a la economía circular publicando tu primer producto.
            </p>
              <button
              onClick={() => setShowAddProduct(true)}
              className="btn-primary inline-flex items-center space-x-2"
              >
              <Plus size={16} />
              <span>Publicar Producto</span>
              </button>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Actividad Reciente</h2>
        <div className="space-y-4">
          {userProducts.slice(0, 5).map((product) => (
            <div key={product.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <Package className="text-emerald-600 dark:text-emerald-400" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{product.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getTransactionTypeLabel(product.transaction_type)} • {formatDate(product.created_at)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{product.views || 0} vistas</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{product.favorites || 0} favoritos</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <AddProductForm
          onClose={() => setShowAddProduct(false)}
          onProductAdded={handleProductAdded}
        />
      )}

      {/* Edit Product Modal */}
      {showEditProduct && editingProduct && (
        <EditarProducto
          product={editingProduct}
          onClose={() => {
            setShowEditProduct(false);
            setEditingProduct(null);
          }}
          onProductUpdated={handleProductUpdated}
        />
      )}



      {/* User Profile Modal */}
      {showUserProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <UserProfile 
              userId={user?.id} 
              onClose={() => setShowUserProfile(false)} 
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDelete
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingProduct(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Producto"
        message="¿Estás seguro de que quieres eliminar este producto?"
        itemName={deletingProduct?.title}
      />
    </div>
  );
};

export default Dashboard;
