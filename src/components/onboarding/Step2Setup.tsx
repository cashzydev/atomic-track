import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Input from '@/components/Input';
import { toast } from 'sonner';

const UNIT_OPTIONS = [
  { value: 'minutos', label: 'Minutos' },
  { value: 'páginas', label: 'Páginas' },
  { value: 'vezes', label: 'Vezes' },
  { value: 'km', label: 'Quilômetros' },
  { value: 'copos', label: 'Copos' },
  { value: 'horas', label: 'Horas' }
];

const ICON_MAP = {
  'read': 'BookOpen',
  'exercise': 'Dumbbell', 
  'meditate': 'Brain',
  'water': 'Droplet',
  'gratitude': 'Heart',
  'custom': 'Target'
};

const Step2Setup = () => {
  const { onboardingData, updateOnboardingData } = useApp();
  const { user, updateOnboardingStatus } = useAuth();
  const navigate = useNavigate();
  const [goal, setGoal] = React.useState(onboardingData.initialGoal || 10);
  const [unit, setUnit] = React.useState(onboardingData.goalUnit || 'minutos');
  const [when, setWhen] = React.useState(onboardingData.when || '');
  const [where, setWhere] = React.useState(onboardingData.where || '');
  const [creating, setCreating] = React.useState(false);

  const habitTitle = onboardingData.habitCustom || 
    (onboardingData.habitType === 'read' ? 'Ler' : 
     onboardingData.habitType === 'exercise' ? 'Exercitar' : 
     onboardingData.habitType === 'meditate' ? 'Meditar' : 'Hábito');

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setGoal(value);
    updateOnboardingData({ initialGoal: value });
  };

  const handleCreateHabit = async () => {
    // Validação de campos obrigatórios (consistente com o modal)
    if (!user) {
      toast.error('Usuário não encontrado');
      return;
    }
    
    if (!habitTitle.trim()) {
      toast.error('Por favor, dê um nome ao seu hábito');
      return;
    }

    if (!when || !where.trim()) {
      toast.error('Por favor, defina o horário e onde você fará este hábito');
      return;
    }

    setCreating(true);
    try {
      const { error } = await supabase.from('habits').insert({
        user_id: user.id,
        title: habitTitle.trim(),
        icon: ICON_MAP[onboardingData.habitType] || 'Target',
        when_time: when,
        where_location: where.trim(),
        goal_target: goal,
        goal_unit: unit,
        status: 'active',
        // Campos opcionais com valores padrão
        trigger_activity: when,
        temptation_bundle: null,
        environment_prep: null,
        social_reinforcement: null,
        goal_current: 0,
        two_minute_rule: null,
        current_phase: 1,
        reward_milestone: null,
        tracking_preferences: null,
        sound_enabled: true,
        vibration_enabled: true,
        streak: 0,
        longest_streak: 0,
        total_completions: 0,
        last_completed: null
      });

      if (error) throw error;

      await updateOnboardingStatus(true);
      toast.success('Primeiro hábito criado! 🎉');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating habit:', error);
      toast.error('Erro ao criar hábito. Tente novamente.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-50 mb-2">
          Configurar "{habitTitle}"
        </h2>
      </div>

      <div className="space-y-5">
        {/* Goal Slider */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Meta diária
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="2"
              max="50"
              value={goal}
              onChange={handleGoalChange}
              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
            <span className="text-2xl font-bold text-violet-400 min-w-[4rem] text-right">
              {goal} {unit}
            </span>
          </div>
          
          {/* Unit Selector */}
          <div className="mt-3">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Unidade
            </label>
            <div className="grid grid-cols-3 gap-2">
              {UNIT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setUnit(option.value);
                    updateOnboardingData({ goalUnit: option.value });
                  }}
                  className={`
                    py-2 px-3 rounded-lg border transition-all text-sm
                    ${unit === option.value
                      ? 'border-violet-500 bg-violet-500/10 text-violet-300'
                      : 'border-slate-700 bg-slate-800/30 text-slate-400 hover:border-slate-600'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* When - Horário Digitável */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Horário específico
          </label>
          <Input
            type="time"
            value={when}
            onChange={(e) => {
              setWhen(e.target.value);
              updateOnboardingData({ when: e.target.value });
            }}
            className="w-full"
            placeholder="Selecione o horário"
          />
          {when && (
            <div className="mt-2 text-sm text-violet-400 text-center">
              Hábito será lembrado às <span className="font-semibold">{when}</span>
            </div>
          )}
        </div>

        {/* Where */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Onde
          </label>
          <Input
            type="text"
            placeholder="Ex: Na sala, no quarto..."
            value={where}
            onChange={(e) => {
              setWhere(e.target.value);
              updateOnboardingData({ where: e.target.value });
            }}
          />
        </div>
      </div>

      <button
        onClick={handleCreateHabit}
        disabled={!habitTitle.trim() || !when || !where.trim() || creating}
        className={`
          w-full py-3 px-4 rounded-lg font-semibold transition-all
          ${!habitTitle.trim() || !when || !where.trim() || creating
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700'
          }
        `}
      >
        {creating ? 'Criando...' : 'Criar Hábito e Começar 🎯'}
      </button>
    </div>
  );
};

export default Step2Setup;
