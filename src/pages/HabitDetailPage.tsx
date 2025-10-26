import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/layouts/AppLayout';
import { AnimatedPage } from '@/components/AnimatedPage';
import { PageLoader } from '@/components/PageLoader';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Target, MapPin, Trophy, Flame, TrendingUp, CheckCircle2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

const getIconComponent = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName];
  return Icon || LucideIcons.Atom;
};

export default function HabitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notes, setNotes] = useState("");

  const { data: habit, isLoading } = useQuery({
    queryKey: ['habit', id],
    queryFn: async () => {
      if (!user || !id) return null;
      
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('id', parseInt(id))
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <PageLoader />
      </AppLayout>
    );
  }

  if (!habit) {
    return (
      <AppLayout>
        <AnimatedPage>
          <div className="max-w-2xl mx-auto">
            <Breadcrumbs />
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Hábito não encontrado</p>
              <Button onClick={() => navigate('/habits')} className="mt-4">
                Voltar para Hábitos
              </Button>
            </Card>
          </div>
        </AnimatedPage>
      </AppLayout>
    );
  }

  const Icon = getIconComponent(habit.icon);
  const completionRate = habit.total_completions 
    ? Math.min(100, Math.round(habit.total_completions * 10))
    : 0;

  return (
    <AppLayout>
      <AnimatedPage>
        <div className="max-w-3xl mx-auto space-y-6">
          <Breadcrumbs />

          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/habits')}
              className="hover:bg-muted/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{habit.title}</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {habit.when_time}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Loop Visual */}
          <Card className="p-6 border-0 bg-muted/10">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <div className="text-sm text-muted-foreground mb-1">Gatilho</div>
                <div className="text-base font-medium">{habit.when_time}</div>
              </div>
              <div className="text-muted-foreground">→</div>
              <div className="flex-1 text-center">
                <div className="text-sm text-muted-foreground mb-1">Hábito</div>
                <div className="text-base font-medium">{habit.title}</div>
              </div>
              <div className="text-muted-foreground">→</div>
              <div className="flex-1 text-center">
                <div className="text-sm text-muted-foreground mb-1">Recompensa</div>
                <div className="text-base font-medium flex items-center justify-center gap-1">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  +{habit.streak || 0} XP
                </div>
              </div>
            </div>
          </Card>

          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-6 border-0 bg-muted/10 text-center space-y-2">
              <Flame className={cn(
                "w-6 h-6 mx-auto",
                habit.streak >= 7 ? "text-amber-500" : "text-muted-foreground"
              )} />
              <div className="text-2xl font-bold text-foreground">{habit.streak || 0}</div>
              <div className="text-sm text-muted-foreground">Sequência Atual</div>
            </Card>

            <Card className="p-6 border-0 bg-muted/10 text-center space-y-2">
              <Trophy className="w-6 h-6 mx-auto text-primary" />
              <div className="text-2xl font-bold text-foreground">{habit.streak || 0}</div>
              <div className="text-sm text-muted-foreground">Recorde</div>
            </Card>

            <Card className="p-6 border-0 bg-muted/10 text-center space-y-2">
              <TrendingUp className="w-6 h-6 mx-auto text-emerald-500" />
              <div className="text-2xl font-bold text-foreground">{completionRate}%</div>
              <div className="text-sm text-muted-foreground">Taxa de Sucesso</div>
            </Card>
          </div>

          {/* Minhas 4 Leis */}
          {habit.temptation_bundle && (
            <Card className="p-6 border-0 bg-muted/10 space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Minhas 4 Leis
              </h2>
              <div className="space-y-3 text-sm">
                {habit.temptation_bundle.split('|').map((law, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">{law.trim()}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Diário do Hábito */}
          <Card className="p-6 border-0 bg-muted/10 space-y-4">
            <h2 className="text-xl font-bold text-foreground">Anotações</h2>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Registre suas vitórias, desafios e aprendizados..."
              className="min-h-[200px] border-0 bg-background/50 resize-none"
            />
            <Button className="w-full">Salvar Anotações</Button>
          </Card>
        </div>
      </AnimatedPage>
    </AppLayout>
  );
}
