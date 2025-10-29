import React from 'react';
import { CheckCircle2, Flame, Target } from 'lucide-react';
import { HabitCard } from '@/components/habits/HabitCard';
import EmptyStateCard from '@/components/EmptyStateCard';
import { motion, AnimatePresence } from 'framer-motion';
import type { Habit } from '@/types/habit';

interface ListViewProps {
  habits: Habit[];
  onComplete: (habitId: number) => void;
  onAddHabit: () => void;
  onUndo?: (habitId: number) => void;
  toggleElement?: React.ReactNode;
}

export const ListView: React.FC<ListViewProps> = ({
  habits,
  onComplete,
  onAddHabit,
  onUndo,
  toggleElement
}) => {
  // Calcular estatísticas
  const completedToday = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;
  const completionPercentage = totalHabits > 0 
    ? Math.round((completedToday / totalHabits) * 100) 
    : 0;
  const activeStreaks = habits.filter(h => h.streak > 0).length;

  // Empty state quando não há hábitos
  if (habits.length === 0) {
    return (
      <EmptyStateCard
        icon={Target}
        title="Nenhum hábito ainda"
        description="Comece sua jornada atômica criando seu primeiro hábito. Pequenos passos levam a grandes transformações."
        actionLabel="Criar Primeiro Hábito"
        onAction={onAddHabit}
        tip="Dica: Comece com algo absurdamente fácil. É melhor fazer 1 flexão por dia do que planejar uma rotina de treino perfeita que você nunca começa."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Container principal com métricas */}
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-violet-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Card principal - Neuromorfismo sem bordas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-card/50 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)] overflow-hidden"
        >
          {/* Background gradiente sutil */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/3 to-transparent opacity-50" />
          
          <div className="relative space-y-6">
            {/* Header com título */}
            <div className="flex items-center justify-between pb-3 border-b border-border/20">
              <h3 className="text-lg font-semibold text-foreground">Hábitos</h3>
              {toggleElement && (
                <div>
                  {toggleElement}
                </div>
              )}
            </div>
            {/* Métricas Visuais */}
            <div className="grid grid-cols-3 gap-4 pt-1">
              <div className="text-center p-4 rounded-xl bg-slate-800/30 backdrop-blur-sm shadow-[0_2px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" strokeWidth={2} />
                </div>
                <div className="text-xl font-bold text-foreground">{completedToday}/{totalHabits}</div>
                <div className="text-xs text-muted-foreground">Completados</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-slate-800/30 backdrop-blur-sm shadow-[0_2px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
                <div className="flex items-center justify-center mb-2">
                  <Flame className="w-4 h-4 text-amber-400" strokeWidth={2} />
                </div>
                <div className="text-xl font-bold text-amber-400">{activeStreaks}</div>
                <div className="text-xs text-muted-foreground">Streaks</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-slate-800/30 backdrop-blur-sm shadow-[0_2px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-4 h-4 text-violet-400" strokeWidth={2} />
                </div>
                <div className="text-xl font-bold text-violet-400">{completionPercentage}%</div>
                <div className="text-xs text-muted-foreground">Taxa</div>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Progresso de Hoje</span>
                <span className="text-violet-400 font-bold">{completionPercentage}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                />
              </div>
            </div>

            {/* Lista de Hábitos */}
            <div className="space-y-2.5 pt-2">
              <AnimatePresence mode="popLayout">
                {habits.map((habit, index) => (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <HabitCard
                      habit={habit}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      isDashboard={true}
                      onToggle={(id) => {
                        if (habit.completedToday && onUndo) {
                          onUndo(id);
                        } else {
                          onComplete(id);
                        }
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

