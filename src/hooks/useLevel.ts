import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { calculateLevel, checkLevelUp, type LevelUpResult } from '@/systems/levelSystem';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function useLevel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAwarding, setIsAwarding] = useState(false);

  // PARTE 5: Usar useQuery para cache automático
  const { data: profileData, isLoading, refetch } = useQuery({
    queryKey: ['level', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 1000, // Curto staleTime para refetch rápido
    refetchOnWindowFocus: true,
  });

  const xp = profileData?.xp || 0;

  const awardXP = async (amount: number, reason: string): Promise<LevelUpResult> => {
    if (!user) return { didLevelUp: false };
    
    setIsAwarding(true);
    const oldXP = xp;
    const newXP = oldXP + amount;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ xp: newXP })
        .eq('id', user.id);

      if (error) throw error;
      
      // PARTE 5: Invalidar cache após atualizar XP
      await queryClient.invalidateQueries({ queryKey: ['level', user.id] });
      
      const levelUpResult = checkLevelUp(oldXP, newXP);
      
      if (!levelUpResult.didLevelUp) {
        toast.success(`+${amount} XP`, {
          description: reason,
        });
      }
      
      return levelUpResult;
    } catch (error) {
      console.error('Error awarding XP:', error);
      toast.error('Erro ao adicionar XP');
      return { didLevelUp: false };
    } finally {
      setIsAwarding(false);
    }
  };

  const levelData = calculateLevel(xp);

  return {
    xp,
    level: levelData.level,
    levelInfo: levelData.levelInfo,
    progress: levelData.percentage,
    currentLevelXP: levelData.currentLevelXP,
    nextLevelXP: levelData.nextLevelXP,
    isLoading,
    isAwarding,
    awardXP,
    refetch,
  };
}
