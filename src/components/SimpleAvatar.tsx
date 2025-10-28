import React from 'react';
import { getAvatarColor, getInitials } from '@/utils/avatarUtils';
import { cn } from '@/lib/utils';

interface SimpleAvatarProps {
  name: string;
  email?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
};

/**
 * Avatar simples com iniciais e cor consistente
 * Elimina complexidade de customização desnecessária
 * 
 * Características:
 * - Cor gerada deterministicamente a partir do nome
 * - Iniciais extraídas inteligentemente
 * - Zero configuração necessária
 * - Consistente entre sessões
 */
export const SimpleAvatar = ({ 
  name, 
  email, 
  size = 'md', 
  className 
}: SimpleAvatarProps) => {
  const initials = getInitials(name, email);
  const colorClass = getAvatarColor(name || email || '');
  
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center',
        'text-white font-semibold',
        'border-2 border-white/20',
        colorClass,
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
};
