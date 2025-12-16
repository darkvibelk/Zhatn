-- Run this command in your Supabase SQL Editor to enable PIN security

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS secret_pin TEXT;

-- Optional: Set a default PIN for existing users (e.g., '1234') so they aren't locked out
UPDATE profiles 
SET secret_pin = '1234' 
WHERE secret_pin IS NULL;
