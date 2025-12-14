-- Add session_id to profiles to track active sessions
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS session_id text;
