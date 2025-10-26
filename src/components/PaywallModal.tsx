import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import atomLogo from '@/assets/atom-logo.png';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emphasize?: 'calendar' | 'stats' | 'habits';
  trigger?: string;
  onUpgrade?: () => void;
}

const PRO_FEATURES = [
  {
    title: "Hábitos Ilimitados",
    detail: "vs 3 no Free"
  },
  {
    title: "Calendário Visual Completo",
    detail: "Bloqueado no Free"
  },
  {
    title: "Estatísticas Avançadas",
    detail: "Padrões e tendências"
  },
  {
    title: "Insights de IA",
    detail: "Previsões personalizadas"
  }
];

export const PaywallModal: React.FC<PaywallModalProps> = ({ 
  open, 
  onOpenChange, 
  onUpgrade 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes in seconds

  useEffect(() => {
    if (!open) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpgrade = (plan: 'monthly' | 'yearly') => {
    const checkoutUrl = plan === 'monthly' 
      ? 'https://pay.cakto.com.br/spex6qk_620338'
      : 'https://pay.cakto.com.br/zrgzgpv';
    
    window.open(checkoutUrl, '_blank');
    onUpgrade?.();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto border-0 bg-background/95 backdrop-blur-xl">
        <div className="text-center space-y-4 sm:space-y-6 py-2">
          {/* Logo Átomo Animada */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
              
              <motion.img
                src={atomLogo}
                alt="atomicTracker Pro"
                className="w-16 h-16 sm:w-20 sm:h-20 relative z-10"
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  rotate: 0,
                  opacity: 1
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  duration: 0.6
                }}
              />
            </div>
          </div>
          
          {/* Title */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Desbloqueie seu Potencial Máximo
            </h2>
            <p className="text-sm text-muted-foreground">
              Usuários Pro mantêm hábitos 3x mais tempo
            </p>
          </div>
          
          {/* Features - Mobile optimized vertical stack */}
          <div className="space-y-3 text-left px-2">
            {PRO_FEATURES.map((feature, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{feature.detail}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pricing */}
          <div className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
            <div className="flex flex-col sm:flex-row items-center sm:items-baseline justify-center gap-1 sm:gap-2 mb-2">
              <span className="text-3xl sm:text-4xl font-bold text-primary">R$ 11,99</span>
              <span className="text-muted-foreground text-sm">/mês</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              ou R$ 99/ano (economize 31%)
            </p>
          </div>
          
          {/* Urgency Timer */}
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground bg-muted/30 rounded-lg py-2 px-4">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>Oferta expira em: {formatTime(timeRemaining)}</span>
          </div>

          {/* CTA - Mobile optimized */}
          <div className="space-y-3 pt-2">
            <Button 
              onClick={() => handleUpgrade('yearly')}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-base font-semibold h-12 rounded-xl"
            >
              Assinar Plano Anual (Melhor Valor)
            </Button>
            
            <Button 
              onClick={() => handleUpgrade('monthly')}
              variant="outline"
              className="w-full text-sm h-11 rounded-xl border-primary/30"
            >
              Assinar Plano Mensal
            </Button>
            
            <button 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full underline py-2"
              onClick={() => onOpenChange(false)}
            >
              Continuar no Free
            </button>
          </div>
          
        </div>
      </DialogContent>
    </Dialog>
  );
};
