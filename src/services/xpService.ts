import { supabase } from '@/integrations/supabase/client';
import { calculateLevel } from '@/systems/levelSystem';

export interface IdentityVoteResult {
  totalVotes: number;
  reasons: string[];
  newVoteCount: number;
  oldLevel: number;
  newLevel: number;
  levelUp: boolean;
  identityGoal?: string;
}

export const identityVotesService = {
  /**
   * Remove XP quando um hábito é desfeito
   * Calcula o XP que foi concedido e remove do perfil do usuário
   */
  async removeHabitCompletionXP(
    userId: string,
    habitId: number,
    habitTitle: string
  ): Promise<IdentityVoteResult> {
    console.log('🔄 Removendo XP de hábito desfeito:', { userId, habitId, habitTitle });

    try {
      // Buscar data do servidor
      const { data: serverDate } = await supabase.rpc('get_server_date');
      const completionDate = serverDate || new Date().toISOString().split('T')[0];

      // Calcular XP que foi concedido (mesma lógica do award)
      let xpToRemove: { total_xp: number; reasons: string[] } = { 
        total_xp: 10, 
        reasons: ['Hábito desfeito (-10 XP)'] 
      };

      try {
        // IMPORTANTE: Calcular XP baseado no estado ANTES do undo
        // Verificar se era primeiro hábito do dia (antes do undo)
        const { data: todayCompletions } = await supabase
          .from('habits')
          .select('id')
          .eq('user_id', userId)
          .eq('status', 'active')
          .eq('last_completed', completionDate)
          .gt('streak', 0);

        const completedToday = todayCompletions?.length || 0;
        
        // Se completadoToday = 0, significa que este era o único hábito completado hoje
        if (completedToday === 0) {
          xpToRemove.total_xp += 5;
          xpToRemove.reasons.push('Primeiro hábito do dia removido (-5 XP)');
        }

        // Verificar se completou todos os hábitos ativos (antes do undo)
        const { data: activeHabits } = await supabase
          .from('habits')
          .select('id')
          .eq('user_id', userId)
          .eq('status', 'active');

        const activeHabitsCount = activeHabits?.length || 0;
        
        // Se completadoToday + 1 >= activeHabitsCount, significa que tinha todos completados
        if (completedToday + 1 >= activeHabitsCount && activeHabitsCount > 0) {
          xpToRemove.total_xp += 15;
          xpToRemove.reasons.push('Bônus "todos completados" removido (-15 XP)');
        }

        // Verificar streak do hábito atual (ANTES do undo - streak atual)
        const { data: currentHabit } = await supabase
          .from('habits')
          .select('streak')
          .eq('id', habitId)
          .single();

        const currentStreak = currentHabit?.streak || 0;
        
        if (currentStreak === 7) {
          xpToRemove.total_xp += 5;
          xpToRemove.reasons.push('Bônus streak 7 dias removido (-5 XP)');
        } else if (currentStreak === 30) {
          xpToRemove.total_xp += 10;
          xpToRemove.reasons.push('Bônus streak 30 dias removido (-10 XP)');
        } else if (currentStreak === 90) {
          xpToRemove.total_xp += 15;
          xpToRemove.reasons.push('Bônus streak 90 dias removido (-15 XP)');
        }

        console.log('✅ XP a ser removido calculado:', xpToRemove);
      } catch (error) {
        console.warn('⚠️ Erro ao calcular XP a remover, usando valor base:', error);
        // Manter o valor base se houver erro
      }

      const xpAmount = xpToRemove.total_xp;
      const xpReasons = xpToRemove.reasons;

      // Buscar dados do perfil atual
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('id', userId)
        .single();

      const oldXP = profile?.xp || 0;
      const oldLevel = profile?.level || 1;
      const newXP = Math.max(0, oldXP - xpAmount); // Não permitir XP negativo

      // Calcular novo nível
      const oldLevelInfo = calculateLevel(oldXP);
      const newLevelInfo = calculateLevel(newXP);
      const didLevelDown = newLevelInfo.level < oldLevelInfo.level;

      // Atualizar XP e level no banco (sempre juntos para consistência)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          xp: newXP,
          level: newLevelInfo.level  // Sempre atualizar level explicitamente
        })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Erro ao remover XP:', updateError);
        throw updateError;
      }

      console.log('🎉 XP removido:', { 
        oldXP, 
        newXP, 
        xpAmount, 
        oldLevel: oldLevelInfo.level,
        newLevel: newLevelInfo.level,
        didLevelDown 
      });

      const result: IdentityVoteResult = {
        totalVotes: 1,
        reasons: xpReasons,
        newVoteCount: -xpAmount, // Negativo para indicar remoção
        oldLevel: oldLevelInfo.level,
        newLevel: newLevelInfo.level,
        levelUp: false, // Nunca sobe de nível ao desfazer
      };

      return result;
    } catch (error) {
      console.error('❌ Erro crítico ao remover XP:', error);
      
      // Retorno de emergência
      return {
        totalVotes: 1,
        reasons: ['Hábito desfeito (erro)'],
        newVoteCount: -10,
        oldLevel: 1,
        newLevel: 1,
        levelUp: false,
      };
    }
  },

  /**
   * Registra um voto de identidade ao completar um hábito
   * Concede XP baseado no sistema de recompensas (novo sistema balanceado)
   */
  async awardForHabitCompletion(
    userId: string,
    habitId: number,
    habitTitle: string
  ): Promise<IdentityVoteResult> {
    console.log('🎯 Registrando voto de identidade:', { userId, habitId, habitTitle });

    try {
      // Buscar data do servidor
      const { data: serverDate } = await supabase.rpc('get_server_date');
      const completionDate = serverDate || new Date().toISOString().split('T')[0];

      // Calcular XP diretamente sem depender da função RPC
      let xpData: { total_xp: number; reasons: string[] } = { 
        total_xp: 10, 
        reasons: ['Hábito completado (+10 XP)'] 
      };

      try {
        // Verificar se é primeiro hábito do dia
        const { data: todayCompletions } = await supabase
          .from('habits')
          .select('id')
          .eq('user_id', userId)
          .eq('status', 'active')
          .eq('last_completed', completionDate)
          .gt('streak', 0);

        const completedToday = todayCompletions?.length || 0;
        
        if (completedToday === 1) {
          xpData.total_xp += 5;
          xpData.reasons.push('Primeiro hábito do dia! 🌅 (+5 XP)');
        }

        // Verificar se completou todos os hábitos ativos
        const { data: activeHabits } = await supabase
          .from('habits')
          .select('id')
          .eq('user_id', userId)
          .eq('status', 'active');

        const activeHabitsCount = activeHabits?.length || 0;
        
        if (completedToday >= activeHabitsCount && activeHabitsCount > 0) {
          xpData.total_xp += 15;
          xpData.reasons.push('Todos os hábitos completados! 🎯 (+15 XP)');
        }

        // Verificar streak do hábito atual
        const { data: currentHabit } = await supabase
          .from('habits')
          .select('streak')
          .eq('id', habitId)
          .single();

        const currentStreak = currentHabit?.streak || 0;
        
        if (currentStreak === 7) {
          xpData.total_xp += 5;
          xpData.reasons.push('7 dias de sequência! 🔥 (+5 XP)');
        } else if (currentStreak === 30) {
          xpData.total_xp += 10;
          xpData.reasons.push('30 dias de sequência! 🔥🔥 (+10 XP)');
        } else if (currentStreak === 90) {
          xpData.total_xp += 15;
          xpData.reasons.push('90 dias de sequência! 🔥🔥🔥 (+15 XP)');
        }

        console.log('✅ XP calculado com sucesso:', xpData);
      } catch (error) {
        console.warn('⚠️ Erro ao calcular XP, usando valor base:', error);
        // Manter o valor base se houver erro
      }

      const xpAmount = xpData.total_xp;
      const xpReasons = xpData.reasons;

      // Buscar identidade e dados do perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('id', userId)
        .single();

      const { data: habitData } = await supabase
        .from('habits')
        .select('identity_goal')
        .eq('id', habitId)
        .single();

      const identityGoal = habitData?.identity_goal || 'pessoa disciplinada e consistente';
      const oldXP = profile?.xp || 0;
      const oldLevel = profile?.level || 1;
      const newXP = oldXP + xpAmount;

      // Calcular novo nível ANTES de atualizar
      const oldLevelInfo = calculateLevel(oldXP);
      const newLevelInfo = calculateLevel(newXP);
      const didLevelUp = newLevelInfo.level > oldLevelInfo.level;

      // Atualizar XP no banco (o trigger atualiza o level automaticamente)
      // IMPORTANTE: Sempre atualizar XP e level juntos para garantir consistência
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          xp: newXP,
          level: newLevelInfo.level  // Sempre atualizar level explicitamente
        })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Erro ao atualizar XP:', updateError);
        throw updateError;
      }

      // Verificar se o nível foi atualizado corretamente
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('level')
        .eq('id', userId)
        .single();

      if (updatedProfile?.level !== newLevelInfo.level) {
        console.warn('⚠️ Level não foi atualizado corretamente pelo trigger, forçando atualização...');
        // Tentar atualizar novamente
        const { error: retryError } = await supabase
          .from('profiles')
          .update({ level: newLevelInfo.level })
          .eq('id', userId);

        if (retryError) {
          console.error('❌ Erro ao atualizar level após retry:', retryError);
        }
      }

      console.log('🎉 XP atualizado:', { 
        oldXP, 
        newXP, 
        xpAmount, 
        oldLevel: oldLevelInfo.level,
        newLevel: newLevelInfo.level,
        didLevelUp 
      });

      // Log detalhado se houve level up
      if (didLevelUp) {
        console.log('🚀 LEVEL UP DETECTADO!', {
          oldLevel: oldLevelInfo.level,
          newLevel: newLevelInfo.level,
          oldXP,
          newXP,
          levelInfo: newLevelInfo.levelInfo
        });
      }

      const result: IdentityVoteResult = {
        totalVotes: 1,
        reasons: xpReasons,
        newVoteCount: xpAmount,
        oldLevel: oldLevelInfo.level,
        newLevel: newLevelInfo.level,
        levelUp: didLevelUp,
        identityGoal,
      };

      return result;
    } catch (error) {
      console.error('❌ Erro crítico ao registrar voto:', error);
      
      // Retorno de emergência
      return {
        totalVotes: 1,
        reasons: ['Hábito completado (erro)'],
        newVoteCount: 10,
        oldLevel: 1,
        newLevel: 1,
        levelUp: false,
      };
    }
  },
};

// Backward compatibility
export const xpService = identityVotesService;
