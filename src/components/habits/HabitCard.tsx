import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import { Habit } from '@/types/habit';
import { HabitActionsMenu } from './HabitActionsMenu';
import { MapPin, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HabitCardProps {
  habit: Habit;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  isDemo?: boolean;
  isDashboard?: boolean;
  onToggle?: (id: number) => void;
}

const getIconComponent = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName];
  return Icon || LucideIcons.Atom;
};

export const HabitCard = ({ habit, onEdit, onDelete, isDemo = false, isDashboard = false, onToggle }: HabitCardProps) => {
  const navigate = useNavigate();
  const Icon = getIconComponent(habit.icon);
  const isCompleted = habit.completedToday;

  // Determinar comportamento do onClick
  const handleClick = () => {
    if (isDemo || isDashboard) {
      // No dashboard/demo, usar onToggle se fornecido
      if (onToggle) {
        onToggle(habit.id);
      }
      return;
    }
    // Na página de hábitos, navegar para detalhes
    navigate(`/habits/${habit.id}`);
  };

  return (
    <Card 
      className={`p-5 transition-all hover:bg-muted/20 border-0 bg-muted/10 backdrop-blur-sm ${isDemo || isDashboard ? 'cursor-pointer hover:shadow-md hover:scale-[1.01] relative' : 'cursor-pointer'}`}
      onClick={handleClick}
    >
      {isDemo && (
        <div className="absolute -top-2 -right-2 z-10">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground shadow-lg">
            Demo
          </span>
        </div>
      )}
      <div className={cn(
        "flex items-center gap-4",
        (!isDemo && !isDashboard) ? "justify-between" : "justify-center"
      )}>
        {/* Icon */}
        <div 
          className={`
            w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all
            ${isCompleted 
              ? 'bg-emerald-500/20' 
              : 'bg-background/50'
            }
          `}
        >
          <Icon 
            size={22} 
            className={isCompleted ? 'text-emerald-500' : 'text-muted-foreground'} 
          />
        </div>

        {/* Info centralizada */}
        <div className="flex-1 min-w-0 space-y-1.5 text-center">
          <h3 className="text-base font-semibold text-foreground break-words">
            {habit.title}
          </h3>
          
          {/* Tags minimalistas */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            {habit.where_location && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span>{habit.where_location}</span>
              </div>
            )}
            {habit.goal_target && habit.goal_unit && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Target className="w-3.5 h-3.5" />
                <span>{habit.goal_target} {habit.goal_unit}</span>
              </div>
            )}
            {habit.streak > 0 && (
              <div 
                className={`
                  flex items-center gap-1 font-semibold
                  ${habit.streak >= 7 ? 'text-amber-500' : 'text-foreground'}
                `}
              >
                🔥 {habit.streak}
              </div>
            )}
          </div>
        </div>

        {/* Menu (apenas na página de hábitos) */}
        <div onClick={(e) => e.stopPropagation()} className={cn(
          "flex-shrink-0",
          (!isDemo && !isDashboard) ? "w-8" : "w-0"
        )}>
          {!isDemo && !isDashboard && (
            <HabitActionsMenu
              onEdit={() => onEdit(habit.id)}
              onDelete={() => onDelete(habit.id)}
            />
          )}
        </div>
      </div>
    </Card>
  );
};
