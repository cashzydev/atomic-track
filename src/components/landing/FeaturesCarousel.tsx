import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, BarChart3, Target, TrendingUp, CheckCircle2, Flame, LayoutDashboard, Atom } from 'lucide-react';
import { DemoHabitsProvider, useDemoHabits } from './DemoHabitsProvider';
import { NotionCalendar } from '@/components/NotionCalendar';
import StatMetricCard from '@/components/StatMetricCard';
import SmartInsights from '@/components/stats/SmartInsights';
import { HabitCard } from '@/components/habits/HabitCard';
import { CompactPreviewContent } from './InteractiveAppPreview';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { getIconComponent } from '@/config/icon-map';
import type { Habit } from '@/types/habit';
import { useIsMobile } from '@/hooks/use-mobile';

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  benefits: string[];
}

const CarouselSlide: React.FC<{ slide: Slide; isActive: boolean }> = ({ slide, isActive }) => {
  return (
    <div className={cn(
      "w-full px-2 sm:px-3 md:px-4 transition-all duration-500 ease-in-out",
      isActive ? "opacity-100 scale-100 relative" : "opacity-0 scale-95 absolute inset-0 pointer-events-none"
    )}>
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
        {/* Header do Slide */}
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center border border-violet-500/30 flex-shrink-0">
            {React.cloneElement(slide.icon as React.ReactElement, { strokeWidth: 2, className: "w-5 h-5 sm:w-6 sm:h-6" })}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-50 font-display tracking-tight break-words">{slide.title}</h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 break-words">{slide.subtitle}</p>
          </div>
        </div>

          {/* Componente Preview */}
        <div className="mb-6 max-h-[650px] sm:max-h-[600px] lg:max-h-[700px] overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="relative min-w-0">
            {slide.component}
          </div>
        </div>

        {/* Benefícios */}
        <div className="border-t border-slate-800 pt-6 overflow-x-hidden">
          <p className="text-sm font-semibold text-slate-300 mb-3 break-words">Principais benefícios:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {slide.benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" strokeWidth={2} />
                <span className="break-words">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper para converter DemoHabit para Habit
const convertDemoToHabit = (demoHabit: any): Habit => {
  return {
    id: parseInt(demoHabit.id.replace('demo-', '')) || 1,
    user_id: demoHabit.user_id,
    title: demoHabit.title,
    icon: demoHabit.icon,
    when_time: demoHabit.when_time,
    where_location: demoHabit.where_location,
    goal_target: demoHabit.goal_target,
    goal_unit: demoHabit.goal_unit,
    goal_current: demoHabit.goal_current || 0,
    completedToday: demoHabit.completedToday || false,
    streak: demoHabit.streak,
    longest_streak: demoHabit.longest_streak,
    total_completions: demoHabit.total_completions,
    status: demoHabit.status as 'active' | 'pending' | 'paused',
    last_completed: demoHabit.completedToday ? new Date().toISOString() : null,
    created_at: demoHabit.created_at,
    updated_at: demoHabit.updated_at,
    current_phase: demoHabit.current_phase,
  };
};

// Componente de Stats Demo Melhorado
const StatsPreview: React.FC = () => {
  const { habits } = useDemoHabits();
  
  // Calcular estatísticas reais dos hábitos demo
  const completedToday = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const currentStreak = Math.max(...habits.map(h => h.streak), 0);
  const totalCompletions = habits.reduce((sum, h) => sum + h.total_completions, 0);
  
  // Simular dados semanais para gráfico
  const weeklyData = [85, 92, 78, 95, 88, 90, completionRate];
  const bestDayValue = Math.max(...weeklyData);
  const bestDayIndex = weeklyData.indexOf(bestDayValue);
  const bestDayName = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][bestDayIndex];
  const averageCompletion = Math.round(weeklyData.reduce((a, b) => a + b, 0) / weeklyData.length);

  return (
    <div className="space-y-4">
      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatMetricCard
          icon={<Target className="w-5 h-5" strokeWidth={2} />}
          title="Taxa de Conclusão"
          value={`${completionRate}%`}
          subtitle="dos hábitos completados"
        />
        <StatMetricCard
          icon={<Flame className="w-5 h-5" strokeWidth={2} />}
          title="Sequência Ativa"
          value={`${currentStreak}`}
          subtitle="dias consecutivos"
        />
        <StatMetricCard
          icon={<CheckCircle2 className="w-5 h-5" strokeWidth={2} />}
          title="Total"
          value={totalCompletions.toString()}
          subtitle="hábitos completados"
        />
        <StatMetricCard
          icon={<TrendingUp className="w-5 h-5" strokeWidth={2} />}
          title="Melhor Dia"
          value={bestDayName}
          subtitle="maior taxa de conclusão"
        />
      </div>

      {/* Smart Insights */}
      <SmartInsights
        averageCompletion={completionRate}
        currentStreak={currentStreak}
        bestDay={{ date: new Date().toISOString(), percentage: bestDayValue }}
        worstDay={{ date: new Date().toISOString(), percentage: Math.min(...weeklyData) }}
        totalCompletions={totalCompletions}
      />

      {/* Gráfico Semanal Melhorado */}
      <div className="mt-4 rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">Progresso Semanal</h4>
            <span className="text-xs text-muted-foreground">Últimos 7 dias</span>
          </div>
          <div className="space-y-2">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, i) => {
              const value = weeklyData[i];
              const isToday = i === weeklyData.length - 1;
              return (
                <div key={day} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-8 flex-shrink-0">{day}</span>
                  <div className="flex-1 h-6 bg-slate-800 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isToday 
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 animate-pulse' 
                          : 'bg-gradient-to-r from-violet-500 to-purple-500'
                      }`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium w-8 text-right flex-shrink-0 ${
                    isToday ? 'text-pink-400' : 'text-foreground'
                  }`}>
                    {value}%
                  </span>
                </div>
              );
            })}
          </div>
          <div className="pt-3 border-t border-border grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Média</p>
              <p className="text-base font-bold text-foreground">{averageCompletion}%</p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-xs text-muted-foreground mb-1">Melhor</p>
              <p className="text-base font-bold text-violet-400">{bestDayValue}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Pior</p>
              <p className="text-base font-bold text-violet-300">{Math.min(...weeklyData)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Dashboard Demo usando view de lista (similar ao CompactPreviewContent)
const DashboardPreview: React.FC = () => {
  const { habits, toggleHabit } = useDemoHabits();
  const isMobile = useIsMobile();
  
  // Formatar data atual
  const todayFormatted = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  
  // Calcular estatísticas
  const completedToday = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;
  const completionPercentage = totalHabits > 0 
    ? Math.round((completedToday / totalHabits) * 100) 
    : 0;
  const activeStreaks = habits.filter(h => h.streak > 0).length;

  // Versão mobile: usar a versão compacta refatorada
  if (isMobile) {
    return <CompactPreviewContent />;
  }

  // Versão desktop: view de lista com espaçamento consistente
  return (
    <div className="space-y-5">
      {/* Container principal com destaque visual */}
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-violet-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Card principal */}
        <div className="relative bg-card rounded-2xl border border-border/50 p-6 lg:p-8 shadow-2xl backdrop-blur-sm overflow-hidden">
          {/* Background gradiente sutil */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/3 to-transparent opacity-50" />
          
          <div className="relative space-y-6">
            {/* Header do Dashboard */}
            <div className="space-y-3 pb-5 border-b border-border/50">
              <p className="text-sm text-muted-foreground/70 font-medium">
                {todayFormatted}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center border border-violet-500/30">
                  <Atom className="w-5 h-5 text-violet-400" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Olá Visitante
                  </h3>
                  <p className="text-sm text-muted-foreground/80">
                    Cada ação é um voto para quem você está se tornando
                  </p>
                </div>
              </div>
            </div>

            {/* Métricas Visuais */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-4 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" strokeWidth={2} />
                </div>
                <div className="text-xl font-bold text-foreground">{completedToday}/{totalHabits}</div>
                <div className="text-xs text-muted-foreground">Completados</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <div className="flex items-center justify-center mb-2">
                  <Flame className="w-4 h-4 text-amber-400" strokeWidth={2} />
                </div>
                <div className="text-xl font-bold text-amber-400">{activeStreaks}</div>
                <div className="text-xs text-muted-foreground">Streaks</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-4 h-4 text-violet-400" strokeWidth={2} />
                </div>
                <div className="text-xl font-bold text-violet-400">{completionPercentage}%</div>
                <div className="text-xs text-muted-foreground">Taxa</div>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Progresso de Hoje</span>
                <span className="text-violet-400 font-bold">{completionPercentage}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Cards de Hábitos - Lista */}
            <div className="space-y-3 pt-2">
              {habits.map((habit) => (
                <div 
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className="cursor-pointer hover:scale-[1.01] transition-all duration-200"
                >
                  <HabitCard
                    habit={{
                      ...habit,
                      id: parseInt(habit.id.replace('demo-', '')) || 1,
                    } as any}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    isDemo={true}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Calendar Demo
const CalendarPreview: React.FC = () => {
  const { habits } = useDemoHabits();
  
  // Gerar completions demo para o último mês
  const generateDemoCompletions = () => {
    const completions: any[] = [];
    const today = new Date();
    
    habits.forEach((habit, habitIndex) => {
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Simular padrão: 70% de completion
        if (Math.random() > 0.3) {
          completions.push({
            id: `demo-${habitIndex}-${i}`,
            habit_id: parseInt(habit.id.replace('demo-', '')) || 1,
            date: date.toISOString().split('T')[0],
            percentage: Math.random() > 0.5 ? 100 : Math.floor(Math.random() * 99 + 1),
            completed_at: date.toISOString(),
          });
        }
      }
    });
    
    return completions;
  };

  return (
    <NotionCalendar
      habits={habits as any}
      completions={generateDemoCompletions()}
      onHabitToggle={() => {}}
    />
  );
};

export const FeaturesCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides: Slide[] = [
    {
      id: 'dashboard',
      title: 'Dashboard Pessoal',
      subtitle: 'Veja tudo em 3 segundos. Zero sobrecarga cognitiva.',
      icon: <LayoutDashboard className="w-6 h-6 text-violet-400" />,
      component: (
        <DemoHabitsProvider>
          <DashboardPreview />
        </DemoHabitsProvider>
      ),
      benefits: ['Visão geral diária', 'Kanban intuitivo', 'Timeline de progresso', 'Acesso rápido']
    },
    {
      id: 'calendar',
      title: 'Calendário Visual',
      subtitle: 'Heatmap que mostra padrões. Não streaks que te punem.',
      icon: <Calendar className="w-6 h-6 text-violet-400" />,
      component: (
        <DemoHabitsProvider>
          <CalendarPreview />
        </DemoHabitsProvider>
      ),
      benefits: ['Visualização anual', 'Padrões visuais', 'Heatmap interativo', 'Histórico completo']
    },
    {
      id: 'stats',
      title: 'Estatísticas Avançadas',
      subtitle: 'Dados que ajudam, não números que te intimidam.',
      icon: <BarChart3 className="w-6 h-6 text-violet-400" />,
      component: (
        <DemoHabitsProvider>
          <StatsPreview />
        </DemoHabitsProvider>
      ),
      benefits: ['Métricas precisas', 'Gráficos detalhados', 'Insights automáticos', 'Trends semanais']
    }
  ];

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 lg:py-16 overflow-x-hidden">
      <div className="text-center mb-16 lg:mb-20 space-y-4">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-50 font-display tracking-tight break-words">
          Explore todas as funcionalidades
        </h2>
        <p className="text-slate-400 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed break-words">
          Interface real do atomicTrack. Cada feature foi pensada para simplificar sua jornada.
        </p>
      </div>

      <div className="relative">
        {/* Carousel Container */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/50 p-2">
          <div className="relative" style={{ minHeight: '600px' }}>
            {slides.map((slide, index) => (
              <CarouselSlide
                key={slide.id}
                slide={slide}
                isActive={index === currentSlide}
              />
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/90 backdrop-blur-sm border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-all hover:scale-110"
          aria-label="Slide anterior"
        >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/90 backdrop-blur-sm border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-all hover:scale-110"
          aria-label="Próximo slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
        </button>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentSlide
                  ? "w-8 bg-violet-500"
                  : "bg-slate-700 hover:bg-slate-600"
              )}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

