import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';

// Componente de loading elegante para lazy loading
const LazyLoadingFallback = () => (
  <motion.div
    className="flex items-center justify-center p-8"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground">Carregando...</p>
    </div>
  </motion.div>
);

// HOC para lazy loading com fallback personalizado
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = lazy(() => 
    Promise.resolve({ default: Component })
  );

  return (props: P) => (
    <Suspense fallback={fallback ? <fallback /> : <LazyLoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Lazy loading de componentes pesados
export const LazyHabitTimelineFiltered = lazy(() => 
  import('@/components/HabitTimelineFiltered').then(module => ({
    default: module.HabitTimelineFiltered
  }))
);

export const LazyBadgeDisplay = lazy(() => 
  import('@/components/BadgeDisplay').then(module => ({
    default: module.default
  }))
);

// Componentes de gráficos (se existirem)
export const LazyCharts = lazy(() => 
  import('@/components/charts').catch(() => ({
    default: () => <div>Charts não disponíveis</div>
  }))
);

// Componentes de relatórios
export const LazyReports = lazy(() => 
  import('@/pages/Reports').catch(() => ({
    default: () => <div>Relatórios não disponíveis</div>
  }))
);

// Componentes de configurações
export const LazySettings = lazy(() => 
  import('@/pages/Settings').catch(() => ({
    default: () => <div>Configurações não disponíveis</div>
  }))
);

// Hook para detectar se o componente está visível (Intersection Observer)
export const useIntersectionObserver = (
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
};

// Componente wrapper para lazy loading com intersection observer
export const LazyWrapper: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
}> = ({ children, fallback = <LazyLoadingFallback />, rootMargin = '100px' }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionObserver(ref, { rootMargin });

  return (
    <div ref={ref}>
      {isIntersecting ? children : fallback}
    </div>
  );
};

