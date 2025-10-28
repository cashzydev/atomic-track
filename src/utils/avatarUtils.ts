/**
 * Utilitários para avatar simples e consistente
 * Elimina complexidade de customização desnecessária
 */

/**
 * Gera cor consistente a partir do nome usando hash simples
 * Mesmo nome sempre retorna mesma cor
 */
export const getAvatarColor = (name: string): string => {
  if (!name) return 'bg-slate-600';
  
  // Hash simples do nome
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Paleta de cores profissionais (não muito vibrantes)
  const colors = [
    'bg-blue-600',
    'bg-violet-600', 
    'bg-emerald-600',
    'bg-amber-600',
    'bg-rose-600',
    'bg-cyan-600',
    'bg-indigo-600',
    'bg-teal-600',
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Extrai iniciais do nome de forma inteligente
 * - Nome completo: primeira letra de cada palavra
 * - Nome único: primeira letra
 * - Fallback: primeira letra do email ou 'U'
 */
export const getInitials = (name: string, email?: string): string => {
  if (!name && !email) return 'U';
  
  const text = name || email || '';
  const words = text.trim().split(/\s+/);
  
  if (words.length === 1) {
    return words[0][0]?.toUpperCase() || 'U';
  }
  
  // Para nomes com múltiplas palavras, pega primeira e última
  return (
    (words[0][0] || '') + (words[words.length - 1][0] || '')
  ).toUpperCase();
};
