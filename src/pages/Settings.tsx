import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Settings, Bell, Lock, Info, AlertTriangle } from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { AnimatedPage } from '@/components/AnimatedPage';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [emailChangeOpen, setEmailChangeOpen] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState('');

  // Fetch user language preference
  const { data: userProfile } = useQuery({
    queryKey: ['profile-language', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('language')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  // Update language mutation
  const updateLanguageMutation = useMutation({
    mutationFn: async (language: string) => {
      if (!user?.id) return;
      const { error } = await supabase
        .from('profiles')
        .update({ language })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-language'] });
      toast({
        title: t('common.success'),
        description: i18n.language === 'en' 
          ? 'Language updated successfully!' 
          : 'Idioma atualizado com sucesso!',
      });
    },
  });

  // Set initial language from profile
  React.useEffect(() => {
    if (userProfile?.language && userProfile.language !== 'auto') {
      i18n.changeLanguage(userProfile.language);
    }
  }, [userProfile, i18n]);

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    updateLanguageMutation.mutate(language);
  };

  const updateEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Email atualizado!",
        description: "Verifique sua caixa de entrada para confirmar a alteração.",
        variant: "default",
      });
      setEmailChangeOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteAccount = async () => {
    try {
      // Delete user data manually since RPC function doesn't exist
      await supabase.from('habits').delete().eq('user_id', user?.id);
      await supabase.from('habit_completions').delete().eq('user_id', user?.id);
      await supabase.from('user_badges').delete().eq('user_id', user?.id);
      await supabase.from('profiles').delete().eq('id', user?.id);

      await signOut();
      toast({
        title: "Conta deletada",
        description: "Sua conta foi excluída com sucesso. Esperamos te ver novamente!",
      });
    } catch (error) {
      toast({
        title: "Erro ao deletar conta",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <AnimatedPage>
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          <Breadcrumbs />
          
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-200">Configurações</h1>
            <p className="text-slate-400 mt-1">Gerencie suas preferências e configurações da conta</p>
          </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Settings size={16} />
            <span>Geral</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell size={16} />
            <span>Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Lock size={16} />
            <span>Privacidade</span>
          </TabsTrigger>
          <TabsTrigger value="about" className="gap-2">
            <Info size={16} />
            <span>Sobre</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferências Gerais</CardTitle>
              <CardDescription>
                Configure suas preferências básicas do aplicativo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Fuso Horário</Label>
                  <Select defaultValue="America/Sao_Paulo">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione seu fuso horário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                      <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                      <SelectItem value="America/Rio_Branco">Rio Branco (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('settings.language')}</Label>
                  <Select 
                    value={i18n.language} 
                    onValueChange={handleLanguageChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('settings.language')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email</CardTitle>
              <CardDescription>
                Atualize seu endereço de email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">{user?.email}</span>
                <Button
                  variant="outline"
                  onClick={() => setEmailChangeOpen(true)}
                >
                  Alterar Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>
                Escolha como e quando deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Lembretes de hábitos</Label>
                  <p className="text-sm text-slate-400">
                    Receba notificações para completar seus hábitos
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Resumo semanal</Label>
                  <p className="text-sm text-slate-400">
                    Receba um email com seu progresso semanal
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Conquistas</Label>
                  <p className="text-sm text-slate-400">
                    Seja notificado ao desbloquear badges
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacidade e Dados</CardTitle>
              <CardDescription>
                Gerencie suas informações pessoais e dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Perfil público</Label>
                    <p className="text-sm text-slate-400">
                      Permitir que outros usuários vejam seu perfil
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="pt-4">
                  <Button variant="outline">
                    Baixar meus dados
                  </Button>
                </div>

                <div className="pt-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2">
                        <AlertTriangle size={16} />
                        Deletar minha conta
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente sua
                          conta e removerá seus dados de nossos servidores.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Sim, deletar minha conta
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sobre o atomicTrack</CardTitle>
              <CardDescription>
                Informações sobre o aplicativo e suporte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-slate-400">Versão</Label>
                  <p className="text-sm">1.0.0</p>
                </div>

                <div>
                  <Label className="text-sm text-slate-400">Links úteis</Label>
                  <div className="space-y-2 pt-2">
                    <Button variant="link" className="h-auto p-0">
                      Termos de Uso
                    </Button>
                    <br />
                    <Button variant="link" className="h-auto p-0">
                      Política de Privacidade
                    </Button>
                    <br />
                    <Button variant="link" className="h-auto p-0">
                      Suporte
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>

        {/* Modal de Alteração de Email */}
      <AlertDialog open={emailChangeOpen} onOpenChange={setEmailChangeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterar Email</AlertDialogTitle>
            <AlertDialogDescription>
              Digite seu novo endereço de email. Você precisará verificá-lo antes que a alteração seja concluída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="email"
              placeholder="novo@email.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (newEmail) {
                  updateEmailMutation.mutate(newEmail);
                }
              }}
              disabled={!newEmail || updateEmailMutation.isPending}
            >
              Alterar Email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
      </div>
      </AnimatedPage>
    </AppLayout>
  );
}