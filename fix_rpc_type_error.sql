-- Script para corrigir erro de tipo na função get_user_todays_completions
-- Execute este script no SQL Editor do Supabase

-- 1. Corrigir função get_user_todays_completions com tipos corretos
CREATE OR REPLACE FUNCTION public.get_user_todays_completions(p_user_id UUID)
RETURNS TABLE(
  habit_id BIGINT, 
  date DATE, 
  percentage INTEGER, 
  completed_at TIMESTAMPTZ
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    hc.habit_id::BIGINT,  -- Cast explícito para BIGINT
    hc.date,
    hc.percentage,
    hc.completed_at
  FROM habit_completions hc
  WHERE hc.user_id = p_user_id
    AND hc.date = CURRENT_DATE
    AND hc.percentage >= 100
  ORDER BY hc.completed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 2. Verificar se a função foi corrigida
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'get_user_todays_completions';

-- 3. Testar a função corrigida
-- Substitua 'USER_ID_AQUI' pelo ID do usuário que está testando
-- SELECT * FROM get_user_todays_completions('USER_ID_AQUI');

-- 4. Verificar estrutura da tabela habit_completions
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'habit_completions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
