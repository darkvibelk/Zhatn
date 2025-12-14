-- RUN THIS SCRIPT IN SUPABASE SQL EDITOR --

-- 1. Add 'read_status' column for Green Ticks (Read Receipts)
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS read_status boolean DEFAULT false;

-- 2. (Optional) Ensure 'sender_name' is robust
ALTER TABLE public.messages 
ALTER COLUMN sender_name DROP NOT NULL;
