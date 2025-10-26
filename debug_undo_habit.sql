-- Script para debug do problema de undo hábito
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar data do servidor
SELECT 
  CURRENT_DATE as server_date,
  NOW() as server_timestamp,
  EXTRACT(TIMEZONE FROM NOW()) as server_timezone;

-- 2. Verificar se a função get_server_date existe e funciona
SELECT get_server_date() as server_date_function;

-- 3. Verificar se a função get_user_todays_completions existe e funciona
-- Substitua 'USER_ID_AQUI' pelo ID do usuário que está testando
SELECT * FROM get_user_todays_completions('USER_ID_AQUI');

-- 4. Verificar completions de hoje diretamente na tabela
-- Substitua 'USER_ID_AQUI' pelo ID do usuário que está testando
SELECT 
  hc.*,
  h.title as habit_title
FROM habit_completions hc
JOIN habits h ON h.id = hc.habit_id
WHERE hc.user_id = 'USER_ID_AQUI'
  AND hc.date = CURRENT_DATE
  AND hc.percentage >= 100;

-- 5. Verificar se há diferença entre CURRENT_DATE e data do cliente
-- Compare com a data que o cliente está enviando
SELECT 
  CURRENT_DATE as server_date,
  '2025-01-27' as client_date_example, -- Substitua pela data que o cliente está enviando
  CURRENT_DATE = '2025-01-27' as dates_match;

-- 6. Verificar se há completions em outras datas
-- Substitua 'USER_ID_AQUI' pelo ID do usuário que está testando
SELECT 
  hc.date,
  COUNT(*) as completion_count,
  h.title as habit_title
FROM habit_completions hc
JOIN habits h ON h.id = hc.habit_id
WHERE hc.user_id = 'USER_ID_AQUI'
  AND hc.percentage >= 100
GROUP BY hc.date, h.title
ORDER BY hc.date DESC
LIMIT 10;

-- 7. Testar a função calculate_habit_streak
-- Substitua 'HABIT_ID_AQUI' pelo ID do hábito que está testando
SELECT * FROM calculate_habit_streak(HABIT_ID_AQUI);

