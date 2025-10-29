import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/Button';
import { CheckoutModal } from './CheckoutModal';

export const FinalCTA: React.FC = () => {
  const navigate = useNavigate();
  const [spotsLeft] = useState(8); // Atualizar manualmente ou via API
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 lg:py-16 overflow-x-hidden">
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-6 sm:p-8 md:p-10 lg:p-14 border border-slate-800 space-y-8 text-center shadow-2xl">
        {/* Badge de urgência */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-bold">
          <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse flex-shrink-0"></span>
          <span className="truncate">Apenas {spotsLeft} vagas restantes</span>
        </div>

        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-50 font-display tracking-tight break-words px-2">
          Cansado de apps que não entendem sua mente?
        </h2>
        
        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed break-words px-2">
          Seja um dos <strong className="text-violet-400">15 membros fundadores</strong> e 
          ajude a moldar o atomicTrack enquanto construímos juntos.
        </p>

        <div className="pt-6 space-y-4">
          <Button 
            size="lg" 
            onClick={() => setIsCheckoutModalOpen(true)}
            className="group shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30"
          >
            Garantir minha vaga por R$19,97
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
          </Button>
          
          {/* Garantia implícita */}
          <p className="text-sm text-slate-500">
            Pagamento único. Sem mensalidades. Sem surpresas.
          </p>
        </div>
      </div>

      {/* Modal de Checkout */}
      <CheckoutModal 
        open={isCheckoutModalOpen} 
        onOpenChange={setIsCheckoutModalOpen}
        spotsLeft={spotsLeft}
      />
    </section>
  );
};

