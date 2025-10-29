-- Migration: Garantir acesso completo para usuário admin/fundador específico
-- Data: 2024-12-XX
-- Este script garante que lucasoliveiratnb0@gmail.com tenha TODAS as permissões

-- 1. Garantir role de admin (idempotente)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'lucasoliveiratnb0@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Garantir subscription como founder (vitalício - sem expiração)
-- Primeiro, garantir que o usuário existe e criar profile se não existir
INSERT INTO public.profiles (id, name, tier, is_founder)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'name', 'Admin'),
  'founder',
  true
FROM auth.users
WHERE email = 'lucasoliveiratnb0@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
  tier = 'founder',
  is_founder = true;

-- 3. Criar/atualizar subscription como founder (vitalício)
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
  expires_at = NULL, -- Garantir que não expire
  updated_at = NOW();

-- 4. Garantir que o profile está atualizado como founder
UPDATE public.profiles
SET 
  tier = 'founder',
  is_founder = true
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'lucasoliveiratnb0@gmail.com'
);

-- 5. Verificar e criar perfil se não existir (fallback)
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'lucasoliveiratnb0@gmail.com'
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Criar perfil se não existir
    INSERT INTO public.profiles (id, name, tier, is_founder)
    VALUES (v_user_id, 'Admin', 'founder', true)
    ON CONFLICT (id) DO UPDATE SET
      tier = 'founder',
      is_founder = true;
  END IF;
END $$;

