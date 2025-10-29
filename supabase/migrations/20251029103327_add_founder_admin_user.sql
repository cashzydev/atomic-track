-- Migration: Adicionar usuário específico como fundador e admin
-- Data: 2024-12-XX

-- 1. Adicionar role de admin se não existir
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'lucasoliveiratnb0@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Criar/atualizar subscription como founder (vitalício - sem expiração)
INSERT INTO public.subscriptions (
  user_id,
  tier,
  status,
  started_at,
  expires_at
)
SELECT 
  id,
  'founder'::text,
  'active'::text,
  NOW(),
  NULL -- Sem expiração (vitalício)
FROM auth.users
WHERE email = 'lucasoliveiratnb0@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
  tier = 'founder',
  status = 'active',
  expires_at = NULL; -- Garantir que não expire

-- 3. Atualizar profile para founder
UPDATE public.profiles
SET 
  tier = 'founder',
  is_founder = true
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'lucasoliveiratnb0@gmail.com'
);

