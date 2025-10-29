import React from 'react';
import { CheckCircle2, Target, Calendar, BarChart3, Sparkles, ArrowRight, Lock } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spotsLeft?: number;
}

const BENEFITS = [
  {
    title: 'Simplicidade Guiada',
    description: 'Crie um hábito em 3 perguntas. Sem menus complexos, sem distrações.',
    icon: Target,
  },
  {
    title: 'Progresso Sem Punição',
    description: 'Seu heatmap de consistência mostra padrões, não falhas. Celebre o progresso, não a perfeição.',
    icon: Calendar,
  },
  {
    title: 'Foco para o seu Cérebro',
    description: 'Uma interface minimalista, desenhada para acalmar a mente e evitar a sobrecarga sensorial.',
    icon: BarChart3,
  },
  {
    title: 'Baseado em Ciência',
    description: 'As 4 Leis de "Hábitos Atômicos" em ação.',
    icon: Sparkles,
  },
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ 
  open, 
  onOpenChange, 
  spotsLeft = 8 
}) => {
  const CAKTO_CHECKOUT_URL = 'https://pay.cakto.com.br/zrgzgpv';

  const handleCheckout = () => {
    // Gera um token único para rastrear a sessão
    const sessionToken = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Salva o token no localStorage para recuperar depois do pagamento
    localStorage.setItem('checkout_session_token', sessionToken);
    
    // Redireciona para o checkout do Cakto
    window.location.href = CAKTO_CHECKOUT_URL;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto border border-slate-800 bg-slate-950/95 backdrop-blur-xl p-0 sm:rounded-2xl">
        <div className="relative">
          {/* Header com gradiente */}
          <div className="relative bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent p-6 sm:p-8 border-b border-slate-800">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-violet-500/5 rounded-t-2xl blur-xl" />
            
            <div className="relative space-y-4 text-center">
              {/* Badge de urgência */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse flex-shrink-0"></span>
                <span>🔥 {spotsLeft} vagas restantes</span>
              </div>

              {/* Título principal */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-50 font-display tracking-tight">
                O problema não é você. É o seu sistema.
              </h2>
              
              {/* Subtítulo */}
              <p className="text-slate-400 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
                Seja um dos fundadores do atomicTrack e ajude a construir a ferramenta definitiva para a consistência.
              </p>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Benefícios */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
                O que você recebe
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {BENEFITS.map((benefit, i) => {
                  const Icon = benefit.icon;
                  return (
                    <div
                      key={i}
                      className="flex gap-3 items-start p-4 rounded-lg border border-slate-800 bg-slate-900/30 hover:bg-slate-900/50 hover:border-violet-500/30 transition-all duration-300"
                    >
                      <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-violet-400" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold mb-1 text-foreground text-sm break-words">
                          {benefit.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed break-words">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Informações do plano */}
            <div className="pt-4 border-t border-slate-800">
              <div className="bg-slate-900/50 rounded-xl p-5 sm:p-6 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-lg sm:text-xl text-foreground">Plano Fundador</h4>
                    <p className="text-sm text-muted-foreground mt-1">3 meses de acesso e benefícios exclusivos</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-violet-400">R$19,97</div>
                    <p className="text-xs text-muted-foreground">Pagamento único</p>
                  </div>
                </div>

                {/* Inclui - Copy otimizada */}
                <div className="space-y-2.5 pt-3 border-t border-slate-800">
                  <div className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="leading-relaxed">Seja um dos arquitetos do produto</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="leading-relaxed">Suporte prioritário e acesso direto ao fundador</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="leading-relaxed">Acesso completo e vitalício à versão atual</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="leading-relaxed">Pagamento único. Sem mensalidades, sem surpresas.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Principal */}
            <button
              onClick={handleCheckout}
              className="relative w-full group overflow-hidden
                bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600
                hover:from-violet-500 hover:via-purple-500 hover:to-violet-500
                shadow-xl shadow-violet-500/40 hover:shadow-2xl hover:shadow-violet-500/60
                border-2 border-violet-400/30 hover:border-violet-300/40
                rounded-xl text-white
                transition-all duration-300
                hover:scale-[1.02] active:scale-[0.98]
                py-4 sm:py-5 px-6"
            >
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              
              <div className="relative flex items-center justify-center gap-3">
                <Lock className="w-5 h-5" strokeWidth={2.5} />
                <span className="text-base sm:text-lg font-bold">
                  Garantir minha vaga de fundador
                </span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
              </div>
            </button>

            {/* Garantia */}
            <p className="text-xs text-center text-slate-500 pt-2">
              Pagamento seguro via Cakto • Suporte 24/7 • Cancelamento a qualquer momento
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

