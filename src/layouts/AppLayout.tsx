import React, { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { ProfileButton } from '@/components/ProfileButton';
import { ProfileSheet } from '@/components/ProfileSheet';
import { DailyProgress } from '@/components/DailyProgress';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useHabits } from '@/hooks/useHabits';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getXPForLevel } from '@/systems/levelSystem';
import { triggerHaptic } from '@/utils/haptics';
import { calculateHabitStats } from '@/utils/statsCalculator';
export function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <AppLayoutContent>{children}</AppLayoutContent>;
}

function AppLayoutContent({
  children
}: {
  children: React.ReactNode;
}) {
  const {
    user
  } = useAuth();
  const {
    data: habits
  } = useHabits();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebar-open');
    return saved ? JSON.parse(saved) : true;
  });
  React.useEffect(() => {
    localStorage.setItem('sidebar-open', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Buscar completions para calcular stats
  const { data: completions } = useQuery({
    queryKey: ['completions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('habit_completions')
        .select('date, habit_id, percentage')
        .eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });
  if (!profile || !user) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  // Calcular XP e nível
  const xpForNextLevel = getXPForLevel(profile.level + 1);
  const xpForCurrentLevel = getXPForLevel(profile.level);
  const xpInCurrentLevel = (profile.xp || 0) - xpForCurrentLevel;
  const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;

  // Calcular stats reais
  const stats = calculateHabitStats(
    completions || [],
    habits?.filter(h => h.status === 'active').length || 0
  );

  const userData = {
    id: user.id,
    name: profile.name || 'Usuário',
    email: user.email,
    created_at: user.created_at,
    xp: profile.xp || 0,
    level: profile.level || 1
  };
  return <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

  <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          <header className="sticky top-0 z-40 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
            <div className="flex h-16 md:h-20 items-center gap-3 px-4 sm:px-6">
              <SidebarTrigger className="h-10 w-10 text-slate-300 hover:text-slate-100 touch-target-comfortable" onClick={() => triggerHaptic('light')} />

              <div className="flex-1" />

              {/* Daily Progress with Circular Indicator */}
              {habits && habits.length > 0 && <div className="hidden md:flex items-center gap-3">
                  
                  <div className="max-w-[240px] lg:max-w-[260px]">
                    <DailyProgress completed={habits.filter(h => h.completedToday).length} total={habits.length} habits={habits.map(h => ({
                  id: h.id,
                  title: h.title,
                  completed: h.completedToday || false
                }))} />
                  </div>
                </div>}

              <div className="scale-90 md:scale-100">
                <ProfileButton 
                  user={userData} 
                  onClick={() => setSheetOpen(true)}
                  xpForNextLevel={xpForNextLevel}
                  xpInCurrentLevel={xpInCurrentLevel}
                  xpNeededForNext={xpNeededForNext}
                />
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 md:p-8">
            {children}
          </main>
        </div>

        {/* Bottom Navigation - Mobile only */}
        <BottomNavigation />

        <ProfileSheet 
          open={sheetOpen} 
          onOpenChange={setSheetOpen} 
          user={userData} 
          stats={stats}
          xpForNextLevel={xpForNextLevel}
          xpInCurrentLevel={xpInCurrentLevel}
          xpNeededForNext={xpNeededForNext}
        />
      </div>
    </SidebarProvider>;
}