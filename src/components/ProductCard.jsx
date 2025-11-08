import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Eye, Heart, MessageCircle, MapPin, Calendar, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabaseFavoritesService } from '../services/supabaseFavoritesService';
import { getCategoryIcon, getCategoryIconColor } from '../utils/categoryIcons';
import { logger } from '../utils/logger';

/**
 * Componente de tarjeta de producto
 * Muestra la información de un producto en formato de tarjeta
 * @param {Object} product - Datos del producto
 * @param {Function} onEdit - Callback cuando se edita el producto
 * @param {Function} onDelete - Callback cuando se elimina el producto
 * @param {Function} onProductRemoved - Callback cuando se remueve de favoritos
 */
const ProductCard = ({ product, onEdit, onDelete, onProductRemoved }) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Memoizar funciones para evitar recrearlas en cada render
  const formatPrice = useCallback((price) => {
    if (price === 0) return 'Gratis';
    return `$${parseFloat(price).toFixed(2)}`;
  }, []);

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  // Verificar si el producto está en favoritos
  useEffect(() => {
    const checkFavorite = async () => {
      if (user && product) {
        try {
          const result = await supabaseFavoritesService.isFavorite(product.id);
          if (result.success) {
            setIsFavorite(result.data);
          }
        } catch (error) {
          logger.error('Error verificando favorito:', error);
        }
      }
    };

    checkFavorite();
  }, [user, product]);

  // Manejar toggle de favorito
  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert('Debes iniciar sesión para agregar productos a favoritos');
      return;
    }

    setIsLoading(true);
    try {
      const result = await supabaseFavoritesService.toggleFavorite(product.id);
      if (result.success) {
        const newFavoriteState = !isFavorite;
        setIsFavorite(newFavoriteState);
        
        // Si se removió de favoritos y hay callback, notificar
        if (!newFavoriteState && onProductRemoved) {
          onProductRemoved(product.id);
        }
      } else {
        logger.error('Error:', result.error);
        alert(result.error);
      }
    } catch (error) {
      logger.error('Error toggleando favorito:', error);
      alert('Error al actualizar favoritos');
    } finally {
      setIsLoading(false);
    }
  };

  // Memoizar funciones de formato
  const getTransactionTypeLabel = useCallback((type) => {
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
  }, []);

  const getTransactionTypeColor = useCallback((type) => {
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
  }, []);

  const getConditionLabel = useCallback((condition) => {
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
  }, []);

  // Memoizar valores calculados
  const isOwner = useMemo(() => user && product.user_id === user.id, [user, product.user_id]);
  
  // Memoizar URL de imagen principal
  const mainImageUrl = useMemo(() => {
    if (!product.images || product.images.length === 0) return null;
    return Array.isArray(product.images) ? product.images[0] : product.images.split(',')[0];
  }, [product.images]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Product Image */}
      <div className="relative h-48 sm:h-56 bg-gray-200 dark:bg-gray-700">
        {mainImageUrl ? (
          <img
            src={mainImageUrl}
            alt={product.title || 'Producto'}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextSibling) {
                e.target.nextSibling.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center" style={{ display: (product.images && product.images.length > 0) ? 'none' : 'flex' }}>
          <div className="text-gray-400 dark:text-gray-500 text-center">
            <div className={`w-12 h-12 ${getCategoryIconColor(product.category)} rounded-full flex items-center justify-center mx-auto mb-2`}>
              {React.createElement(getCategoryIcon(product.category), { 
                size: 24, 
                className: "text-white" 
              })}
            </div>
            <p className="text-sm">Sin imagen</p>
          </div>
        </div>
        
        {/* Transaction Type Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(product.transaction_type)}`}>
            {getTransactionTypeLabel(product.transaction_type)}
          </span>
        </div>

        {/* Price Badge */}
        <div className="absolute top-2 right-2">
          <span className="bg-emerald-600 text-white px-2 py-1 rounded-full text-sm font-medium">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4">
        <div className="mb-3">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
            {product.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Product Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Categoría:</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">{product.category}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Estado:</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">{getConditionLabel(product.condition_product)}</span>
          </div>
          {product.location && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <MapPin size={14} className="mr-1" />
              <span>{product.location}</span>
            </div>
          )}
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Calendar size={14} className="mr-1" />
            <span>{formatDate(product.created_at)}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center">
            <Eye size={14} className="mr-1" />
            <span>{product.views || 0} vistas</span>
          </div>
          <div className="flex items-center">
            <Heart size={14} className="mr-1" />
            <span>{product.favorites || 0} favoritos</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Link
            to={`/product/${product.id}`}
            className="flex-1 bg-emerald-600 text-white text-center py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors duration-200 text-sm font-medium"
            aria-label={`Ver detalles de ${product.title}`}
          >
            Ver Detalles
          </Link>
          {user && !isOwner && (
            <button 
              onClick={handleToggleFavorite}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isFavorite 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              } disabled:opacity-50`}
              title={isFavorite ? 'Remover de favoritos' : 'Agregar a favoritos'}
              aria-label={isFavorite ? `Remover ${product.title} de favoritos` : `Agregar ${product.title} a favoritos`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
              )}
            </button>
          )}
          {isOwner && onEdit && (
            <button 
              onClick={() => onEdit(product)}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              title="Editar producto"
              aria-label={`Editar producto ${product.title}`}
            >
              <Edit size={16} aria-hidden="true" />
            </button>
          )}
          {isOwner && onDelete && (
            <button 
              onClick={() => onDelete(product)}
              className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
              title="Eliminar producto"
              aria-label={`Eliminar producto ${product.title}`}
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          )}
          <Link
            to="/chat"
            className="bg-sky-600 text-white p-2 rounded-lg hover:bg-sky-700 transition-colors duration-200"
            title="Abrir chat"
            aria-label="Abrir chat con el vendedor"
          >
            <MessageCircle size={16} aria-hidden="true" />
          </Link>
        </div>

        {/* Seller Info */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mr-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                {product.user_name ? product.user_name.charAt(0) : 'U'}
              </span>
            </div>
            <span className="font-medium">{product.user_name || 'Usuario'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoizar componente para evitar re-renders innecesarios
export default React.memo(ProductCard, (prevProps, nextProps) => {
  // Comparación personalizada para optimizar renders
  return (
    prevProps.product?.id === nextProps.product?.id &&
    prevProps.product?.views === nextProps.product?.views &&
    prevProps.product?.favorites === nextProps.product?.favorites &&
    prevProps.user?.id === nextProps.user?.id
  );
});
