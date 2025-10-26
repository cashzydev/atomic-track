import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getIconComponent } from '@/config/icon-map';
import { Button } from '@/components/ui/button';
import { format, isToday, isSameDay, subDays, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Habit {
  id: number;
  title: string;
  icon: string;
}

interface Completion {
  habit_id: number;
  date: string;
  percentage: number;
}

interface HabitTimelineFilteredProps {
  habits: Habit[];
  completions: Completion[];
  onDayClick?: (date: Date) => void;
  className?: string;
}

type FilterPeriod = '7d' | '14d' | '30d' | '90d';

const FILTER_OPTIONS: { value: FilterPeriod; label: string; icon: React.ComponentType<any> }[] = [
  { value: '7d', label: '7 dias', icon: Calendar },
  { value: '14d', label: '14 dias', icon: Clock },
  { value: '30d', label: '30 dias', icon: TrendingUp },
  { value: '90d', label: '90 dias', icon: BarChart3 },
];

export const HabitTimelineFiltered: React.FC<HabitTimelineFilteredProps> = ({
  habits,
  completions,
  onDayClick,
  className
}) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterPeriod>('7d');

  // Gerar dias baseado no filtro selecionado
  const days = useMemo(() => {
    const today = new Date();
    const daysBack = parseInt(selectedFilter.replace('d', ''));
    const start = subDays(today, daysBack - 1);
    const end = today;
    
    return eachDayOfInterval({ start, end }).reverse(); // Mais recente primeiro
  }, [selectedFilter]);

  const isHabitCompletedOnDay = (habitId: number, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return completions.some(c => c.habit_id === habitId && c.date === dateStr && c.percentage >= 100);
  };

  const getDayStats = (date: Date) => {
    const completedHabits = habits.filter(h => isHabitCompletedOnDay(h.id, date));
    const completedCount = completedHabits.length;
    const totalCount = habits.length;
    const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    return {
      completedHabits,
      completedCount,
      totalCount,
      percentage
    };
  };

  const getOverallStats = () => {
    const totalDays = days.length;
    const completedDays = days.filter(day => {
      const stats = getDayStats(day);
      return stats.percentage === 100;
    }).length;
    
    const averageCompletion = days.reduce((sum, day) => {
      return sum + getDayStats(day).percentage;
    }, 0) / totalDays;

    return {
      totalDays,
      completedDays,
      averageCompletion,
      streak: calculateStreak()
    };
  };

  const calculateStreak = () => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < days.length; i++) {
      const day = subDays(today, i);
      const stats = getDayStats(day);
      
      if (stats.percentage === 100) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const overallStats = getOverallStats();

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Header com filtros */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Histórico</h3>
          <div className="text-sm text-muted-foreground">
            {overallStats.completedDays}/{overallStats.totalDays} dias completos
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {FILTER_OPTIONS.map((option) => {
            const IconComponent = option.icon;
            const isSelected = selectedFilter === option.value;
            
            return (
              <Button
                key={option.value}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(option.value)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap transition-all duration-200 flex-shrink-0",
                  isSelected 
                    ? "bg-violet-500 hover:bg-violet-600 text-white shadow-[0_2px_8px_rgba(139,92,246,0.3)]" 
                    : "hover:border-violet-500/50 hover:text-violet-500"
                )}
              >
                <IconComponent className="w-3 h-3" />
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Estatísticas gerais */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-medium text-foreground">Sequência</span>
          </div>
          <div className="text-lg font-bold text-violet-600 dark:text-violet-400">
            {overallStats.streak} dias
          </div>
        </div>
        
        <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-foreground">Média</span>
          </div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {Math.round(overallStats.averageCompletion)}%
          </div>
        </div>
      </div>

      {/* Timeline vertical */}
      <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-hide">
        {days.map((day, index) => {
          const stats = getDayStats(day);
          const isCurrentDay = isToday(day);
          const isPast = day < new Date() && !isCurrentDay;
          const isFuture = day > new Date();

          return (
            <motion.div
              key={day.toISOString()}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "p-5 rounded-xl border transition-all duration-200 cursor-pointer",
                isCurrentDay 
                  ? "border-violet-500 bg-violet-500/10 ring-2 ring-violet-500/20" 
                  : "border-border hover:border-violet-500/30 hover:bg-muted/30",
                isFuture && "opacity-50 cursor-not-allowed",
                stats.percentage === 100 && !isFuture && "border-emerald-500/50 bg-emerald-500/5"
              )}
              onClick={() => !isFuture && onDayClick?.(day)}
            >
              <div className="flex items-center justify-between mb-3">
                {/* Data */}
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className={cn(
                      "text-sm font-semibold",
                      isCurrentDay ? "text-violet-600 dark:text-violet-400" : "text-foreground"
                    )}>
                      {format(day, 'dd')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(day, 'MMM', { locale: ptBR })}
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {format(day, 'EEEE', { locale: ptBR })}
                  </div>
                </div>

                {/* Progresso */}
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">
                      {stats.completedCount}/{stats.totalCount}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(stats.percentage)}%
                    </div>
                  </div>
                  
                  {/* Barra de progresso circular pequena */}
                  <div className="relative w-8 h-8">
                    <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="8"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-muted/30"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="8"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 8}`}
                        strokeDashoffset={`${2 * Math.PI * 8 * (1 - stats.percentage / 100)}`}
                        className={cn(
                          "transition-all duration-500",
                          stats.percentage === 100 ? "text-emerald-500" : "text-violet-500"
                        )}
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Hábitos completados */}
              {stats.completedHabits.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    Hábitos completados:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stats.completedHabits.map((habit) => {
                      const IconComponent = getIconComponent(habit.icon);
                      return (
                        <div
                          key={habit.id}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                        >
                          <IconComponent className="w-3 h-3 text-emerald-500" />
                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            {habit.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dia completo */}
              {stats.percentage === 100 && !isFuture && (
                <div className="flex items-center gap-2 mt-2 text-emerald-600 dark:text-emerald-400">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium">Dia completo! ✨</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default HabitTimelineFiltered;
