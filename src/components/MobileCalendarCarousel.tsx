import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getIconComponent } from '@/config/icon-map';
import { Button } from '@/components/ui/button';
import { format, isToday, isSameDay, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
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

interface MobileCalendarCarouselProps {
  habits: Habit[];
  completions: Completion[];
  onDayClick?: (date: Date) => void;
  className?: string;
}

export const MobileCalendarCarousel: React.FC<MobileCalendarCarouselProps> = ({
  habits,
  completions,
  onDayClick,
  className
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Gerar 7 dias a partir da data atual (3 antes + hoje + 3 depois)
  const generateDays = (centerDate: Date) => {
    const start = subDays(centerDate, 3);
    const end = addDays(centerDate, 3);
    return eachDayOfInterval({ start, end });
  };

  const [days, setDays] = useState(() => generateDays(currentDate));

  const isHabitCompletedOnDay = (habitId: number, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return completions.some(c => c.habit_id === habitId && c.date === dateStr && c.percentage >= 100);
  };

  const getDayProgress = (date: Date) => {
    const completedCount = habits.filter(h => isHabitCompletedOnDay(h.id, date)).length;
    return habits.length > 0 ? (completedCount / habits.length) * 100 : 0;
  };

  const getDayHabits = (date: Date) => {
    return habits.slice(0, 6).map(habit => ({
      ...habit,
      completed: isHabitCompletedOnDay(habit.id, date),
      IconComponent: getIconComponent(habit.icon)
    }));
  };

  const navigateToDate = (date: Date) => {
    setCurrentDate(date);
    setDays(generateDays(date));
    setCurrentIndex(3); // Sempre centralizar no dia selecionado
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    const newDate = direction === 'left' 
      ? addDays(currentDate, 1)
      : subDays(currentDate, 1);
    
    navigateToDate(newDate);
    
    // Scroll para o item centralizado
    if (containerRef.current) {
      const itemWidth = 128 + 16; // 32 (w-32) + 16 (gap-4) = 128px + 16px
      const scrollPosition = 3 * itemWidth; // Centralizar no meio (índice 3)
      containerRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleCardClick = (date: Date) => {
    navigateToDate(date);
    onDayClick?.(date);
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Header com navegação */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSwipe('right')}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {format(currentDate, 'dd MMM', { locale: ptBR })}
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSwipe('left')}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Carrossel de dias */}
      <div className="relative">
        <div 
          ref={containerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 px-2"
          style={{ scrollSnapType: 'x mandatory' }}
          onScroll={(e) => {
            const container = e.target as HTMLDivElement;
            const scrollLeft = container.scrollLeft;
            const itemWidth = container.scrollWidth / days.length;
            const newIndex = Math.round(scrollLeft / itemWidth);
            setCurrentIndex(newIndex);
          }}
        >
          {days.map((day, index) => {
            const dayHabits = getDayHabits(day);
            const progress = getDayProgress(day);
            const isCurrentDay = isToday(day);
            const isSelected = isSameDay(day, currentDate);
            const isPast = day < new Date() && !isCurrentDay;
            const isFuture = day > new Date();

            return (
              <motion.div
                key={day.toISOString()}
                className={cn(
                  "flex-shrink-0 w-32 h-32 rounded-2xl border-2 transition-all duration-300 cursor-pointer",
                  "snap-center shadow-lg",
                  isSelected 
                    ? "border-violet-500 bg-violet-500/10 scale-105 shadow-[0_8px_24px_rgba(139,92,246,0.2)]" 
                    : "border-border hover:border-violet-500/50 hover:shadow-md",
                  isCurrentDay && "ring-2 ring-violet-400/40",
                  isFuture && "opacity-60 cursor-not-allowed"
                )}
                onClick={() => !isFuture && handleCardClick(day)}
                whileHover={{ scale: isFuture ? 1 : 1.02 }}
                whileTap={{ scale: isFuture ? 1 : 0.98 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="w-full h-full p-3 flex flex-col items-center justify-between">
                  {/* Data */}
                  <div className="text-center">
                    <div className={cn(
                      "text-sm font-semibold",
                      isCurrentDay ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground"
                    )}>
                      {format(day, 'dd')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(day, 'EEE', { locale: ptBR })}
                    </div>
                  </div>

                  {/* Ícones dos hábitos */}
                  <div className="grid grid-cols-3 gap-1 w-full">
                    {dayHabits.map((habit, habitIndex) => (
                      <div
                        key={habit.id}
                        className={cn(
                          "w-5 h-5 rounded-md flex items-center justify-center text-xs",
                          habit.completed 
                            ? "bg-violet-500 text-white shadow-sm" 
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <habit.IconComponent className="w-3 h-3" />
                      </div>
                    ))}
                  </div>

                  {/* Barra de progresso circular */}
                  <div className="relative w-8 h-8">
                    <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-muted/30"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 10}`}
                        strokeDashoffset={`${2 * Math.PI * 10 * (1 - progress / 100)}`}
                        className={cn(
                          "transition-all duration-500",
                          progress === 100 ? "text-emerald-500" : "text-violet-500"
                        )}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-semibold text-foreground">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Indicadores de scroll */}
        <div className="flex justify-center gap-2 mt-4">
          {days.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === currentIndex ? "bg-violet-500 w-6" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Estatísticas do dia selecionado */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentDate.toISOString()}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="mt-6 p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20"
        >
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-muted-foreground font-medium">
              {format(currentDate, 'dd MMMM yyyy', { locale: ptBR })}
            </span>
            <span className="font-semibold text-foreground">
              {habits.filter(h => isHabitCompletedOnDay(h.id, currentDate)).length}/{habits.length} hábitos
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="h-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${getDayProgress(currentDate)}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MobileCalendarCarousel;
