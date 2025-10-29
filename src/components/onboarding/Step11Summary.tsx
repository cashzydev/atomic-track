import React, { useEffect } from "react";
import { BookOpen, Dumbbell, Droplet, Brain, Heart } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Habit, User } from "@/types/habit";

import { IconName } from "@/config/icon-map";

const habitIcons: Record<string, IconName> = {
  read: "read",
  exercise: "exercise",
  water: "hydration",
  meditate: "meditation",
  gratitude: "health"
};

const Step11Summary = () => {
  const { onboardingData, addHabit, setUser } = useApp();

  useEffect(() => {
    createHabitFromOnboarding();
  }, []);

  const createHabitFromOnboarding = () => {

    const habitTitles: Record<string, string> = {
      read: "Ler páginas",
      exercise: "Exercitar",
      water: "Beber água",
      meditate: "Meditar",
      gratitude: "Praticar gratidão"
    };

    const habitUnits: Record<string, string> = {
      read: "páginas",
      exercise: "minutos",
      water: "copos",
      meditate: "minutos",
      gratitude: "itens"
    };

    const habitType = onboardingData.habitType || "read";
    const habitTitle = habitType === "custom" 
      ? onboardingData.habitCustom || "Hábito personalizado"
      : habitTitles[habitType];
    
    const initialGoal = onboardingData.initialGoal || 5;
    const recommendedStart = onboardingData.acceptedRecommendation 
      ? initialGoal 
      : Math.max(Math.floor(initialGoal / 3), 2);

    const newHabit: Habit = {
      id: 1,
      user_id: '',
      title: habitTitle,
      icon: habitType === "custom" ? "focus" : habitIcons[habitType],
      when_time: getWhenLabel(),
      where_location: onboardingData.where || "",
      trigger_activity: onboardingData.triggerActivity || "",
      temptation_bundle: onboardingData.temptationBundle,
      environment_prep: onboardingData.environmentPrep,
      social_reinforcement: onboardingData.socialReinforcement,
      goal_current: 0,
      goal_target: recommendedStart,
      goal_unit: habitType === "custom" ? "vezes" : habitUnits[habitType],
      two_minute_rule: null,
      current_phase: 1,
      reward_milestone: null,
      tracking_preferences: null,
      sound_enabled: false,
      vibration_enabled: false,
      streak: 0,
      longest_streak: 0,
      total_completions: 0,
      status: "pending",
      last_completed: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    addHabit(newHabit);

    const newUser: User = {
      name: onboardingData.name || "Usuário",
      desiredIdentity: onboardingData.desiredIdentity || "",
      specificChange: onboardingData.specificChange || "",
      pastAttempts: onboardingData.pastAttempts || "",
      whatWorked: onboardingData.whatWorked || "",
      whatDidntWork: onboardingData.whatDidntWork || "",
      morningRoutine: onboardingData.typicalMorning || "",
      workStart: onboardingData.workStart || "",
      availableTime: "",
      obstacles: [],
      createdAt: new Date().toISOString(),
      points: 0,
      longestStreak: 0
    };

    setUser(newUser);
  };

  const getWhenLabel = () => {
    const whenMap: Record<string, string> = {
      "morning": "Ao acordar",
      "after-coffee": "Após café da manhã",
      "afternoon": "À tarde",
      "evening": "Antes de dormir",
      "custom": onboardingData.customTime || "Horário personalizado"
    };
    return whenMap[onboardingData.when || "morning"] || "Quando definido";
  };

  const getIcon = () => {
    const habitType = onboardingData.habitType || "read";
    const icons: Record<string, React.ComponentType<any>> = {
      read: BookOpen,
      exercise: Dumbbell,
      water: Droplet,
      meditate: Brain,
      gratitude: Heart
    };
    return icons[habitType] || BookOpen;
  };

  const Icon = getIcon();
  const habitTitle = onboardingData.habitType === "custom"
    ? onboardingData.habitCustom
    : onboardingData.habitType === "read" ? "Ler páginas" 
    : onboardingData.habitType === "exercise" ? "Exercitar"
    : onboardingData.habitType === "water" ? "Beber água"
    : onboardingData.habitType === "meditate" ? "Meditar"
    : "Praticar gratidão";

  const recommendedStart = onboardingData.acceptedRecommendation
    ? onboardingData.initialGoal
    : Math.max(Math.floor((onboardingData.initialGoal || 5) / 3), 2);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-slate-50 flex items-center justify-center gap-3">
          Seu primeiro hábito atômico
          <span className="text-4xl animate-float">
            ⚛️
          </span>
        </h2>
        <h3 className="text-2xl font-bold gradient-text">
          está pronto! 🎯
        </h3>
      </div>

      <div className="glass-violet border-2 border-violet-500/50 rounded-3xl p-8 space-y-6 shadow-2xl shadow-violet-900/50">
        {/* Habit Icon & Title */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/50">
            <Icon 
              name={onboardingData.habitType === "custom" ? "focus" : habitIcons[onboardingData.habitType as keyof typeof habitIcons]} 
              className="w-8 h-8 text-white"
              size={32}
            />
          </div>
          <h3 className="text-3xl font-bold text-slate-50">{habitTitle}</h3>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

        {/* 4 Laws Summary */}
        <div className="space-y-4 text-slate-200">
          <div className="flex items-start gap-3">
            <span className="text-xl">🎯</span>
            <div>
              <span className="font-semibold text-violet-400">Meta: </span>
              {recommendedStart} (dias 1-3) → {Math.ceil(recommendedStart * 1.5)} → {onboardingData.initialGoal}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl">⏰</span>
            <div>
              <span className="font-semibold text-violet-400">Quando: </span>
              {getWhenLabel()}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl">📍</span>
            <div>
              <span className="font-semibold text-violet-400">Onde: </span>
              {onboardingData.where}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl">⚡</span>
            <div>
              <span className="font-semibold text-violet-400">Gatilho: </span>
              Após {onboardingData.triggerActivity}
            </div>
          </div>

          {onboardingData.temptationBundle && (
            <div className="flex items-start gap-3">
              <span className="text-xl">✨</span>
              <div>
                <span className="font-semibold text-violet-400">Recompensa: </span>
                {onboardingData.temptationBundle}
              </div>
            </div>
          )}

          {onboardingData.realReward && (
            <div className="flex items-start gap-3">
              <span className="text-xl">🎁</span>
              <div>
                <span className="font-semibold text-violet-400">Marco 7 dias: </span>
                {onboardingData.realReward}
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <span className="text-xl">🔥</span>
            <div>
              <span className="font-semibold text-violet-400">Streak: </span>
              0 dias → Vamos começar!
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Quotes */}
      <div className="space-y-4">
        <div className="glass border-l-4 border-violet-500 rounded-lg p-4 text-center">
          <p className="text-lg text-slate-200 font-semibold">
            💭 "1% melhor todo dia = 37x melhor em um ano"
          </p>
        </div>

        <div className="glass border-l-4 border-violet-500 rounded-lg p-4 text-center">
          <p className="text-lg text-slate-200 font-semibold">
            🌱 "Hábitos atômicos: pequenos, impacto gigante"
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step11Summary;
