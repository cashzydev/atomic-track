import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { Habit } from '@/types/habit';

interface DemoHabit {
  id: string;
  title: string;
  icon: string;
  when_time: string;
  where_location: string;
  goal_target: number;
  goal_unit: string;
  goal_current?: number;
  completedToday?: boolean;
  streak: number;
  longest_streak: number;
  total_completions: number;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  current_phase: number;
}

const DEMO_HABITS: DemoHabit[] = [
  {
    id: 'demo-1',
    title: 'Ler 10 páginas',
    icon: 'BookOpen',
    when_time: 'Após o café da manhã',
    where_location: 'Na poltrona de leitura',
    goal_target: 10,
    goal_unit: 'páginas',
    goal_current: 7,
    completedToday: false,
    streak: 12,
    longest_streak: 12,
    total_completions: 45,
    status: 'active',
    user_id: 'demo-user',
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 dias atrás
    updated_at: new Date().toISOString(),
    current_phase: 1,
  },
  {
    id: 'demo-2',
    title: 'Meditar 5 minutos',
    icon: 'Brain',
    when_time: 'Antes de dormir',
    where_location: 'No quarto',
    goal_target: 5,
    goal_unit: 'minutos',
    goal_current: 0,
    completedToday: false,
    streak: 5,
    longest_streak: 8,
    total_completions: 32,
    status: 'active',
    user_id: 'demo-user',
    created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 dias atrás
    updated_at: new Date().toISOString(),
    current_phase: 1,
  },
  {
    id: 'demo-3',
    title: 'Beber 2L de água',
    icon: 'Droplet',
    when_time: 'Durante o dia',
    where_location: 'Garrafa na mesa',
    goal_target: 2000,
    goal_unit: 'ml',
    goal_current: 800,
    completedToday: false,
    streak: 3,
    longest_streak: 7,
    total_completions: 28,
    status: 'active',
    user_id: 'demo-user',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias atrás
    updated_at: new Date().toISOString(),
    current_phase: 1,
  },
];

interface DemoContextType {
  habits: DemoHabit[];
  toggleHabit: (id: string) => void;
  updateProgress: (id: string, progress: number) => void;
}

const DemoContext = createContext<DemoContextType | null>(null);

export const DemoHabitsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<DemoHabit[]>(DEMO_HABITS);

  const toggleHabit = (id: string) => {
    // Haptic feedback (se mobile)
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              completedToday: !h.completedToday,
              goal_current: !h.completedToday ? h.goal_target : 0,
              streak: !h.completedToday ? h.streak + 1 : Math.max(0, h.streak - 1),
              total_completions: !h.completedToday ? h.total_completions + 1 : h.total_completions,
            }
          : h
      )
    );
  };

  const updateProgress = (id: string, progress: number) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              goal_current: progress,
              completedToday: progress >= h.goal_target,
            }
          : h
      )
    );
  };

  return (
    <DemoContext.Provider value={{ habits, toggleHabit, updateProgress }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemoHabits = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoHabits must be used within DemoHabitsProvider');
  }
  return context;
};

