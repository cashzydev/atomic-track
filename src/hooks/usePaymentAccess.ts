import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Subscription {
  id: string;
  user_id: string;
  tier: 'free' | 'founder' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  started_at: string;
  expires_at: string | null;
  cakto_payment_id: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
}

export const usePaymentAccess = () => {
  const { user } = useAuth();
  
  // Verificar se é admin primeiro
  const { data: isAdmin } = useQuery({
    queryKey: ['user-is-admin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });
  
  // Se é admin, sempre tem acesso
  const { data: subscription, isLoading, refetch, error } = useQuery({
    queryKey: ['payment-access', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Buscar subscription ativa (não expirada)
      const now = new Date().toISOString();
      const { data, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .in('tier', ['founder', 'pro', 'enterprise'])
        .maybeSingle();
      
      // Filtrar manualmente se está expirada (mas permitir se expires_at é NULL)
      if (data && data.expires_at && new Date(data.expires_at) < new Date(now)) {
        return null;
      }
      
      if (subError) {
        console.error('Error fetching subscription:', subError);
        return null;
      }
      
      return data as Subscription | null;
    },
    enabled: !!user?.id,
    refetchInterval: 5 * 60 * 1000, // Refetch a cada 5 minutos
    staleTime: 2 * 60 * 1000, // Considerar stale após 2 minutos
  });

  // Admin sempre tem acesso
  const hasAccess = isAdmin || !!subscription;
  const isFounder = subscription?.tier === 'founder';
  const isPro = subscription?.tier === 'pro' || subscription?.tier === 'enterprise';
  const tier = subscription?.tier || (isAdmin ? 'admin' : 'free');
  
  // Verificar se está expirado
  const isExpired = subscription 
    ? subscription.expires_at && new Date(subscription.expires_at) < new Date()
    : false;
  
  return { 
    subscription, 
    hasAccess,
    isFounder,
    isPro,
    isAdmin: isAdmin || false,
    tier,
    isLoading,
    isExpired,
    error,
    refetch
  };
};

