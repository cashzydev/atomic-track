import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useRole = () => {
  const { user } = useAuth();
  
  const { data: roles, isLoading } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching roles:', error);
        return [];
      }
      
      return data?.map(r => r.role) || [];
    },
    enabled: !!user?.id,
  });
  
  const isAdmin = roles?.includes('admin') || false;
  
  return { 
    roles: roles || [],
    isAdmin,
    isLoading
  };
};
