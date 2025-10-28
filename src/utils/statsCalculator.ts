/**
 * Calculadores de estatísticas reais para o perfil
 * Foca em dados que realmente importam para o usuário
 */

export interface Completion {
  date: string;
  habit_id: number;
  percentage: number;
}

export interface HabitStats {
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  activeHabits: number;
}

/**
 * Calcula sequência atual de dias consecutivos
 * Considera apenas completions com 100% de conclusão
 */
export const calculateCurrentStreak = (completions: Completion[]): number => {
  if (!completions.length) return 0;
  
  // Filtrar apenas completions de 100%
  const fullCompletions = completions.filter(c => c.percentage >= 100);
  
  if (!fullCompletions.length) return 0;
  
  // Ordenar por data decrescente
  const sorted = [...fullCompletions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  // Agrupar completions por data única
  const completionsByDate = new Map<string, Completion[]>();
  for (const completion of sorted) {
    const dateKey = completion.date;
    if (!completionsByDate.has(dateKey)) {
      completionsByDate.set(dateKey, []);
    }
    completionsByDate.get(dateKey)!.push(completion);
  }
  
  // Calcular streak a partir de hoje
  for (let i = 0; i < 365; i++) { // Limite de 1 ano para evitar loop infinito
    const checkDate = new Date(currentDate);
    checkDate.setDate(checkDate.getDate() - i);
    const dateKey = checkDate.toISOString().split('T')[0];
    
    if (completionsByDate.has(dateKey)) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

/**
 * Calcula a maior sequência de dias consecutivos
 * Considera apenas completions com 100% de conclusão
 */
export const calculateLongestStreak = (completions: Completion[]): number => {
  if (!completions.length) return 0;
  
  // Filtrar apenas completions de 100%
  const fullCompletions = completions.filter(c => c.percentage >= 100);
  
  if (!fullCompletions.length) return 0;
  
  // Ordenar por data crescente
  const sorted = [...fullCompletions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Agrupar por data única
  const uniqueDates = Array.from(
    new Set(sorted.map(c => c.date))
  ).sort();
  
  let maxStreak = 0;
  let currentStreak = 0;
  let lastDate: Date | null = null;
  
  for (const dateStr of uniqueDates) {
    const currentDate = new Date(dateStr);
    currentDate.setHours(0, 0, 0, 0);
    
    if (!lastDate) {
      currentStreak = 1;
    } else {
      const diffDays = Math.floor(
        (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }
    
    lastDate = currentDate;
  }
  
  return Math.max(maxStreak, currentStreak);
};

/**
 * Calcula total de completions únicas (por data)
 * Considera apenas completions com 100% de conclusão
 */
export const calculateTotalCompletions = (completions: Completion[]): number => {
  const fullCompletions = completions.filter(c => c.percentage >= 100);
  const uniqueDates = new Set(fullCompletions.map(c => c.date));
  return uniqueDates.size;
};

/**
 * Calcula estatísticas completas do usuário
 * Combina todos os cálculos em uma única função
 */
export const calculateHabitStats = (
  completions: Completion[],
  activeHabitsCount: number
): HabitStats => {
  return {
    totalCompletions: calculateTotalCompletions(completions),
    currentStreak: calculateCurrentStreak(completions),
    longestStreak: calculateLongestStreak(completions),
    activeHabits: activeHabitsCount,
  };
};
