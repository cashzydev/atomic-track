import React from "react";
import { 
  BookOpen, Dumbbell, Brain, Heart, Droplet, Utensils, Moon, Sun, 
  Target, Zap, Award, Clock, MapPin 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/utils/haptics";

const ICON_OPTIONS = [
  { icon: BookOpen, name: 'BookOpen' },
  { icon: Dumbbell, name: 'Dumbbell' },
  { icon: Brain, name: 'Brain' },
  { icon: Heart, name: 'Heart' },
  { icon: Droplet, name: 'Droplet' },
  { icon: Utensils, name: 'Utensils' },
  { icon: Moon, name: 'Moon' },
  { icon: Sun, name: 'Sun' },
  { icon: Target, name: 'Target' },
  { icon: Zap, name: 'Zap' },
  { icon: Award, name: 'Award' },
];

const UNIT_OPTIONS = ['minutos', 'páginas', 'vezes', 'km', 'copos', 'horas'];

const LOCATION_SUGGESTIONS = [
  'Quarto',
  'Sala',
  'Cozinha',
  'Escritório',
  'Varanda',
  'Academia',
  'Parque',
  'Escola/Trabalho'
];

interface NewHabitStep1Props {
  title: string;
  setTitle: (value: string) => void;
  selectedIcon: string;
  setSelectedIcon: (value: string) => void;
  whenTime: string;
  setWhenTime: (value: string) => void;
  timeOfDay: string;
  setTimeOfDay: (value: string) => void;
  whenMode: 'behavior' | 'time';
  setWhenMode: (value: 'behavior' | 'time') => void;
  location: string;
  setLocation: (value: string) => void;
  goal: number;
  setGoal: (value: number) => void;
  unit: string;
  setUnit: (value: string) => void;
  habits: any[];
  habitStack: number | null;
  setHabitStack: (value: number | null) => void;
  onApplySuggestions: (iconName: string) => void;
  isValidTitle: boolean;
  isValidWhen: boolean;
  isValidLocation: boolean;
  isFormValid: boolean;
  onCreate: () => void;
  onNextStep: () => void;
}

const NewHabitStep1 = ({
  title,
  setTitle,
  selectedIcon,
  setSelectedIcon,
  whenTime,
  setWhenTime,
  timeOfDay,
  setTimeOfDay,
  whenMode,
  setWhenMode,
  location,
  setLocation,
  goal,
  setGoal,
  unit,
  setUnit,
  habits,
  habitStack,
  setHabitStack,
  onApplySuggestions,
  isValidTitle,
  isValidWhen,
  isValidLocation,
  isFormValid,
  onCreate,
  onNextStep,
}: NewHabitStep1Props) => {
  const handleIconSelect = (iconName: string) => {
    setSelectedIcon(iconName);
    onApplySuggestions(iconName);
    triggerHaptic('light');
  };

  const handleLocationSuggestion = (suggestion: string) => {
    setLocation(suggestion);
    triggerHaptic('light');
  };

  return (
    <div className="space-y-8">
      {/* Nome do Hábito */}
      <div className="space-y-3">
        <Label htmlFor="title" className="text-base font-medium">Nome do Hábito</Label>
        <Input
          id="title"
          placeholder="Ex: Ler um livro"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={cn(
            "text-lg py-3 px-4 transition-all duration-200",
            isValidTitle ? 'ring-2 ring-emerald-500/20 border-emerald-500/30 bg-emerald-500/5' : 'focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50'
          )}
        />
      </div>

      {/* Seletor de Ícones */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Escolha um ícone</Label>
        <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
          <div className="inline-grid grid-flow-col auto-cols-max grid-rows-2 gap-3 py-2 items-start h-28">
            {ICON_OPTIONS.map(({ icon: Icon, name }) => {
              const active = selectedIcon === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleIconSelect(name)}
                  aria-label={`Selecionar ícone ${name}`}
                  className={cn(
                    'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300',
                    'border-2 border-transparent',
                    active 
                      ? 'bg-violet-500 text-white scale-110 shadow-[0_8px_32px_rgba(139,92,246,0.4)] ring-4 ring-violet-500/30' 
                      : 'bg-card/60 text-muted-foreground hover:bg-card/80 hover:text-foreground hover:scale-105 hover:border-violet-500/30 hover:shadow-lg'
                  )}
                  aria-pressed={active}
                >
                  <Icon className={cn(
                    "w-5 h-5 transition-colors duration-200",
                    active ? "text-white" : "text-current"
                  )} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contexto - Quando e Onde */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Contexto</h3>
        
        {/* Quando */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-medium">
            <Clock className="w-4 h-4" />
            Quando?
          </Label>
          
          {/* Modo de seleção */}
          <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-lg">
            <button
              type="button"
              onClick={() => setWhenMode('behavior')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex-1',
                whenMode === 'behavior' 
                  ? 'bg-violet-500 text-white shadow-[0_4px_16px_rgba(139,92,246,0.3)] scale-105' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              )}
            >
              Após um hábito
            </button>
            <button
              type="button"
              onClick={() => setWhenMode('time')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex-1',
                whenMode === 'time' 
                  ? 'bg-violet-500 text-white shadow-[0_4px_16px_rgba(139,92,246,0.3)] scale-105' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              )}
            >
              Horário específico
            </button>
          </div>

          {/* Input baseado no modo */}
          {whenMode === 'time' ? (
            <Input
              id="timeOfDay"
              type="time"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              className={cn(
                "transition-all duration-200",
                isValidWhen ? 'ring-2 ring-emerald-500/20 border-emerald-500/30 bg-emerald-500/5' : 'focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50'
              )}
            />
          ) : (
            <div className="space-y-2">
              <select
                value={habitStack || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setHabitStack(value ? Number(value) : null);
                  if (value) {
                    const habit = habits.find(h => h.id === Number(value));
                    if (habit) {
                      setWhenTime(`Após ${habit.title}`);
                    }
                  } else {
                    setWhenTime('');
                  }
                }}
                className="neuro-interactive h-10 w-full rounded-md px-3 py-2 text-sm"
              >
                <option value="">Selecione um hábito existente</option>
                {habits.map((habit) => (
                  <option key={habit.id} value={habit.id}>
                    Após {habit.title}
                  </option>
                ))}
              </select>
              <Input
                id="whenTime"
                placeholder="Ex: Após o café da manhã"
                value={whenTime}
                onChange={(e) => setWhenTime(e.target.value)}
                className={cn(
                  "transition-all duration-200",
                  isValidWhen ? 'ring-2 ring-emerald-500/20 border-emerald-500/30 bg-emerald-500/5' : 'focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50'
                )}
              />
            </div>
          )}
        </div>

        {/* Onde */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-medium">
            <MapPin className="w-4 h-4" />
            Onde?
          </Label>
          <Input
            id="location"
            placeholder="Ex: Na sala de estar"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={cn(
              "transition-all duration-200",
              isValidLocation ? 'ring-2 ring-emerald-500/20 border-emerald-500/30 bg-emerald-500/5' : 'focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50'
            )}
          />
          
          {/* Sugestões de localização */}
          <div className="flex gap-2 flex-wrap">
            {LOCATION_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleLocationSuggestion(suggestion)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                  "border border-transparent",
                  location === suggestion
                    ? "bg-violet-500 text-white border-violet-500 scale-105 shadow-[0_4px_16px_rgba(139,92,246,0.3)]"
                    : "bg-card/60 text-muted-foreground hover:bg-card/80 hover:text-foreground hover:border-violet-500/30 hover:scale-102"
                )}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Meta Diária</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="goal">Quantidade</Label>
            <Input
              id="goal"
              type="number"
              min={1}
              value={goal}
              onChange={(e) => setGoal(parseInt(e.target.value) || 1)}
              className="neuro-interactive"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unidade</Label>
            <select
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="neuro-interactive h-10 w-full rounded-md px-3 py-2 text-sm"
            >
              {UNIT_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-3 pt-6">
        <Button
          onClick={onCreate}
          className="flex-1 bg-violet-500 hover:bg-violet-600 text-white shadow-[0_4px_16px_rgba(139,92,246,0.3)] hover:shadow-[0_8px_24px_rgba(139,92,246,0.4)] transition-all duration-200"
        >
          Criar Hábito
        </Button>
        <Button
          variant="outline"
          onClick={onNextStep}
          disabled={!isFormValid}
          className={cn(
            "flex-1 border-2 transition-all duration-200",
            isFormValid 
              ? "border-violet-500 text-violet-500 hover:bg-violet-500 hover:text-white hover:shadow-[0_4px_16px_rgba(139,92,246,0.3)]" 
              : "border-muted text-muted-foreground"
          )}
        >
          Otimizar Hábito ✨
        </Button>
      </div>
    </div>
  );
};

export default NewHabitStep1;
