import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Heart, MessageCircle, MapPin, Calendar, User, Phone, Mail, Share2, Flag, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabaseProductService } from '../services/supabaseProductService';
import { supabaseFavoritesService } from '../services/supabaseFavoritesService';
import { supabaseReviewService } from '../services/supabaseReviewService';
import { useAuth } from '../hooks/useAuth';
import { getCategoryIcon, getCategoryIconColor } from '../utils/categoryIcons';
import ProductReviews from '../components/ProductReviews';
import { migrationConfig } from '../config/migrationConfig';
import { logger } from '../utils/logger';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  // Función para obtener el servicio correcto
  const getProductService = () => {
    return migrationConfig.databaseType === 'supabase' ? supabaseProductService : null;
  };

  const getFavoritesService = () => {
    return migrationConfig.databaseType === 'supabase' ? supabaseFavoritesService : null;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const productService = getProductService();
        
        if (!productService) {
          setError('Servicio de productos no disponible');
          return;
        }

        logger.log('Obteniendo producto con ID:', id);
        const result = await productService.getProductById(id);
        
        if (result.success && result.data) {
          logger.log('Producto cargado exitosamente:', result.data);
          setProduct(result.data);
          // Incrementar vistas del producto
          await productService.incrementViews(id);
        } else {
          logger.error('Error al cargar producto:', result.error);
          setError(result.error || 'Producto no encontrado');
          setProduct(null);
        }
      } catch (err) {
        logger.error('Error inesperado al cargar producto:', err);
        setError('Error al cargar el producto: ' + err.message);
        setProduct(null);
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
          const favoritesService = getFavoritesService();
          if (!favoritesService) return;

          const result = await favoritesService.isFavorite(product.id);
          if (result.success) {
            setIsFavorite(result.data);
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
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'intercambio':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'donacion':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
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
      const favoritesService = getFavoritesService();
      if (!favoritesService) {
        alert('Servicio de favoritos no disponible');
        return;
      }

      const result = await favoritesService.toggleFavorite(product.id);
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
    
    // Redirigir al chat con el vendedor
    navigate('/chat');
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

  // Manejar compartir producto
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error compartiendo:', error);
      }
    } else {
      // Fallback: copiar URL al portapapeles
      navigator.clipboard.writeText(window.location.href);
      alert('URL copiada al portapapeles');
    }
  };

  // Manejar reportar producto
  const handleReport = () => {
    alert('Funcionalidad de reporte en desarrollo');
  };

  // Navegación de imágenes
  const nextImage = () => {
    const images = getProductImages();
    if (images && images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    const images = getProductImages();
    if (images && images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? images.length - 1 : prev - 1
      );
    }
  };

  // Obtener imágenes del producto
  const getProductImages = () => {
    if (!product || !product.images) return [];
    if (Array.isArray(product.images)) return product.images;
    if (typeof product.images === 'string') {
      return product.images.split(',').filter(img => img.trim());
    }
    return [];
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Producto no encontrado</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'El producto que buscas no existe o ha sido eliminado.'}</p>
          <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg mb-6 max-w-md mx-auto">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>ID del producto:</strong> {id}<br/>
              <strong>Error:</strong> {error || 'Producto no encontrado'}
            </p>
          </div>
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

  // Verificación adicional de seguridad
  if (!product || !product.id) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error de datos</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">El producto no tiene datos válidos.</p>
          <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg mb-6 max-w-md mx-auto">
            <p className="text-red-800 dark:text-red-200 text-sm">
              <strong>ID del producto:</strong> {id}<br/>
              <strong>Producto cargado:</strong> {product ? 'Sí' : 'No'}<br/>
              <strong>Datos del producto:</strong> {JSON.stringify(product, null, 2)}
            </p>
          </div>
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

  // Obtener imágenes del producto (después de verificar que product existe)
  const productImages = getProductImages();

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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="relative h-96 bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700">
                {productImages.length > 0 ? (
                  <>
                    <img
                      src={productImages[currentImageIndex]}
                      alt={product.title || 'Imagen del producto'}
                      className="w-full h-full object-cover cursor-pointer"
                      loading="lazy"
                      decoding="async"
                      onClick={() => setShowImageModal(true)}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                    
                    {/* Navegación de imágenes */}
                    {productImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                          aria-label="Imagen anterior"
                        >
                          <ChevronLeft size={20} aria-hidden="true" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                          aria-label="Imagen siguiente"
                        >
                          <ChevronRight size={20} aria-hidden="true" />
                        </button>
                        
                        {/* Indicadores de imagen */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2" role="tablist" aria-label="Navegación de imágenes">
                          {productImages.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                              role="tab"
                              aria-selected={index === currentImageIndex}
                              aria-label={`Imagen ${index + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <div className="text-gray-400 dark:text-gray-500 text-center">
                      <div className={`w-20 h-20 ${getCategoryIconColor(product.category)} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        {React.createElement(getCategoryIcon(product.category), { 
                          size: 32, 
                          className: "text-white" 
                        })}
                      </div>
                      <p className="text-lg">Sin imagen disponible</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Miniaturas de imágenes */}
              {productImages.length > 1 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2 overflow-x-auto">
                    {productImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex 
                            ? 'border-emerald-500' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            {/* Información principal */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTransactionTypeColor(product.transaction_type)}`}>
                    {getTransactionTypeLabel(product.transaction_type)}
                  </span>
                  <div className="flex items-center space-x-2">
                  <button 
                    onClick={handleShare}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Compartir"
                    aria-label="Compartir producto"
                  >
                    <Share2 size={20} aria-hidden="true" />
                  </button>
                  <button
                    onClick={handleReport}
                    className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Reportar"
                    aria-label="Reportar producto"
                  >
                    <Flag size={20} aria-hidden="true" />
                  </button>
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {product.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  {product.description}
                </p>
                <div className="text-3xl font-bold text-emerald-600">
                  {formatPrice(product.price)}
                </div>
              </div>

              {/* Detalles del producto */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Categoría:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{product.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Estado:</span>
                  <span className={`font-medium ${getConditionColor(product.condition_product)}`}>
                    {getConditionLabel(product.condition_product)}
                  </span>
                </div>
                {product.location && (
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <MapPin size={16} className="mr-2" />
                    <span>{product.location}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Calendar size={16} className="mr-2" />
                  <span>Publicado el {formatDate(product.created_at)}</span>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-6">
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
                  className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-medium flex items-center justify-center"
                  aria-label="Contactar vendedor"
                >
                  <MessageCircle size={20} className="mr-2" aria-hidden="true" />
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
                        : 'bg-gray-200 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                    aria-label={isFavorite ? `Remover ${product.title} de favoritos` : `Agregar ${product.title} a favoritos`}
                  >
                    {isLoadingFavorite ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : (
                      <>
                        <Heart size={16} className={`mr-2 ${isFavorite ? 'fill-current' : ''}`} aria-hidden="true" />
                        {isFavorite ? 'En Favoritos' : 'Favorito'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Información del vendedor */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <User size={20} className="mr-2" />
                Información del Vendedor
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-emerald-600 font-semibold text-lg">
                      {product.user_name ? product.user_name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{product.user_name || 'Usuario'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Miembro desde {formatDate(product.user_created_at || product.created_at)}</p>
                  </div>
                </div>
                
                {/* Estadísticas del vendedor */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{product.user_products_count || 0}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Productos</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center justify-center">
                        <Star size={16} className="mr-1 text-yellow-500" />
                        {product.user_rating || '4.8'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Calificación</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={handleContactSeller}
                    className="w-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 py-2 px-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors duration-200"
                  >
                    <Phone size={16} className="mr-2" />
                    Ver teléfono
                  </button>
                  <button 
                    onClick={handleContactSeller}
                    className="w-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 py-2 px-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors duration-200"
                  >
                    <Mail size={16} className="mr-2" />
                    Enviar email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de imagen */}
        {showImageModal && productImages.length > 0 && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl max-h-[90vh] w-full">
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <X size={24} />
              </button>
              
              <img
                src={productImages[currentImageIndex]}
                alt={product.title || 'Imagen del producto'}
                className="w-full h-full object-contain rounded-lg"
                loading="eager"
                decoding="async"
              />
              
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft size={24} aria-hidden="true" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight size={24} aria-hidden="true" />
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2" role="tablist" aria-label="Navegación de imágenes">
                    {productImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                        role="tab"
                        aria-selected={index === currentImageIndex}
                        aria-label={`Imagen ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
