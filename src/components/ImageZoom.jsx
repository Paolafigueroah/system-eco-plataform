import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCw, X } from 'lucide-react';

/**
 * Componente de zoom para imágenes con soporte para gestos táctiles
 * 
 * @component
 * @param {string} src - URL de la imagen
 * @param {string} alt - Texto alternativo
 * @param {Function} onClose - Función para cerrar el modal
 * @param {Function} onPrev - Función para imagen anterior (opcional)
 * @param {Function} onNext - Función para imagen siguiente (opcional)
 * @param {boolean} hasNavigation - Si tiene navegación entre imágenes
 * @returns {JSX.Element} Modal con zoom de imagen
 */
const ImageZoom = ({ src, alt, onClose, onPrev, onNext, hasNavigation = false }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const lastTouchDistance = useRef(0);
  const lastTouchCenter = useRef({ x: 0, y: 0 });

  // Reset zoom al cambiar de imagen
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, [src]);

  // Manejar zoom con rueda del mouse
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.5, Math.min(5, scale + delta));
    setScale(newScale);
  };

  // Manejar doble clic para zoom
  const handleDoubleClick = (e) => {
    if (scale === 1) {
      setScale(2);
      const rect = imageRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        setPosition({ x: -x * 2, y: -y * 2 });
      }
    } else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  // Manejar inicio de arrastre
  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  // Manejar arrastre
  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  // Manejar fin de arrastre
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Manejar gestos táctiles (pinch to zoom)
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      lastTouchDistance.current = distance;
      lastTouchCenter.current = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const scaleChange = distance / lastTouchDistance.current;
      const newScale = Math.max(0.5, Math.min(5, scale * scaleChange));
      setScale(newScale);
      lastTouchDistance.current = distance;
    } else if (e.touches.length === 1 && scale > 1) {
      const touch = e.touches[0];
      setPosition({
        x: position.x + (touch.clientX - lastTouchCenter.current.x),
        y: position.y + (touch.clientY - lastTouchCenter.current.y)
      });
      lastTouchCenter.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  // Funciones de zoom
  const zoomIn = () => {
    setScale(prev => Math.min(5, prev + 0.5));
  };

  const zoomOut = () => {
    const newScale = Math.max(0.5, scale - 0.5);
    setScale(newScale);
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition-colors"
        aria-label="Cerrar"
      >
        <X size={24} />
      </button>

      {/* Controles de zoom */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 bg-black/70 rounded-lg p-2">
        <button
          onClick={zoomIn}
          className="p-2 text-white hover:bg-white/20 rounded transition-colors"
          aria-label="Acercar"
          disabled={scale >= 5}
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={zoomOut}
          className="p-2 text-white hover:bg-white/20 rounded transition-colors"
          aria-label="Alejar"
          disabled={scale <= 0.5}
        >
          <ZoomOut size={20} />
        </button>
        <button
          onClick={rotate}
          className="p-2 text-white hover:bg-white/20 rounded transition-colors"
          aria-label="Rotar"
        >
          <RotateCw size={20} />
        </button>
        {scale !== 1 && (
          <button
            onClick={resetZoom}
            className="p-2 text-white hover:bg-white/20 rounded transition-colors text-xs"
            aria-label="Resetear zoom"
          >
            Reset
          </button>
        )}
      </div>

      {/* Indicador de zoom */}
      {scale !== 1 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/70 text-white px-3 py-1 rounded text-sm">
          {Math.round(scale * 100)}%
        </div>
      )}

      {/* Imagen con zoom */}
      <div
        className="relative max-w-full max-h-full overflow-hidden cursor-move"
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className="max-w-full max-h-[90vh] object-contain select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            transformOrigin: 'center center'
          }}
          draggable={false}
        />
      </div>

      {/* Navegación */}
      {hasNavigation && (
        <>
          {onPrev && (
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition-colors"
              aria-label="Imagen anterior"
            >
              ←
            </button>
          )}
          {onNext && (
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition-colors"
              aria-label="Imagen siguiente"
            >
              →
            </button>
          )}
        </>
      )}

      {/* Instrucciones */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/70 text-white px-4 py-2 rounded text-xs text-center">
        Doble clic para zoom • Rueda del mouse para acercar/alejar • Arrastra cuando esté ampliado
      </div>
    </div>
  );
};

export default ImageZoom;

