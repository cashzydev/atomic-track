import { useCallback, useRef, useEffect } from 'react';

// Hook para debounce - útil para inputs de busca e validações
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

// Hook para throttle - útil para scroll, resize e eventos frequentes
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          callback(...args);
        }, delay - (now - lastCallRef.current));
      }
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
};

// Hook para otimizar handlers de scroll
export const useScrollHandler = (
  callback: (event: Event) => void,
  throttleDelay: number = 16 // ~60fps
) => {
  const throttledCallback = useThrottle(callback, throttleDelay);

  useEffect(() => {
    window.addEventListener('scroll', throttledCallback, { passive: true });
    return () => window.removeEventListener('scroll', throttledCallback);
  }, [throttledCallback]);
};

// Hook para otimizar handlers de resize
export const useResizeHandler = (
  callback: (event: Event) => void,
  throttleDelay: number = 100
) => {
  const throttledCallback = useThrottle(callback, throttleDelay);

  useEffect(() => {
    window.addEventListener('resize', throttledCallback, { passive: true });
    return () => window.removeEventListener('resize', throttledCallback);
  }, [throttledCallback]);
};

// Hook para otimizar handlers de input com debounce
export const useInputHandler = (
  callback: (value: string) => void,
  debounceDelay: number = 300
) => {
  const debouncedCallback = useDebounce(callback, debounceDelay);

  return useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      debouncedCallback(event.target.value);
    },
    [debouncedCallback]
  );
};

// Hook para otimizar handlers de clique com debounce
export const useClickHandler = (
  callback: () => void,
  debounceDelay: number = 100
) => {
  const debouncedCallback = useDebounce(callback, debounceDelay);

  return useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      debouncedCallback();
    },
    [debouncedCallback]
  );
};


