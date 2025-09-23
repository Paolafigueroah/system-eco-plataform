import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Heart, MessageCircle, MapPin, Calendar, User, Phone, Mail } from 'lucide-react';
import { sqliteProductService } from '../services/sqliteProductService';
import { sqliteFavoritesService } from '../services/sqliteFavoritesService';
import { useAuth } from '../hooks/useAuth';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const result = await sqliteProductService.getProductById(id);
        
        if (result.success) {
          setProduct(result.product);
          // Incrementar vistas del producto
          await sqliteProductService.incrementViews(id);
        } else {
          setError(result.error || 'Producto no encontrado');
        }
      } catch (err) {
        setError('Error al cargar el producto');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Verificar si el producto está en favoritos
  useEffect(() => {
    const checkFavorite = async () => {
      if (user && product) {
        try {
          const result = await sqliteFavoritesService.isFavorite(user.id, product.id);
          if (result.success) {
            setIsFavorite(result.isFavorite);
          }
        } catch (error) {
          console.error('Error verificando favorito:', error);
        }
      }
    };

    checkFavorite();
  }, [user, product]);

  const formatPrice = (price) => {
    if (price === 0) return 'Gratis';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'intercambio':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'donacion':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConditionLabel = (condition) => {
    switch (condition) {
      case 'excelente':
        return 'Excelente';
      case 'muy_bueno':
        return 'Muy bueno';
      case 'bueno':
        return 'Bueno';
      case 'aceptable':
        return 'Aceptable';
      case 'necesita_reparacion':
        return 'Necesita reparación';
      default:
        return condition;
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excelente':
        return 'text-green-600';
      case 'muy_bueno':
        return 'text-blue-600';
      case 'bueno':
        return 'text-yellow-600';
      case 'aceptable':
        return 'text-orange-600';
      case 'necesita_reparacion':
        return 'text-red-600';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Manejar toggle de favorito
  const handleToggleFavorite = async () => {
    if (!user) {
      alert('Debes iniciar sesión para agregar productos a favoritos');
      return;
    }

    setIsLoadingFavorite(true);
    try {
      const result = await sqliteFavoritesService.toggleFavorite(user.id, product.id);
      if (result.success) {
        setIsFavorite(!isFavorite);
      } else {
        console.error('Error:', result.error);
        alert(result.error);
      }
    } catch (error) {
      console.error('Error toggleando favorito:', error);
      alert('Error al actualizar favoritos');
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  // Manejar contacto con vendedor
  const handleContactSeller = () => {
    if (!user) {
      alert('Debes iniciar sesión para contactar al vendedor');
      return;
    }
    
    // Aquí podrías implementar un modal de contacto o redirigir al chat
    alert('Funcionalidad de contacto en desarrollo');
  };

  // Manejar chat
  const handleChat = () => {
    if (!user) {
      alert('Debes iniciar sesión para chatear');
      return;
    }
    
    // Redirigir al chat con el vendedor
    navigate('/chat');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Producto no encontrado</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'El producto que buscas no existe o ha sido eliminado.'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors duration-200"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 mb-4 transition-colors duration-200"
          >
            <ArrowLeft size={20} className="mr-2" />
            Volver
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Imagen del producto */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-96 bg-gray-200">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={Array.isArray(product.images) ? product.images[0] : product.images.split(',')[0]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="absolute inset-0 bg-gray-200 flex items-center justify-center" 
                  style={{ display: (product.images && product.images.length > 0) ? 'none' : 'flex' }}
                >
                  <div className="text-gray-400 text-center">
                    <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-gray-600 dark:text-gray-400 font-semibold text-2xl">
                        {product.category ? product.category.charAt(0).toUpperCase() : 'P'}
                      </span>
                    </div>
                    <p className="text-lg">Sin imagen disponible</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            {/* Información principal */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTransactionTypeColor(product.transaction_type)}`}>
                    {getTransactionTypeLabel(product.transaction_type)}
                  </span>
                  <span className="text-3xl font-bold text-emerald-600">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {product.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Detalles del producto */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Categoría:</span>
                  <span className="font-medium text-gray-700">{product.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Estado:</span>
                  <span className={`font-medium ${getConditionColor(product.condition_product)}`}>
                    {getConditionLabel(product.condition_product)}
                  </span>
                </div>
                {product.location && (
                  <div className="flex items-center text-gray-500">
                    <MapPin size={16} className="mr-2" />
                    <span>{product.location}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-500">
                  <Calendar size={16} className="mr-2" />
                  <span>Publicado el {formatDate(product.created_at)}</span>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                <div className="flex items-center">
                  <Eye size={16} className="mr-1" />
                  <span>{product.views || 0} vistas</span>
                </div>
                <div className="flex items-center">
                  <Heart size={16} className="mr-1" />
                  <span>{product.favorites || 0} favoritos</span>
                </div>
              </div>

              {/* Acciones */}
              <div className="space-y-3">
                <button 
                  onClick={handleContactSeller}
                  className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-medium"
                >
                  Contactar Vendedor
                </button>
                <div className="flex space-x-2">
                  <button 
                    onClick={handleChat}
                    className="flex-1 bg-sky-600 text-white py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    <MessageCircle size={16} className="mr-2" />
                    Chat
                  </button>
                  <button 
                    onClick={handleToggleFavorite}
                    disabled={isLoadingFavorite}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center disabled:opacity-50 ${
                      isFavorite 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-gray-200 text-gray-600 dark:text-gray-400 hover:bg-gray-300'
                    }`}
                  >
                    {isLoadingFavorite ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : (
                      <>
                        <Heart size={16} className={`mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                        {isFavorite ? 'En Favoritos' : 'Favorito'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Información del vendedor */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User size={20} className="mr-2" />
                Información del Vendedor
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-emerald-600 font-semibold text-lg">
                      {product.user_name ? product.user_name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.user_name || 'Usuario'}</p>
                    <p className="text-sm text-gray-500">Miembro desde {formatDate(product.user_created_at || product.created_at)}</p>
                  </div>
                </div>
                
                {/* Estadísticas del vendedor */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{product.user_products_count || 0}</p>
                      <p className="text-xs text-gray-500">Productos</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{product.user_rating || 'N/A'}</p>
                      <p className="text-xs text-gray-500">Calificación</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={handleContactSeller}
                    className="w-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 py-2 px-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200"
                  >
                    <Phone size={16} className="mr-2" />
                    Ver teléfono
                  </button>
                  <button 
                    onClick={handleContactSeller}
                    className="w-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 py-2 px-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200"
                  >
                    <Mail size={16} className="mr-2" />
                    Enviar email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
