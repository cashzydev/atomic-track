import React from 'react';
import { SimpleAvatar } from '@/components/SimpleAvatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProfileButtonProps {
  user: {
    name: string;
    email?: string;
    xp?: number;
    level?: number;
  };
  onClick: () => void;
  xpForNextLevel?: number;
  xpInCurrentLevel?: number;
  xpNeededForNext?: number;
}

/**
 * Botão de perfil com barra de nível
 * Avatar + progress bar de XP para próximo nível
 *
 * Características:
 * - Avatar simples com iniciais
 * - Barra de progresso de XP
 * - Click direto abre Sheet
 * - Foco em simplicidade e gamificação sutil
 */
export const ProfileButton = ({ 
  user, 
  onClick, 
  xpForNextLevel = 0,
  xpInCurrentLevel = 0,
  xpNeededForNext = 1
}: ProfileButtonProps) => {
  const progressPercentage = xpNeededForNext > 0 ? (xpInCurrentLevel / xpNeededForNext) * 100 : 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative group touch-target-comfortable",
        "hover:opacity-80 transition-opacity",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
      )}
      aria-label="Abrir perfil"
    >
      <div className="flex items-center gap-3">
        <SimpleAvatar
          name={user.name}
          email={user.email}
          size="md"
          className="ring-2 ring-border group-hover:ring-primary/40 transition-all"
        />
        
        {/* Barra de progresso de XP */}
        <div className="hidden md:flex flex-col min-w-[120px]">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Nível {user.level || 1}</span>
            <span>{xpInCurrentLevel}/{xpNeededForNext} XP</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2 bg-muted/30"
          />
        </div>
      </div>
    </button>
  );
};
