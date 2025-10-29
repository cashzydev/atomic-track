import React from 'react';

export const FounderStory: React.FC = () => {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 lg:py-16 overflow-x-hidden">
      <div className="bg-slate-900/50 rounded-2xl p-6 sm:p-8 md:p-12 lg:p-14 border border-slate-800 space-y-7">
        <div className="space-y-6">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-50 font-display tracking-tight break-words">
            Por que criei isso?
          </h2>
          <div className="space-y-6 text-slate-300 leading-relaxed text-base lg:text-lg break-words">
            {/* Hook Emocional */}
            <p>
              Já tentei vários métodos e apps para seguir uma rotina. Planners elaborados, bullet journals, técnicas de produtividade, apps de hábitos... 
              Mais uma vez, desisti rapidamente.
            </p>
            
            {/* Problema Específico */}
            <div className="space-y-4">
              <p>
                Streaks me faziam sentir culpado. Gamificação parecia infantil. Formulários intermináveis me travavam antes de começar. 
                Métodos complexos me sobrecarregavam.
              </p>
            </div>
            
            {/* Insight - Conecta com o Hero */}
            <p className="text-violet-300 font-semibold">
              Então percebi: <strong className="text-violet-400">a culpa não era minha</strong>. Era que nenhum sistema entendia como minha mente funciona.
            </p>
            
            {/* Blockquote Destacado */}
            <blockquote className="border-l-4 border-violet-500 pl-6 lg:pl-8 py-4 lg:py-5 italic text-slate-200 my-8 bg-slate-800/40 rounded-r-lg shadow-lg shadow-violet-500/10">
              Meu cérebro precisa de simplicidade. Precisa de clareza:{' '}
              <strong className="text-violet-400 font-semibold not-italic">quando</strong>,{' '}
              <strong className="text-violet-400 font-semibold not-italic">onde</strong>,{' '}
              <strong className="text-violet-400 font-semibold not-italic">quanto</strong>.
            </blockquote>
            
            {/* Solução */}
            <div className="space-y-4">
              <p>
                Peguei o livro "Hábitos Atômicos" e simplifiquei tudo. Quando, Onde, Quanto. Só isso. Sem complicações. E funcionou.
              </p>
            </div>
            
            {/* Convite */}
            <p className="pt-2 text-slate-200 font-medium">
              Se você também já cansou de métodos e apps complicados, vem testar.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

