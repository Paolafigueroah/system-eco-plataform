import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageCircle, User, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

const ProductReviews = ({ productId, reviews = [], onAddReview }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
    recommend: true
  });
  const [filteredReviews, setFilteredReviews] = useState(reviews);
  const [filter, setFilter] = useState('all'); // all, 5, 4, 3, 2, 1

  // Calcular estadísticas
  const stats = {
    total: reviews.length,
    average: reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0,
    distribution: [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: reviews.filter(r => r.rating === rating).length,
      percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
    }))
  };

  useEffect(() => {
    if (filter === 'all') {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter(review => review.rating === parseInt(filter)));
    }
  }, [reviews, filter]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!user) return;

    const review = {
      ...newReview,
      userId: user.id,
      userName: user.display_name || user.email,
      productId,
      createdAt: new Date().toISOString(),
      helpful: 0,
      notHelpful: 0
    };

    onAddReview(review);
    setNewReview({
      rating: 5,
      title: '',
      comment: '',
      recommend: true
    });
    setShowReviewForm(false);
  };

  const renderStars = (rating, size = 'sm') => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Reseñas y Calificaciones
        </h3>
        {user && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            Escribir Reseña
          </button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Resumen de calificaciones */}
        <div>
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.average.toFixed(1)}
              </div>
              <div className="flex items-center justify-center">
                {renderStars(Math.round(stats.average), 'md')}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stats.total} reseña{stats.total !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Distribución de calificaciones */}
          <div className="space-y-2">
            {stats.distribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                  {rating}
                </span>
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 w-8">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Filtros */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Filtrar por calificación</h4>
          <div className="space-y-2">
            <button
              onClick={() => setFilter('all')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                filter === 'all'
                  ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Todas las reseñas ({stats.total})
            </button>
            {stats.distribution.map(({ rating, count }) => (
              <button
                key={rating}
                onClick={() => setFilter(rating.toString())}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                  filter === rating.toString()
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {renderStars(rating, 'sm')}
                  <span>({count})</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Formulario de nueva reseña */}
      {showReviewForm && user && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">Escribir una reseña</h4>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Calificación
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= newReview.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título de la reseña
              </label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Resume tu experiencia..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comentario
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Comparte tu experiencia con este producto..."
                required
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newReview.recommend}
                  onChange={(e) => setNewReview(prev => ({ ...prev, recommend: e.target.checked }))}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Recomendar este producto
                </span>
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Publicar Reseña
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de reseñas */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'all' ? 'No hay reseñas aún' : 'No hay reseñas con esta calificación'}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {filter === 'all' ? 'Sé el primero en escribir una reseña' : 'Intenta con otro filtro'}
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-semibold">
                  {review.userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {review.userName}
                    </h4>
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating, 'sm')}
                    </div>
                    {review.recommend && (
                      <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                        Recomendado
                      </span>
                    )}
                  </div>
                  
                  {review.title && (
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      {review.title}
                    </h5>
                  )}
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {review.comment}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200">
                        <ThumbsUp className="h-4 w-4" />
                        <span>Útil ({review.helpful || 0})</span>
                      </button>
                      <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200">
                        <ThumbsDown className="h-4 w-4" />
                        <span>No útil ({review.notHelpful || 0})</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
