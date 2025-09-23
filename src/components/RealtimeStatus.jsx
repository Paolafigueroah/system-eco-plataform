import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity } from 'lucide-react';
import { useRealtime } from '../hooks/useRealtime';

const RealtimeStatus = () => {
  const { isConnected } = useRealtime();
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Mostrar el estado cuando cambie la conexión
    if (isConnected) {
      setShowStatus(true);
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  if (!showStatus && !isConnected) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`
        flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg transition-all duration-300
        ${isConnected 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white'
        }
        ${showStatus ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
      `}>
        {isConnected ? (
          <>
            <Wifi className="h-4 w-4" />
            <span className="text-sm font-medium">En tiempo real</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">Sin conexión</span>
          </>
        )}
      </div>
    </div>
  );
};

export default RealtimeStatus;
