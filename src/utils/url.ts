/**
 * Normaliza a URL para sempre usar www.atomictrack.com.br
 * Isso garante consistência nas URLs de redirecionamento OAuth
 */
export const normalizeAppUrl = (): string => {
  if (typeof window === 'undefined') {
    return 'https://www.atomictrack.com.br';
  }

  const origin = window.location.origin;
  const hostname = window.location.hostname;

  // Se estiver em atomictrack.com.br sem www, redirecionar para www
  if (hostname === 'atomictrack.com.br') {
    // Não fazemos redirect aqui, apenas retornamos a URL normalizada
    return 'https://www.atomictrack.com.br';
  }

  // Se já tiver www, retorna como está
  if (hostname.includes('www.atomictrack.com.br')) {
    return origin;
  }

  // Para desenvolvimento local
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return origin;
  }

  // Por padrão, usar www
  return 'https://www.atomictrack.com.br';
};

/**
 * Obtém a URL base da aplicação normalizada
 */
export const getAppBaseUrl = (): string => {
  return normalizeAppUrl();
};

