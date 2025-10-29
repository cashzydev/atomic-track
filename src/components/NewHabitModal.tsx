import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription, DrawerHeader, DrawerFooter } from "@/components/ui/drawer";
import { 
  X, BookOpen, Dumbbell, Brain, Heart, Droplet, Utensils, Moon, Sun, 
  Target, Zap, Award, Sparkles, Trophy, HelpCircle, CheckCircle2, 
  Lightbulb, ChevronDown, Rocket, Wand2, Loader2
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { triggerHaptic } from "@/utils/haptics";
import { HabitStackSelector } from "@/components/HabitStackSelector";

interface NewHabitModalProps {
  open: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
}

const ICON_OPTIONS = [
  { icon: BookOpen, name: 'BookOpen', color: 'from-blue-500 to-cyan-500' },
  { icon: Dumbbell, name: 'Dumbbell', color: 'from-orange-500 to-red-500' },
  { icon: Brain, name: 'Brain', color: 'from-purple-500 to-pink-500' },
  { icon: Heart, name: 'Heart', color: 'from-pink-500 to-rose-500' },
  { icon: Droplet, name: 'Droplet', color: 'from-blue-400 to-cyan-400' },
  { icon: Utensils, name: 'Utensils', color: 'from-amber-500 to-orange-500' },
  { icon: Moon, name: 'Moon', color: 'from-indigo-500 to-purple-500' },
  { icon: Sun, name: 'Sun', color: 'from-yellow-500 to-orange-500' },
  { icon: Target, name: 'Target', color: 'from-violet-500 to-purple-500' },
  { icon: Zap, name: 'Zap', color: 'from-yellow-400 to-amber-500' },
  { icon: Award, name: 'Award', color: 'from-emerald-500 to-teal-500' },
];

const UNIT_OPTIONS = ['minutos', 'páginas', 'vezes', 'km', 'copos', 'horas'];

const HABIT_SUGGESTIONS: Record<string, { title: string; when: string; where: string; goal: string; unit: string; twoMin: string }> = {
  BookOpen: { title: "Leitura", when: "Após o café da manhã", where: "Poltrona de leitura", goal: "10", unit: "páginas", twoMin: "Ler 1 página" },
  Dumbbell: { title: "Exercício", when: "Ao acordar", where: "Quarto", goal: "20", unit: "flexões", twoMin: "Fazer 5 flexões" },
  Brain: { title: "Meditação", when: "Antes de dormir", where: "Cama", goal: "5", unit: "minutos", twoMin: "Respirar fundo 3 vezes" },
  Droplet: { title: "Hidratação", when: "Ao acordar", where: "Cozinha", goal: "2", unit: "copos", twoMin: "Beber 1 copo" },
  Utensils: { title: "Alimentação", when: "Durante o almoço", where: "Cozinha", goal: "1", unit: "refeição", twoMin: "Comer 1 fruta" },
  Moon: { title: "Sono", when: "Às 22:00", where: "Quarto", goal: "8", unit: "horas", twoMin: "Deitar na cama" },
  Sun: { title: "Rotina", when: "Ao acordar", where: "Casa", goal: "30", unit: "minutos", twoMin: "Levantar da cama" },
  Target: { title: "Meta", when: "Após café da manhã", where: "Escritório", goal: "1", unit: "tarefa", twoMin: "Abrir o planner" },
  Zap: { title: "Energia", when: "Ao acordar", where: "Quarto", goal: "10", unit: "minutos", twoMin: "Alongar 2 minutos" },
  Award: { title: "Conquista", when: "Após trabalho", where: "Casa", goal: "1", unit: "atividade", twoMin: "Celebrar pequena vitória" },
  default: { title: "Hábito", when: "Após café da manhã", where: "Em casa", goal: "10", unit: "minutos", twoMin: "Fazer por 2 minutos" }
};

const NewHabitModal = ({ open, onClose, onOpenChange }: NewHabitModalProps) => {
  const { createHabit, isCreating, data: habits } = useHabits();
  const isMobile = useIsMobile();
  
  // Form data - Essential fields (always visible)
  const [title, setTitle] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0].name);
  const [when, setWhen] = useState("");
  const [location, setLocation] = useState("");
  
  // Advanced options (in accordion)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [goal, setGoal] = useState(5);
  const [unit, setUnit] = useState("minutos");
  const [habitStack, setHabitStack] = useState<number | null>(null);
  const [temptationBundle, setTemptationBundle] = useState("");
  const [twoMinuteVersion, setTwoMinuteVersion] = useState("");
  
  // Validation state
  const [attempted, setAttempted] = useState(false);

  // Calcular progresso do formulário
  const formProgress = () => {
    let completed = 0;
    if (title.trim()) completed++;
    if (when.trim()) completed++;
    if (location.trim()) completed++;
    if (selectedIcon) completed++;
    return Math.round((completed / 4) * 100);
  };

  const resetForm = () => {
    setTitle("");
    setSelectedIcon(ICON_OPTIONS[0].name);
    setWhen("");
    setLocation("");
    setGoal(5);
    setUnit("minutos");
    setHabitStack(null);
    setTemptationBundle("");
    setTwoMinuteVersion("");
    setIsAdvancedOpen(false);
    setAttempted(false);
  };

  const getDefaultTitle = (iconName: string) => {
    return HABIT_SUGGESTIONS[iconName]?.title || HABIT_SUGGESTIONS.default.title;
  };

  const applySuggestions = (iconName: string) => {
    const suggestions = HABIT_SUGGESTIONS[iconName] || HABIT_SUGGESTIONS.default;
    
    if (!title) setTitle(suggestions.title);
    if (!when) setWhen(suggestions.when);
    if (!location) setLocation(suggestions.where);
    if (!twoMinuteVersion) setTwoMinuteVersion(suggestions.twoMin);
    
    toast.success(`Sugestões aplicadas para ${suggestions.title}! ✨`);
    triggerHaptic('success');
  };

  const handleHabitStackChange = (habitId: number | null, habit?: any) => {
    setHabitStack(habitId);
    if (habit) {
      setWhen(`Após ${habit.title}`);
    }
  };

  const handleCreate = async () => {
    setAttempted(true);
    
    if (!title.trim()) {
      toast.error("Por favor, dê um nome ao seu hábito");
      document.getElementById('title')?.focus();
      return;
    }

    if (!when.trim()) {
      toast.error("Defina quando você fará este hábito");
      document.getElementById('when')?.focus();
      return;
    }

    if (!location.trim()) {
      toast.error("Defina onde você fará este hábito");
      document.getElementById('location')?.focus();
      return;
    }

    try {
      await createHabit({
        title: title.trim(),
        icon: selectedIcon,
        when_time: when.trim(),
        where_location: location.trim(),
        trigger_activity: when.trim() || null,
        temptation_bundle: temptationBundle.trim() || null,
        environment_prep: null,
        goal_target: goal,
        goal_unit: unit,
      });

      toast.success("Hábito criado com sucesso! 🌱");
      triggerHaptic('success');
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

  const renderEssentialFields = () => (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">Progresso</span>
          <span className="text-violet-400 font-bold">{formProgress()}%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${formProgress()}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
          />
        </div>
      </motion.div>

      {/* 1. Nome do Hábito */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <Label htmlFor="title" className="flex items-center gap-2">
          <span>Nome do Hábito</span>
          <span className="text-destructive">*</span>
          {title.trim() && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-emerald-400"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </motion.span>
          )}
        </Label>
        <div className="relative group">
        <Input
          id="title"
          placeholder="Ex: Ler um livro"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={cn(
              "transition-all duration-300",
              !title && attempted && "border-destructive focus-visible:ring-destructive",
              title.trim() && "border-emerald-500/30 focus:border-emerald-500 focus:ring-emerald-500/20",
              "focus:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
            )}
          />
          {title.trim() && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              </div>
            </motion.div>
          )}
        </div>
        <AnimatePresence>
        {!title && attempted && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-destructive flex items-center gap-1"
            >
              <X className="w-3 h-3" />
            Por favor, dê um nome ao seu hábito
            </motion.p>
        )}
        </AnimatePresence>
      </motion.div>

      {/* 2. Ícone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <Label className="flex items-center gap-2">
          <span>Ícone</span>
          <span className="text-xs text-muted-foreground">(selecione um)</span>
        </Label>
        
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
          {ICON_OPTIONS.map(({ icon: Icon, name, color }, index) => {
            const active = selectedIcon === name;
            return (
              <motion.button
                key={name}
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.02 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedIcon(name);
                  triggerHaptic('light');
                }}
                aria-label={`Selecionar ícone ${name}`}
                className={cn(
                  "aspect-square rounded-xl transition-all duration-300 relative overflow-hidden",
                  "border-2 flex items-center justify-center",
                  active 
                    ? `border-violet-500 bg-gradient-to-br ${color} shadow-lg shadow-violet-500/30` 
                    : "border-border bg-card/50 hover:bg-card/80 hover:border-violet-500/50"
                )}
                aria-pressed={active}
              >
                {active && (
                  <motion.div
                    layoutId="selectedIcon"
                    className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon className={cn(
                  "w-5 h-5 relative z-10 transition-all duration-300",
                  active ? "text-white scale-110" : "text-foreground"
                )} />
                {active && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 text-white" fill="white" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
        
        {/* Botão de sugestão melhorado */}
        {selectedIcon && !title && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => applySuggestions(selectedIcon)}
              className="text-xs text-muted-foreground hover:text-foreground group relative overflow-hidden"
            >
              <Wand2 className="w-3 h-3 mr-1.5 group-hover:rotate-12 transition-transform" />
              Usar sugestão para {getDefaultTitle(selectedIcon)}
              <motion.div
                className="absolute inset-0 bg-violet-500/10"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.5 }}
              />
          </Button>
          </motion.div>
        )}
      </motion.div>

      {/* 3. Quando? */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <Label htmlFor="when" className="flex items-center gap-2">
          <span>Quando?</span>
          <span className="text-destructive">*</span>
          {when.trim() && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-emerald-400"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </motion.span>
          )}
        </Label>
        
        <div className="relative">
        <Input
          id="when"
          placeholder="Ex: Após café da manhã (ou 08:00)"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          className={cn(
              "transition-all duration-300",
              !when && attempted && "border-destructive focus-visible:ring-destructive",
              when.trim() && "border-emerald-500/30 focus:border-emerald-500 focus:ring-emerald-500/20",
              "focus:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
            )}
          />
          {when.trim() && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Chips melhorados */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-2 mt-2 flex-wrap"
        >
          {[
            { label: "Manhã", value: "08:00" },
            { label: "Almoço", value: "12:00" },
            { label: "Noite", value: "20:00" },
            { label: "Após café", value: "Após café da manhã" }
          ].map((chip, index) => (
            <motion.button
              key={chip.label}
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setWhen(chip.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-violet-500/50 hover:bg-violet-500/5 transition-all bg-background"
            >
              {chip.label}
            </motion.button>
          ))}
        </motion.div>
        
        <AnimatePresence>
        {!when && attempted && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-destructive flex items-center gap-1"
            >
              <X className="w-3 h-3" />
            Defina quando você fará este hábito
            </motion.p>
        )}
        </AnimatePresence>
      </motion.div>

      {/* 4. Onde? */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-2"
      >
        <Label htmlFor="location" className="flex items-center gap-2">
          <span>Onde?</span>
          <span className="text-destructive">*</span>
          {location.trim() && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-emerald-400"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </motion.span>
          )}
        </Label>
        <div className="relative">
        <Input
          id="location"
          placeholder="Ex: Na sala de estar"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={cn(
              "transition-all duration-300",
              !location && attempted && "border-destructive focus-visible:ring-destructive",
              location.trim() && "border-emerald-500/30 focus:border-emerald-500 focus:ring-emerald-500/20",
              "focus:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
            )}
          />
          {location.trim() && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              </div>
            </motion.div>
          )}
        </div>
        <AnimatePresence>
        {!location && attempted && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-destructive flex items-center gap-1"
            >
              <X className="w-3 h-3" />
            Defina onde você fará este hábito
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Accordion para opções avançadas melhorado */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
      <Accordion 
        type="single" 
        collapsible
        value={isAdvancedOpen ? "advanced" : undefined}
        onValueChange={(value) => setIsAdvancedOpen(value === "advanced")}
      >
        <AccordionItem value="advanced" className="border-b-0">
            <AccordionTrigger className="text-sm hover:no-underline group">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400 group-hover:rotate-12 transition-transform" />
                <span>Mais opções (opcional)</span>
              </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            
            {/* Meta diária */}
            <div className="space-y-2">
              <Label>Meta diária</Label>
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  value={goal} 
                  onChange={(e) => setGoal(parseInt(e.target.value) || 1)}
                  className="w-20" 
                  min={1}
                />
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_OPTIONS.map(u => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Empilhar após outro hábito */}
            <div className="space-y-2">
              <Label>Empilhar após outro hábito</Label>
              <HabitStackSelector 
                habits={habits || []} 
                value={habitStack}
                onChange={handleHabitStackChange}
              />
            </div>

            {/* Recompensa ao completar */}
            <div className="space-y-2">
              <Label>Recompensa ao completar</Label>
              <Input 
                placeholder="Ex: Tomar um café especial"
                value={temptationBundle}
                onChange={(e) => setTemptationBundle(e.target.value)}
              />
            </div>

            {/* Versão de 2 minutos */}
            <div className="space-y-2">
              <Label>Versão de 2 minutos</Label>
              <Input 
                placeholder="Ex: Ler apenas 1 página"
                value={twoMinuteVersion}
                onChange={(e) => setTwoMinuteVersion(e.target.value)}
              />
            </div>

          </AccordionContent>
        </AccordionItem>
      </Accordion>
      </motion.div>
    </div>
  );

  return isMobile ? (
    <Drawer open={open} onOpenChange={handleDialogChange}>
      <DrawerContent className="flex flex-col max-h-[85vh]">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle className="text-lg font-semibold leading-none">Novo Hábito</DrawerTitle>
          <DrawerDescription className="text-sm text-muted-foreground mt-1.5">
            Crie seu hábito em menos de 30 segundos
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto px-6">
          {renderEssentialFields()}
        </div>
        
        <DrawerFooter className="flex-shrink-0 border-t sticky bottom-0 bg-background">
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={isCreating}
              className="glow-violet hover:shadow-xl"
            >
              {isCreating ? "Criando..." : "Criar Hábito"}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-xl w-full max-h-[90vh] rounded-2xl !flex !flex-col !p-0 !gap-0 bg-gradient-to-br from-slate-950/95 to-slate-900/95 backdrop-blur-xl">
        {/* Header melhorado com gradiente */}
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent" />
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center border border-violet-500/30">
                <Rocket className="w-5 h-5 text-violet-400" />
              </div>
              <DialogTitle className="text-xl font-bold leading-none bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                Novo Hábito
              </DialogTitle>
            </motion.div>
            <DialogDescription className="text-sm text-muted-foreground/80 mt-1.5">
              Crie seu hábito em menos de 30 segundos ✨
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 overflow-y-auto flex-1 min-h-0">
          {renderEssentialFields()}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border/30 flex-shrink-0 mt-auto bg-gradient-to-t from-slate-950/50 to-transparent">
          <div className="flex justify-between w-full">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={handleCreate}
                disabled={isCreating || formProgress() < 100}
                className={cn(
                  "relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600",
                  "hover:from-violet-500 hover:via-purple-500 hover:to-violet-500",
                  "text-white shadow-[0_4px_20px_rgba(139,92,246,0.4)]",
                  "hover:shadow-[0_6px_25px_rgba(139,92,246,0.5)]",
                  "border-0 disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all duration-300"
                )}
              >
                {/* Efeito de brilho animado */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ["-100%", "100%"]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                />
                <span className="relative flex items-center gap-2">
                  {isCreating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="w-4 h-4" />
                      </motion.div>
                      Criando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Criar Hábito
                    </>
                  )}
                </span>
              </Button>
            </motion.div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewHabitModal;