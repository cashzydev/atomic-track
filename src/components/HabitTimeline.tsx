import React, { memo, useMemo, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getIconComponent } from '@/config/icon-map';

interface TimelineHabit {
  id: number;
  title: string;
  icon: string;
  completed: boolean;
  completedAt?: string;
}

interface HabitTimelineProps {
  habits: TimelineHabit[];
  className?: string;
}

// Componente memoizado para cada item da timeline
const TimelineItem = memo<{
  habit: TimelineHabit;
  index: number;
  isLastCompleted: boolean;
  lastCompletedIndex: number;
}>(({ habit, index, isLastCompleted, lastCompletedIndex }) => {
  const IconComponent = getIconComponent(habit.icon);
  const isCompleted = habit.completed;
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      key={habit.id}
      className="relative group flex items-center gap-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: shouldReduceMotion ? 0.1 : 0.5, 
        delay: shouldReduceMotion ? 0 : index * 0.1,
        ease: "easeOut"
      }}
    >
      {/* Bolinha do hábito - tamanho uniforme */}
      <div
        className={cn(
          "relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
          "border-2 border-transparent shadow-lg z-10",
          isCompleted
            ? "bg-violet-500 text-white border-violet-500 shadow-[0_4px_16px_rgba(139,92,246,0.4)]"
            : "bg-muted text-muted-foreground border-muted/50 hover:border-violet-500/30 hover:bg-muted/80"
        )}
      >
        <IconComponent className="w-4 h-4" />
        
        {/* Indicador de check no canto superior direito */}
        {isCompleted && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-background shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Check className="w-2.5 h-2.5 text-white" />
          </motion.div>
        )}
        
        {/* Efeito de pulso para o último hábito completado */}
        {isLastCompleted && !shouldReduceMotion && (
          <motion.div
            className="absolute inset-0 rounded-full bg-violet-500 opacity-20"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Informações do hábito - Layout horizontal */}
      <div className="flex-1 flex items-center justify-between min-w-0">
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-medium transition-colors duration-200 text-sm truncate",
            isCompleted ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground"
          )}>
            {habit.title}
          </p>
        </div>
        
        {/* Hora apenas para hábitos completados */}
        {isCompleted && habit.completedAt && (
          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
            {new Date(habit.completedAt).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        )}
      </div>

      {/* Tooltip minimalista */}
      <div className="hidden sm:block absolute left-full ml-3 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
        <div className="font-medium">{habit.title}</div>
        {isCompleted ? (
          <div className="text-emerald-500">
            ✓ Concluído
          </div>
        ) : (
          <div className="text-muted-foreground">Pendente</div>
        )}
      </div>
    </motion.div>
  );
});

TimelineItem.displayName = 'TimelineItem';

export const HabitTimeline = memo<HabitTimelineProps>(({ habits, className }) => {
  // Memoizar cálculos pesados para evitar re-computação desnecessária
  const { sortedHabits, completedCount, totalCount, lastCompletedIndex } = useMemo(() => {
    if (!habits || habits.length === 0) {
      return {
        sortedHabits: [],
        completedCount: 0,
        totalCount: 0,
        lastCompletedIndex: -1
      };
    }

    // Ordenar hábitos cronologicamente (completados primeiro, depois pendentes)
    const sorted = [...habits].sort((a, b) => {
      // Se ambos são completados, ordenar por horário de conclusão
      if (a.completed && b.completed) {
        return new Date(a.completedAt || 0).getTime() - new Date(b.completedAt || 0).getTime();
      }
      // Se apenas um é completado, o completado vem primeiro
      if (a.completed && !b.completed) return -1;
      if (!a.completed && b.completed) return 1;
      // Se ambos são pendentes, manter ordem original
      return 0;
    });

    // Calcular estatísticas
    const completed = sorted.filter(habit => habit.completed).length;
    const total = sorted.length;
    
    // Encontrar o último hábito completado para a linha de progresso
    const lastCompleted = sorted.map((habit, index) => ({ habit, index }))
      .filter(({ habit }) => habit.completed)
      .pop()?.index ?? -1;

    return {
      sortedHabits: sorted,
      completedCount: completed,
      totalCount: total,
      lastCompletedIndex: lastCompleted
    };
  }, [habits]);

  if (!habits || habits.length === 0) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <p className="text-muted-foreground text-sm">Nenhum hábito para exibir</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Header minimalista */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Timeline</h3>
        <span className="text-sm text-muted-foreground font-medium">
          {completedCount}/{totalCount}
        </span>
      </div>

      {/* Timeline Vertical Container */}
      <div className="relative">
        {/* Linha de Fundo Vertical (Cinza) */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-muted/30" />
        
        {/* Linha de Progresso Vertical (Roxa) */}
        {completedCount > 0 && (
          <div
            className="absolute left-5 w-0.5 bg-gradient-to-b from-violet-500 to-purple-500"
            style={{ 
              height: lastCompletedIndex === -1 
                ? '0%' 
                : `${((lastCompletedIndex + 1) / totalCount) * 100}%`
            }}
          />
        )}

        {/* Container dos hábitos - Layout vertical */}
        <div className="relative space-y-4 sm:space-y-6">
          {sortedHabits.map((habit, index) => (
            <TimelineItem
              key={habit.id}
              habit={habit}
              index={index}
              isLastCompleted={habit.completed && index === lastCompletedIndex}
              lastCompletedIndex={lastCompletedIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

HabitTimeline.displayName = 'HabitTimeline';