import React from 'react';
import { motion } from 'framer-motion';
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

export const HabitTimeline: React.FC<HabitTimelineProps> = ({ habits, className }) => {
  if (!habits || habits.length === 0) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <p className="text-muted-foreground text-sm">Nenhum hábito para exibir</p>
      </div>
    );
  }

  // Ordenar hábitos cronologicamente (completados primeiro, depois pendentes)
  const sortedHabits = [...habits].sort((a, b) => {
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
  const completedCount = sortedHabits.filter(habit => habit.completed).length;
  const totalCount = sortedHabits.length;
  
  // Encontrar o último hábito completado para a linha de progresso
  const lastCompletedIndex = sortedHabits.findLastIndex(habit => habit.completed);

  // Função para calcular posicionamento dinâmico
  const getDynamicPositioning = (habitCount: number) => {
    if (habitCount === 1) {
      return {
        containerClass: "flex justify-center",
        habitClass: "flex-col items-center",
        spacing: "0"
      };
    } else if (habitCount === 2) {
      return {
        containerClass: "flex justify-between",
        habitClass: "flex-col items-center",
        spacing: "gap-8"
      };
    } else if (habitCount <= 4) {
      return {
        containerClass: "flex justify-between",
        habitClass: "flex-col items-center",
        spacing: "gap-4"
      };
    } else {
      return {
        containerClass: "flex justify-between",
        habitClass: "flex-col items-center",
        spacing: "gap-2"
      };
    }
  };

  const positioning = getDynamicPositioning(totalCount);

  return (
    <div className={cn("w-full", className)}>
      {/* Header com estatísticas */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Linha do Tempo</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {completedCount}/{totalCount}
          </span>
          <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / totalCount) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="relative">
        {/* Mobile: Layout Horizontal */}
        <div className="block sm:hidden">
          {/* Linha de Fundo (Cinza) - Horizontal passando através de todos os hábitos */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted/30 -translate-y-1/2" />
          
          {/* Linha de Progresso (Roxa) - Preenchimento dinâmico horizontal */}
          {completedCount > 0 && (
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500 -translate-y-1/2"
        style={{ 
                width: lastCompletedIndex === -1 
                  ? '0%' 
                  : `${((lastCompletedIndex + 1) / totalCount) * 100}%`
              }}
            />
          )}

          {/* Container dos hábitos - Layout horizontal dinâmico */}
          <div className={cn(
            "relative flex items-center py-6 px-4",
            positioning.containerClass,
            positioning.spacing
          )}>
            {sortedHabits.map((habit, index) => {
              const IconComponent = getIconComponent(habit.icon);
              const isCompleted = habit.completed;
              const isLastCompleted = isCompleted && index === lastCompletedIndex;
              const isFirstIncomplete = !isCompleted && index === lastCompletedIndex + 1;

                  return (
                <motion.div
                  key={habit.id}
                  className={cn(
                    "relative group z-10",
                    positioning.habitClass
                  )}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                >
                  {/* Bolinha do hábito */}
                  <div
                            className={cn(
                      "relative rounded-full flex items-center justify-center transition-all duration-300",
                      "border-2 border-transparent shadow-lg",
                      // Tamanho dinâmico baseado na quantidade de hábitos
                      totalCount === 1 ? "w-16 h-16" :
                      totalCount === 2 ? "w-14 h-14" :
                      totalCount <= 4 ? "w-12 h-12" :
                      "w-10 h-10",
                              isCompleted 
                        ? "bg-violet-500 text-white border-violet-500 shadow-[0_4px_16px_rgba(139,92,246,0.4)]"
                        : "bg-muted text-muted-foreground border-muted/50 hover:border-violet-500/30 hover:bg-muted/80"
                    )}
                  >
                    <IconComponent className={cn(
                      // Tamanho do ícone baseado no tamanho da bolinha
                      totalCount === 1 ? "w-7 h-7" :
                      totalCount === 2 ? "w-6 h-6" :
                      totalCount <= 4 ? "w-5 h-5" :
                      "w-4 h-4"
                    )} />
                    
                    {/* Indicador de check para hábitos completos */}
                    {isCompleted && (
                      <motion.div
                        className={cn(
                          "absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center",
                          "border-2 border-background shadow-lg"
                        )}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                      >
                        <Check className="w-2.5 h-2.5 text-white" />
                      </motion.div>
                    )}
                    
                    {/* Efeito de pulso para o último hábito completado */}
                    {isLastCompleted && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-violet-500 opacity-20"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                          </div>

                  {/* Label do hábito */}
                  <div className="mt-3 text-center max-w-20">
                    <p className={cn(
                      "font-medium transition-colors duration-200 text-sm",
                      isCompleted ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground"
                    )}>
                      {habit.title}
                    </p>
                    
                    {/* Timestamp para hábitos completos - minimalista */}
                    {isCompleted && habit.completedAt && (
                      <p className="mt-1 text-xs text-muted-foreground/60">
                        {new Date(habit.completedAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>

                  {/* Tooltip no hover - apenas em desktop */}
                  <div className={cn(
                    "hidden sm:block absolute top-1/2 -translate-y-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10",
                    index % 2 === 0 ? "left-full ml-3" : "right-full mr-3"
                  )}>
                    <div className="font-medium">{habit.title}</div>
                    {isCompleted ? (
                      <div className="text-emerald-500 font-medium">
                        ✓ Concluído às {habit.completedAt && new Date(habit.completedAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    ) : (
                      <div className="text-muted-foreground">Pendente</div>
                    )}
                  </div>
                </motion.div>
                  );
                })}
          </div>
        </div>

        {/* Desktop: Layout Horizontal */}
        <div className="hidden sm:block">
          {/* Linha de Fundo (Cinza) - Horizontal passando através de todos os hábitos */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted/30 -translate-y-1/2" />
          
          {/* Linha de Progresso (Roxa) - Preenchimento dinâmico horizontal */}
          {completedCount > 0 && (
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500 -translate-y-1/2"
              style={{ 
                width: lastCompletedIndex === -1 
                  ? '0%' 
                  : `${((lastCompletedIndex + 1) / totalCount) * 100}%`
              }}
            />
          )}

          {/* Container dos hábitos - Layout horizontal dinâmico */}
          <div className={cn(
            "relative flex items-center py-6 px-6",
            positioning.containerClass,
            positioning.spacing
          )}>
            {sortedHabits.map((habit, index) => {
              const IconComponent = getIconComponent(habit.icon);
              const isCompleted = habit.completed;
              const isLastCompleted = isCompleted && index === lastCompletedIndex;
              const isFirstIncomplete = !isCompleted && index === lastCompletedIndex + 1;

              return (
                <motion.div
                  key={habit.id}
                  className={cn(
                    "relative group z-10",
                    positioning.habitClass
                  )}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                >
                  {/* Bolinha do hábito */}
                  <div
                    className={cn(
                      "relative rounded-full flex items-center justify-center transition-all duration-300",
                      "border-2 border-transparent shadow-lg",
                      // Tamanho dinâmico baseado na quantidade de hábitos
                      totalCount === 1 ? "w-16 h-16" :
                      totalCount === 2 ? "w-14 h-14" :
                      totalCount <= 4 ? "w-12 h-12" :
                      "w-10 h-10",
                      isCompleted
                        ? "bg-violet-500 text-white border-violet-500 shadow-[0_4px_16px_rgba(139,92,246,0.4)]"
                        : "bg-muted text-muted-foreground border-muted/50 hover:border-violet-500/30 hover:bg-muted/80"
                    )}
                  >
                    <IconComponent className={cn(
                      // Tamanho do ícone baseado no tamanho da bolinha
                      totalCount === 1 ? "w-7 h-7" :
                      totalCount === 2 ? "w-6 h-6" :
                      totalCount <= 4 ? "w-5 h-5" :
                      "w-4 h-4"
                    )} />
                    
                    {/* Indicador de check para hábitos completos */}
                    {isCompleted && (
                      <motion.div
                        className={cn(
                          "absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center",
                          "border-2 border-background shadow-lg"
                        )}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                      >
                        <Check className="w-2.5 h-2.5 text-white" />
                      </motion.div>
                    )}
                    
                    {/* Efeito de pulso para o último hábito completado */}
                    {isLastCompleted && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-violet-500 opacity-20"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>

                  {/* Label do hábito */}
                  <div className="mt-3 text-center max-w-20">
                    <p className={cn(
                      "font-medium transition-colors duration-200 text-sm",
                      isCompleted ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground"
                    )}>
                      {habit.title}
                    </p>
                    
                    {/* Timestamp para hábitos completos - minimalista */}
                    {isCompleted && habit.completedAt && (
                      <p className="mt-1 text-xs text-muted-foreground/60">
                        {new Date(habit.completedAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                )}
              </div>

                  {/* Tooltip no hover - apenas em desktop */}
                  <div className="hidden sm:block absolute bottom-full mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    <div className="font-medium">{habit.title}</div>
                    {isCompleted ? (
                      <div className="text-emerald-500 font-medium">
                        ✓ Concluído às {habit.completedAt && new Date(habit.completedAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                </div>
                    ) : (
                      <div className="text-muted-foreground">Pendente</div>
              )}
                  </div>
                </motion.div>
          );
        })}
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-4 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-violet-500" />
          <span className="text-muted-foreground">Concluído</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-muted" />
          <span className="text-muted-foreground">Pendente</span>
        </div>
      </div>
    </div>
  );
};