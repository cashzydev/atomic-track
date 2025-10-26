-- Script para investigar problema de DELETE
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a completion existe
-- Substitua 'USER_ID_AQUI' pelo ID do usuário e 'HABIT_ID_AQUI' pelo ID do hábito
SELECT 
  hc.*,
  h.title as habit_title
FROM habit_completions hc
JOIN habits h ON h.id = hc.habit_id
WHERE hc.user_id = 'USER_ID_AQUI'
  AND hc.habit_id = HABIT_ID_AQUI
  AND hc.date = '2025-10-26';

-- 2. Verificar políticas RLS da tabela habit_completions
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'habit_completions';

-- 3. Verificar se há constraints na tabela
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'habit_completions';

-- 4. Testar DELETE diretamente (CUIDADO: vai deletar a completion!)
-- Descomente apenas se quiser testar
-- DELETE FROM habit_completions 
-- WHERE user_id = 'USER_ID_AQUI'
--   AND habit_id = HABIT_ID_AQUI
--   AND date = '2025-10-26';

-- 5. Verificar se há triggers na tabela
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'habit_completions';

-- 6. Verificar permissões do usuário atual
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'habit_completions';
