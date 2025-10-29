-- Migration: Adicionar suporte para tier 'founder' e campos de pagamento Cakto
-- Data: 2024-12-XX

-- 1. Adicionar tier 'founder' ao CHECK constraint de subscriptions
ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_tier_check;

ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_tier_check 
CHECK (tier IN ('free', 'founder', 'pro', 'enterprise'));

-- 2. Adicionar coluna cakto_payment_id para rastreamento
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS cakto_payment_id TEXT;

-- 3. Adicionar índice para busca rápida por payment_id (evitar duplicatas)
CREATE INDEX IF NOT EXISTS idx_subscriptions_cakto_payment_id 
ON public.subscriptions(cakto_payment_id) 
WHERE cakto_payment_id IS NOT NULL;

-- 4. Adicionar coluna is_founder no profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_founder BOOLEAN DEFAULT false;

-- 5. Adicionar coluna payment_email no profiles (email usado no pagamento)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS payment_email TEXT;

-- 6. Criar função para verificar se usuário tem acesso pago (founder/pro/enterprise)
CREATE OR REPLACE FUNCTION public.has_paid_access(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_access BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM subscriptions
    WHERE user_id = p_user_id
      AND status = 'active'
      AND tier IN ('founder', 'pro', 'enterprise')
      AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO v_has_access;
  
  RETURN COALESCE(v_has_access, false);
END;
$$;

-- 7. Criar função para criar/atualizar subscription via webhook (idempotente)
CREATE OR REPLACE FUNCTION public.process_cakto_payment(
  p_email TEXT,
  p_payment_id TEXT,
  p_amount NUMERIC,
  p_tier TEXT DEFAULT 'founder',
  p_expires_days INTEGER DEFAULT 90
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_subscription_id UUID;
BEGIN
  -- Buscar usuário pelo email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email
  LIMIT 1;

  -- Se usuário não existe, retornar erro
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado. Email: %', p_email;
  END IF;

  -- Verificar se payment_id já foi processado (idempotência)
  SELECT id INTO v_subscription_id
  FROM subscriptions
  WHERE cakto_payment_id = p_payment_id
  LIMIT 1;

  IF v_subscription_id IS NOT NULL THEN
    -- Pagamento já processado, retornar subscription existente
    RETURN v_subscription_id;
  END IF;

  -- Criar nova subscription
  INSERT INTO subscriptions (
    user_id,
    tier,
    status,
    cakto_payment_id,
    expires_at,
    started_at
  ) VALUES (
    v_user_id,
    p_tier,
    'active',
    p_payment_id,
    NOW() + (p_expires_days || ' days')::INTERVAL,
    NOW()
  )
  RETURNING id INTO v_subscription_id;

  -- Atualizar profile
  UPDATE profiles
  SET 
    tier = p_tier,
    is_founder = (p_tier = 'founder'),
    payment_email = p_email
  WHERE id = v_user_id;

  RETURN v_subscription_id;
END;
$$;

-- 8. Comentários para documentação
COMMENT ON FUNCTION public.has_paid_access IS 'Verifica se usuário tem acesso pago ativo (founder/pro/enterprise)';
COMMENT ON FUNCTION public.process_cakto_payment IS 'Processa pagamento do Cakto de forma idempotente';

