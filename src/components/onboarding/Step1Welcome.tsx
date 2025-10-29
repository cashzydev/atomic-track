import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Zap, BookOpen } from "lucide-react";

interface Step1WelcomeProps {
  onModeSelect?: (mode: 'quick' | 'full') => void;
}

const Step1Welcome = ({ onModeSelect }: Step1WelcomeProps) => {
  const { user } = useAuth();
  const { updateOnboardingData } = useApp();
  
  // Set user's name from auth context when component mounts
  React.useEffect(() => {
    if (user?.user_metadata?.name) {
      updateOnboardingData({ name: user.user_metadata.name });
    }
  }, [user, updateOnboardingData]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-50">
          Transforme sua vida com
        </h1>
        <h2 className="text-4xl sm:text-5xl font-bold gradient-text flex flex-col sm:flex-row items-center justify-center gap-3">
          <span>pequenos hábitos</span>
          <img
            src="/atom-logo.png"
            alt=""
            className="w-12 h-12 sm:w-16 sm:h-16 animate-float"
          />
        </h2>
      </div>

      <div className="mt-12">
        <h3 className="text-xl sm:text-2xl font-semibold text-slate-50 mb-6 text-center">
          {user?.user_metadata?.name ? (
            <>Olá, {user.user_metadata.name}! 👋</>
          ) : (
            <>Olá! 👋</>
          )}
        </h3>

        {onModeSelect ? (
          <div className="space-y-4 mt-8">
            <p className="text-slate-300 text-center mb-6">
              Escolha como você quer começar:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Quick Mode */}
              <button
                onClick={() => onModeSelect('quick')}
                className="glass card-rounded p-6 text-left hover:border-violet-500/50 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-lg">Modo Rápido</h3>
                    <p className="text-xs text-emerald-400">3 etapas • 2 minutos</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Comece agora com um hábito pré-configurado. Perfeito para quem quer ação imediata.
                </p>
              </button>

              {/* Full Mode */}
              <button
                onClick={() => onModeSelect('full')}
                className="glass card-rounded p-6 text-left hover:border-violet-500/50 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-lg">Modo Completo</h3>
                    <p className="text-xs text-violet-400">11 etapas • 10 minutos</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Personalize completamente seu hábito com as 4 Leis dos Hábitos Atômicos.
                </p>
              </button>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">💡</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-violet-400">Dica:</span> Se é sua primeira vez, recomendamos o <span className="font-semibold">Modo Rápido</span> para começar sem fricção. Você pode personalizar depois!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start gap-3 bg-slate-800 border-l-4 border-violet-500 rounded-lg p-4">
            <span className="text-xl sm:text-2xl mb-2 sm:mb-0">💡</span>
            <p className="text-sm sm:text-base text-slate-300">
              Vamos começar sua jornada de transformação através de pequenos hábitos diários.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step1Welcome;
