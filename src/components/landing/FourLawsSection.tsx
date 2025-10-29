import React from 'react';
import { Target, Sparkles, Rocket, PartyPopper } from 'lucide-react';
import { LawCard } from './LawCard';

// Constantes movidas para fora do componente
const laws = [
  {
    icon: Target,
    title: "Torne Óbvio",
    description: "Crie gatilhos claros e impossíveis de ignorar",
    example: "Ex: 'Após o café' em vez de 'Manhã'"
  },
  {
    icon: Sparkles,
    title: "Torne Atraente", 
    description: "Faça seus hábitos irresistíveis",
    example: "Ex: Combine com algo prazeroso (podcast + caminhada)"
  },
  {
    icon: Rocket,
    title: "Torne Fácil",
    description: "Regra dos 2 Minutos",
    example: "Ex: 'Ler 1 página' em vez de 'Ler 30min'"
  },
  {
    icon: PartyPopper,
    title: "Torne Satisfatório",
    description: "Celebre cada vitória",
    example: "Ex: Veja seu heatmap crescer a cada dia"
  }
];

export const FourLawsSection: React.FC = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12 lg:py-16 overflow-x-hidden">
      <div className="text-center mb-16 lg:mb-20 space-y-4">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-50 font-display tracking-tight break-words">
          Baseado nas 4 Leis de "Hábitos Atômicos"
        </h2>
        <p className="text-slate-400 text-lg lg:text-xl max-w-2xl mx-auto break-words">
          Cada feature segue a ciência, não hype
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-7 lg:gap-8">
        {laws.map((law, index) => (
          <LawCard
            key={index}
            icon={law.icon}
            title={law.title}
            description={law.description}
            example={law.example}
          />
        ))}
      </div>
    </section>
  );
};

