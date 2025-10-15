import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const OfflineIndicator = () => {
  const { theme } = useTheme();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
      setRetryCount(0);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    // Intentar recargar la página
    window.location.reload();
  };

  if (isOnline) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-down">
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">Conectado</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm">
        <div className="flex items-start space-x-3">
          <WifiOff className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Sin conexión</h3>
            <p className="text-xs mt-1 opacity-90">
              No tienes conexión a internet. Algunas funciones pueden no estar disponibles.
            </p>
            <button
              onClick={handleRetry}
              className="flex items-center space-x-1 mt-2 bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs font-medium transition-colors duration-200"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reintentar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineIndicator;
