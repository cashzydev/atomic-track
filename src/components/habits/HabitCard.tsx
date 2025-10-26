import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import { Habit } from '@/types/habit';
import { calculateCompletionRate } from '@/utils/habitMetrics';
import { HabitActionsMenu } from './HabitActionsMenu';
import { MapPin, Target } from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const getIconComponent = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName];
  return Icon || LucideIcons.Atom;
};

export const HabitCard = ({ habit, onEdit, onDelete }: HabitCardProps) => {
  const navigate = useNavigate();
  const Icon = getIconComponent(habit.icon);
  const completionRate = calculateCompletionRate(habit);
  const isCompleted = habit.completedToday;
  const isPending = habit.status === 'pending';
  const isActive = habit.status === 'active';

  return (
    <Card 
      className="p-5 transition-all hover:bg-muted/20 border-0 bg-muted/10 backdrop-blur-sm cursor-pointer"
      onClick={() => navigate(`/habits/${habit.id}`)}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Icon + Info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
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

          <div className="flex-1 min-w-0 space-y-1.5">
            <h3 className="text-base font-semibold text-foreground truncate">
              {habit.title}
            </h3>
            
            {/* Tags minimalistas */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
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
            </div>
          </div>
        </div>

        {/* Right: Stats + Menu */}
        <div className="flex items-start gap-3 flex-shrink-0">
          <div className="flex items-center gap-3 text-sm">
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
            {isActive && (
              <div className="text-muted-foreground font-medium">
                {completionRate}%
              </div>
            )}
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <HabitActionsMenu
              onEdit={() => onEdit(habit.id)}
              onDelete={() => onDelete(habit.id)}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
