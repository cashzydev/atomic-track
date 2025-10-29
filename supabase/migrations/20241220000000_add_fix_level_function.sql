-- Adiciona função RPC simples para corrigir nível de um usuário
-- Útil para corrigir casos onde o nível está inconsistente

CREATE OR REPLACE FUNCTION public.fix_user_level(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_xp INTEGER;
  v_correct_level INTEGER;
  v_old_level INTEGER;
BEGIN
  -- Buscar XP do usuário
  SELECT xp, level INTO v_xp, v_old_level
  FROM profiles
  WHERE id = p_user_id;

  IF v_xp IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  -- Calcular nível correto baseado no XP
  v_correct_level := CASE 
    WHEN v_xp >= 20000 THEN 10
    WHEN v_xp >= 10000 THEN 9
    WHEN v_xp >= 6000 THEN 8
    WHEN v_xp >= 3500 THEN 7
    WHEN v_xp >= 2000 THEN 6
    WHEN v_xp >= 1000 THEN 5
    WHEN v_xp >= 500 THEN 4
    WHEN v_xp >= 250 THEN 3
    WHEN v_xp >= 100 THEN 2
    ELSE 1
  END;

  -- Atualizar nível se estiver incorreto
  IF v_old_level IS NULL OR v_old_level != v_correct_level THEN
    UPDATE profiles
    SET level = v_correct_level
    WHERE id = p_user_id;
    
    RETURN v_correct_level;
  END IF;

  RETURN v_old_level;
END;
$$;

-- Comentário para documentação
COMMENT ON FUNCTION public.fix_user_level IS 'Corrige o nível de um usuário baseado no XP atual';


