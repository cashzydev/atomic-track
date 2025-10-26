import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { getLevelInfo } from '@/systems/levelSystem';
import { getLevelTitle } from '@/utils/levelTranslations';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LevelBadgeProps {
  level: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTooltip?: boolean;
  showProgress?: boolean;
  animated?: boolean;
  xp?: number;
  nextLevelXP?: number;
}

const LevelBadge: React.FC<LevelBadgeProps> = ({ 
  level, 
  size = 'md', 
  showTooltip = true,
  showProgress = false,
  animated = false,
  xp,
  nextLevelXP 
}) => {
  const { i18n } = useTranslation();
  const levelInfo = getLevelInfo(level);
  const levelTitle = getLevelTitle(level);
  const Icon = levelInfo.icon;
  
  // Estado para animação de mudança de nível
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const previousLevelRef = useRef(level);
  
  // Detectar mudança de nível e animar
  useEffect(() => {
    if (level > previousLevelRef.current) {
      setIsLevelingUp(true);
      
      // Resetar animação após 2 segundos
      const timer = setTimeout(() => {
        setIsLevelingUp(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    // Atualizar referência do nível anterior
    previousLevelRef.current = level;
  }, [level]);
  
  // Cores progressivas por tier
  const getTierGradient = (lvl: number) => {
    if (lvl >= 10) return 'from-violet-500 via-purple-500 to-pink-500';
    if (lvl >= 8) return 'from-yellow-500 to-amber-500';
    if (lvl >= 6) return 'from-purple-500 to-violet-600';
    if (lvl >= 4) return 'from-cyan-500 to-blue-600';
    if (lvl >= 2) return 'from-lime-500 to-emerald-600';
    return 'from-emerald-500 to-teal-600';
  };

  const sizeClasses = {
    xs: 'w-8 h-8 text-sm',
    sm: 'w-12 h-12 text-base',
    md: 'w-20 h-20 text-lg',
    lg: 'w-28 h-28 text-2xl',
    xl: 'w-36 h-36 text-3xl',
  };
  
  const iconSizes = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
  };

  const gradient = getTierGradient(level);
  const progress = xp && nextLevelXP && nextLevelXP > 0 ? (xp / nextLevelXP) * 100 : 0;

  const badge = (
    <div className="relative inline-block">
      <div
        className={cn(
          'rounded-full flex items-center justify-center relative overflow-hidden',
          `bg-gradient-to-br ${gradient}`,
          'border-2 border-white/30',
          'shadow-lg',
          'transition-all duration-300',
          !showTooltip && 'hover:scale-110',
          animated && level >= 7 && 'animate-pulse-violet',
          isLevelingUp && 'animate-bounce scale-110',
          sizeClasses[size]
        )}
      >
        {/* Animação de brilho para níveis altos */}
        {animated && level >= 7 && (
          <div className="absolute inset-0 animate-spin-slow opacity-30">
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent" />
          </div>
        )}

        {/* Animação especial para level up */}
        {isLevelingUp && (
          <div className="absolute inset-0 animate-ping opacity-75">
            <div className="h-full w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full" />
          </div>
        )}

        <Icon size={iconSizes[size]} className="text-white relative z-10" />
      </div>

      {/* Progress ring ao redor */}
      {showProgress && xp !== undefined && nextLevelXP !== undefined && (
        <svg className="absolute inset-0 -rotate-90 w-full h-full">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-white/20"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${progress * 2.83} 283`}
            className="text-violet-400 transition-all duration-500"
          />
        </svg>
      )}
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-semibold">
              {i18n.language === 'en' ? 'Level' : 'Nível'} {level} • {levelTitle}
            </p>
            {xp !== undefined && nextLevelXP !== undefined && (
              <p className="text-xs text-slate-400 mt-1">
                {nextLevelXP - xp} {i18n.language === 'en' ? 'XP to complete' : 'XP para completar'}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default LevelBadge;
