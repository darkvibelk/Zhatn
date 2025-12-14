-- Add Online Status columns to the existing profiles table
-- We use DO block or just simple ALTER statements. 
-- Since IF NOT EXISTS is supported in modern Postgres for ADD COLUMN, this is safe to run multiple times.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_seen timestamp with time zone DEFAULT now();

-- The error "relation already member of publication" means Realtime is ALREADY ENABLED.
-- So we do not need to run the 'alter publication' command again.
