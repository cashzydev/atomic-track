import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

/**
 * Card de estatística minimalista
 * Foca em dados reais sem gamificação excessiva
 * 
 * Características:
 * - Design limpo e legível
 * - Suporte a highlight para métricas importantes
 * - Responsivo e acessível
 */
export const StatCard = ({ label, value, highlight }: StatCardProps) => {
  return (
    <div className={cn(
      "p-4 rounded-lg border transition-colors",
      highlight 
        ? "bg-primary/5 border-primary/20" 
        : "bg-muted/30 border-border"
    )}>
      <p className="text-xs text-muted-foreground font-medium mb-2">
        {label}
      </p>
      <p className={cn(
        "text-2xl font-bold",
        highlight ? "text-primary" : "text-foreground"
      )}>
        {value}
      </p>
    </div>
  );
};
