import React from 'react';
import type { ElementType } from 'react';

interface LawCardProps {
  icon: ElementType;
  title: string;
  description: string;
  example?: string;
}

export const LawCard: React.FC<LawCardProps> = ({ icon: Icon, title, description, example }) => {
  return (
    <div className="group p-7 lg:p-9 rounded-xl border border-slate-800 hover:border-violet-500/40 transition-all duration-300 hover:shadow-[0_0_25px_rgba(167,139,250,0.25)] bg-slate-900/30 hover:bg-slate-900/50 min-w-0">
      <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center mb-5 lg:mb-6 group-hover:from-violet-500/20 group-hover:to-purple-500/20 transition-all duration-300 shadow-lg group-hover:shadow-violet-500/20 flex-shrink-0">
        <Icon className="w-7 h-7 lg:w-8 lg:h-8 text-slate-300 group-hover:text-violet-400 transition-colors duration-300" strokeWidth={2} />
      </div>
      <h3 className="text-xl lg:text-2xl font-semibold text-slate-50 mb-3 lg:mb-4 font-display tracking-tight break-words">
        {title}
      </h3>
      <p className="text-slate-400 leading-relaxed text-base lg:text-lg mb-3 break-words">{description}</p>
      {example && (
        <p className="text-sm text-violet-300/80 italic border-l-2 border-violet-500/30 pl-3 break-words">
          {example}
        </p>
      )}
    </div>
  );
};

