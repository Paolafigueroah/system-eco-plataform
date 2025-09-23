import { useState, useEffect, useRef } from 'react';
import { supabaseRealtimeService } from '../services/supabaseRealtimeService';

export const useRealtime = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const subscriptionsRef = useRef([]);

  // Limpiar suscripciones al desmontar
  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach(sub => {
        if (sub) {
          supabaseRealtimeService.unsubscribe(sub);
        }
      });
    };
  }, []);

  // Suscribirse a productos
  const subscribeToProducts = (callback) => {
    const subscription = supabaseRealtimeService.subscribeToProducts(callback);
    if (subscription) {
      subscriptionsRef.current.push(subscription);
      setSubscriptions(prev => [...prev, subscription]);
      setIsConnected(true);
    }
    return subscription;
  };

  // Suscribirse a favoritos
  const subscribeToFavorites = (userId, callback) => {
    const subscription = supabaseRealtimeService.subscribeToFavorites(userId, callback);
    if (subscription) {
      subscriptionsRef.current.push(subscription);
      setSubscriptions(prev => [...prev, subscription]);
      setIsConnected(true);
    }
    return subscription;
  };

  // Suscribirse a mensajes
  const subscribeToMessages = (conversationId, callback) => {
    const subscription = supabaseRealtimeService.subscribeToMessages(conversationId, callback);
    if (subscription) {
      subscriptionsRef.current.push(subscription);
      setSubscriptions(prev => [...prev, subscription]);
      setIsConnected(true);
    }
    return subscription;
  };

  // Suscribirse a conversaciones
  const subscribeToConversations = (userId, callback) => {
    const subscription = supabaseRealtimeService.subscribeToConversations(userId, callback);
    if (subscription) {
      subscriptionsRef.current.push(subscription);
      setSubscriptions(prev => [...prev, subscription]);
      setIsConnected(true);
    }
    return subscription;
  };

  // Suscribirse a notificaciones
  const subscribeToNotifications = (userId, callback) => {
    const subscription = supabaseRealtimeService.subscribeToNotifications(userId, callback);
    if (subscription) {
      subscriptionsRef.current.push(subscription);
      setSubscriptions(prev => [...prev, subscription]);
      setIsConnected(true);
    }
    return subscription;
  };

  // Suscribirse a puntos
  const subscribeToUserPoints = (userId, callback) => {
    const subscription = supabaseRealtimeService.subscribeToUserPoints(userId, callback);
    if (subscription) {
      subscriptionsRef.current.push(subscription);
      setSubscriptions(prev => [...prev, subscription]);
      setIsConnected(true);
    }
    return subscription;
  };

  // Desuscribirse de una suscripción específica
  const unsubscribe = (subscription) => {
    if (subscription) {
      supabaseRealtimeService.unsubscribe(subscription);
      subscriptionsRef.current = subscriptionsRef.current.filter(sub => sub !== subscription);
      setSubscriptions(prev => prev.filter(sub => sub !== subscription));
      
      if (subscriptionsRef.current.length === 0) {
        setIsConnected(false);
      }
    }
  };

  // Desuscribirse de todas las suscripciones
  const unsubscribeAll = () => {
    supabaseRealtimeService.unsubscribeAll();
    subscriptionsRef.current = [];
    setSubscriptions([]);
    setIsConnected(false);
  };

  return {
    isConnected,
    subscribeToProducts,
    subscribeToFavorites,
    subscribeToMessages,
    subscribeToConversations,
    subscribeToNotifications,
    subscribeToUserPoints,
    unsubscribe,
    unsubscribeAll
  };
};

export default useRealtime;
