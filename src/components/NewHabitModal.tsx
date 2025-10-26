import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription, DrawerHeader, DrawerFooter } from "@/components/ui/drawer";
import { 
  BookOpen, Dumbbell, Brain, Heart, Droplet, Utensils, Moon, Sun, 
  Target, Zap, Award, ArrowLeft, ArrowRight
} from "lucide-react";
import { useHabits } from "@/hooks/useHabits";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import NewHabitStep1 from "./NewHabitStep1";
import NewHabitStep2 from "./NewHabitStep2";

interface NewHabitModalProps {
  open: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
}

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
  
  // Step management
  const [step, setStep] = useState(1);
  
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
    setStep(1);
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

  const handleNextStep = () => setStep(2);
  const handlePrevStep = () => setStep(1);

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

  const isValidTitle = title.trim().length > 0;
  const isValidWhen = whenMode === 'time' ? timeOfDay.trim().length > 0 : whenTime.trim().length > 0;
  const isValidLocation = location.trim().length > 0;
  const isFormValid = isValidTitle && isValidWhen && isValidLocation;

  const getStepTitle = () => {
    return step === 1 ? "Novo Hábito" : "Otimizar Hábito";
  };

  const getStepDescription = () => {
    return step === 1 
      ? "Comece com o básico e otimize depois" 
      : "Aplique as 4 Leis para maximizar o sucesso";
  };

  return isMobile ? (
    <Drawer open={open} onOpenChange={handleDialogChange}>
      <DrawerContent className={cn(
        "overflow-y-auto border-border/50 p-0 flex flex-col",
        "h-[92vh] rounded-t-3xl"
      )}>
        <DrawerHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center justify-between mb-2">
            <DrawerTitle className="text-lg font-semibold leading-none">{getStepTitle()}</DrawerTitle>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  step >= 1 ? "bg-violet-500 scale-110" : "bg-muted"
                )} />
                <div className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  step >= 2 ? "bg-violet-500 scale-110" : "bg-muted"
                )} />
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {step}/2
              </span>
            </div>
          </div>
          <DrawerDescription className="text-sm text-muted-foreground mt-1.5">
            {getStepDescription()}
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-6 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: step === 1 ? -20 : 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: step === 1 ? 20 : -20, scale: 0.95 }}
              transition={{ 
                duration: 0.3, 
                ease: [0.4, 0.0, 0.2, 1],
                scale: { duration: 0.2 }
              }}
            >
              {step === 1 ? (
                <NewHabitStep1
                  title={title}
                  setTitle={setTitle}
                  selectedIcon={selectedIcon}
                  setSelectedIcon={setSelectedIcon}
                  whenTime={whenTime}
                  setWhenTime={setWhenTime}
                  timeOfDay={timeOfDay}
                  setTimeOfDay={setTimeOfDay}
                  whenMode={whenMode}
                  setWhenMode={setWhenMode}
                  location={location}
                  setLocation={setLocation}
                  goal={goal}
                  setGoal={setGoal}
                  unit={unit}
                  setUnit={setUnit}
                  habits={habits || []}
                  habitStack={habitStack}
                  setHabitStack={setHabitStack}
                  onApplySuggestions={applySuggestions}
                  isValidTitle={isValidTitle}
                  isValidWhen={isValidWhen}
                  isValidLocation={isValidLocation}
                  isFormValid={isFormValid}
                  onCreate={handleCreate}
                  onNextStep={handleNextStep}
                />
              ) : (
                <NewHabitStep2
                  title={title}
                  selectedIcon={selectedIcon}
                  iconOptions={ICON_OPTIONS}
                  environmentPrep={environmentPrep}
                  setEnvironmentPrep={setEnvironmentPrep}
                  temptationBundle={temptationBundle}
                  setTemptationBundle={setTemptationBundle}
                  twoMinuteVersion={twoMinuteVersion}
                  setTwoMinuteVersion={setTwoMinuteVersion}
                  reward={reward}
                  setReward={setReward}
                  onPrevStep={handlePrevStep}
                  onCreateOptimized={handleCreate}
                />
              )}
            </motion.div>
          </AnimatePresence>
            </div>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className={cn(
        "overflow-y-auto border-border/50 p-0 flex flex-col",
        "max-w-xl w-full max-h-[90vh] rounded-2xl"
      )}>
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center justify-between mb-2">
            <DialogTitle className="text-lg font-semibold leading-none">{getStepTitle()}</DialogTitle>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  step >= 1 ? "bg-violet-500 scale-110" : "bg-muted"
                )} />
                <div className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  step >= 2 ? "bg-violet-500 scale-110" : "bg-muted"
                )} />
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {step}/2
              </span>
            </div>
          </div>
          <DialogDescription className="text-sm text-muted-foreground mt-1.5">
            {getStepDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: step === 1 ? -20 : 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: step === 1 ? 20 : -20, scale: 0.95 }}
              transition={{ 
                duration: 0.3, 
                ease: [0.4, 0.0, 0.2, 1],
                scale: { duration: 0.2 }
              }}
            >
              {step === 1 ? (
                <NewHabitStep1
                  title={title}
                  setTitle={setTitle}
                  selectedIcon={selectedIcon}
                  setSelectedIcon={setSelectedIcon}
                  whenTime={whenTime}
                  setWhenTime={setWhenTime}
                  timeOfDay={timeOfDay}
                  setTimeOfDay={setTimeOfDay}
                  whenMode={whenMode}
                  setWhenMode={setWhenMode}
                  location={location}
                  setLocation={setLocation}
                  goal={goal}
                  setGoal={setGoal}
                  unit={unit}
                  setUnit={setUnit}
                  habits={habits || []}
                  habitStack={habitStack}
                  setHabitStack={setHabitStack}
                  onApplySuggestions={applySuggestions}
                  isValidTitle={isValidTitle}
                  isValidWhen={isValidWhen}
                  isValidLocation={isValidLocation}
                  isFormValid={isFormValid}
                  onCreate={handleCreate}
                  onNextStep={handleNextStep}
                />
              ) : (
                <NewHabitStep2
                  title={title}
                  selectedIcon={selectedIcon}
                  iconOptions={ICON_OPTIONS}
                  environmentPrep={environmentPrep}
                  setEnvironmentPrep={setEnvironmentPrep}
                  temptationBundle={temptationBundle}
                  setTemptationBundle={setTemptationBundle}
                  twoMinuteVersion={twoMinuteVersion}
                  setTwoMinuteVersion={setTwoMinuteVersion}
                  reward={reward}
                  setReward={setReward}
                  onPrevStep={handlePrevStep}
                  onCreateOptimized={handleCreate}
                />
              )}
            </motion.div>
          </AnimatePresence>
            </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewHabitModal;