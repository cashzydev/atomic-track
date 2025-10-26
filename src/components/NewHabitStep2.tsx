import React from "react";
import { Target, Sparkles, Zap, Trophy, CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const HABIT_LAWS = [
  {
    id: 'obvious',
    icon: Target,
    title: '1. Torne Óbvio',
    subtitle: 'Deixe claro quando e onde fazer',
    placeholder: 'Ex: Deixar o livro na mesa de cabeceira todas as noites',
    field: 'environmentPrep',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    id: 'attractive',
    icon: Sparkles,
    title: '2. Torne Atraente',
    subtitle: 'Combine com algo que você gosta',
    placeholder: 'Ex: Ouvir música favorita enquanto pratico',
    field: 'temptationBundle',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  {
    id: 'easy',
    icon: Zap,
    title: '3. Torne Fácil',
    subtitle: 'Comece com apenas 2 minutos',
    placeholder: 'Ex: Ler apenas uma página',
    field: 'twoMinuteVersion',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  {
    id: 'satisfying',
    icon: Trophy,
    title: '4. Torne Satisfatório',
    subtitle: 'Celebre cada pequena vitória',
    placeholder: 'Ex: Me presentear com um café especial',
    field: 'reward',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  }
];

interface NewHabitStep2Props {
  title: string;
  selectedIcon: string;
  iconOptions: Array<{ icon: any; name: string }>;
  environmentPrep: string;
  setEnvironmentPrep: (value: string) => void;
  temptationBundle: string;
  setTemptationBundle: (value: string) => void;
  twoMinuteVersion: string;
  setTwoMinuteVersion: (value: string) => void;
  reward: string;
  setReward: (value: string) => void;
  onPrevStep: () => void;
  onCreateOptimized: () => void;
}

const NewHabitStep2 = ({
  title,
  selectedIcon,
  iconOptions,
  environmentPrep,
  setEnvironmentPrep,
  temptationBundle,
  setTemptationBundle,
  twoMinuteVersion,
  setTwoMinuteVersion,
  reward,
  setReward,
  onPrevStep,
  onCreateOptimized,
}: NewHabitStep2Props) => {
  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(option => option.name === iconName);
    return iconOption ? iconOption.icon : Target;
  };

  const IconComponent = getIconComponent(selectedIcon);

  const getFieldValue = (field: string) => {
    switch (field) {
      case 'environmentPrep': return environmentPrep;
      case 'temptationBundle': return temptationBundle;
      case 'twoMinuteVersion': return twoMinuteVersion;
      case 'reward': return reward;
      default: return '';
    }
  };

  const setFieldValue = (field: string, value: string) => {
    switch (field) {
      case 'environmentPrep': setEnvironmentPrep(value); break;
      case 'temptationBundle': setTemptationBundle(value); break;
      case 'twoMinuteVersion': setTwoMinuteVersion(value); break;
      case 'reward': setReward(value); break;
    }
  };

  const isFieldFilled = (field: string) => {
    return getFieldValue(field).trim().length > 0;
  };

  const filledFieldsCount = HABIT_LAWS.filter(law => isFieldFilled(law.field)).length;

  return (
    <div className="space-y-6">
      {/* Header com contexto do hábito */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
        <div className="w-12 h-12 rounded-xl bg-violet-500 flex items-center justify-center shadow-[0_4px_16px_rgba(139,92,246,0.3)]">
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">Otimizando seu hábito</p>
        </div>
        <Badge 
          variant="secondary" 
          className={cn(
            "ml-auto px-3 py-1 font-medium transition-colors duration-200",
            filledFieldsCount === 4 
              ? "bg-emerald-500 text-white" 
              : filledFieldsCount > 0 
                ? "bg-violet-500 text-white" 
                : "bg-muted text-muted-foreground"
          )}
        >
          {filledFieldsCount}/4 completas
        </Badge>
      </div>

      {/* Lista das 4 Leis */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Aplicar as 4 Leis dos Hábitos</h3>
        
        {HABIT_LAWS.map((law) => {
          const LawIcon = law.icon;
          const isFilled = isFieldFilled(law.field);
          const value = getFieldValue(law.field);
          
          return (
            <div
              key={law.id}
              className={cn(
                "p-5 rounded-xl border-2 transition-all duration-300 group",
                isFilled 
                  ? "border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 shadow-[0_4px_16px_rgba(16,185,129,0.1)]" 
                  : "border-border/50 bg-card/30 hover:border-violet-500/30 hover:bg-violet-500/5"
              )}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200",
                  law.bgColor,
                  isFilled && "scale-110 shadow-lg"
                )}>
                  <LawIcon className={cn("w-5 h-5", law.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-foreground text-lg">{law.title}</h4>
                    {isFilled && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 animate-pulse" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{law.subtitle}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor={law.field} className="text-sm font-medium text-foreground">
                  Sua estratégia:
                </Label>
                <Textarea
                  id={law.field}
                  placeholder={law.placeholder}
                  value={value}
                  onChange={(e) => setFieldValue(law.field, e.target.value)}
                  className={cn(
                    "resize-none min-h-[90px] transition-all duration-200",
                    "focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50",
                    isFilled 
                      ? "ring-2 ring-emerald-500/20 border-emerald-500/30 bg-emerald-500/5" 
                      : "border-border/50 hover:border-violet-500/30"
                  )}
                  rows={3}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Dica motivacional */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 shadow-[0_4px_16px_rgba(139,92,246,0.1)]">
        <div className="flex items-start gap-3">
          <Sparkles className="w-6 h-6 text-violet-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-violet-700 dark:text-violet-300 mb-2 text-lg">
              Dica de Especialista
            </h4>
            <p className="text-sm text-violet-600 dark:text-violet-400 leading-relaxed">
              Hábitos que seguem as 4 Leis têm <span className="font-semibold">3x mais chances de sucesso</span>. 
              Não precisa preencher tudo agora - você pode ajustar depois!
            </p>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-3 pt-6">
        <Button
          variant="ghost"
          onClick={onPrevStep}
          className="flex-1 border-2 border-muted text-muted-foreground hover:border-violet-500 hover:text-violet-500 hover:bg-violet-500/10 transition-all duration-200"
        >
          Voltar
        </Button>
        <Button
          onClick={onCreateOptimized}
          className={cn(
            "flex-1 transition-all duration-200 shadow-[0_4px_16px_rgba(139,92,246,0.3)] hover:shadow-[0_8px_24px_rgba(139,92,246,0.4)]",
            filledFieldsCount === 4 
              ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
              : "bg-violet-500 hover:bg-violet-600 text-white"
          )}
        >
          {filledFieldsCount === 4 ? "Salvar Hábito Perfeito ✨" : "Salvar Hábito Otimizado"}
        </Button>
      </div>
    </div>
  );
};

export default NewHabitStep2;
