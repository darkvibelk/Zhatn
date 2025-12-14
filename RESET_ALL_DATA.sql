-- DANGER: This will delete ALL user data, messages, and conversations.
-- Run this in your Supabase SQL Editor.

TRUNCATE TABLE public.messages CASCADE;
TRUNCATE TABLE public.messages_v2 CASCADE;
TRUNCATE TABLE public.stories CASCADE;
TRUNCATE TABLE public.participants CASCADE;
TRUNCATE TABLE public.conversations CASCADE;
TRUNCATE TABLE public.profiles CASCADE;
-- If you created the 'users' table from schema v2:
TRUNCATE TABLE public.users CASCADE;
