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

      let xpData: { total_xp: number; reasons: string[] } | null = null;
      let attempts = 0;
      const maxAttempts = 3;

      // Tentar chamar RPC com retry
      while (attempts < maxAttempts && !xpData) {
        attempts++;
        
        try {
          const { data, error } = await supabase.rpc('get_habit_completion_xp', {
            p_user_id: userId,
            p_habit_id: habitId,
            p_date: completionDate,
          });

          if (error) {
            console.warn(`⚠️ Tentativa ${attempts} falhou:`, error);
            if (attempts >= maxAttempts) {
              throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 500 * attempts));
            continue;
          }

          if (data && data.length > 0) {
            xpData = data[0];
            console.log('✅ XP calculado com sucesso:', xpData);
          }
        } catch (rpcError) {
          console.warn(`Erro na tentativa ${attempts}:`, rpcError);
          if (attempts >= maxAttempts) {
            // Fallback para XP base
            xpData = { 
              total_xp: 25, 
              reasons: ['Hábito completado (fallback)'] 
            };
          }
        }
      }

      // Garantir fallback se ainda não tiver XP
      if (!xpData) {
        xpData = { 
          total_xp: 25, 
          reasons: ['Hábito completado (base)'] 
        };
      }

      const xpAmount = xpData.total_xp;
      const xpReasons = xpData.reasons;

      // Buscar identidade e dados do perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('desired_identity, xp, level')
        .eq('id', userId)
        .single();

      const { data: habitData } = await supabase
        .from('habits')
        .select('identity_goal')
        .eq('id', habitId)
        .single();

      const identityGoal = habitData?.identity_goal || profile?.desired_identity || 'pessoa disciplinada e consistente';
      const oldXP = profile?.xp || 0;
      const oldLevel = profile?.level || 1;
      const newXP = oldXP + xpAmount;

      // Calcular novo nível
      const oldLevelInfo = calculateLevel(oldXP);
      const newLevelInfo = calculateLevel(newXP);
      const didLevelUp = newLevelInfo.level > oldLevelInfo.level;

      // Atualizar XP no banco (o trigger atualiza o level automaticamente)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ xp: newXP })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Erro ao atualizar XP:', updateError);
        throw updateError;
      }

      console.log('🎉 XP atualizado:', { 
        oldXP, 
        newXP, 
        xpAmount, 
        oldLevel: oldLevelInfo.level,
        newLevel: newLevelInfo.level,
        didLevelUp 
      });

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
        newVoteCount: 15,
        oldLevel: 1,
        newLevel: 1,
        levelUp: false,
      };
    }
  },
};

// Backward compatibility
export const xpService = identityVotesService;
