-- ============================================
-- ATOMICTRACK DATABASE SCHEMA
-- ============================================

-- 1. PROFILES TABLE
-- Armazena informações do perfil do usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  desired_identity TEXT,
  specific_change TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies para profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. HABITS TABLE
-- Armazena os hábitos criados pelos usuários
CREATE TABLE public.habits (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '⚛️',
  
  -- Law #1: Make it Obvious
  when_time TEXT NOT NULL,
  where_location TEXT NOT NULL,
  trigger_activity TEXT,
  
  -- Law #2: Make it Attractive
  temptation_bundle TEXT,
  environment_prep TEXT,
  social_reinforcement TEXT,
  
  -- Law #3: Make it Easy
  goal_current INTEGER NOT NULL DEFAULT 0,
  goal_target INTEGER NOT NULL,
  goal_unit TEXT NOT NULL DEFAULT 'minutos',
  two_minute_rule JSONB, -- {phase1: {days: 3, target: 3}, phase2: {...}, phase3: {...}}
  current_phase INTEGER NOT NULL DEFAULT 1,
  
  -- Law #4: Make it Satisfying
  reward_milestone JSONB, -- {days: 7, reward: "texto"}
  tracking_preferences JSONB, -- {graphs: true, streaks: true, badges: true, heatmap: true}
  sound_enabled BOOLEAN DEFAULT false,
  vibration_enabled BOOLEAN DEFAULT false,
  
  -- Progress tracking
  streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_completions INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  last_completed TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

-- RLS Policies para habits
CREATE POLICY "Users can view their own habits"
  ON public.habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habits"
  ON public.habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
  ON public.habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
  ON public.habits FOR DELETE
  USING (auth.uid() = user_id);

-- 3. HABIT COMPLETIONS TABLE
-- Rastreia cada vez que um hábito é completado
CREATE TABLE public.habit_completions (
  id BIGSERIAL PRIMARY KEY,
  habit_id BIGINT NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  percentage INTEGER NOT NULL DEFAULT 100 CHECK (percentage >= 0 AND percentage <= 100),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(habit_id, date)
);

-- Enable RLS
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies para habit_completions
CREATE POLICY "Users can view their own completions"
  ON public.habit_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own completions"
  ON public.habit_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completions"
  ON public.habit_completions FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. BADGES TABLE
-- Define os badges disponíveis no sistema
CREATE TABLE public.badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT NOT NULL,
  target INTEGER NOT NULL,
  category TEXT NOT NULL
);

-- Inserir badges padrão
INSERT INTO public.badges (id, name, icon, description, target, category) VALUES
  ('seed', 'A Semente', '🌱', 'Complete um hábito por 3 dias', 3, 'streak'),
  ('week', 'Semana Forte', '🔥', '7 dias consecutivos', 7, 'streak'),
  ('identity', 'Nova Identidade', '⚛️', '21 dias (formação de hábito)', 21, 'streak'),
  ('transform', 'Transformação', '🦋', '90 dias de consistência', 90, 'streak'),
  ('stacker', 'Empilhador', '🏗️', 'Use empilhamento 10 vezes', 10, 'habits'),
  ('resilient', 'Resiliente', '💪', 'Volte após quebrar streak', 1, 'comeback');

-- Enable RLS (público - todos podem ler)
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are viewable by everyone"
  ON public.badges FOR SELECT
  USING (true);

-- 5. USER BADGES TABLE
-- Rastreia badges desbloqueados por cada usuário
CREATE TABLE public.user_badges (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  unlocked BOOLEAN NOT NULL DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies para user_badges
CREATE POLICY "Users can view their own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own badges"
  ON public.user_badges FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function: Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON public.habits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function: Criar perfil automaticamente quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, desired_identity, specific_change)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'desired_identity', ''),
    COALESCE(NEW.raw_user_meta_data->>'specific_change', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil ao criar usuário
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function: Inicializar badges do usuário
CREATE OR REPLACE FUNCTION public.initialize_user_badges(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_badges (user_id, badge_id, progress, unlocked)
  SELECT p_user_id, id, 0, false
  FROM public.badges
  ON CONFLICT (user_id, badge_id) DO NOTHING;
END;
$$;

-- ============================================
-- INDEXES para performance
-- ============================================

CREATE INDEX idx_habits_user_id ON public.habits(user_id);
CREATE INDEX idx_habits_status ON public.habits(status);
CREATE INDEX idx_habit_completions_user_id ON public.habit_completions(user_id);
CREATE INDEX idx_habit_completions_habit_id ON public.habit_completions(habit_id);
CREATE INDEX idx_habit_completions_date ON public.habit_completions(date);
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);