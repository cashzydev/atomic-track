import React from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div 
      className={cn(
        "p-5 transition-all duration-200",
        "shadow-[0_2px_12px_rgba(0,0,0,0.15)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)]",
        "hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)]",
        isDemo || isDashboard ? 'cursor-pointer hover:scale-[1.01] relative' : 'cursor-pointer',
        "rounded-xl"
      )}
      onClick={handleClick}
      style={{ 
        background: 'rgba(30, 41, 59, 0.5)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: 'none',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
        backgroundImage: 'none',
        backgroundClip: 'padding-box'
      }}
    >
      {isDemo && (
        <div className="absolute -top-2 -right-2 z-10">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-700/80 text-slate-100 shadow-lg backdrop-blur-sm">
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
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200",
            isCompleted 
              ? 'bg-emerald-500/20 shadow-[0_2px_8px_rgba(16,185,129,0.15)]' 
              : 'bg-slate-700/50 shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
          )}
          style={
            !isCompleted 
              ? { 
                  background: 'rgba(51, 65, 85, 0.5)',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }
              : undefined
          }
        >
          <Icon 
            size={22} 
            className={cn(
              isCompleted ? 'text-emerald-500' : 'text-slate-400'
            )}
            strokeWidth={2}
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
    </div>
  );
};
