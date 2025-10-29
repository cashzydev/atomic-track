import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Lightbulb, TrendingUp, AlertTriangle, Trophy } from 'lucide-react';

interface SmartInsightsProps {
  averageCompletion: number;
  currentStreak: number;
  bestDay: { date: string; percentage: number };
  worstDay: { date: string; percentage: number };
  totalCompletions: number;
}

interface Insight {
  type: 'success' | 'warning' | 'celebration' | 'tip';
  icon: React.ReactNode;
  title: string;
  description: string;
}

const SmartInsights = ({ 
  averageCompletion, 
  currentStreak, 
  bestDay, 
  worstDay,
  totalCompletions 
}: SmartInsightsProps) => {
  const insights = useMemo(() => {
    const result: Insight[] = [];

    // Insight 1: Alta performance
    if (averageCompletion >= 75) {
      result.push({
        type: 'celebration',
        icon: <Trophy className="w-5 h-5" />,
        title: 'Desempenho excepcional!',
        description: `Com ${Math.round(averageCompletion)}% de conclusão, você está entre os mais consistentes. Continue assim!`,
      });
    }

    // Insight 2: Sequência forte
    if (currentStreak >= 7) {
      result.push({
        type: 'success',
        icon: <TrendingUp className="w-5 h-5" />,
        title: `${currentStreak} dias de sequência! 🔥`,
        description: 'Você está construindo um hábito sólido. A consistência é a chave para mudanças duradouras.',
      });
    }

    // Insight 3: Dia desafiador
    if (worstDay.percentage < 50 && averageCompletion >= 60) {
      const worstDayName = new Date(worstDay.date).toLocaleDateString('pt-BR', { weekday: 'long' });
      result.push({
        type: 'warning',
        icon: <AlertTriangle className="w-5 h-5" />,
        title: `${worstDayName} precisa de atenção`,
        description: 'Tente programar hábitos mais simples ou ajustar o horário para dias desafiadores.',
      });
    }

    // Insight 4: Dica geral
    if (totalCompletions > 0 && averageCompletion < 70) {
      result.push({
        type: 'tip',
        icon: <Lightbulb className="w-5 h-5" />,
        title: 'Dica para melhorar',
        description: 'Reduza o número de hábitos ou simplifique-os. É melhor fazer menos consistentemente do que muitos de forma irregular.',
      });
    }

    return result;
  }, [averageCompletion, currentStreak, bestDay, worstDay, totalCompletions]);

  if (insights.length === 0) return null;

  return (
    <div className="space-y-2">
      {insights.map((insight, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className={cn(
            "p-4 rounded-xl bg-card/50 backdrop-blur-sm shadow-[0_4px_15px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_15px_rgba(0,0,0,0.2)]",
            insight.type === 'success' && "bg-gradient-to-br from-emerald-500/5 to-teal-500/5",
            insight.type === 'warning' && "bg-gradient-to-br from-amber-500/5 to-orange-500/5",
            insight.type === 'celebration' && "bg-gradient-to-br from-violet-500/5 to-purple-500/5",
            insight.type === 'tip' && "bg-gradient-to-br from-blue-500/5 to-cyan-500/5"
          )}
        >
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10 text-violet-400 flex-shrink-0 mt-0.5">
              {insight.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground text-sm mb-1">
                {insight.title}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {insight.description}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SmartInsights;
