import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setIsProcessing(true);
        
        // O Supabase processa automaticamente os tokens do hash da URL
        // Aguardar um pouco mais para garantir que o processamento foi concluído
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Obter a sessão atual
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          toast.error('Erro ao processar login. Tente novamente.');
          window.location.hash = '';
          navigate('/auth', { replace: true });
          return;
        }

        if (data.session?.user) {
          // Verificar se o usuário tem perfil
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // Perfil não existe, criar um
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: data.session.user.id,
                email: data.session.user.email!,
                name: data.session.user.user_metadata?.name || data.session.user.email?.split('@')[0] || 'Usuário',
                avatar_type: 'initials',
                avatar_color: 'violet',
                tier: 'free',
                xp: 0,
                level: 1
              });

            if (insertError) {
              console.error('Error creating profile:', insertError);
            }
          }

          // Limpar hash da URL antes de redirecionar
          window.location.hash = '';
          
          // Verificar status de onboarding
          const onboardingCompleted = data.session.user.user_metadata?.onboarding_completed;
          
          // Pequeno delay para garantir que tudo foi processado
          await new Promise(resolve => setTimeout(resolve, 300));
          
          if (onboardingCompleted) {
            navigate('/dashboard', { replace: true });
          } else {
            navigate('/onboarding', { replace: true });
          }
        } else {
          // Limpar hash da URL e redirecionar
          window.location.hash = '';
          toast.error('Login não pôde ser processado. Tente novamente.');
          navigate('/auth', { replace: true });
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        toast.error('Erro ao processar login. Tente novamente.');
        window.location.hash = '';
        navigate('/auth', { replace: true });
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900/10 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <img 
          src="/atom-logo.png" 
          alt="atomicTrack"
          className="w-20 h-20 mx-auto mb-6 animate-pulse"
        />
        <div className="flex items-center justify-center gap-3 mb-4">
          <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
          <p className="text-slate-300">Processando login...</p>
        </div>
        <p className="text-sm text-slate-500">Aguarde um momento</p>
      </div>
    </div>
  );
};

export default AuthCallback;

