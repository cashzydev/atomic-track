import React from 'react';
import { motion } from 'framer-motion';
import { useHabits } from '@/hooks/useHabits';
import { AppLayout } from '@/layouts/AppLayout';
import { PageLoader } from '@/components/PageLoader';
import { NotionCalendar } from '@/components/NotionCalendar';
import { AnimatedPage } from '@/components/AnimatedPage';
import { FeatureLock } from '@/components/FeatureLock';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Calendar } from 'lucide-react';

const CalendarPage = () => {
  const { data: habits, isLoading: habitsLoading } = useHabits();
  
  // Buscar completions direto do banco
  const { data: completions, isLoading: completionsLoading } = useQuery({
    queryKey: ['habit-completions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habit_completions')
        .select('id, habit_id, date, percentage, completed_at')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!habits,
  });

  if (habitsLoading || completionsLoading) {
    return (
      <AppLayout>
        <PageLoader />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <AnimatedPage>
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
          {/* Header */}
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center shadow-[0_2px_10px_rgba(139,92,246,0.15)]">
              <Calendar className="w-6 h-6 text-violet-400" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Calendário de Hábitos
              </h1>
              <p className="text-sm text-muted-foreground/80 mt-1.5 leading-relaxed">
                Um pequeno passo por dia, uma jornada transformadora por ano
              </p>
            </div>
          </motion.div>

          {/* Calendário com bloqueio */}
          <FeatureLock feature="calendar">
            <NotionCalendar 
              habits={habits || []} 
              completions={completions || []}
              onHabitToggle={() => {}}
            />
          </FeatureLock>
        </div>
      </AnimatedPage>
    </AppLayout>
  );
};

export default CalendarPage;
