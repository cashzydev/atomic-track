import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePaymentAccess } from '@/hooks/usePaymentAccess';
import { useAuth } from '@/contexts/AuthContext';
import { CheckoutModal } from '@/components/landing/CheckoutModal';
import { Loader2 } from 'lucide-react';

interface PaymentGuardProps {
  children: React.ReactNode;
  requirePayment?: boolean;
}

/**
 * Componente que protege rotas baseado em pagamento
 * Mostra PaywallModal se usuário não tem acesso pago
 * Admins sempre têm acesso completo
 */
export const PaymentGuard: React.FC<PaymentGuardProps> = ({ 
  children, 
  requirePayment = true 
}) => {
  const { user, loading: authLoading } = useAuth();
  const { hasAccess, isLoading, isExpired, isAdmin } = usePaymentAccess();
  const [showCheckoutModal, setShowCheckoutModal] = React.useState(false);

  // Se não requer pagamento, permitir acesso
  if (!requirePayment) {
    return <>{children}</>;
  }

  // Se não está autenticado, redirecionar para login
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

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Se está carregando subscription, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900/10 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-violet-400" />
          <p className="text-slate-300">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Admins sempre têm acesso completo
  if (isAdmin) {
    return <>{children}</>;
  }

  // Se não tem acesso ou expirou, mostrar modal de checkout
  if (!hasAccess || isExpired) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900/10 to-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-50">
                Acesso Restrito
              </h1>
              <p className="text-slate-400">
                {isExpired 
                  ? 'Sua assinatura expirou. Renove para continuar usando o atomicTrack.'
                  : 'Você precisa ser um membro fundador para acessar o atomicTrack.'}
              </p>
            </div>
            
            <button
              onClick={() => setShowCheckoutModal(true)}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-violet-500/40"
            >
              Tornar-me Membro Fundador
            </button>
          </div>
        </div>

        <CheckoutModal 
          open={showCheckoutModal} 
          onOpenChange={setShowCheckoutModal}
          spotsLeft={8}
        />
      </>
    );
  }

  // Tem acesso, renderizar children
  return <>{children}</>;
};
