-- Add avatar fields to profiles table
-- This migration ensures that avatar fields exist in the profiles table

-- 1. Add avatar fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_type TEXT DEFAULT 'initials' CHECK (avatar_type IN ('initials', 'upload', 'icon')),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS avatar_icon TEXT,
ADD COLUMN IF NOT EXISTS avatar_color TEXT DEFAULT 'violet';

-- 2. Add email field if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 3. Add level field if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- 4. Add xp field if it doesn't exist (rename from points if needed)
DO $$ 
BEGIN
    -- Check if 'points' column exists and 'xp' doesn't
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'points') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'xp') THEN
        -- Rename points to xp
        ALTER TABLE public.profiles RENAME COLUMN points TO xp;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'xp') THEN
        -- Add xp column if neither exists
        ALTER TABLE public.profiles ADD COLUMN xp INTEGER DEFAULT 0;
    END IF;
END $$;

-- 5. Add tier field if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free';

-- 6. Update existing profiles to have default avatar values
UPDATE public.profiles 
SET 
    avatar_type = 'initials',
    avatar_color = 'violet',
    level = COALESCE(level, 1),
    xp = COALESCE(xp, 0),
    tier = COALESCE(tier, 'free')
WHERE avatar_type IS NULL;

-- 7. Create index on avatar_icon for performance
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_icon ON public.profiles(avatar_icon);

-- 8. Add comment to document the avatar fields
COMMENT ON COLUMN public.profiles.avatar_type IS 'Type of avatar: initials, upload, or icon';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL of uploaded avatar image';
COMMENT ON COLUMN public.profiles.avatar_icon IS 'Name of the selected icon for avatar';
COMMENT ON COLUMN public.profiles.avatar_color IS 'Color theme for the avatar';








