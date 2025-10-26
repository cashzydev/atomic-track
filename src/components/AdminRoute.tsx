import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // Verificação direta de admin no banco
  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      
      if (error) {
        console.log('Admin check error:', error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!user?.id,
    retry: 1,
    staleTime: 30000, // Cache por 30 segundos
  });

  console.log('AdminRoute Debug:', {
    user: user?.email,
    loading,
    roleLoading,
    isAdmin,
    userId: user?.id
  });

  // Loading state
  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900/10 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-violet-500 rounded-full animate-pulse"></div>
          <p className="text-slate-300">Verificando permissões de administrador...</p>
        </div>
      </div>
    );
  }

  // Sem usuário logado
  if (!user) {
    console.log('AdminRoute: Usuário não logado, redirecionando para auth');
    return <Navigate to="/auth" replace />;
  }

  // Verificação de admin
  if (!isAdmin) {
    console.log('AdminRoute: Usuário não é admin, redirecionando para dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('AdminRoute: Acesso admin permitido para:', user.email);
  return <>{children}</>;
};

export default AdminRoute;