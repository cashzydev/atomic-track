import React from 'react';
import { Settings, LogOut, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { SimpleAvatar } from '@/components/SimpleAvatar';
import { StatCard } from '@/components/StatCard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    name: string;
    email?: string;
    created_at?: string;
    xp?: number;
    level?: number;
  };
  stats: {
    totalCompletions: number;
    currentStreak: number;
    longestStreak: number;
    activeHabits: number;
  };
  xpForNextLevel?: number;
  xpInCurrentLevel?: number;
  xpNeededForNext?: number;
}

/**
 * Sheet de perfil com nível + estatísticas reais
 * Combina gamificação sutil com dados úteis
 * 
 * Características:
 * - Sistema de nível com progress bar
 * - Stats reais (completions, streaks, hábitos)
 * - Design limpo e mobile-first
 * - Actions no footer fixo
 */
export const ProfileSheet = ({ 
  open, 
  onOpenChange, 
  user, 
  stats,
  xpForNextLevel = 0,
  xpInCurrentLevel = 0,
  xpNeededForNext = 1
}: ProfileSheetProps) => {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        
        {/* HEADER MINIMALISTA */}
        <SheetHeader className="pb-6 border-b">
          <div className="flex items-center gap-4">
            <SimpleAvatar
              name={user.name}
              email={user.email}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg truncate">
                {user.name}
              </SheetTitle>
              <SheetDescription className="text-sm truncate">
                {user.email}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        {/* CONTEÚDO SCROLLÁVEL */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          
          {/* SISTEMA DE NÍVEL */}
          <section>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Trophy className="w-3 h-3" />
              Progresso de Nível
            </h3>
            <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl p-4 border border-violet-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-violet-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Nível {user.level || 1}</p>
                    <p className="text-xs text-muted-foreground">{user.xp || 0} XP total</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Próximo nível</p>
                  <p className="font-semibold text-sm">{xpInCurrentLevel}/{xpNeededForNext} XP</p>
                </div>
              </div>
              <Progress 
                value={xpNeededForNext > 0 ? (xpInCurrentLevel / xpNeededForNext) * 100 : 0} 
                className="h-3 bg-muted/30"
              />
            </div>
          </section>
          
          {/* STATS GRID - DADOS REAIS */}
          <section>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Suas Estatísticas
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Completados"
                value={stats.totalCompletions}
              />
              <StatCard
                label="Sequência Atual"
                value={`${stats.currentStreak} dias`}
                highlight={stats.currentStreak > 0}
              />
              <StatCard
                label="Melhor Sequência"
                value={`${stats.longestStreak} dias`}
              />
              <StatCard
                label="Hábitos Ativos"
                value={stats.activeHabits}
              />
            </div>
          </section>
          
          {/* MEMBER SINCE */}
          {user.created_at && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              Membro desde{' '}
              {format(new Date(user.created_at), 'MMMM yyyy', { locale: ptBR })}
            </p>
          )}
        </div>
        
        {/* FOOTER FIXO - ACTIONS */}
        <div className="pt-6 border-t space-y-2 flex-shrink-0">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => {
              onOpenChange(false);
              navigate('/settings');
            }}
          >
            <Settings className="w-4 h-4" />
            Configurações
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
        
      </SheetContent>
    </Sheet>
  );
};
