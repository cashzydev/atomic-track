import React, { useState } from 'react';
import { CheckCircle2, Search, GripVertical, Plus, Target, Sparkles, Square, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import HabitCardCompact from '../HabitCardCompact';
import EmptyStateCard from '@/components/EmptyStateCard';
import { triggerMiniAtomicAnimation } from '@/utils/atomicParticles';
interface Habit {
  id: number;
  title: string;
  icon: string;
  status: string;
  streak: number;
  where_location: string;
  when_time: string;
  goal_current: number;
  goal_target: number;
  goal_unit: string;
  completedToday?: boolean;
}
interface KanbanViewProps {
  habits: Habit[];
  onComplete: (habitId: number) => void;
  onAddHabit: () => void;
  onUndo?: (habitId: number) => void;
}
const KanbanView: React.FC<KanbanViewProps> = ({
  habits,
  onComplete,
  onAddHabit,
  onUndo
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [completingId, setCompletingId] = useState<number | null>(null);
  const handleComplete = (habitId: number) => {
    setCompletingId(habitId);

    // Mini atomic animation
    triggerMiniAtomicAnimation();

    // Slight delay for visual feedback
    setTimeout(() => {
      onComplete(habitId);
      setCompletingId(null);
    }, 300);
  };

  // Filtrar hábitos baseado em completedToday
  const filteredHabits = habits.filter(h => h.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const pendingHabits = filteredHabits.filter(h => !h.completedToday);
  const completedHabits = filteredHabits.filter(h => h.completedToday);
  const completionPercentage = habits.length > 0 ? Math.round(completedHabits.length / habits.length * 100) : 0;
  
  // Empty state when no habits exist
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
  
  return <div className="space-y-6">
      {/* Progress Summary */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {completedHabits.length}/{habits.length} Completados
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {completionPercentage}% do progresso diário
            </p>
          </div>
          {completionPercentage === 100 && (
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          )}
        </div>
        
        <Progress value={completionPercentage} className="h-2" />
      </motion.div>

      {/* Search Bar removed: icon caused visual clutter on small screens */}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Column */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h2 className="text-lg font-semibold text-foreground">Pendentes</h2>
            </div>
            <Badge variant="secondary">{pendingHabits.length}</Badge>
          </div>
          
          <AnimatePresence mode="popLayout">
            {pendingHabits.length > 0 ? <div className="space-y-3">
                {pendingHabits.map(habit => <motion.div key={habit.id} layout initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              x: 100,
              scale: 0.8
            }} transition={{
              duration: 0.3
            }} className="group relative">
                    <HabitCardCompact habit={habit} onComplete={() => handleComplete(habit.id)} />
                  </motion.div>)}
              </div> : <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-sm font-medium text-foreground">Tudo concluído!</p>
                <p className="text-xs text-muted-foreground mt-1">Excelente trabalho hoje!</p>
              </div>}
          </AnimatePresence>
        </motion.div>

        {/* Completed Column */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <h2 className="text-lg font-semibold text-foreground">Completados</h2>
            </div>
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {completedHabits.length}
            </Badge>
          </div>
          
          <AnimatePresence mode="popLayout">
            {completedHabits.length > 0 ? <div className="space-y-3">
                {completedHabits.map((habit, index) => <motion.div key={habit.id} layout initial={{
              opacity: 0,
              x: -20
            }} animate={{
              opacity: 1,
              x: 0
            }} exit={{
              opacity: 0,
              scale: 0.8
            }} transition={{
              duration: 0.3,
              delay: index * 0.05
            }}>
                    <HabitCardCompact 
                      habit={habit} 
                      onUndo={onUndo ? () => onUndo(habit.id) : undefined}
                    />
                  </motion.div>)}
              </div> : <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Square className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Nenhum hábito completado ainda</p>
              </div>}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>;
};
export default KanbanView;