import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  // Logs imediatos quando o componente é montado
  useEffect(() => {
    console.log('🚨 ========== AuthCallback COMPONENTE MONTADO ==========');
    console.log('🚨 Timestamp:', new Date().toISOString());
    console.log('🚨 URL completa:', window.location.href);
    console.log('🚨 Pathname:', window.location.pathname);
    console.log('🚨 Search:', window.location.search);
    console.log('🚨 Hash:', window.location.hash);
    console.log('🚨 Hash (completo):', window.location.hash || '(vazio)');
    console.log('🚨 Origin:', window.location.origin);
    console.log('🚨 Hostname:', window.location.hostname);
    console.log('🚨 Protocol:', window.location.protocol);
    console.log('🚨 ================================================');
  }, []);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setIsProcessing(true);
        
        console.log('🔄 AuthCallback handler iniciado');
        console.log('📍 URL atual:', window.location.href);
        console.log('📍 Pathname:', window.location.pathname);
        console.log('📍 Hash completo:', window.location.hash || '(sem hash)');
        console.log('📍 Origin:', window.location.origin);
        console.log('📍 Hostname:', window.location.hostname);
        
        // Verificar se estamos no domínio correto
        const isValidDomain = window.location.hostname.includes('atomictrack.com.br') || 
                              window.location.hostname.includes('localhost') ||
                              window.location.hostname.includes('127.0.0.1');
        
        if (!isValidDomain) {
          console.error('❌ Hostname inesperado:', window.location.hostname);
          console.error('❌ Esperado: atomictrack.com.br ou localhost');
          toast.error(`Domínio inválido: ${window.location.hostname}`);
          navigate('/auth', { replace: true });
          return;
        } else {
          console.log('✅ Domínio válido:', window.location.hostname);
        }

        // Analisar hash se presente
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          console.log('🔑 Parâmetros no hash:');
          hashParams.forEach((value, key) => {
            // Não logar valores completos por segurança, apenas indicadores
            if (key.includes('token') || key.includes('access')) {
              console.log(`  - ${key}: ${value.substring(0, 20)}... (truncado por segurança)`);
            } else {
              console.log(`  - ${key}: ${value}`);
            }
          });
        } else {
          console.warn('⚠️ Nenhum hash presente na URL - pode indicar que não veio do OAuth');
        }
        
        // O Supabase processa automaticamente os tokens do hash da URL
        console.log('⏳ Aguardando processamento do Supabase...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Obter a sessão atual
        console.log('🔍 Buscando sessão do Supabase...');
        const { data, error } = await supabase.auth.getSession();
        
        console.log('📊 Resultado getSession:');
        console.log('  - Tem erro?', !!error);
        console.log('  - Tem sessão?', !!data?.session);
        console.log('  - Tem user?', !!data?.session?.user);
        
        if (error) {
          console.error('❌ Error getting session:', error);
          toast.error('Erro ao processar login. Tente novamente.');
          window.location.hash = '';
          navigate('/auth', { replace: true });
          return;
        }
        
        console.log('✅ Sessão obtida:', data.session ? 'Sessão encontrada' : 'Sem sessão');

        if (data.session?.user) {
          console.log('👤 Usuário autenticado:', data.session.user.email);
          
          // Verificar se o usuário tem perfil
          console.log('🔍 Verificando perfil...');
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            console.log('📝 Criando novo perfil...');
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
              console.error('❌ Error creating profile:', insertError);
            } else {
              console.log('✅ Perfil criado com sucesso');
            }
          } else if (profile) {
            console.log('✅ Perfil encontrado');
          }

          // Limpar hash da URL antes de redirecionar
          window.location.hash = '';
          
          // Verificar status de onboarding
          const onboardingCompleted = data.session.user.user_metadata?.onboarding_completed;
          console.log('📋 Onboarding completo:', onboardingCompleted);
          
          // Pequeno delay para garantir que tudo foi processado
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const redirectPath = onboardingCompleted ? '/dashboard' : '/onboarding';
          console.log('🚀 Preparando redirecionamento...');
          console.log('  - Destino:', redirectPath);
          console.log('  - Onboarding completo:', onboardingCompleted);
          console.log('  - User ID:', data.session.user.id);
          console.log('  - User Email:', data.session.user.email);
          
          // Limpar hash antes de navegar
          window.location.hash = '';
          console.log('✅ Hash limpo');
          
          navigate(redirectPath, { replace: true });
          console.log('✅ Navegação iniciada para:', redirectPath);
        } else {
          console.warn('⚠️ Sem sessão de usuário após getSession');
          console.warn('⚠️ Isso pode indicar:');
          console.warn('  - Tokens não foram processados corretamente');
          console.warn('  - URL de redirect está incorreta');
          console.warn('  - Supabase não conseguiu validar os tokens');
          
          // Limpar hash da URL e redirecionar
          window.location.hash = '';
          toast.error('Login não pôde ser processado. Tente novamente.');
          console.log('🔄 Redirecionando para /auth');
          navigate('/auth', { replace: true });
        }
      } catch (error) {
        console.error('❌ ========== ERRO CAPTURADO ==========');
        console.error('❌ Error type:', error instanceof Error ? error.constructor.name : typeof error);
        console.error('❌ Error message:', error instanceof Error ? error.message : String(error));
        console.error('❌ Error stack:', error instanceof Error ? error.stack : 'N/A');
        console.error('❌ =====================================');
        toast.error('Erro ao processar login. Tente novamente.');
        window.location.hash = '';
        navigate('/auth', { replace: true });
      } finally {
        setIsProcessing(false);
        console.log('🏁 AuthCallback processamento finalizado');
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

