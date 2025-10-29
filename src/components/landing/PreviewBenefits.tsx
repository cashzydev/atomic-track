import React from 'react';
import { Target, Calendar, BarChart3, Sparkles } from 'lucide-react';

const BENEFITS = [
  {
    title: 'Quando, Onde, Quanto',
    description: 'Só 3 perguntas. Sem 20 campos para preencher que te fazem desistir antes de começar.',
    icon: Target,
  },
  {
    title: 'Sem Streaks Punitivos',
    description: 'Perdeu 1 dia? Relaxa. Veja seu progresso real, não uma contagem que te faz sentir culpado.',
    icon: Calendar,
  },
  {
    title: 'Visual, Não Numérico',
    description: 'Seu cérebro processa cores 60x mais rápido que texto. Heatmap > Tabelas.',
    icon: BarChart3,
  },
  {
    title: 'Baseado em Ciência',
    description: 'Cada feature segue as 4 Leis de "Hábitos Atômicos". Zero achismo.',
    icon: Sparkles,
  },
];

export const PreviewBenefits: React.FC = () => {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 lg:py-16 overflow-x-hidden">
      <div className="text-center mb-12 lg:mb-16">
        <h3 className="text-2xl md:text-3xl font-bold mb-3 lg:mb-4 text-foreground font-display tracking-tight break-words">
          Por que isso funciona?
        </h3>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto break-words">
          Cada diferença foi pensada para simplificar sua jornada
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 lg:gap-7">
        {BENEFITS.map((benefit, i) => {
          const Icon = benefit.icon;
          return (
            <div
              key={i}
              className="flex gap-4 lg:gap-5 items-start p-5 lg:p-6 rounded-xl border border-slate-800 bg-slate-900/30 hover:bg-slate-900/50 hover:border-violet-500/30 transition-all duration-300 min-w-0"
            >
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-violet-400" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold mb-1 lg:mb-1.5 text-foreground text-base lg:text-lg break-words">{benefit.title}</h4>
                <p className="text-sm lg:text-base text-muted-foreground leading-relaxed break-words">{benefit.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
