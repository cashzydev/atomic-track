import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription, DrawerHeader, DrawerFooter } from "@/components/ui/drawer";
import { 
  X, BookOpen, Dumbbell, Brain, Heart, Droplet, Utensils, Moon, Sun, 
  Target, Zap, Award, Sparkles, Trophy, HelpCircle, CheckCircle2, 
  Lightbulb, ChevronDown, Rocket 
} from "lucide-react";
import { useHabits } from "@/hooks/useHabits";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { triggerHaptic } from "@/utils/haptics";
import { HabitStackSelector } from "@/components/HabitStackSelector";

interface NewHabitModalProps {
  open: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
}

const EDUCATIONAL_TIPS = {
  attractive: {
    icon: Sparkles,
    title: "Torne Atraente",
    tip: "Empilhar tentações aumenta a chance de sucesso em 80%"
  },
  easy: {
    icon: Zap,
    title: "Torne Fácil",
    tip: "Comece pequeno: a regra dos 2 minutos é crucial"
  },
  satisfying: {
    icon: Trophy,
    title: "Torne Satisfatório",
    tip: "Celebre pequenas vitórias para reforçar o hábito"
  },
  triggers: {
    icon: Target,
    title: "Gatilhos Extra",
    tip: "Associar a hábitos existentes aumenta em 3x a chance de sucesso"
  }
};

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

const HABIT_SUGGESTIONS: Record<string, { when: string; where: string; goal: string; unit: string; twoMin: string }> = {
  BookOpen: { when: "Após o café da manhã", where: "Poltrona de leitura", goal: "10", unit: "páginas", twoMin: "Ler 1 página" },
  Dumbbell: { when: "Ao acordar", where: "Quarto", goal: "20", unit: "flexões", twoMin: "Fazer 5 flexões" },
  Brain: { when: "Antes de dormir", where: "Cama", goal: "5", unit: "minutos", twoMin: "Respirar fundo 3 vezes" },
  Droplet: { when: "Ao acordar", where: "Cozinha", goal: "2", unit: "copos", twoMin: "Beber 1 copo" },
  Pencil: { when: "Após o jantar", where: "Mesa de estudos", goal: "30", unit: "minutos", twoMin: "Escrever 1 frase" },
  Music: { when: "Durante o almoço", where: "Sala", goal: "15", unit: "minutos", twoMin: "Ouvir 1 música" },
  default: { when: "Após café da manhã", where: "Em casa", goal: "10", unit: "minutos", twoMin: "Fazer por 2 minutos" }
};

const NewHabitModal = ({ open, onClose, onOpenChange }: NewHabitModalProps) => {
  const { createHabit, isCreating, data: habits } = useHabits();
  const isMobile = useIsMobile();
  const [showAllIcons, setShowAllIcons] = useState(false);
  
  // Form data - Essential fields
  const [title, setTitle] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0].name);
  const [whenTime, setWhenTime] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [whenMode, setWhenMode] = useState<'behavior' | 'time'>('behavior');
  const [location, setLocation] = useState("");
  const [goal, setGoal] = useState(5);
  const [unit, setUnit] = useState("minutos");

  // Auto-fill animation flags (brief pulse when suggestion applied)
  const [pulseTitle, setPulseTitle] = useState(false);
  const [pulseGoal, setPulseGoal] = useState(false);
  const [pulseUnit, setPulseUnit] = useState(false);
  
  // Advanced options state
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [activeOptimizationTab, setActiveOptimizationTab] = useState("attractive");
  const [appliedOptimizations, setAppliedOptimizations] = useState<Record<string, boolean>>({});
  const [expandedOptimizationInput, setExpandedOptimizationInput] = useState<Record<string, boolean>>({});
  
  // Advanced fields - Law 2: Make it Attractive
  const [motivation, setMotivation] = useState("");
  const [temptationBundle, setTemptationBundle] = useState("");
  
  // Advanced fields - Law 3: Make it Easy
  const [twoMinuteVersion, setTwoMinuteVersion] = useState("");
  const [environmentPrep, setEnvironmentPrep] = useState("");
  
  // Advanced fields - Law 4: Make it Satisfying
  const [reward, setReward] = useState("");
  
  // Advanced fields - Additional Triggers
  const [habitStack, setHabitStack] = useState<number | null>(null);

  const resetForm = () => {
    setTitle("");
    setSelectedIcon(ICON_OPTIONS[0].name);
    setGoal(5);
    setUnit("minutos");
    setWhenTime("");
  setTimeOfDay("");
  setWhenMode('behavior');
    setLocation("");
    setHabitStack(null);
    setMotivation("");
    setTemptationBundle("");
    setTwoMinuteVersion("");
    setEnvironmentPrep("");
    setReward("");
    setIsAdvancedOpen(false);
    setActiveOptimizationTab("attractive");
  };

  const applySuggestions = (iconName: string) => {
    const suggestions = HABIT_SUGGESTIONS[iconName] || HABIT_SUGGESTIONS.default;
    // Always apply suggestions (but keep user's custom values) — animate filled fields
    if (!title) {
      setTitle(getDefaultTitle(iconName));
      setPulseTitle(true);
      setTimeout(() => setPulseTitle(false), 550);
    }
  if (!whenTime) setWhenTime(suggestions.when);
  // if suggestion is a rough time keyword, keep it in behavior; timeOfDay remains manual
    if (!location) setLocation(suggestions.where);
    if (!goal) {
      setGoal(Number(suggestions.goal));
      setPulseGoal(true);
      setTimeout(() => setPulseGoal(false), 550);
    }
    if (!unit) {
      setUnit(suggestions.unit);
      setPulseUnit(true);
      setTimeout(() => setPulseUnit(false), 550);
    }
    if (!twoMinuteVersion) setTwoMinuteVersion(suggestions.twoMin);
  };

  const getDefaultTitle = (iconName: string) => {
    switch (iconName) {
      case 'Dumbbell': return 'Exercício';
      case 'BookOpen': return 'Leitura';
      case 'Brain': return 'Meditação';
      case 'Droplet': return 'Hidratação';
      case 'Utensils': return 'Alimentação';
      case 'Moon': return 'Sono';
      case 'Sun': return 'Rotina';
      case 'Target': return 'Meta';
      case 'Zap': return 'Energia';
      case 'Award': return 'Conquista';
      default: return 'Hábito';
    }
  };

  const handleHabitStackChange = (habitId: number | null, habit?: any) => {
    setHabitStack(habitId);
    if (habit) {
      setWhenTime(`Após ${habit.title}`);
    } else {
      setWhenTime("");
    }
  };

  // Calculate habit strength based on filled fields
  const calculateHabitStrength = (): number => {
    let strength = 0;
    
    // Essential fields (50%)
    if (title && whenTime && location) strength += 50;
    
    // Optimization fields (up to 50%)
    if (motivation || temptationBundle) strength += 12.5;
    if (twoMinuteVersion) strength += 12.5;
    if (environmentPrep) strength += 12.5;
    if (reward || habitStack) strength += 12.5;
    
    return Math.min(100, strength);
  };

  const getStrengthLabel = (strength: number): string => {
    if (strength < 50) return "Básico";
    if (strength < 75) return "Bom";
    if (strength < 90) return "Ótimo";
    return "Excelente";
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Por favor, dê um nome ao seu hábito");
      return;
    }

    if (!whenTime || !location) {
      toast.error("Por favor, defina quando e onde você fará este hábito");
      return;
    }

    try {
      await createHabit({
        title: title.trim(),
        icon: selectedIcon,
        when_time: whenTime || '',
        where_location: location.trim(),
        trigger_activity: whenTime || null,
        temptation_bundle: temptationBundle.trim() || null,
        environment_prep: environmentPrep.trim() || null,
        goal_target: goal,
        goal_unit: unit,
      });

      toast.success("Hábito criado com sucesso! 🌱");
      resetForm();
      if (onOpenChange) onOpenChange(false);
      if (onClose) onClose();
    } catch (error) {
      console.error('Error creating habit:', error);
      toast.error("Erro ao criar hábito");
    }
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      if (onClose) onClose();
      if (onOpenChange) onOpenChange(false);
      resetForm();
    }
  };

  // legacy handleSubmit removed — use handleCreate which validates and creates habit with current fields

  const habitStrength = calculateHabitStrength();

  const isValidTitle = title.trim().length > 0;
  const isValidWhen = whenMode === 'time' ? timeOfDay.trim().length > 0 : whenTime.trim().length > 0;
  const isValidLocation = location.trim().length > 0;
  const isFormValid = isValidTitle && isValidWhen && isValidLocation;

  const renderEssentialFields = () => (
    <div className="space-y-6">
      {/* Nome do Hábito */}
      <div className="space-y-2">
        <Label htmlFor="title">Nome do Hábito</Label>
        <Input
          id="title"
          placeholder="Ex: Ler um livro"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`neuro-interactive ${pulseTitle ? 'animate-scale-in' : ''} ${isValidTitle ? 'ring-2 ring-emerald-500/20 border-emerald-500/30' : ''}`}
        />
      </div>

      {/* Seletor de Ícones — faixa horizontal rolável */}
      <div className="space-y-2">
        <Label>Ícone</Label>
        {/* Horizontal scroll with 2 rows (fixed height) to avoid expanding modal vertically */}
        <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
          <div className="inline-grid grid-flow-col auto-cols-max grid-rows-2 gap-3 py-2 items-start h-28">
            {ICON_OPTIONS.map(({ icon: Icon, name }) => {
              const active = selectedIcon === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setSelectedIcon(name);
                    applySuggestions(name);
                  }}
                  aria-label={`Selecionar ícone ${name}`}
                  className={cn(
                    'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform',
                    'neuro-card',
                    active ? 'scale-105 ring-2 ring-violet-500/40 shadow-[0_0_24px_rgba(139,92,246,0.22)]' : 'opacity-90'
                  )}
                  aria-pressed={active}
                >
                  <Icon className="w-5 h-5 text-foreground/90" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quando: modo (Comportamento | Hora) */}
      <div className="space-y-2">
        <Label>Quando?</Label>
        {/* Suggested time chips */}
        <div className="flex gap-2 mb-2 flex-wrap">
          <button type="button" className="px-3 py-1 rounded-full text-sm bg-card/60" onClick={() => { setWhenMode('time'); setTimeOfDay('08:00'); }}>
            Manhã (08:00)
          </button>
          <button type="button" className="px-3 py-1 rounded-full text-sm bg-card/60" onClick={() => { setWhenMode('time'); setTimeOfDay('12:00'); }}>
            Almoço (12:00)
          </button>
          <button type="button" className="px-3 py-1 rounded-full text-sm bg-card/60" onClick={() => { setWhenMode('time'); setTimeOfDay('20:00'); }}>
            Noite (20:00)
          </button>
          <button type="button" className="px-3 py-1 rounded-full text-sm bg-card/60" onClick={() => { setWhenMode('behavior'); setWhenTime('Após o café da manhã'); }}>
            Após (comportamento)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWhenMode('behavior')}
            className={cn(
              'px-3 py-1 rounded-md text-sm',
              whenMode === 'behavior' ? 'bg-violet-600 text-white shadow-[0_6px_24px_rgba(139,92,246,0.12)]' : 'bg-card/60 text-muted-foreground'
            )}
          >
            Comportamento
          </button>
          <button
            type="button"
            onClick={() => setWhenMode('time')}
            className={cn(
              'px-3 py-1 rounded-md text-sm',
              whenMode === 'time' ? 'bg-violet-600 text-white shadow-[0_6px_24px_rgba(139,92,246,0.12)]' : 'bg-card/60 text-muted-foreground'
            )}
          >
            Hora
          </button>
        </div>

        {whenMode === 'time' ? (
          <Input
            id="timeOfDay"
            type="time"
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value)}
            className={`neuro-interactive mt-2 ${isValidWhen ? 'ring-2 ring-emerald-500/20 border-emerald-500/30' : ''}`}
          />
        ) : (
          <Input
            id="whenTime"
            placeholder="Ex: Após o café da manhã"
            value={whenTime}
            onChange={(e) => setWhenTime(e.target.value)}
            className={`neuro-interactive mt-2 ${isValidWhen ? 'ring-2 ring-emerald-500/20 border-emerald-500/30' : ''}`}
          />
        )}
      </div>

      {/* Onde */}
      <div className="space-y-2">
        <Label htmlFor="location">Onde?</Label>
        <Input
          id="location"
          placeholder="Ex: Na sala de estar"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={`neuro-interactive ${isValidLocation ? 'ring-2 ring-emerald-500/20 border-emerald-500/30' : ''}`}
        />
      </div>

      {/* Meta + Unidade — empilhados verticalmente para mobile */}
      <div className="space-y-2">
        <Label htmlFor="goal">Meta Diária</Label>
        <Input
          id="goal"
          type="number"
          min={1}
          value={goal}
          onChange={(e) => setGoal(parseInt(e.target.value) || 1)}
          className={`neuro-interactive ${pulseGoal ? 'animate-scale-in' : ''}`}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit">Unidade</Label>
        <select
          id="unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className={`neuro-interactive h-10 w-full rounded-md px-3 py-2 text-sm ${pulseUnit ? 'animate-scale-in' : ''}`}
        >
          {UNIT_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderOptimizations = () => (
    <Accordion
      type="single"
      collapsible
      className="mt-8"
      value={isAdvancedOpen ? "optimization" : undefined}
      onValueChange={(value) => setIsAdvancedOpen(value === "optimization")}
    >
      <AccordionItem value="optimization" className="border-b-0">
        <AccordionTrigger className="flex items-center gap-2 py-4 text-sm font-medium hover:no-underline">
          <Rocket className="w-4 h-4 text-primary" />
          Ferramentas de Potência
          {habitStrength < 100 && (
            <Badge variant="secondary" className="ml-2 font-normal">
              +{Math.floor(100 - habitStrength)}% potencial
            </Badge>
          )}
        </AccordionTrigger>
        <AccordionContent className="pt-6 pb-2">
          <Tabs
            value={activeOptimizationTab}
            onValueChange={setActiveOptimizationTab}
            className="w-full"
          >
            <TabsList className="w-full justify-start mb-6 bg-transparent p-0 gap-2">
              {[
                ['attractive', 'Combinar com Recompensa'],
                ['easy', 'Começar com 2 Minutos'],
                ['satisfying', 'Planejar uma Celebração'],
                ['triggers', 'Gatilho & Localização'],
              ].map(([key, label]) => (
                <TabsTrigger
                  key={key}
                  value={key as string}
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-border px-3 py-2 flex items-center gap-2"
                >
                  <span className="text-sm">{label}</span>
                  <input
                    type="checkbox"
                    checked={!!appliedOptimizations[key as string]}
                    onChange={(e) => setAppliedOptimizations(prev => ({ ...prev, [key as string]: e.target.checked }))}
                    className="ml-2"
                    aria-label={`Marcar ${label} como aplicado`}
                  />
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Attractive -> Combinar com Recompensa */}
            <TabsContent value="attractive" className="m-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="temptation">Combinar com uma Recompensa</Label>
                  {expandedOptimizationInput['attractive'] ? (
                    <Textarea
                      id="temptation"
                      placeholder="Ex: Ouvir música favorita enquanto pratico"
                      value={temptationBundle}
                      onChange={(e) => setTemptationBundle(e.target.value)}
                      className="resize-none"
                      rows={3}
                    />
                  ) : (
                    <Input
                      id="temptation"
                      placeholder="Ex: Ouvir música favorita enquanto pratico"
                      value={temptationBundle}
                      onFocus={() => setExpandedOptimizationInput(prev => ({ ...prev, attractive: true }))}
                      onChange={(e) => setTemptationBundle(e.target.value)}
                    />
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Easy -> 2 Minutes */}
            <TabsContent value="easy" className="m-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="twoMin">Começar com 2 Minutos</Label>
                  {expandedOptimizationInput['easy'] ? (
                    <Textarea
                      id="twoMin"
                      placeholder="Ex: Ler apenas uma página"
                      value={twoMinuteVersion}
                      onChange={(e) => setTwoMinuteVersion(e.target.value)}
                      className="resize-none"
                      rows={3}
                    />
                  ) : (
                    <Input
                      id="twoMin"
                      placeholder="Ex: Ler apenas uma página"
                      value={twoMinuteVersion}
                      onFocus={() => setExpandedOptimizationInput(prev => ({ ...prev, easy: true }))}
                      onChange={(e) => setTwoMinuteVersion(e.target.value)}
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prep">Preparação do Ambiente</Label>
                  <Input
                    id="prep"
                    placeholder="Ex: Deixar o livro na mesa de cabeceira"
                    value={environmentPrep}
                    onChange={(e) => setEnvironmentPrep(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Satisfying -> Celebration */}
            <TabsContent value="satisfying" className="m-0">
              <div className="space-y-2">
                <Label htmlFor="reward">Planejar uma Celebração</Label>
                {expandedOptimizationInput['satisfying'] ? (
                  <Textarea
                    id="reward"
                    placeholder="Ex: Me presentear com um café especial"
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                ) : (
                  <Input
                    id="reward"
                    placeholder="Ex: Me presentear com um café especial"
                    value={reward}
                    onFocus={() => setExpandedOptimizationInput(prev => ({ ...prev, satisfying: true }))}
                    onChange={(e) => setReward(e.target.value)}
                  />
                )}
              </div>
            </TabsContent>

            {/* Triggers -> Gatilho & Localização */}
            <TabsContent value="triggers" className="m-0">
              <div className="space-y-2">
                <Label>Empilhar com Outro Hábito</Label>
                <HabitStackSelector
                  habits={habits || []}
                  value={habitStack}
                  onChange={handleHabitStackChange}
                />
              </div>
            </TabsContent>

            {/* Small tip text */}
            <div className="mt-6 flex items-start gap-2 text-xs">
              <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                {EDUCATIONAL_TIPS[activeOptimizationTab as keyof typeof EDUCATIONAL_TIPS].tip}
              </p>
            </div>
          </Tabs>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  return isMobile ? (
    <Drawer open={open} onOpenChange={handleDialogChange}>
      <DrawerContent className={cn(
        "overflow-y-auto border-border/50 p-0 flex flex-col",
        "h-[92vh] rounded-t-3xl"
      )}>
        <DrawerHeader className="px-6 pt-6 pb-0">
          <DrawerTitle className="text-lg font-semibold leading-none">Novo Hábito</DrawerTitle>
          <DrawerDescription className="text-sm text-muted-foreground mt-1.5">
            Comece com o básico e otimize depois
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-6 flex-1 overflow-y-auto">
          {renderEssentialFields()}
        </div>

        <DrawerFooter className="px-6 py-4 border-t">
          <div className="flex justify-between w-full">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              {isFormValid ? (
                <Button
                  type="submit"
                  onClick={handleCreate}
                  className="glow-violet hover:shadow-xl"
                >
                  Criar
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        type="button"
                        disabled
                      >
                        Criar
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {(!isValidTitle && 'Adicione um nome para o hábito') || (!isValidWhen && 'Escolha uma hora ou descreva o comportamento') || (!isValidLocation && 'Defina onde você fará o hábito')}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className={cn(
        "overflow-y-auto border-border/50 p-0 flex flex-col",
        "max-w-xl w-full max-h-[90vh] rounded-2xl"
      )}>
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-lg font-semibold leading-none">Novo Hábito</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1.5">
            Comece com o básico e otimize depois
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 flex-1 overflow-y-auto">
          {renderEssentialFields()}
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <div className="flex justify-between w-full">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              {isFormValid ? (
                <Button
                  type="submit"
                  onClick={handleCreate}
                  className="glow-violet hover:shadow-xl"
                >
                  Criar
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        type="button"
                        disabled
                      >
                        Criar
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {(!isValidTitle && 'Adicione um nome para o hábito') || (!isValidWhen && 'Escolha uma hora ou descreva o comportamento') || (!isValidLocation && 'Defina onde você fará o hábito')}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewHabitModal;