-- ============================================================================
-- BUILDERS PERFORMANCE - AUTH PROFILES TRIGGER
-- ============================================================================
-- Este arquivo cria a trigger para sincronizar auth.users com public.users
-- Quando um usuário faz signup, um registro é criado automaticamente na tabela users
--
-- Data: 2026-01-28
-- Versão: 1.0.0
-- ============================================================================

-- ============================================================================
-- PART 1: CREATE TRIGGER FUNCTION
-- ============================================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates or updates a user profile when a new auth user is created';

-- ============================================================================
-- PART 2: CREATE TRIGGER
-- ============================================================================

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to call function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- PART 3: HANDLE EXISTING USERS
-- ============================================================================

-- Sync existing auth users to public.users table
INSERT INTO public.users (id, email, name, avatar_url, created_at, updated_at)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  au.raw_user_meta_data->>'avatar_url',
  au.created_at,
  NOW()
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PART 4: UPDATE RLS POLICY FOR INSERT WITHOUT ID
-- ============================================================================

-- Allow service role to insert users (for the trigger)
-- The existing policies already allow service_role, but let's ensure anon can't insert
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run this to verify the trigger exists:
-- SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
-- ============================================================================
