import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { triggerAtomicAnimation } from "@/utils/atomicParticles";
import { triggerHaptic } from "@/utils/haptics";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/layouts/AppLayout";
import { useHabits } from "@/hooks/useHabits";
import { useStats } from "@/hooks/useStats";
import { useAuth } from "@/contexts/AuthContext";
import { DailyProgressCard } from "@/components/DailyProgressCard";
import { HabitTimeline } from "@/components/HabitTimeline";
import NewHabitModal from "@/components/NewHabitModal";

interface TimelineHabit {
  id: number;
  title: string;
  icon: string;
  completed: boolean;
  completedAt?: string;
}
import KanbanView from "@/components/views/KanbanView";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { AnimatedPage } from "@/components/AnimatedPage";
import { PageLoader } from "@/components/PageLoader";
import { Plus, Atom } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const { data: habits, isLoading: habitsLoading, completeHabit, undoHabit } = useHabits();
  const { weeklyStats, streakStats } = useStats();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isNewHabitModalOpen, setIsNewHabitModalOpen] = useState(false);

  // Get XP earned today from database
  const { data: xpEarnedToday } = useQuery({
    queryKey: ['xp-earned-today', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { data, error } = await supabase
        .rpc('get_user_xp_earned_today', { p_user_id: user.id });
      if (error) {
        console.error('Error fetching XP:', error);
        return 0;
      }
      return data || 0;
    },
    enabled: !!user?.id,
  });

  const dateLocale = i18n.language === 'en' ? enUS : ptBR;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'n' || e.key === 'N') {
        setIsNewHabitModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  const handleCompleteHabit = async (habitId: number) => {
    const habit = habits?.find(h => h.id === habitId);
    if (!habit) return;
    await completeHabit({
      habitId,
      percentage: 100,
      habitTitle: habit.title
    });

    // Atomic animation
    triggerAtomicAnimation();

    // Toast with undo
    toast.success(`${habit.title} concluído!`, {
      description: "Ótimo trabalho! Continue assim 🚀",
      duration: 5000,
      action: {
        label: "Desfazer",
        onClick: async () => {
          await handleUndoHabit(habitId);
        }
      }
    });
  };

  const handleUndoHabit = async (habitId: number) => {
    undoHabit(habitId);
    toast.info("Conclusão desfeita", {
      duration: 2000
    });
  };
  if (!user) {
    navigate("/auth");
    return null;
  }
  if (habitsLoading) {
    return <AppLayout>
        <PageLoader />
      </AppLayout>;
  }
  
  const userName = user.user_metadata?.name || 'Usuário';
  const todayFormatted = format(new Date(), "EEEE, d 'de' MMMM", { locale: dateLocale });
  
  // Calculate daily progress data
  const today = new Date().toISOString().split('T')[0];
  const completedToday = habits?.filter(h => h.completedToday).length || 0;
  
  const activeStreaks = habits?.filter(h => {
    if (!h.streak || h.streak === 0) return false;
    // Verify if habit was completed today or yesterday
    return h.completedToday || h.last_completed;
  }).length || 0;
  
  const xpEarned = xpEarnedToday || 0;
  
  // Prepare weekly data for mini graph
  const weeklyData = weeklyStats?.data?.days?.map(day => ({
    day: day.day.substring(0, 3), // D, S, T, Q, Q, S, S
    percentage: day.percentage
  })) || [];

  return <AppLayout>
      <AnimatedPage>
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
          {/* Header Card - Design Minimalista */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Card cinza escuro */}
            <div className="relative bg-card rounded-2xl p-6 border">
              
              {/* Conteúdo principal */}
              <div className="space-y-6">
                
                {/* Saudação */}
                <div className="space-y-3">
                  {/* Data */}
                  <motion.p 
                    className="text-sm text-muted-foreground/60 font-medium"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {todayFormatted}
                  </motion.p>
                  
                  {/* Título com ícone átomo */}
                  <motion.h1 
                    className="text-3xl md:text-4xl font-bold flex items-center gap-3"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Atom className="w-8 h-8 md:w-9 md:h-9 text-violet-500 drop-shadow-[0_0_12px_rgba(139,92,246,0.6)]" />
                    </motion.div>
                    <span className="text-violet-500">
                      Olá {userName}
                    </span>
                  </motion.h1>
                  
                  {/* Frase inspiracional */}
                  <motion.p 
                    className="text-base text-muted-foreground/80 max-w-xl leading-relaxed"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {i18n.language === 'en'
                      ? 'Every action is a vote for the person you want to become'
                      : 'Cada ação é um voto para quem você está se tornando'}
                  </motion.p>
                </div>

                {/* Botão de ação */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    onClick={() => setIsNewHabitModalOpen(true)}
                    className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300 hover:scale-105 border-0 px-6 py-3 text-base font-medium rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('habits.newHabit')}
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Kanban View - Destaque Secundário */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative"
          >
            {/* Subtle border glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-transparent to-purple-500/10 rounded-2xl blur-sm" />
            <div className="relative">
              <KanbanView 
                habits={habits || []} 
                onComplete={handleCompleteHabit} 
                onAddHabit={() => setIsNewHabitModalOpen(true)}
                onUndo={handleUndoHabit}
              />
            </div>
          </motion.div>

          {/* Teste Simples - Temporário */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
          </motion.div>

          {/* Habit Timeline - Destaque Terciário */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="relative bg-card rounded-2xl p-8 border">
              <HabitTimeline
                habits={habits?.map(h => ({
                  id: h.id,
                  title: h.title,
                  icon: h.icon,
                  completed: h.completedToday || false,
                  completedAt: h.last_completed || undefined
                })) as TimelineHabit[] || []}
              />
            </div>
          </motion.div>

        </div>

        {/* Modals */}
        <NewHabitModal open={isNewHabitModalOpen} onOpenChange={setIsNewHabitModalOpen} />
      </AnimatedPage>
    </AppLayout>;
};
export default Dashboard;