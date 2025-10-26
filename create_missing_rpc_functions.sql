-- Script para criar as funções RPC faltantes
-- Execute este script no SQL Editor do Supabase

-- 1. Criar função get_server_date
CREATE OR REPLACE FUNCTION public.get_server_date()
RETURNS DATE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 2. Criar função get_user_todays_completions
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
    hc.habit_id,
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

-- 3. Verificar se as funções foram criadas
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('get_server_date', 'get_user_todays_completions');

-- 4. Testar as funções
SELECT get_server_date() as server_date_test;

-- Substitua 'USER_ID_AQUI' pelo ID do usuário que está testando
-- SELECT * FROM get_user_todays_completions('USER_ID_AQUI');
