import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Brain } from 'lucide-react';
import { CompactInteractivePreview } from './InteractiveAppPreview';
import { CheckoutModal } from './CheckoutModal';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [spotsLeft] = useState(8); // Atualizar manualmente ou via API
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16 lg:py-20 overflow-x-hidden">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center">
        {/* Coluna Esquerda: Texto */}
        <div className="space-y-7 lg:space-y-9 min-w-0">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium">
            <Brain className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
            <span className="whitespace-nowrap">Feito para mentes com TDAH</span>
          </div>

          {/* H1 com destaque visual */}
          <div className="relative pt-2">
            <div className="absolute -inset-3 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl blur-xl opacity-50"></div>
            <h1 className="relative text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.15] font-display tracking-tight break-words">
              <span className="text-slate-50">Já tentou vários </span>
              <span className="text-violet-400">métodos e apps</span>
              <span className="text-slate-50"> para seguir uma rotina e </span>
              <span className="text-amber-400/90">desistiu rapidamente</span>?
            </h1>
          </div>
          
          {/* Sub-headlines minimalistas com hierarquia clara */}
          <div className="space-y-3 md:space-y-4 pt-3">
            {/* Primeira frase - empática e clara */}
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold leading-snug text-slate-300 font-display break-words">
              A culpa não é sua.
            </h2>
            
            {/* Segunda frase - solução destacada */}
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight 
              bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent
              drop-shadow-[0_2px_10px_rgba(139,92,246,0.3)]
              font-display break-words">
              É o sistema que não entende como sua mente funciona.
            </h2>
          </div>
          
          {/* Parágrafo em card sutil com gradiente */}
          <div className="relative pt-4 border-t border-slate-800/50">
            {/* Background gradiente sutil */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/3 to-transparent rounded-lg -mx-2 -my-2 pointer-events-none"></div>
            
            {/* Sombra sutil */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500/40 via-purple-500/20 to-transparent rounded-l-lg"></div>
            
            <p className="relative text-base md:text-lg text-slate-300/90 leading-relaxed max-w-xl break-words pt-4 pl-4">
              <strong className="text-slate-200">atomicTrack</strong> foi feito para mentes que precisam de clareza, não de complicações.{' '}
              <span className="text-violet-300 font-medium">Quando</span>,{' '}
              <span className="text-violet-300 font-medium">Onde</span> e{' '}
              <span className="text-violet-300 font-medium">Quanto</span>. Só isso.
            </p>
          </div>

          {/* CTA Section - Separado visualmente */}
          <div className="pt-8 space-y-5 border-t border-slate-800/50">
            {/* Badge de Promoção */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-200 text-sm font-semibold w-full sm:w-auto justify-center sm:justify-start">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse flex-shrink-0"></span>
              <span className="truncate">🎉 Promoção de Lançamento</span>
            </div>

            {/* CTA Principal */}
            <button
              onClick={() => setIsCheckoutModalOpen(true)}
              className="relative w-full group overflow-hidden
                bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600
                hover:from-violet-500 hover:via-purple-500 hover:to-violet-500
                shadow-xl shadow-violet-500/40 hover:shadow-2xl hover:shadow-violet-500/60
                border-2 border-violet-400/30 hover:border-violet-300/40
                rounded-2xl text-white
                transition-all duration-300
                hover:scale-[1.02] active:scale-[0.98]"
            >
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              
              <div className="relative px-4 sm:px-6 py-4 flex flex-col items-center justify-center gap-2.5">
                <span className="flex items-center gap-2.5 text-base sm:text-lg font-bold whitespace-nowrap">
                  <span>Começar agora</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" strokeWidth={2.5} />
                </span>
                
                <div className="flex flex-col items-center gap-1 pt-1 border-t border-white/20 w-full">
                  <div className="flex flex-col sm:flex-row items-center gap-1.5">
                    <span className="text-2xl font-bold text-white">R$19,97</span>
                    <span className="text-white/90 text-sm font-medium whitespace-nowrap">por 3 meses</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium flex-wrap justify-center">
                    <span className="text-violet-100 whitespace-nowrap">Pagamento único</span>
                    <span className="text-white/40">·</span>
                    <span className="text-amber-200 font-semibold whitespace-nowrap">{spotsLeft} vagas restantes</span>
                  </div>
                </div>
              </div>
            </button>

            {/* Prova Social */}
            <div className="flex items-center gap-2.5 text-xs text-slate-500 pt-2 flex-wrap justify-center sm:justify-start">
              <div className="flex -space-x-2 flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 border-2 border-slate-950" />
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-2 border-slate-950" />
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 border-2 border-slate-950" />
              </div>
              <span className="truncate">{15 - spotsLeft} pessoas começaram hoje</span>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Preview Interativa */}
        <div className="lg:pl-8 min-w-0">
          <CompactInteractivePreview />
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

