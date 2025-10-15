import { useState, useEffect, useCallback, useRef } from 'react';

// Hook para debounce
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook para throttle
export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
};

// Hook para lazy loading
export const useLazyLoading = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [elementRef, isVisible];
};

// Hook para medir rendimiento
export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
  });

  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} - Render #${renderCount.current} - Time: ${renderTime.toFixed(2)}ms`);
    }
    
    startTime.current = performance.now();
  });

  return {
    renderCount: renderCount.current,
    resetRenderCount: () => {
      renderCount.current = 0;
    }
  };
};

// Hook para cache de datos
export const useCache = (key, fetcher, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cacheRef = useRef(new Map());

  useEffect(() => {
    const cacheKey = `${key}-${JSON.stringify(dependencies)}`;
    
    if (cacheRef.current.has(cacheKey)) {
      setData(cacheRef.current.get(cacheKey));
      return;
    }

    setLoading(true);
    setError(null);

    fetcher()
      .then(result => {
        cacheRef.current.set(cacheKey, result);
        setData(result);
      })
      .catch(err => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [key, fetcher, ...dependencies]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return { data, loading, error, clearCache };
};

// Hook para optimizar re-renders
export const useMemoizedCallback = (callback, dependencies) => {
  const callbackRef = useRef();
  callbackRef.current = callback;

  return useCallback((...args) => {
    return callbackRef.current(...args);
  }, dependencies);
};

export default {
  useDebounce,
  useThrottle,
  useLazyLoading,
  usePerformanceMonitor,
  useCache,
  useMemoizedCallback
};
