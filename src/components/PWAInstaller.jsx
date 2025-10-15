import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const PWAInstaller = () => {
  const { theme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detectar si es iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detectar si ya está instalado (modo standalone)
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      window.navigator.standalone === true;
    setIsStandalone(standalone);

    // Detectar si ya está instalado
    if (standalone) {
      setIsInstalled(true);
      return;
    }

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Mostrar el prompt después de un delay
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
    };

    // Escuchar el evento appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuario aceptó instalar la PWA');
    } else {
      console.log('Usuario rechazó instalar la PWA');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // No mostrar de nuevo por 24 horas
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // No mostrar si ya está instalado o si se descartó recientemente
  if (isInstalled || isStandalone) return null;

  const dismissedTime = localStorage.getItem('pwa-install-dismissed');
  if (dismissedTime && Date.now() - parseInt(dismissedTime) < 24 * 60 * 60 * 1000) {
    return null;
  }

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 animate-slide-up">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Instalar System Eco
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {isIOS 
                ? 'Agrega esta app a tu pantalla de inicio para una mejor experiencia'
                : 'Instala la app para acceso rápido y notificaciones'
              }
            </p>
            
            {isIOS ? (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <p>1. Toca el botón de compartir</p>
                <p>2. Selecciona "Agregar a pantalla de inicio"</p>
              </div>
            ) : (
              <div className="flex items-center space-x-2 mt-3">
                <button
                  onClick={handleInstallClick}
                  className="flex items-center space-x-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200"
                >
                  <Download className="h-3 w-3" />
                  <span>Instalar</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xs"
                >
                  Ahora no
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstaller;
