-- 1. Add receiver_id column to messages table
ALTER TABLE messages 
ADD COLUMN receiver_id text;

-- 2. Create Storage Bucket for Media (for the next step)
-- Go to Storage -> New Bucket -> Name it "chat-media" -> Public: Yes

-- 3. (Optional) Cleanup old messages that don't have a receiver
DELETE FROM messages WHERE receiver_id IS NULL;
