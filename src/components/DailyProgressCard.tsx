import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Flame, Zap, Circle, Clock, Check } from 'lucide-react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';
import { getIconComponent } from '@/config/icon-map';

interface HabitTimelineItem {
  id: number;
  title: string;
  icon: string;
  completed: boolean;
  completedAt?: string;
}

interface DailyProgressCardProps {
  completedToday: number;
  totalHabits: number;
  activeStreaks: number;
  xpEarned: number;
  habits?: HabitTimelineItem[];
}

export const DailyProgressCard: React.FC<DailyProgressCardProps> = ({
  completedToday,
  totalHabits,
  activeStreaks,
  xpEarned,
  habits = []
}) => {
  const progressPercentage = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Linha do Tempo do Dia</h2>
          <span className="text-2xl font-bold text-primary">
            {Math.round(progressPercentage)}%
          </span>
        </div>

        {/* Timeline / Habit tokens */}
        {habits.length > 0 && (
          <div className="relative">
            {/* Top progress summary connected to tokens */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Progresso Diário</h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
                <div className="w-44 md:w-60">
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              </div>
            </div>

            {/* tokens container: wrap on small screens, horizontal scroll if many items */}
            <div className="flex flex-wrap gap-3 md:gap-4">
              {habits.map((habit, index) => {
                const IconComponent = getIconComponent(habit.icon);
                const nextIndex = habits.findIndex(h => !h.completed);
                const status: 'completed' | 'active' | 'future' =
                  habit.completed ? 'completed' : (index === nextIndex ? 'active' : 'future');

                return (
                  <motion.button
                    key={habit.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg min-w-[120px] md:min-w-[140px] neuro-interactive',
                      status === 'completed'
                        ? 'bg-emerald-600/10 border border-emerald-600/20'
                        : status === 'active'
                        ? 'bg-violet-700/10 border border-violet-500/20'
                        : 'bg-card/40 border border-border'
                    )}
                    aria-pressed={status === 'active'}
                    onClick={() => { /* open detail or focus — placeholder for future */ }}
                  >
                    <div className={cn('flex items-center justify-center rounded-full', 'w-10 h-10') +
                      (status === 'completed' ? ' bg-emerald-500 text-white' : status === 'active' ? ' bg-violet-500/90 text-white' : ' bg-slate-700/30 text-slate-300')}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn('text-sm truncate', status === 'future' ? 'text-muted-foreground' : 'text-foreground font-semibold')}>{habit.title}</p>
                        {status === 'completed' && <Check className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {habit.completed && habit.completedAt
                          ? new Date(habit.completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex flex-col items-center p-3 rounded-lg bg-primary/5 border border-primary/10"
          >
            <CheckCircle2 className="w-5 h-5 text-primary mb-2" />
            <span className="text-xl font-bold text-foreground">{completedToday}</span>
            <span className="text-xs text-muted-foreground">Completados</span>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex flex-col items-center p-3 rounded-lg bg-orange-500/5 border border-orange-500/10"
          >
            <Flame className="w-5 h-5 text-orange-500 mb-2" />
            <span className="text-xl font-bold text-foreground">{activeStreaks}</span>
            <span className="text-xs text-muted-foreground">Streaks</span>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex flex-col items-center p-3 rounded-lg bg-primary/5 border border-primary/10"
          >
            <Zap className="w-5 h-5 text-primary mb-2" />
            <span className="text-xl font-bold text-foreground">{xpEarned}</span>
            <span className="text-xs text-muted-foreground">XP</span>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};
