import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Target, Sparkles, Rocket, PartyPopper, CheckCircle, TrendingUp, Clock, BarChart3 } from "lucide-react";
import Button from "@/components/Button";

const Landing = () => {
  const navigate = useNavigate();

  // Componente minimalista para as 4 leis
  const LawCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="group p-6 rounded-xl border border-slate-800 hover:border-violet-500/30 transition-all duration-200 hover:translate-y-[-2px]">
      <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-violet-500/10 transition-colors">
        <Icon className="w-6 h-6 text-slate-300 group-hover:text-violet-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-50 mb-2">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );

  // Componente para estatísticas sociais
  const StatCard = ({ value, label }: { value: string, label: string }) => (
    <div className="text-center">
      <div className="text-3xl font-bold text-slate-50 mb-1">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );

  // Componente para benefícios concretos
  const BenefitCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-800/50 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-violet-400" />
      </div>
      <div>
        <h3 className="font-semibold text-slate-50 mb-1">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </div>
  );

  const laws = [
    {
      icon: Target,
      title: "Torne Óbvio",
      description: "Crie gatilhos claros e impossíveis de ignorar"
    },
    {
      icon: Sparkles,
      title: "Torne Atraente", 
      description: "Faça seus hábitos irresistíveis e prazerosos"
    },
    {
      icon: Rocket,
      title: "Torne Fácil",
      description: "Comece pequeno com a Regra dos 2 Minutos"
    },
    {
      icon: PartyPopper,
      title: "Torne Satisfatório",
      description: "Celebre cada vitória e construa momentum"
    }
  ];

  const benefits = [
    {
      icon: BarChart3,
      title: "Streaks Visuais",
      description: "Veja seu progresso crescer dia após dia com gráficos intuitivos"
    },
    {
      icon: Clock,
      title: "Lembretes Inteligentes",
      description: "Notificações no momento certo, sem spam ou interrupções"
    },
    {
      icon: TrendingUp,
      title: "Dashboard Simples",
      description: "Tudo que você precisa em uma tela limpa e organizada"
    },
    {
      icon: CheckCircle,
      title: "Hábitos Empilhados",
      description: "Conecte hábitos existentes para criar rotinas poderosas"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header Minimalista */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-semibold text-slate-50">atomicTracker</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/auth")}
              className="text-slate-300 hover:text-slate-50"
            >
              Entrar
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Limpo e Direto */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-slate-50 mb-6 leading-tight">
          Transforme sua vida
          <br />
          <span className="text-violet-400">1% por dia</span>
        </h1>
        
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          Construa hábitos que duram usando as 4 Leis da Mudança de Comportamento
        </p>

        <Button 
          size="lg" 
          onClick={() => navigate("/auth")}
          className="group"
        >
          Começar Agora - Grátis
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </section>

      {/* Social Proof - Logo Após Hero */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-3 gap-8 py-8 border-y border-slate-800">
          <StatCard value="2.5K+" label="Usuários Ativos" />
          <StatCard value="15K+" label="Hábitos Criados" />
          <StatCard value="85%" label="Taxa de Sucesso" />
        </div>
      </section>

      {/* As 4 Leis - Grid Limpo */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-50 mb-4">
            As 4 Leis da Mudança
          </h2>
          <p className="text-slate-400 text-lg">
            Cientificamente comprovadas para formar hábitos duradouros
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {laws.map((law, index) => (
            <LawCard
              key={index}
              icon={law.icon}
              title={law.title}
              description={law.description}
            />
          ))}
        </div>
      </section>

      {/* Benefícios Concretos - Substituindo IA */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-50 mb-4">
            Tudo que você precisa
          </h2>
          <p className="text-slate-400 text-lg">
            Ferramentas simples e eficazes para construir hábitos duradouros
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </div>
      </section>

      {/* CTA Final - Apenas se Necessário */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-slate-900 rounded-2xl p-12 border border-slate-800">
          <h2 className="text-3xl font-bold text-slate-50 mb-4">
            Pronto para começar?
          </h2>
          <p className="text-slate-400 mb-8">
            Junte-se a milhares de pessoas que já transformaram suas vidas
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")}
            className="group"
          >
            Criar Minha Conta
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Footer Minimalista */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            © 2024 atomicTracker. Transformando vidas, um hábito por vez.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;