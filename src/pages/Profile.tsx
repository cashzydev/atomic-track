import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AppLayout } from '@/layouts/AppLayout';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { AnimatedPage } from '@/components/AnimatedPage';
import { useLevel } from '@/hooks/useLevel';
import { Progress } from '@/components/ui/progress';
import LevelBadge from '@/components/LevelBadge';
import BadgeDisplay from '@/components/BadgeDisplay';
import { Target, Trophy, Flame, Calendar, Sparkles } from 'lucide-react';
import { ICON_SIZES } from '@/config/iconSizes';

export default function Profile() {
  const { user } = useAuth();
  const { level, xp, progress, levelInfo, currentLevelXP, nextLevelXP } = useLevel();
  const queryClient = useQueryClient();

  // Fetch profile data
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch real stats
  const { data: stats } = useQuery({
    queryKey: ['profile-stats', user?.id],
    queryFn: async () => {
      // Total habits
      const { count: totalHabits } = await supabase
        .from('habits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      // Longest streak
      const { data: habitsData } = await supabase
        .from('habits')
        .select('longest_streak')
        .eq('user_id', user?.id);
      
      const longestStreak = Math.max(...(habitsData?.map(h => h.longest_streak) || [0]));

      // Unlocked badges
      const { count: unlockedBadges } = await supabase
        .from('user_badges')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('unlocked', true);

      // Active days
      const { data: completionsData } = await supabase
        .from('habit_completions')
        .select('date')
        .eq('user_id', user?.id)
        .gte('percentage', 100);
      
      const uniqueDates = new Set(completionsData?.map(c => c.date) || []);
      const activeDays = uniqueDates.size;

      return {
        totalHabits: totalHabits || 0,
        longestStreak,
        unlockedBadges: unlockedBadges || 0,
        activeDays,
      };
    },
    enabled: !!user?.id,
  });

  if (!user) return null;

  const xpToNext = nextLevelXP - currentLevelXP;

  return (
    <AppLayout>
      <AnimatedPage>
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          <Breadcrumbs />
          
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-200">Perfil</h1>
            <p className="text-slate-400 mt-1">Seu progresso e personalização</p>
          </div>

          {/* Header com Avatar e Nível */}
          <Card className="border-2 border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-purple-500/10">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Avatar Grande */}
                <div className="relative">
                  <div className="w-24 h-24 text-4xl rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white border-4 border-violet-500/50 font-bold">
                    {(profile?.name || user.email || 'U')[0]?.toUpperCase()}
                  </div>
                  <div className="absolute -bottom-2 -right-2">
                    <LevelBadge 
                      level={level} 
                      size="sm"
                      user={{
                        name: profile?.name || user.email || 'Usuário',
                        email: user.email || ''
                      }}
                      useAvatar={true}
                    />
                  </div>
                </div>

                {/* Info e Progresso */}
                <div className="flex-1 text-center sm:text-left space-y-3 w-full">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {profile?.name || 'Usuário'}
                    </h2>
                    <p className="text-violet-300">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 justify-center sm:justify-start">
                      <Calendar size={12} />
                      <span>
                        Membro desde{' '}
                        {new Date(user.created_at).toLocaleDateString('pt-BR', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* XP Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-violet-300 font-semibold">Nível {level} • {levelInfo.title}</span>
                      <span className="text-violet-400/70">{xpToNext} XP para próximo</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-violet-300">
                      {currentLevelXP} / {nextLevelXP} XP
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center space-y-2">
                <Target className="w-6 h-6 text-violet-400 mx-auto" />
                <p className="text-xs text-muted-foreground">Hábitos</p>
                <p className="text-2xl font-bold text-slate-200">{stats?.totalHabits || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center space-y-2">
                <Flame className="w-6 h-6 text-orange-400 mx-auto" />
                <p className="text-xs text-muted-foreground">Melhor Streak</p>
                <p className="text-2xl font-bold text-slate-200">{stats?.longestStreak || 0}d</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center space-y-2">
                <Trophy className="w-6 h-6 text-amber-400 mx-auto" />
                <p className="text-xs text-muted-foreground">Conquistas</p>
                <p className="text-2xl font-bold text-slate-200">{stats?.unlockedBadges || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center space-y-2">
                <Sparkles className="w-6 h-6 text-emerald-400 mx-auto" />
                <p className="text-xs text-muted-foreground">XP Total</p>
                <p className="text-2xl font-bold text-slate-200">{xp}</p>
              </CardContent>
            </Card>
          </div>

          {/* Personalização de Avatar */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>
                Seus dados e estatísticas pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome</label>
                  <p className="text-lg font-semibold">{profile?.name || 'Usuário'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-lg">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Membro desde</label>
                  <p className="text-lg">
                    {new Date(user.created_at).toLocaleDateString('pt-BR', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conquistas Recentes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Conquistas Recentes</CardTitle>
                  <CardDescription>Suas últimas badges desbloqueadas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <BadgeDisplay mode="scroll" filter="unlocked" limit={5} />
            </CardContent>
          </Card>

          {/* Benefícios Desbloqueados */}
          {levelInfo.perks.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="text-amber-500" size={ICON_SIZES.lg} />
                  <CardTitle>Benefícios Desbloqueados</CardTitle>
                </div>
                <CardDescription>
                  Recompensas do Nível {level}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {levelInfo.perks.map((perk, index) => (
                    <li key={index} className="flex items-start gap-2 text-body">
                      <span className="text-emerald-500 text-lg">✓</span>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </AnimatedPage>
    </AppLayout>
  );
}
