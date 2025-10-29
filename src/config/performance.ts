// Configurações de performance para a aplicação
export const PERFORMANCE_CONFIG = {
  // Configurações de memoização
  memoization: {
    // Threshold para usar React.memo em componentes
    componentMemoThreshold: 3, // componentes com mais de 3 props
    // Threshold para usar useMemo em cálculos
    calculationMemoThreshold: 10, // arrays com mais de 10 itens
  },

  // Configurações de virtualização
  virtualization: {
    // Threshold para usar virtualização em listas
    listThreshold: 50,
    // Altura padrão para listas virtualizadas
    defaultHeight: 400,
    // Altura padrão para itens
    defaultItemHeight: 60,
    // Número de itens para renderizar fora da viewport
    overscanCount: 5,
  },

  // Configurações de debounce/throttle
  timing: {
    // Debounce para inputs de busca
    searchDebounce: 300,
    // Debounce para validações
    validationDebounce: 500,
    // Throttle para scroll
    scrollThrottle: 16, // ~60fps
    // Throttle para resize
    resizeThrottle: 100,
    // Debounce para cliques
    clickDebounce: 100,
  },

  // Configurações de animações
  animations: {
    // Duração padrão para animações
    defaultDuration: 300,
    // Duração reduzida para usuários com preferência de movimento reduzido
    reducedMotionDuration: 100,
    // Delay entre animações sequenciais
    sequentialDelay: 100,
  },

  // Configurações de lazy loading
  lazyLoading: {
    // Root margin para intersection observer
    rootMargin: '100px',
    // Threshold para intersection observer
    threshold: 0.1,
    // Delay para carregar componentes lazy
    lazyLoadDelay: 0,
  },

  // Configurações de bundle
  bundle: {
    // Tamanho máximo para chunks
    maxChunkSize: 250000, // 250KB
    // Tamanho máximo para assets
    maxAssetSize: 100000, // 100KB
  },

  // Configurações de cache
  cache: {
    // TTL para cache de queries
    queryCacheTTL: 5 * 60 * 1000, // 5 minutos
    // TTL para cache de componentes
    componentCacheTTL: 10 * 60 * 1000, // 10 minutos
  },
} as const;

// Hook para verificar se deve usar otimizações baseado no tamanho dos dados
export const usePerformanceOptimization = (dataSize: number) => {
  return {
    shouldMemoize: dataSize > PERFORMANCE_CONFIG.memoization.calculationMemoThreshold,
    shouldVirtualize: dataSize > PERFORMANCE_CONFIG.virtualization.listThreshold,
    shouldDebounce: dataSize > 20,
  };
};

// Utilitário para determinar configurações de performance baseado no dispositivo
export const getDevicePerformanceConfig = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
  
  return {
    isMobile,
    isLowEnd,
    shouldReduceAnimations: isMobile || isLowEnd,
    shouldUseVirtualization: !isMobile, // Virtualização pode ser problemática em mobile
    shouldUseLazyLoading: true,
    maxConcurrentAnimations: isMobile ? 3 : 10,
  };
};

// Configurações específicas para diferentes tipos de componentes
export const COMPONENT_PERFORMANCE_CONFIG = {
  HabitTimeline: {
    maxItemsWithoutVirtualization: 20,
    animationDelay: 100,
    shouldMemoizeItems: true,
  },
  HabitCard: {
    shouldMemoize: true,
    animationDuration: 300,
    shouldOptimizeImages: true,
  },
  Dashboard: {
    shouldMemoizeStats: true,
    shouldDebounceInteractions: true,
    maxConcurrentAnimations: 5,
  },
  BadgeDisplay: {
    shouldVirtualize: true,
    virtualizationThreshold: 30,
    shouldMemoizeBadges: true,
  },
} as const;


