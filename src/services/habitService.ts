import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type HabitInsert = Database['public']['Tables']['habits']['Insert'];
type HabitRow = Database['public']['Tables']['habits']['Row'];
type HabitUpdate = Database['public']['Tables']['habits']['Update'];

// Interface para dados do hábito vindos do formulário
interface HabitFormData {
  title: string;
  icon?: string;
  when_time: string;
  where_location: string;
  trigger_activity?: string | null;
  temptation_bundle?: string | null;
  environment_prep?: string | null;
  social_reinforcement?: string | null;
  goal_target: number;
  goal_unit?: string;
}

export const habitService = {
  async getHabits(userId: string): Promise<{ data: HabitRow[] | null; error: any }> {
    try {
      if (!userId) throw new Error('User ID is required');

      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching habits:', error);
      return { data: null, error };
    }
  },

  async getHabit(id: number): Promise<{ data: HabitRow | null; error: any }> {
    try {
      if (!id) throw new Error('Habit ID is required');

      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching habit:', error);
      return { data: null, error };
    }
  },

  async createHabit(habitData: HabitFormData): Promise<{ data: HabitRow | null; error: any }> {
    try {
      console.log('🔍 habitService.createHabit chamado com:', habitData);

      // 1. Obter usuário autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('❌ Erro de autenticação:', authError);
        return { data: null, error: 'Usuário não autenticado' };
      }

      console.log('👤 Usuário autenticado:', user.id);

      // 2. Construir objeto com campos corretos do banco
      const newHabit: HabitInsert = {
        user_id: user.id,
        title: habitData.title.trim(),
        icon: habitData.icon || '⚛️',
        when_time: habitData.when_time.trim(),
        where_location: habitData.where_location.trim(),
        trigger_activity: habitData.trigger_activity || null,
        temptation_bundle: habitData.temptation_bundle || null,
        environment_prep: habitData.environment_prep || null,
        social_reinforcement: habitData.social_reinforcement || null,
        goal_target: habitData.goal_target,
        goal_unit: habitData.goal_unit || 'vezes',
        streak: 0,
        longest_streak: 0,
        total_completions: 0,
        status: 'active', // Sempre começa como 'active'
      };

      console.log('📤 Dados sendo enviados:', newHabit);

      // 3. Inserir no Supabase
      const { data, error } = await supabase
        .from('habits')
        .insert(newHabit)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro do Supabase ao criar hábito:', error);
        return { data: null, error: error.message };
      }

      console.log('✅ Hábito criado com sucesso:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Erro inesperado ao criar hábito:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  },

  async updateHabit(id: number, data: HabitUpdate): Promise<{ data: HabitRow | null; error: any }> {
    try {
      if (!id) throw new Error('Habit ID is required');

      const { data: habit, error } = await supabase
        .from('habits')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: habit, error: null };
    } catch (error) {
      console.error('Error updating habit:', error);
      return { data: null, error };
    }
  },

  async deleteHabit(id: number): Promise<{ error: any }> {
    try {
      if (!id) throw new Error('Habit ID is required');

      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting habit:', error);
      return { error };
    }
  },

  async completeHabit(habitId: number, userId: string, date: string, percentage: number): Promise<{ error: any }> {
    try {
      if (!habitId) throw new Error('Habit ID is required');
      if (!userId) throw new Error('User ID is required');
      if (!date) throw new Error('Date is required');
      if (percentage < 0 || percentage > 100) throw new Error('Percentage must be between 0 and 100');

      // 1. Registrar completion usando upsert para evitar duplicação
      const { error: completionError } = await supabase
        .from('habit_completions')
        .upsert({
          habit_id: habitId,
          user_id: userId,
          date,
          percentage,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'habit_id,user_id,date'
        });

      if (completionError) throw completionError;

      // 2. Atualizar o hábito imediatamente
      const { data: habit } = await this.getHabit(habitId);
      if (!habit) throw new Error('Habit not found');

      // ⚡ FASE 3: Usar RPC centralizada para cálculo de streak
      const { data: streakData, error: streakError } = await supabase
        .rpc('calculate_habit_streak', { p_habit_id: habitId });

      if (streakError) {
        console.error('❌ Erro ao calcular streak:', streakError);
        throw streakError;
      }

      const newStreak = streakData?.[0]?.current_streak || 1;
      const newLongestStreak = streakData?.[0]?.longest_streak || 1;

      // 3. Atualizar tabela habits (SEM mudar status - permanece 'active')
      const { error: updateError } = await supabase
        .from('habits')
        .update({
          last_completed: new Date().toISOString(),
          streak: newStreak,
          longest_streak: newLongestStreak,
          total_completions: (habit.total_completions || 0) + 1,
          goal_current: habit.goal_target // Define current como target quando completa
        })
        .eq('id', habitId);

      if (updateError) throw updateError;

      // VALIDAÇÃO: Verificar se realmente foi atualizado
      const { data: updated } = await this.getHabit(habitId);
      if (!updated || updated.total_completions !== (habit.total_completions || 0) + 1) {
        throw new Error('Falha ao atualizar estatísticas do hábito');
      }
      
      console.log('✅ Hábito completado com sucesso:', {
        habitId,
        newStreak,
        totalCompletions: updated.total_completions
      });

      // VALIDAR que completion foi registrado corretamente
      console.log('🔍 [habitService] Validando completion...');
      const { data: verification, error: verifyError } = await supabase
        .from('habit_completions')
        .select('id, percentage')
        .eq('habit_id', habitId)
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle();

      if (verifyError) {
        console.error('❌ [habitService] Erro ao validar completion:', verifyError);
        throw verifyError;
      }

      if (!verification || verification.percentage < 100) {
        console.error('❌ [habitService] Completion não foi registrado corretamente:', verification);
        throw new Error('Completion não foi registrado corretamente no banco');
      }

      console.log('✅ [habitService] Completion validado:', verification);

      return { error: null };
    } catch (error) {
      console.error('❌ Erro ao completar hábito:', error);
      return { error };
    }
  },

  async getCompletions(habitId: number, startDate: string, endDate: string) {
    try {
      if (!habitId) throw new Error('Habit ID is required');
      if (!startDate || !endDate) throw new Error('Date range is required');

      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_id', habitId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching completions:', error);
      return { data: null, error };
    }
  },

  async updateStreak(habitId: number): Promise<{ error: any }> {
    try {
      if (!habitId) throw new Error('Habit ID is required');

      // 1. Buscar hábito
      const { data: habit } = await this.getHabit(habitId);
      if (!habit) throw new Error('Habit not found');

      // 2. Buscar completions recentes (últimos 30 dias)
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const { data: completions } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_id', habitId)
        .gte('date', thirtyDaysAgo)
        .lte('date', today)
        .order('date', { ascending: true });

      if (!completions) return { error: new Error('Failed to fetch completions') };

      // 3. Calcular streak atual
      let currentStreak = 0;
      const sortedCompletions = [...completions].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      for (const completion of sortedCompletions) {
        if (completion.percentage >= 100) {
          currentStreak++;
        } else {
          break;
        }
      }

      // 4. Atualizar hábito
      const longestStreak = Math.max(currentStreak, habit.longest_streak || 0);
      const { error } = await supabase
        .from('habits')
        .update({
          streak: currentStreak,
          longest_streak: longestStreak,
          last_completed: today,
          status: currentStreak > 0 ? 'active' : 'pending'
        })
        .eq('id', habitId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error updating streak:', error);
      return { error };
    }
  }
};