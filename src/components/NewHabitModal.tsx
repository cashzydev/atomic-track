import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { X, BookOpen, Dumbbell, Brain, Heart, Droplet, Utensils, Moon, Sun, Target, Zap, Award } from "lucide-react";
import { useHabits } from "@/hooks/useHabits";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const NewHabitModal = ({ open, onClose, onOpenChange }: NewHabitModalProps) => {
  const { createHabit, isCreating, data: habits } = useHabits();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("1");
  const [maxTabReached, setMaxTabReached] = useState(1);
  
  // Form data
  const [title, setTitle] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0].name);
  const [goal, setGoal] = useState(5);
  const [unit, setUnit] = useState("minutos");
  const [whenTime, setWhenTime] = useState("");
  const [location, setLocation] = useState("");
  const [habitStack, setHabitStack] = useState<number | null>(null);
  const [motivation, setMotivation] = useState("");
  const [temptationBundle, setTemptationBundle] = useState("");
  const [twoMinuteVersion, setTwoMinuteVersion] = useState("");
  const [environmentPrep, setEnvironmentPrep] = useState("");
  const [reward, setReward] = useState("");

  const resetForm = () => {
    setTitle("");
    setSelectedIcon(ICON_OPTIONS[0].name);
    setGoal(5);
    setUnit("minutos");
    setWhenTime("");
    setLocation("");
    setHabitStack(null);
    setMotivation("");
    setTemptationBundle("");
    setTwoMinuteVersion("");
    setEnvironmentPrep("");
    setReward("");
    setActiveTab("1");
    setMaxTabReached(1);
  };

  const handleNext = () => {
    const currentTabNum = parseInt(activeTab);
    
    // Validação básica antes de avançar
    if (currentTabNum === 1 && !title.trim()) {
      toast.error("Por favor, dê um nome ao seu hábito");
      return;
    }

    if (currentTabNum < 4) {
      const nextTab = (currentTabNum + 1).toString();
      setActiveTab(nextTab);
      setMaxTabReached(Math.max(maxTabReached, currentTabNum + 1));
    }
  };

  const handleBack = () => {
    const currentTabNum = parseInt(activeTab);
    if (currentTabNum > 1) {
      setActiveTab((currentTabNum - 1).toString());
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

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Por favor, dê um nome ao seu hábito");
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
    if (onOpenChange) onOpenChange(open);
    if (!open && onClose) onClose();
  };

  const Container = isMobile ? Drawer : Dialog;
  const Content = isMobile ? DrawerContent : DialogContent;

  return (
    <Container open={open} onOpenChange={handleDialogChange}>
      <Content className={cn(
        "overflow-hidden border-border/50 p-0 flex flex-col",
        isMobile 
          ? "h-[95vh] rounded-t-3xl" 
          : "max-w-3xl w-full max-h-[90vh] rounded-2xl"
      )}>
        {/* Accessibility components */}
        {isMobile ? (
          <>
            <DrawerTitle className="sr-only">Novo Hábito</DrawerTitle>
            <DrawerDescription className="sr-only">
              Crie um novo hábito seguindo os 4 passos baseados nas Leis dos Hábitos Atômicos
            </DrawerDescription>
          </>
        ) : (
          <>
            <DialogTitle className="sr-only">Novo Hábito</DialogTitle>
            <DialogDescription className="sr-only">
              Crie um novo hábito seguindo os 4 passos baseados nas Leis dos Hábitos Atômicos
            </DialogDescription>
          </>
        )}
        
        {/* Header */}
        <div className="border-b border-border/50 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Novo Hábito</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { 
                resetForm(); 
                if (onOpenChange) onOpenChange(false);
                if (onClose) onClose();
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <Tabs value={activeTab} className="mt-3">
            <TabsList className="w-full justify-start border-none bg-transparent gap-2 p-0">
              <TabsTrigger 
                value="1" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                onClick={() => maxTabReached >= 1 && setActiveTab("1")}
              >
                Óbvio
              </TabsTrigger>
              <TabsTrigger 
                value="2" 
                disabled={maxTabReached < 2}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => maxTabReached >= 2 && setActiveTab("2")}
              >
                Atraente
              </TabsTrigger>
              <TabsTrigger 
                value="3" 
                disabled={maxTabReached < 3}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => maxTabReached >= 3 && setActiveTab("3")}
              >
                Fácil
              </TabsTrigger>
              <TabsTrigger 
                value="4" 
                disabled={maxTabReached < 4}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => maxTabReached >= 4 && setActiveTab("4")}
              >
                Recompensa
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1 min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Tab 1: Óbvio */}
            <TabsContent value="1" className="space-y-4 mt-0">
              <div>
                <Label className="text-sm font-medium">Nome do Hábito</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Ler, Meditar, Exercitar..."
                  className="mt-1.5"
                  autoFocus
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Ícone</Label>
                <div className="grid grid-cols-6 gap-2 mt-1.5">
                  {ICON_OPTIONS.map(({ icon: Icon, name }) => (
                    <button
                      key={name}
                      onClick={() => {
                        setSelectedIcon(name);
                        triggerHaptic('light');
                      }}
                      className={cn(
                        "p-2 rounded-lg border transition-colors",
                        selectedIcon === name 
                          ? "border-primary bg-primary/10" 
                          : "border-input hover:border-muted-foreground/50"
                      )}
                    >
                      <Icon className="w-5 h-5 mx-auto" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Quando? (Opcional)</Label>
                <Input
                  value={whenTime}
                  onChange={(e) => setWhenTime(e.target.value)}
                  placeholder="Ex: 7h, após café, manhã..."
                  className="mt-1.5"
                  type="time"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Onde? (Opcional)</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Quarto, Escritório..."
                  className="mt-1.5"
                />
              </div>

              {habits && habits.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Empilhar após outro hábito?</Label>
                  <div className="mt-1.5">
                    <HabitStackSelector
                      habits={habits}
                      value={habitStack}
                      onChange={handleHabitStackChange}
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab 2: Atraente */}
            <TabsContent value="2" className="space-y-4 mt-0">
              <div>
                <Label className="text-sm font-medium">Por que este hábito é importante?</Label>
                <Textarea
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="Ex: Quero melhorar minha mente..."
                  className="mt-1.5 min-h-[80px]"
                  maxLength={200}
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Tornar mais atraente (Opcional)</Label>
                <Input
                  value={temptationBundle}
                  onChange={(e) => setTemptationBundle(e.target.value)}
                  placeholder="Ex: ouvir música, tomar café especial..."
                  className="mt-1.5"
                />
              </div>
            </TabsContent>

            {/* Tab 3: Fácil */}
            <TabsContent value="3" className="space-y-4 mt-0">
              <div>
                <Label className="text-sm font-medium">Meta</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    type="number"
                    value={goal}
                    onChange={(e) => setGoal(Number(e.target.value))}
                    min={1}
                    className="flex-1"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="px-3 rounded-md border border-input bg-background"
                  >
                    {UNIT_OPTIONS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Versão de 2 minutos (Opcional)</Label>
                <Input
                  value={twoMinuteVersion}
                  onChange={(e) => setTwoMinuteVersion(e.target.value)}
                  placeholder="Ex: Ler 1 página, meditar 2 min..."
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Preparar ambiente (Opcional)</Label>
                <Input
                  value={environmentPrep}
                  onChange={(e) => setEnvironmentPrep(e.target.value)}
                  placeholder="Ex: Deixar livro na mesa..."
                  className="mt-1.5"
                />
              </div>
            </TabsContent>

            {/* Tab 4: Recompensa */}
            <TabsContent value="4" className="space-y-4 mt-0">
              <div>
                <Label className="text-sm font-medium">Recompensa imediata (Opcional)</Label>
                <Input
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  placeholder="Ex: Marcar X no calendário..."
                  className="mt-1.5"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="border-t border-border/50 p-4 flex justify-between shrink-0 bg-background">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                resetForm();
                if (onOpenChange) onOpenChange(false);
                if (onClose) onClose();
              }}
            >
              Cancelar
            </Button>
            {parseInt(activeTab) > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
              >
                Voltar
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {parseInt(activeTab) < 4 ? (
              <Button 
                onClick={handleNext}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Avançar →
              </Button>
            ) : (
              <Button
                onClick={handleCreate}
                disabled={isCreating || !title.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
              >
                {isCreating ? "Criando..." : "Criar Hábito"}
              </Button>
            )}
          </div>
        </div>
      </Content>
    </Container>
  );
};

export default NewHabitModal;
