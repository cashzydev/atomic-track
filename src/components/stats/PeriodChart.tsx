import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { usePeriodStats } from '@/hooks/usePeriodStats';
import type { PeriodType } from '@/components/stats/PeriodFilter';
import PeriodFilter from '@/components/stats/PeriodFilter';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PeriodChart = () => {
  const [period, setPeriod] = useState<PeriodType>('7d');
  const { data: stats, isLoading } = usePeriodStats(period);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4">
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (!stats) return null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const emoji = data.percentage >= 80 ? '🔥' : data.percentage >= 50 ? '✨' : '💪';
      
      return (
        <div className="rounded-lg border border-border bg-background/95 backdrop-blur-sm p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-1">
            {format(new Date(data.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
          <p className="text-xs text-muted-foreground mb-2">
            {data.completed}/{data.total} hábitos completados
          </p>
          <div className="flex items-center gap-2">
            <span className="text-lg">{emoji}</span>
            <span className="text-sm font-bold text-violet-400">
              {data.percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-card/50 backdrop-blur-sm p-5 shadow-[0_4px_15px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Evolução no Tempo</h3>
        </div>
        <PeriodFilter selectedPeriod={period} onPeriodChange={setPeriod} />
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={stats.data} margin={{ top: 30, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.95}/>
              <stop offset="100%" stopColor="#7C3AED" stopOpacity={1}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="label" 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))' }} />
          <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
            {stats.data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isToday ? '#EC4899' : 'url(#barGradient)'}
                className={entry.isToday ? 'animate-pulse' : ''}
              />
            ))}
            <LabelList
              dataKey="percentage"
              content={(props: any) => {
                const { x, y, width, payload } = props;
                if (!payload || !payload.isToday) return null;
                return (
                  <g>
                    <rect
                      x={x + width / 2 - 20}
                      y={y - 25}
                      width={40}
                      height={18}
                      fill="#EC4899"
                      rx={4}
                    />
                    <text
                      x={x + width / 2}
                      y={y - 13}
                      textAnchor="middle"
                      fill="white"
                      fontSize={10}
                      fontWeight="bold"
                    >
                      HOJE
                    </text>
                  </g>
                );
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-border/30">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Média</p>
          <p className="text-lg font-bold text-foreground">{stats.averagePercentage}%</p>
        </div>
        <div className="text-center border-x border-border">
          <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
            <TrendingUp className="w-3 h-3" /> Melhor
          </p>
          <p className="text-lg font-bold text-violet-400">{stats.bestPeriod.percentage}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
            <TrendingDown className="w-3 h-3" /> Menor
          </p>
          <p className="text-lg font-bold text-violet-300">{stats.worstPeriod.percentage}%</p>
        </div>
      </div>
    </motion.div>
  );
};

export default PeriodChart;
