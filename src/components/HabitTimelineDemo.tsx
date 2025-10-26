import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HabitTimeline } from './HabitTimeline';

// Dados de exemplo para demonstração
const sampleHabits = [
  {
    id: 1,
    title: 'Exercício',
    icon: 'Dumbbell',
    completed: true,
    completedAt: '2024-01-15T08:30:00Z'
  },
  {
    id: 2,
    title: 'Leitura',
    icon: 'BookOpen',
    completed: true,
    completedAt: '2024-01-15T12:15:00Z'
  },
  {
    id: 3,
    title: 'Meditação',
    icon: 'Brain',
    completed: false,
    completedAt: undefined
  },
  {
    id: 4,
    title: 'Hidratação',
    icon: 'Droplet',
    completed: false,
    completedAt: undefined
  },
  {
    id: 5,
    title: 'Estudo',
    icon: 'Target',
    completed: false,
    completedAt: undefined
  }
];

export const HabitTimelineDemo = () => {
  const [habits, setHabits] = useState(sampleHabits);

  const toggleHabit = (habitId: number) => {
    setHabits(prev => prev.map(habit => 
      habit.id === habitId 
        ? { 
            ...habit, 
            completed: !habit.completed,
            completedAt: !habit.completed ? new Date().toISOString() : undefined
          }
        : habit
    ));
  };

  const resetDemo = () => {
    setHabits(sampleHabits);
  };

  const completeAll = () => {
    setHabits(prev => prev.map(habit => ({
      ...habit,
      completed: true,
      completedAt: habit.completedAt || new Date().toISOString()
    })));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Habit Timeline Demo</h1>
        <p className="text-muted-foreground">
          Demonstração da linha do tempo de hábitos com estados visuais responsivos
        </p>
      </div>

      {/* Controles */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 justify-center">
          <Button onClick={resetDemo} variant="outline">
            Resetar Demo
          </Button>
          <Button onClick={completeAll} variant="outline">
            Completar Todos
          </Button>
          <div className="text-sm text-muted-foreground flex items-center">
            Clique nos hábitos para alternar o estado
          </div>
        </div>
      </Card>

      {/* Timeline Principal */}
      <Card className="p-6">
        <HabitTimeline habits={habits} />
      </Card>

      {/* Timeline com poucos hábitos */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Timeline com poucos hábitos (≤4)</h3>
        <HabitTimeline habits={habits.slice(0, 3)} />
      </Card>

      {/* Timeline com muitos hábitos */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Timeline com muitos hábitos (>4)</h3>
        <HabitTimeline habits={habits} />
      </Card>

      {/* Estados dos hábitos */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Estados dos Hábitos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map(habit => (
            <div 
              key={habit.id}
              className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleHabit(habit.id)}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${habit.completed 
                  ? 'bg-violet-500 text-white' 
                  : 'bg-muted text-muted-foreground'
                }
              `}>
                {habit.completed ? '✓' : '○'}
              </div>
              <div className="flex-1">
                <p className="font-medium">{habit.title}</p>
                {habit.completedAt && (
                  <p className="text-xs text-muted-foreground">
                    Concluído às {new Date(habit.completedAt).toLocaleTimeString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default HabitTimelineDemo;
