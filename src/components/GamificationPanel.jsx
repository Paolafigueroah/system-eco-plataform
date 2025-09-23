import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  Award, 
  TrendingUp, 
  Target,
  Gift,
  Medal,
  Crown,
  Zap,
  Heart,
  Eye,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabaseGamificationService } from '../services/supabaseGamificationService';

const GamificationPanel = () => {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadGamificationData();
    }
  }, [user]);

  const loadGamificationData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Simular datos de gamificación por ahora
      setPoints(150); // Puntos fijos por ahora
      setBadges([
        { id: 1, name: 'Primer Producto', icon: 'Gift', description: 'Publicaste tu primer producto' },
        { id: 2, name: 'Eco Warrior', icon: 'Leaf', description: 'Ayudaste al medio ambiente' }
      ]);
      setActions([
        { id: 1, action: 'Publicaste un producto', points: 10, timestamp: new Date() },
        { id: 2, action: 'Completaste tu perfil', points: 5, timestamp: new Date() }
      ]);
    } catch (error) {
      console.error('Error cargando datos de gamificación:', error);
      // Asegurar que siempre tengamos arrays válidos
      setBadges([]);
      setActions([]);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (badgeId) => {
    switch (badgeId) {
      case 'points_100':
        return <Star className="h-6 w-6 text-yellow-500" />;
      case 'points_500':
        return <Award className="h-6 w-6 text-purple-500" />;
      case 'points_1000':
        return <Crown className="h-6 w-6 text-yellow-600" />;
      case 'publisher_5':
        return <Target className="h-6 w-6 text-blue-500" />;
      case 'collector_10':
        return <Heart className="h-6 w-6 text-red-500" />;
      default:
        return <Medal className="h-6 w-6 text-gray-500" />;
    }
  };

  const getBadgeName = (badgeId) => {
    switch (badgeId) {
      case 'points_100':
        return 'Primeros 100 puntos';
      case 'points_500':
        return 'Coleccionista';
      case 'points_1000':
        return 'Experto';
      case 'publisher_5':
        return 'Publicador';
      case 'collector_10':
        return 'Coleccionista de Favoritos';
      default:
        return 'Badge Especial';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'publish_product':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'favorite_product':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'view_product':
        return <Eye className="h-4 w-4 text-green-500" />;
      case 'send_message':
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <Zap className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionName = (action) => {
    switch (action) {
      case 'publish_product':
        return 'Publicar producto';
      case 'favorite_product':
        return 'Agregar a favoritos';
      case 'view_product':
        return 'Ver producto';
      case 'send_message':
        return 'Enviar mensaje';
      default:
        return action;
    }
  };

  const getLevel = (points) => {
    if (points < 100) return { level: 1, name: 'Novato', color: 'text-gray-500' };
    if (points < 500) return { level: 2, name: 'Intermedio', color: 'text-blue-500' };
    if (points < 1000) return { level: 3, name: 'Avanzado', color: 'text-purple-500' };
    if (points < 2000) return { level: 4, name: 'Experto', color: 'text-yellow-500' };
    return { level: 5, name: 'Maestro', color: 'text-red-500' };
  };

  const level = getLevel(points);
  const nextLevelPoints = Math.ceil(points / 500) * 500;
  const progress = (points % 500) / 500 * 100;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Puntos y Nivel */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Mis Puntos</h2>
            <p className="text-blue-100">Nivel {level.level} - {level.name}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{points}</div>
            <div className="text-blue-100">puntos</div>
          </div>
        </div>
        
        <div className="mb-2">
          <div className="flex justify-between text-sm text-blue-100">
            <span>Progreso al siguiente nivel</span>
            <span>{nextLevelPoints - points} puntos restantes</span>
          </div>
          <div className="w-full bg-blue-300 rounded-full h-2 mt-1">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Mis Badges
          </h3>
        </div>
        
        {(!badges || badges.length === 0) ? (
          <p className="text-gray-500 text-center py-4">
            Aún no has ganado ningún badge. ¡Sigue participando!
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                {getBadgeIcon(badge.badge_id)}
                <span className="text-sm font-medium text-gray-900 dark:text-white mt-2 text-center">
                  {getBadgeName(badge.badge_id)}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {new Date(badge.earned_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historial de Acciones */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Actividad Reciente
          </h3>
        </div>
        
        {(!actions || actions.length === 0) ? (
          <p className="text-gray-500 text-center py-4">
            Aún no tienes actividad registrada.
          </p>
        ) : (
          <div className="space-y-3">
            {actions.map((action) => (
              <div
                key={action.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-shrink-0">
                  {getActionIcon(action.action)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getActionName(action.action)}
                  </p>
                  {action.description && (
                    <p className="text-xs text-gray-500">{action.description}</p>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className="text-sm font-medium text-green-600">
                    +{action.points_earned}
                  </span>
                  <p className="text-xs text-gray-500">
                    {new Date(action.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Consejos para ganar puntos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Gift className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cómo ganar puntos
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Target className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Publicar producto</p>
              <p className="text-xs text-gray-500">+10 puntos</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Heart className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-medium">Agregar a favoritos</p>
              <p className="text-xs text-gray-500">+5 puntos</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Eye className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">Ver producto</p>
              <p className="text-xs text-gray-500">+1 punto</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium">Enviar mensaje</p>
              <p className="text-xs text-gray-500">+3 puntos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationPanel;
