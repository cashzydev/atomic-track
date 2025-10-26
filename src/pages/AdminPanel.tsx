import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/layouts/AppLayout';
import { AnimatedPage } from '@/components/AnimatedPage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Shield, Users, Crown, Search, Edit, Activity, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserWithStats {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  tier: string | null;
  xp: number | null;
  level: number | null;
  avatar_type: string | null;
  avatar_color: string | null;
  is_admin: boolean;
  total_habits: number;
  total_completions: number;
  longest_streak: number;
  last_sign_in_at: string | null;
}

const AdminPanel: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  // Buscar usuários com dados reais do banco
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users-real'],
    queryFn: async () => {
      // Buscar perfis
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          name,
          created_at,
          tier,
          xp,
          level,
          avatar_type,
          avatar_color
        `)
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return [];
      }

      // Buscar roles de admin
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      const adminUserIds = new Set(adminRoles?.map(r => r.user_id) || []);

      // Buscar estatísticas de hábitos para cada usuário
      const usersWithStats = await Promise.all(
        profiles.map(async (profile) => {
          // Buscar hábitos do usuário
          const { data: habits } = await supabase
            .from('habits')
            .select('id, total_completions, longest_streak')
            .eq('user_id', profile.id);

          const totalHabits = habits?.length || 0;
          const totalCompletions = habits?.reduce((sum, h) => sum + (h.total_completions || 0), 0) || 0;
          const longestStreak = Math.max(...(habits?.map(h => h.longest_streak || 0) || [0]));

          // Buscar último login do auth.users
          const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
          const lastSignIn = authUser?.user?.last_sign_in_at;

          return {
            ...profile,
            is_admin: adminUserIds.has(profile.id),
            total_habits: totalHabits,
            total_completions: totalCompletions,
            longest_streak: longestStreak,
            last_sign_in_at: lastSignIn
          };
        })
      );

      return usersWithStats;
    }
  });

  // Buscar estatísticas reais do banco
  const { data: stats } = useQuery({
    queryKey: ['admin-stats-real'],
    queryFn: async () => {
      // Buscar todos os perfis
      const { data: profiles } = await supabase
        .from('profiles')
        .select('tier, created_at, xp');

      // Buscar todos os hábitos para calcular completions
      const { data: habits } = await supabase
        .from('habits')
        .select('total_completions, user_id');

      // Buscar roles de admin
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      const totalUsers = profiles?.length || 0;
      const premiumUsers = profiles?.filter(p => p.tier === 'premium').length || 0;
      const proUsers = profiles?.filter(p => p.tier === 'pro').length || 0;
      const adminUsers = adminRoles?.length || 0;
      
      // Usuários ativos (últimos 7 dias) - usando created_at como proxy
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const activeUsers = profiles?.filter(p => 
        new Date(p.created_at) > sevenDaysAgo
      ).length || 0;

      // Total de XP do sistema
      const totalXP = profiles?.reduce((sum, p) => sum + (p.xp || 0), 0) || 0;

      // Total de completions
      const totalCompletions = habits?.reduce((sum, h) => sum + (h.total_completions || 0), 0) || 0;

      return {
        totalUsers,
        premiumUsers,
        proUsers,
        adminUsers,
        activeUsers,
        totalXP,
        totalCompletions
      };
    }
  });

  // Mutação para alterar role de admin
  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      if (isAdmin) {
        // Remover role de admin usando função do banco
        const { error } = await supabase
          .rpc('remove_user_role', {
            p_user_id: userId,
            p_role: 'admin'
          });
        
        if (error) throw error;
      } else {
        // Adicionar role de admin usando função do banco
        const { error } = await supabase
          .rpc('add_user_role', {
            p_user_id: userId,
            p_role: 'admin'
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-real'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats-real'] });
      toast({
        title: "Sucesso",
        description: "Role de admin alterada com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao alterar role: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutação para alterar tier
  const toggleTierMutation = useMutation({
    mutationFn: async ({ userId, tier }: { userId: string; tier: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ tier })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-real'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats-real'] });
      toast({
        title: "Sucesso",
        description: "Tier do usuário alterado com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao alterar tier: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const filteredUsers = users?.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const getTierBadge = (tier: string | null) => {
    switch (tier) {
      case 'premium':
        return <Badge className="bg-violet-600">Premium</Badge>;
      case 'pro':
        return <Badge className="bg-blue-600">Pro</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  const getAdminBadge = (isAdmin: boolean) => {
    return isAdmin ? (
      <Badge className="bg-red-600">Admin</Badge>
    ) : (
      <Badge variant="outline">User</Badge>
    );
  };

  const getActivityBadge = (lastSignIn: string | null, createdAt: string) => {
    if (!lastSignIn) {
      // Usar created_at como fallback
      const createdDate = new Date(createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 7) return <Badge className="bg-green-600">Novo</Badge>;
      return <Badge variant="outline">Inativo</Badge>;
    }
    
    const lastSignInDate = new Date(lastSignIn);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - lastSignInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) return <Badge className="bg-green-600">Ativo</Badge>;
    if (daysDiff <= 7) return <Badge className="bg-yellow-600">Semi-ativo</Badge>;
    return <Badge variant="outline">Inativo</Badge>;
  };

  return (
    <AppLayout>
      <AnimatedPage>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/10 rounded-lg">
              <Shield className="h-6 w-6 text-violet-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Painel de Administração</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Dados reais do banco de dados - Gerencie usuários e permissões
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Registrados no sistema
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Últimos 7 dias
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários Pagantes</CardTitle>
                  <Crown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.premiumUsers + stats.proUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.premiumUsers} Premium + {stats.proUsers} Pro
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de XP</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalXP.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    XP acumulado no sistema
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gerenciamento de Usuários (Dados Reais)
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por email ou nome..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 mx-auto mb-4 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-muted-foreground">Carregando dados reais do banco...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{user.name || 'Sem nome'}</h3>
                          {getTierBadge(user.tier)}
                          {getAdminBadge(user.is_admin)}
                          {getActivityBadge(user.last_sign_in_at, user.created_at)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Level {user.level || 1}</span>
                          <span>{user.xp || 0} XP</span>
                          <span>{user.total_habits} hábitos</span>
                          <span>{user.total_completions} completos</span>
                          <span>Maior streak: {user.longest_streak}</span>
                          <span>Criado em {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleTierMutation.mutate({
                            userId: user.id,
                            tier: user.tier === 'premium' ? 'free' : 'premium'
                          })}
                          disabled={toggleTierMutation.isPending}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {user.tier === 'premium' ? 'Remover Premium' : 'Tornar Premium'}
                        </Button>
                        <Button
                          size="sm"
                          variant={user.is_admin ? "destructive" : "default"}
                          onClick={() => toggleAdminMutation.mutate({
                            userId: user.id,
                            isAdmin: user.is_admin
                          })}
                          disabled={toggleAdminMutation.isPending}
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          {user.is_admin ? 'Remover Admin' : 'Tornar Admin'}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum usuário encontrado
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Stats */}
          {stats && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Estatísticas do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Usuários ativos (7 dias)</span>
                      <Badge className="bg-green-600">{stats.activeUsers}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total de completions</span>
                      <Badge variant="outline">{stats.totalCompletions.toLocaleString()}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Administradores</span>
                      <Badge className="bg-red-600">{stats.adminUsers}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Distribuição de Tiers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Usuários Free</span>
                      <Badge variant="outline">{stats.totalUsers - stats.premiumUsers - stats.proUsers}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Usuários Premium</span>
                      <Badge className="bg-violet-600">{stats.premiumUsers}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Usuários Pro</span>
                      <Badge className="bg-blue-600">{stats.proUsers}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </AnimatedPage>
    </AppLayout>
  );
};

export default AdminPanel;