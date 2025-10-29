import React, { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { triggerHaptic } from "@/utils/haptics";
import { HabitStackSelector } from "@/components/HabitStackSelector";

interface EditHabitModalProps {
  open: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  habitId: number;
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

const EditHabitModal = ({ open, onClose, onOpenChange, habitId }: EditHabitModalProps) => {
  const { updateHabit, data: habits } = useHabits();
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

  // Load habit data when modal opens
  useEffect(() => {
    if (open && habitId) {
      const habit = habits?.find(h => h.id === habitId);
      if (habit) {
        setTitle(habit.title || "");
        setSelectedIcon(habit.icon || ICON_OPTIONS[0].name);
        setGoal(habit.goal_target || 5);
        setUnit(habit.goal_unit || "minutos");
        setWhen(habit.when_time || "");
        setLocation(habit.where_location || "");
        
        // Parse advanced fields from temptation_bundle if available
        if (habit.temptation_bundle) {
          const bundle = habit.temptation_bundle;
          if (bundle.includes('|')) {
            const parts = bundle.split('|');
            setTemptationBundle(parts[0]?.trim() || "");
            setTwoMinuteVersion(parts[2]?.replace('2min:', '').trim() || "");
          } else {
            setTemptationBundle(bundle);
          }
        }
      }
    }
  }, [open, habitId, habits]);

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
    
    toast.success(`Sugestões aplicadas para ${suggestions.title}!`);
  };

  const handleHabitStackChange = (habitId: number | null, habit?: any) => {
    setHabitStack(habitId);
    if (habit) {
      setWhen(`Após ${habit.title}`);
    }
  };

  const handleUpdate = async () => {
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
      await updateHabit({
        id: habitId,
        data: {
          title: title.trim(),
          icon: selectedIcon,
          when_time: when.trim(),
          where_location: location.trim(),
          trigger_activity: when.trim() || null,
          temptation_bundle: temptationBundle.trim() || null,
          environment_prep: null,
          goal_target: goal,
          goal_unit: unit,
        }
      });

      toast.success("Hábito atualizado com sucesso! 🌱");
      resetForm();
      if (onOpenChange) onOpenChange(false);
      if (onClose) onClose();
    } catch (error) {
      console.error('Error updating habit:', error);
      toast.error("Erro ao atualizar hábito");
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
      {/* 1. Nome do Hábito */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Nome do Hábito <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Ex: Ler um livro"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={cn(
            "transition-all duration-200",
            !title && attempted && "border-destructive focus-visible:ring-destructive"
          )}
        />
        {!title && attempted && (
          <p className="text-xs text-destructive">
            Por favor, dê um nome ao seu hábito
          </p>
        )}
      </div>

      {/* 2. Ícone */}
      <div className="space-y-3">
        <Label>Ícone</Label>
        
        {/* Grid responsivo normal (não scroll horizontal) */}
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
          {ICON_OPTIONS.map(({ icon: Icon, name }) => {
            const active = selectedIcon === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setSelectedIcon(name);
                  triggerHaptic('light');
                }}
                aria-label={`Selecionar ícone ${name}`}
                className={cn(
                  "aspect-square rounded-xl transition-all duration-200",
                  "border-2 hover:border-violet-500 hover:scale-105",
                  "flex items-center justify-center",
                  active 
                    ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/20" 
                    : "border-border bg-card/50 hover:bg-card/80"
                )}
                aria-pressed={active}
              >
                <Icon className="w-5 h-5 text-foreground" />
              </button>
            );
          })}
        </div>
        
        {/* Botão de sugestão explícito */}
        {selectedIcon && !title && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => applySuggestions(selectedIcon)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            💡 Usar sugestão para {getDefaultTitle(selectedIcon)}
          </Button>
        )}
      </div>

      {/* 3. Quando? */}
      <div className="space-y-2">
        <Label htmlFor="when">
          Quando? <span className="text-destructive">*</span>
        </Label>
        
        {/* Campo inteligente que aceita hora OU texto */}
        <Input
          id="when"
          placeholder="Ex: Após café da manhã (ou 08:00)"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          className={cn(
            "transition-all duration-200",
            !when && attempted && "border-destructive focus-visible:ring-destructive"
          )}
        />
        
        {/* Chips de exemplo que PREENCHEM, não mudam modo */}
        <div className="flex gap-2 mt-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setWhen("08:00")}
            className="text-xs"
          >
            Manhã
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setWhen("12:00")}
            className="text-xs"
          >
            Almoço
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setWhen("20:00")}
            className="text-xs"
          >
            Noite
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setWhen("Após café da manhã")}
            className="text-xs"
          >
            Após café
          </Button>
        </div>
        
        {!when && attempted && (
          <p className="text-xs text-destructive">
            Defina quando você fará este hábito
          </p>
        )}
      </div>

      {/* 4. Onde? */}
      <div className="space-y-2">
        <Label htmlFor="location">
          Onde? <span className="text-destructive">*</span>
        </Label>
        <Input
          id="location"
          placeholder="Ex: Na sala de estar"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={cn(
            "transition-all duration-200",
            !location && attempted && "border-destructive focus-visible:ring-destructive"
          )}
        />
        {!location && attempted && (
          <p className="text-xs text-destructive">
            Defina onde você fará este hábito
          </p>
        )}
      </div>

      {/* Accordion para opções avançadas */}
      <Accordion 
        type="single" 
        collapsible
        value={isAdvancedOpen ? "advanced" : undefined}
        onValueChange={(value) => setIsAdvancedOpen(value === "advanced")}
      >
        <AccordionItem value="advanced" className="border-b-0">
          <AccordionTrigger className="text-sm hover:no-underline">
            Mais opções (opcional)
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
                habits={habits?.filter(h => h.id !== habitId) || []} 
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
    </div>
  );

  return isMobile ? (
    <Drawer open={open} onOpenChange={handleDialogChange}>
      <DrawerContent className="flex flex-col max-h-[85vh]">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle className="text-lg font-semibold leading-none">Editar Hábito</DrawerTitle>
          <DrawerDescription className="text-sm text-muted-foreground mt-1.5">
            Atualize as informações do seu hábito
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
              onClick={handleUpdate}
              className="glow-violet hover:shadow-xl"
            >
              Atualizar Hábito
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-xl w-full max-h-[90vh] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold leading-none">Editar Hábito</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1.5">
            Atualize as informações do seu hábito
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 overflow-y-auto">
          {renderEssentialFields()}
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdate}
              className="glow-violet hover:shadow-xl"
            >
              Atualizar Hábito
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditHabitModal;