-- Fix Level System Consistency
-- This migration updates the level system to match the frontend values

-- 1. Update the level calculation function to match frontend
CREATE OR REPLACE FUNCTION public.update_level_from_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.level = CASE 
    WHEN NEW.xp >= 20000 THEN 10
    WHEN NEW.xp >= 10000 THEN 9
    WHEN NEW.xp >= 6000 THEN 8
    WHEN NEW.xp >= 3500 THEN 7
    WHEN NEW.xp >= 2000 THEN 6
    WHEN NEW.xp >= 1000 THEN 5
    WHEN NEW.xp >= 500 THEN 4
    WHEN NEW.xp >= 250 THEN 3
    WHEN NEW.xp >= 100 THEN 2
    ELSE 1
  END;
  RETURN NEW;
END;
$function$;

-- 2. Update the XP calculation function to use consistent values
CREATE OR REPLACE FUNCTION public.get_habit_completion_xp(
  p_user_id uuid,
  p_habit_id bigint,
  p_date date
)
RETURNS TABLE(total_xp integer, reasons text[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  base_xp INT := 25;           -- XP base por hábito
  first_habit_bonus INT := 15; -- Bônus primeiro hábito do dia
  all_habits_bonus INT := 50;  -- Bônus completar todos os hábitos
  streak_bonus INT := 10;      -- Bônus por streak
  
  v_total_xp INT := 0;
  v_reasons TEXT[] := ARRAY[]::TEXT[];
  v_today_completions INT;
  v_active_habits_count INT;
  v_current_streak INT;
BEGIN
  -- Log de debug
  RAISE NOTICE 'Calculando XP: user=% habit=% date=%', p_user_id, p_habit_id, p_date;
  
  -- XP base
  v_total_xp := base_xp;
  v_reasons := array_append(v_reasons, 'Hábito completado (+25 XP)');
  
  -- Verificar se é primeiro hábito do dia
  SELECT COUNT(*) INTO v_today_completions
  FROM habit_completions
  WHERE user_id = p_user_id 
    AND date = p_date 
    AND percentage >= 100;
  
  IF v_today_completions = 1 THEN
    v_total_xp := v_total_xp + first_habit_bonus;
    v_reasons := array_append(v_reasons, 'Primeiro hábito do dia! 🌅 (+15 XP)');
  END IF;
  
  -- Verificar se completou todos os hábitos do dia
  SELECT COUNT(*) INTO v_active_habits_count
  FROM habits
  WHERE user_id = p_user_id AND status = 'active';
  
  IF v_today_completions >= v_active_habits_count AND v_active_habits_count > 0 THEN
    v_total_xp := v_total_xp + all_habits_bonus;
    v_reasons := array_append(v_reasons, 'Todos os hábitos completados! 🎯 (+50 XP)');
  END IF;
  
  -- Verificar streak e aplicar bônus
  SELECT streak INTO v_current_streak
  FROM habits
  WHERE id = p_habit_id;
  
  IF v_current_streak = 7 THEN
    v_total_xp := v_total_xp + streak_bonus;
    v_reasons := array_append(v_reasons, '7 dias de sequência! 🔥 (+10 XP)');
  ELSIF v_current_streak = 30 THEN
    v_total_xp := v_total_xp + (streak_bonus * 2);
    v_reasons := array_append(v_reasons, '30 dias de sequência! 🔥🔥 (+20 XP)');
  ELSIF v_current_streak = 90 THEN
    v_total_xp := v_total_xp + (streak_bonus * 3);
    v_reasons := array_append(v_reasons, '90 dias de sequência! 🔥🔥🔥 (+30 XP)');
  END IF;
  
  RETURN QUERY SELECT v_total_xp, v_reasons;
END;
$function$;

-- 3. Update existing profiles to use new level calculation
UPDATE public.profiles SET level = 
  CASE 
    WHEN xp >= 20000 THEN 10
    WHEN xp >= 10000 THEN 9
    WHEN xp >= 6000 THEN 8
    WHEN xp >= 3500 THEN 7
    WHEN xp >= 2000 THEN 6
    WHEN xp >= 1000 THEN 5
    WHEN xp >= 500 THEN 4
    WHEN xp >= 250 THEN 3
    WHEN xp >= 100 THEN 2
    ELSE 1
  END;

-- 4. Create function to get user XP earned today (for dashboard)
CREATE OR REPLACE FUNCTION public.get_user_xp_earned_today(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  total_xp_today INTEGER := 0;
  completion_record RECORD;
BEGIN
  -- Sum XP from all habit completions today
  FOR completion_record IN
    SELECT hc.habit_id, hc.date
    FROM habit_completions hc
    WHERE hc.user_id = p_user_id 
      AND hc.date = CURRENT_DATE 
      AND hc.percentage >= 100
  LOOP
    SELECT total_xp INTO total_xp_today
    FROM get_habit_completion_xp(p_user_id, completion_record.habit_id, completion_record.date);
    
    total_xp_today := total_xp_today + COALESCE(total_xp_today, 0);
  END LOOP;
  
  RETURN COALESCE(total_xp_today, 0);
END;
$function$;
