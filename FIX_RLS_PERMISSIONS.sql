-- CRITICAL FIX: Reset RLS Policies for Zhatn Chat App
-- Run this in your Supabase SQL Editor to fix 401 Unauthorized errors

-- 1. Enable RLS on tables (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Public profiles access" ON public.profiles;
DROP POLICY IF EXISTS "Public messages access" ON public.messages;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.messages;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.messages;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.messages;

-- 3. Create WIDE-OPEN policies (Since we handle auth client-side)
-- Profiles: Allow ALL operations for anonymous users
CREATE POLICY "Allow all on profiles"
ON public.profiles
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Messages: Allow ALL operations for anonymous users
CREATE POLICY "Allow all on messages"
ON public.messages
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 4. Grant explicit permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.messages TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 5. Verify policies are active
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'messages');
