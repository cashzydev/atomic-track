import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { habitService } from '@/services/habitService';
import { xpService } from '@/services/xpService';
import { toast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Habit } from '@/types/habit';
import { useState, useEffect } from 'react';

const QUERY_KEYS = {
  habits: 'habits',
  habit: (id: string) => ['habits', id],
  userHabits: (userId: string, status: 'active' | 'archived' | 'pending' | 'all', today: string) => ['habits', userId, status, today],
} as const;

export function useHabits(status?: 'active' | 'archived' | 'pending') {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ⚡ Calcular today no cliente para queryKey (força refresh diário)
  const today = new Date().toISOString().split('T')[0];

  // ⚡ FASE 5: Cache strategy agressiva
  const habits = useQuery({
    queryKey: QUERY_KEYS.userHabits(user?.id || '', status || 'all', today),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: false,
    queryFn: async () => {
      console.log('🔄 [useHabits] QueryFn executada');
      
      if (!user) return [];
      
      const { data, error } = await habitService.getHabits(user.id);
      if (error) throw error;
      
      // Filtrar por status GERAL (active/archived/paused)
      let filteredHabits = data || [];
      if (status) {
        filteredHabits = filteredHabits.filter(h => h.status === status);
      } else {
        // Se não especificar, mostrar apenas ativos
        filteredHabits = filteredHabits.filter(h => h.status === 'active');
      }
      
      const habitsWithCompletionStatus = filteredHabits.map(habit => ({
        ...habit,
        // Hábito está completo se tem streak > 0 e last_completed é hoje
        // Extrair apenas a data do last_completed (formato ISO) para comparar
        completedToday: habit.streak > 0 && habit.last_completed && habit.last_completed.split('T')[0] === today
      }));
      
      return habitsWithCompletionStatus;
    },
  });

  const createHabitMutation = useMutation({
    mutationFn: async (data: {
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
    }) => {
      if (!user) throw new Error('User not authenticated');
      const result = await habitService.createHabit(data);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      // Invalidar todas as queries relacionadas (todas as variações de today)
      queryClient.invalidateQueries({ queryKey: ['habits', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['stats', user?.id, 'weekly'] });
      queryClient.invalidateQueries({ queryKey: ['stats', user?.id, 'streaks'] });
      
      toast({
        title: '✅ Hábito criado!',
        description: 'Seu novo hábito foi criado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar hábito',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateHabitMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Habit> }) => {
      const result = await habitService.updateHabit(id, data);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', user?.id] });
      toast({
        title: 'Hábito atualizado!',
        description: 'As alterações foram salvas com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar hábito',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: async (id: number) => {
      const result = await habitService.deleteHabit(id);
      if (result.error) throw result.error;
      return id;
    },
    onMutate: async (id: number) => {
      const currentToday = new Date().toISOString().split('T')[0];
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.userHabits(user?.id || '', status || 'all', currentToday) });
      
      // Snapshot previous value
      const previousHabits = queryClient.getQueryData(QUERY_KEYS.userHabits(user?.id || '', status || 'all', currentToday));
      
      // Optimistic update - remover hábito imediatamente da UI
      queryClient.setQueryData(
        QUERY_KEYS.userHabits(user?.id || '', status || 'all', currentToday),
        (old: any) => {
          if (!old) return old;
          return old.filter((h: any) => h.id !== id);
        }
      );
      
      return { previousHabits, deletedId: id };
    },
    onSuccess: (deletedId, variables, context) => {
      // Notificação única apenas quando sucesso
      toast({
        title: 'Hábito deletado',
        description: 'O hábito foi removido com sucesso.',
        duration: 3000,
      });
      
      // Invalidar queries para garantir sincronização
      const currentToday = new Date().toISOString().split('T')[0];
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'habits'
      });
      
      // Invalidar queries relacionadas
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['stats'] }),
        queryClient.invalidateQueries({ queryKey: ['weekly-data'] }),
      ]);
    },
    onError: (error: Error, variables, context) => {
      const currentToday = new Date().toISOString().split('T')[0];
      
      // Rollback on error - restaurar hábito na UI
      if (context?.previousHabits) {
        queryClient.setQueryData(
          QUERY_KEYS.userHabits(user?.id || '', status || 'all', currentToday), 
          context.previousHabits
        );
      }
      
      // Notificação única de erro
      toast({
        title: 'Erro ao deletar hábito',
        description: error.message,
        variant: 'destructive',
        duration: 4000,
      });
    },
  });

  const completeHabitMutation = useMutation({
    mutationFn: async ({ habitId, percentage, habitTitle }: { habitId: number; percentage: number; habitTitle: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const today = new Date().toISOString().split('T')[0];
      
      // Atualizar o estado do hábito
      const { error } = await supabase
        .from('habits')
        .update({
          streak: 1,
          last_completed: today,
          goal_current: percentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', habitId)
        .eq('user_id', user.id);
      
      if (error) throw error;

      // 2. Conceder XP automaticamente
      const xpResult = await xpService.awardForHabitCompletion(
        user.id,
        habitId,
        habitTitle
      );

      return xpResult;
    },
    onMutate: async ({ habitId }) => {
      const currentToday = new Date().toISOString().split('T')[0];
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.userHabits(user?.id || '', status || 'all', currentToday) });
      
      // Snapshot previous value
      const previousHabits = queryClient.getQueryData(QUERY_KEYS.userHabits(user?.id || '', status || 'all', currentToday));
      
      // Optimistic update - marcar como completo e atualizar estado
      queryClient.setQueryData(
        QUERY_KEYS.userHabits(user?.id || '', status || 'all', currentToday),
        (old: any) => {
          if (!old) return old;
          return old.map((h: any) => 
            h.id === habitId 
              ? { 
                  ...h, 
                  completedToday: true, 
                  streak: 1,
                  last_completed: currentToday,
                  goal_current: 100
                }
              : h
          );
        }
      );
      
      return { previousHabits };
    },
    onError: (error: Error, variables, context) => {
      const currentToday = new Date().toISOString().split('T')[0];
      // Rollback on error
      if (context?.previousHabits) {
        queryClient.setQueryData(QUERY_KEYS.userHabits(user?.id || '', status || 'all', currentToday), context.previousHabits);
      }
      toast({
        title: 'Erro ao completar hábito',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSuccess: async (xpResult, { habitId, habitTitle }) => {
      // 1. Toast IMEDIATO - mostrar antes de qualquer delay
      if (xpResult?.levelUp) {
        toast({
          title: "🎊 LEVEL UP!",
          description: `Você alcançou o nível ${xpResult.newLevel}!`,
          duration: 6000,
        });
      } else {
        toast({
          title: `${habitTitle} completado! 🎉`,
          description: `+${xpResult.newVoteCount} XP`,
          duration: 4000,
        });
      }
      
      // 2. Invalidar queries IMEDIATAMENTE (sem delay)
      await Promise.all([
        queryClient.invalidateQueries({ 
          predicate: (query) => query.queryKey[0] === 'habits'
        }),
        queryClient.invalidateQueries({ queryKey: ['stats'] }),
        queryClient.invalidateQueries({ queryKey: ['weekly-data'] }),
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
        queryClient.invalidateQueries({ queryKey: ['level'] }),
      ]);
      
      // 3. Refetch crítico para garantir dados atualizados
      const currentToday = new Date().toISOString().split('T')[0];
      await Promise.all([
        queryClient.refetchQueries({ 
          queryKey: QUERY_KEYS.userHabits(user?.id || '', status || 'all', currentToday),
          type: 'active'
        }),
        queryClient.refetchQueries({ queryKey: ['profile'] }),
        queryClient.refetchQueries({ queryKey: ['level'] }),
      ]);
    },
  });

  // NOVA IMPLEMENTAÇÃO SIMPLES DE UNDO
  const undoHabitMutation = useMutation({
    mutationFn: async ({ habitId, habitTitle }: { habitId: number; habitTitle: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      // 1. Remover XP primeiro (antes de alterar o estado do hábito)
      await xpService.removeHabitCompletionXP(user.id, habitId, habitTitle);
      
      // 2. Atualizar o estado do hábito para pendente
      const { error } = await supabase
        .from('habits')
        .update({
          streak: 0,
          last_completed: null,
          goal_current: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', habitId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: async () => {
      toast({
        title: 'Hábito desmarcado',
        description: 'Conclusão removida com sucesso.',
      });
      
      // Invalidar queries para atualizar a UI
      await Promise.all([
        queryClient.invalidateQueries({ 
          predicate: (query) => query.queryKey[0] === 'habits'
        }),
        queryClient.invalidateQueries({ queryKey: ['stats'] }),
        queryClient.invalidateQueries({ queryKey: ['weekly-data'] }),
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
        queryClient.invalidateQueries({ queryKey: ['level'] }),
      ]);
      
      // Forçar refetch
      const currentToday = new Date().toISOString().split('T')[0];
      await queryClient.refetchQueries({ 
        queryKey: QUERY_KEYS.userHabits(user?.id || '', status || 'all', currentToday),
        type: 'active'
      });
    },
    onError: (error: Error) => {
      console.error('❌ Erro ao desfazer hábito:', error);
      
      toast({
        title: 'Erro ao desfazer',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    // Query Results
    data: habits.data,
    isLoading: habits.isLoading,
    isError: habits.isError,
    error: habits.error as Error | null,
    refetch: habits.refetch,

    // Mutations
    createHabit: async (data: Parameters<typeof createHabitMutation.mutate>[0]) => {
      try {
        return await createHabitMutation.mutateAsync(data);
      } catch (error) {
        console.error('Error creating habit:', error);
        throw error;
      }
    },
    updateHabit: updateHabitMutation.mutate,
    deleteHabit: deleteHabitMutation.mutate,
    completeHabit: completeHabitMutation.mutate,
    undoHabit: async (habitId: number) => {
      // Verificação adicional: só permitir undo se o hábito está marcado como completo na interface
      const currentHabits = queryClient.getQueryData(QUERY_KEYS.userHabits(user?.id || '', status || 'all', new Date().toISOString().split('T')[0])) as any[];
      
      if (currentHabits) {
        const habit = currentHabits.find(h => h.id === habitId);
        if (!habit || !habit.completedToday) {
          toast({
            title: 'Hábito não completado',
            description: 'Este hábito não está marcado como completo hoje.',
            variant: 'destructive',
          });
          return;
        }
        
        // Chamar undo com habitTitle
        undoHabitMutation.mutate({ habitId, habitTitle: habit.title });
      } else {
        // Fallback se não conseguir encontrar o hábito
        undoHabitMutation.mutate({ habitId, habitTitle: 'Hábito' });
      }
    },

    // Mutation States
    isCreating: createHabitMutation.isPending,
    isUpdating: updateHabitMutation.isPending,
    isDeleting: deleteHabitMutation.isPending,
    isCompleting: completeHabitMutation.isPending,
    isUndoing: undoHabitMutation.isPending,
  };
}