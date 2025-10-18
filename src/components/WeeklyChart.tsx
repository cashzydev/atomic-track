import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DayData {
  day: string;
  date: string;
  completed: number;
  total: number;
  percentage: number;
  isToday: boolean;
}

interface WeeklyChartProps {
  weekData: DayData[];
}

const WeeklyChart = ({ weekData }: WeeklyChartProps) => {
  // Calcular métricas
  const totalCompleted = weekData.reduce((sum, day) => sum + day.completed, 0);
  const totalPossible = weekData.reduce((sum, day) => sum + day.total, 0);
  const averagePercentage = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
  
  const bestDay = weekData.reduce((best, day) => 
    day.percentage > best.percentage ? day : best
  , weekData[0]);
  
  const worstDay = weekData
    .filter(day => day.total > 0 && !day.isToday) // Excluir dias sem hábitos e hoje
    .reduce((worst, day) => 
      day.percentage < worst.percentage ? day : worst
    , weekData[0]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border-2 border-violet-500 rounded-lg p-3 shadow-xl">
          <p className="text-slate-50 font-semibold mb-1">{data.day}</p>
          <p className="text-violet-400 text-sm">
            {data.completed}/{data.total} hábitos
          </p>
          <p className="text-slate-300 text-sm font-bold">
            {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 animate-fade-in">
      {/* Header */}
      <h2 className="text-xl sm:text-2xl font-bold heading-section text-slate-50 mb-4 sm:mb-6 flex items-center gap-2">
        <span>📊</span>
        Progresso Semanal
      </h2>

      {/* Gráfico */}
      <div className="bg-slate-800/50 rounded-xl p-4 sm:p-6 mb-4 border border-slate-700">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={weekData}>
            {/* Eixo X - Dias da semana */}
            <XAxis 
              dataKey="day" 
              stroke="#cbd5e1" 
              tick={{ fill: '#cbd5e1', fontSize: 12 }}
              axisLine={{ stroke: '#475569' }}
            />
            
            {/* Eixo Y - Número de hábitos */}
            <YAxis 
              stroke="#cbd5e1"
              tick={{ fill: '#cbd5e1', fontSize: 12 }}
              axisLine={{ stroke: '#475569' }}
              allowDecimals={false}
            />
            
            {/* Tooltip customizado */}
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(124, 58, 237, 0.1)' }}
            />
            
            {/* Barras com cores baseadas em percentage */}
            <Bar 
              dataKey="completed" 
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
            >
              {weekData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={
                    entry.isToday 
                      ? '#a78bfa' // Roxo claro para hoje
                      : entry.percentage >= 80 
                        ? '#7c3aed' // Roxo escuro (ótimo)
                        : entry.percentage >= 50
                          ? '#a78bfa' // Roxo médio (bom)
                          : entry.percentage > 0
                            ? '#f59e0b' // Amber (parcial)
                            : '#475569' // Cinza (não feito/futuro)
                  }
                  style={{
                    filter: entry.percentage > 0 
                      ? 'drop-shadow(0 0 8px rgba(124, 58, 237, 0.5))' 
                      : 'none'
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Label nos topos das barras */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mt-2">
          {weekData.map((day, index) => (
            <div 
              key={index} 
              className="text-center text-xs font-semibold"
              style={{
                color: day.percentage >= 80 ? '#a78bfa' : 
                       day.percentage >= 50 ? '#cbd5e1' : 
                       day.percentage > 0 ? '#f59e0b' : '#64748b'
              }}
            >
              {day.completed}/{day.total}
            </div>
          ))}
        </div>
      </div>

      {/* Métricas embaixo do gráfico */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
        
        {/* Taxa média */}
        <div className="bg-slate-800/80 rounded-xl p-3 sm:p-4 border border-slate-700 hover:border-violet-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-slate-400">Taxa Média</span>
            <span className="text-2xl">📈</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-50 mb-1">
            {averagePercentage}%
          </div>
          <p className="text-xs text-slate-400">
            {totalCompleted}/{totalPossible} hábitos
          </p>
          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
              style={{ width: `${averagePercentage}%` }}
            />
          </div>
        </div>

        {/* Melhor dia */}
        <div className="bg-slate-800/80 rounded-xl p-3 sm:p-4 border border-slate-700 hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-slate-400">Melhor Dia</span>
            <span className="text-2xl">🔥</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 mb-1">
            {bestDay.day}
          </div>
          <p className="text-xs text-slate-400">
            {bestDay.percentage}% ({bestDay.completed}/{bestDay.total})
          </p>
        </div>

        {/* Dia mais desafiador */}
        <div className="bg-slate-800/80 rounded-xl p-3 sm:p-4 border border-slate-700 hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-slate-400">Precisa Atenção</span>
            <span className="text-2xl">💪</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 mb-1">
            {worstDay.day}
          </div>
          <p className="text-xs text-slate-400">
            {worstDay.percentage}% ({worstDay.completed}/{worstDay.total})
          </p>
        </div>

      </div>

      {/* Legenda de cores */}
      <div className="flex flex-wrap gap-3 sm:gap-4 mt-4 pt-4 border-t border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-violet-600"></div>
          <span className="text-xs text-slate-400">Ótimo (80-100%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-violet-400"></div>
          <span className="text-xs text-slate-400">Bom (50-79%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-amber-500"></div>
          <span className="text-xs text-slate-400">Parcial (1-49%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-slate-600"></div>
          <span className="text-xs text-slate-400">Não feito / Futuro</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-violet-300 border-2 border-violet-400"></div>
          <span className="text-xs text-violet-400 font-medium">Hoje</span>
        </div>
      </div>

    </div>
  );
};

export default WeeklyChart;