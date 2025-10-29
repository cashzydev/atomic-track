-- Fix All User Levels - Corrige níveis de todos os perfis baseado no XP atual
-- Esta migration garante que todos os usuários tenham o nível correto baseado em seu XP

-- 1. Garantir que a função de atualização de nível está correta
CREATE OR REPLACE FUNCTION public.update_level_from_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- 2. Garantir que o trigger está ativo
DROP TRIGGER IF EXISTS update_level_trigger ON public.profiles;
CREATE TRIGGER update_level_trigger
  BEFORE UPDATE OF xp ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_level_from_xp();

-- 3. Corrigir TODOS os perfis existentes baseado no XP atual
UPDATE public.profiles 
SET level = CASE 
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
  END
WHERE level IS NULL OR level != (
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
  END
);

-- 4. Log da correção (para debug)
DO $$
DECLARE
  corrected_count INTEGER;
BEGIN
  GET DIAGNOSTICS corrected_count = ROW_COUNT;
  RAISE NOTICE '✅ Níveis corrigidos para % perfis', corrected_count;
END $$;

