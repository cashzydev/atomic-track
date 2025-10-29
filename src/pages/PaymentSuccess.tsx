import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

/**
 * Página de callback após pagamento bem-sucedido no Cakto
 * Verifica se o pagamento foi processado e redireciona o usuário
 */
export const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signIn, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<'checking' | 'success' | 'error' | 'pending'>('checking');
  const [message, setMessage] = useState('Verificando pagamento...');

  const paymentId = searchParams.get('payment_id');
  const email = searchParams.get('email');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Se não tem payment_id ou email, redirecionar para landing
        if (!paymentId && !email) {
          setStatus('error');
          setMessage('Informações de pagamento não encontradas.');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // Se usuário não está logado e tem email, tentar fazer login
        if (!user && email) {
          setMessage('Criando sua conta...');
          
          // Verificar se usuário existe
          const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('payment_email', email)
            .maybeSingle();

          if (existingUser) {
            // Usuário existe, redirecionar para login
            setMessage('Por favor, faça login com sua conta existente.');
            setTimeout(() => navigate('/auth'), 3000);
            return;
          }

          // Usuário não existe - isso não deveria acontecer se o fluxo for correto
          // O usuário deve criar conta primeiro, depois pagar
          setStatus('error');
          setMessage('Por favor, crie uma conta primeiro e depois realize o pagamento.');
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        // Se usuário está logado, verificar subscription
        if (user) {
          setMessage('Verificando sua assinatura...');

          const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .in('tier', ['founder', 'pro', 'enterprise'])
            .maybeSingle();

          if (subError) {
            console.error('Erro ao verificar subscription:', subError);
            setStatus('error');
            setMessage('Erro ao verificar pagamento. Entre em contato com o suporte.');
            return;
          }

          if (subscription) {
            // Pagamento processado com sucesso
            setStatus('success');
            setMessage('Pagamento confirmado! Redirecionando...');
            
            // Redirecionar para onboarding ou dashboard
            setTimeout(() => {
              if (user.user_metadata?.onboarding_completed) {
                navigate('/dashboard');
              } else {
                navigate('/onboarding');
              }
            }, 2000);
          } else {
            // Pagamento ainda não processado (webhook pode estar atrasado)
            setStatus('pending');
            setMessage('Aguardando confirmação do pagamento. Isso pode levar alguns segundos...');
            
            // Tentar novamente após 5 segundos
            setTimeout(() => {
              checkPaymentStatus();
            }, 5000);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
        setStatus('error');
        setMessage('Erro ao processar pagamento. Entre em contato com o suporte.');
      }
    };

    if (!authLoading) {
      checkPaymentStatus();
    }
  }, [user, authLoading, paymentId, email, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900/10 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-violet-400" />
          <p className="text-slate-300">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900/10 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8 text-center space-y-6">
        {status === 'checking' && (
          <>
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-violet-400" />
            <div>
              <h1 className="text-2xl font-bold text-slate-50 mb-2">Processando...</h1>
              <p className="text-slate-400">{message}</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-50 mb-2">Pagamento Confirmado!</h1>
              <p className="text-slate-400">{message}</p>
            </div>
          </>
        )}

        {status === 'pending' && (
          <>
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-amber-400" />
            <div>
              <h1 className="text-2xl font-bold text-slate-50 mb-2">Aguardando Confirmação</h1>
              <p className="text-slate-400">{message}</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-50 mb-2">Erro no Pagamento</h1>
              <p className="text-slate-400 mb-4">{message}</p>
              <button
                onClick={() => navigate('/')}
                className="text-violet-400 hover:text-violet-300 underline"
              >
                Voltar para a página inicial
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;

