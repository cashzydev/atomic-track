-- Ensure admin user is properly set up
-- This migration ensures that lucasoliveiratnb0@gmail.com has admin privileges

-- First, ensure the user exists in auth.users (this will be created when they sign up)
-- Then add admin role if not already present

-- Add admin role for the specified email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'lucasoliveiratnb0@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Also ensure the user has a profile entry
INSERT INTO public.profiles (id, email, name, avatar_type, avatar_color, tier)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'name', 'Admin User') as name,
  'initials' as avatar_type,
  'violet' as avatar_color,
  'premium' as tier
FROM auth.users
WHERE email = 'lucasoliveiratnb0@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  tier = 'premium',
  updated_at = NOW();

-- Log the operation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'lucasoliveiratnb0@gmail.com') THEN
    RAISE NOTICE 'Admin user setup completed for lucasoliveiratnb0@gmail.com';
  ELSE
    RAISE NOTICE 'User lucasoliveiratnb0@gmail.com not found in auth.users - will be created on first signup';
  END IF;
END $$;
