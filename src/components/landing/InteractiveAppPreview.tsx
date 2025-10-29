import React from 'react';
import { Info, Atom, Target, Flame, CheckCircle2 } from 'lucide-react';
import { DemoHabitsProvider, useDemoHabits } from './DemoHabitsProvider';
import { HabitCard } from '@/components/habits/HabitCard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const PreviewContent: React.FC = () => {
  const { habits, toggleHabit } = useDemoHabits();

  return (
    <div className="space-y-6">
      {/* Header explicativo */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-foreground mb-1">
            Preview interativa
          </p>
          <p className="text-muted-foreground">
            Experimente clicar nos hábitos abaixo. Esta é a interface 
            real do atomicTrack, sem complexidade desnecessária.
          </p>
        </div>
      </div>

      {/* Container que simula o app real */}
      <div className="relative">
        {/* Efeito de profundidade sutil */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-2xl blur-xl" />

        {/* Cards de hábitos REAIS */}
        <div className="relative space-y-3 p-6 rounded-2xl border bg-background/50 backdrop-blur">
          {habits.map((habit) => (
            <div 
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              className="cursor-pointer hover:scale-[1.01] transition-transform"
            >
              <HabitCard
                habit={{
                  ...habit,
                  id: parseInt(habit.id.replace('demo-', '')) || 1,
                } as any}
                onEdit={() => {}}
                onDelete={() => {}}
                isDemo={true}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dica de interação */}
      <p className="text-center text-sm text-muted-foreground">
        👆 Clique para marcar como completo ou ajuste o progresso
      </p>
    </div>
  );
};

// Versão compacta melhorada para hero
export const CompactPreviewContent: React.FC = () => {
  const { habits, toggleHabit } = useDemoHabits();
  
  // Calcular estatísticas
  const completedToday = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;
  const completionPercentage = totalHabits > 0 
    ? Math.round((completedToday / totalHabits) * 100) 
    : 0;
  const activeStreaks = habits.filter(h => h.streak > 0).length;
  const todayFormatted = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div className="space-y-4">
      {/* Container principal com destaque visual */}
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-violet-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Card principal */}
        <div className="relative bg-card rounded-2xl border border-border/50 p-5 shadow-2xl backdrop-blur-sm overflow-hidden">
          {/* Background gradiente sutil */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/3 to-transparent opacity-50" />
          
          <div className="relative space-y-5">
            {/* Header do Dashboard */}
            <div className="space-y-3 pb-4 border-b border-border/50">
              <p className="text-xs text-muted-foreground/70 font-medium">
                {todayFormatted}
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center border border-violet-500/30">
                  <Atom className="w-5 h-5 text-violet-400" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Olá Visitante
                  </h3>
                  <p className="text-xs text-muted-foreground/80">
                    Cada ação é um voto para quem você está se tornando
                  </p>
                </div>
              </div>
            </div>

            {/* Métricas Visuais */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <div className="flex items-center justify-center mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
                </div>
                <div className="text-lg font-bold text-foreground">{completedToday}/{totalHabits}</div>
                <div className="text-[10px] text-muted-foreground">Completados</div>
              </div>
              <div className="text-center p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <div className="flex items-center justify-center mb-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" strokeWidth={2} />
                </div>
                <div className="text-lg font-bold text-amber-400">{activeStreaks}</div>
                <div className="text-[10px] text-muted-foreground">Streaks</div>
              </div>
              <div className="text-center p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <div className="flex items-center justify-center mb-1">
                  <Target className="w-3.5 h-3.5 text-violet-400" strokeWidth={2} />
                </div>
                <div className="text-lg font-bold text-violet-400">{completionPercentage}%</div>
                <div className="text-[10px] text-muted-foreground">Taxa</div>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Progresso de Hoje</span>
                <span className="text-violet-400 font-bold">{completionPercentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Cards de Hábitos */}
            <div className="space-y-2.5 pt-2">
              {habits.map((habit) => (
                <div 
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className="cursor-pointer hover:scale-[1.02] transition-all duration-200"
                >
                  <HabitCard
                    habit={{
                      ...habit,
                      id: parseInt(habit.id.replace('demo-', '')) || 1,
                    } as any}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    isDemo={true}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dica de interação melhorada - oculto no mobile */}
      <div className="hidden md:flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-800/30 border border-slate-700/50">
          <Info className="w-3 h-3" strokeWidth={2} />
          <span>Clique nos hábitos para experimentar</span>
        </div>
      </div>
    </div>
  );
};

export const InteractiveAppPreview: React.FC = () => {
  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Veja como funciona
          </h2>
          <p className="text-muted-foreground">
            Interface real do atomicTrack. Simples, focada, sem distrações.
          </p>
        </div>

        <DemoHabitsProvider>
          <PreviewContent />
        </DemoHabitsProvider>
      </div>
    </section>
  );
};

export const CompactInteractivePreview: React.FC = () => {
  return (
    <DemoHabitsProvider>
      <CompactPreviewContent />
    </DemoHabitsProvider>
  );
};
