# 🚀 Zhatn Performance Fix Guide

We have optimized the app to load instantly even with thousands of messages! ⚡

## 1. ⚠️ CRITICAL: Run SQL Script
The app now uses a **smart database function** to fetch chats instead of downloading everything to your phone/browser. You **MUST** run this in your Supabase SQL Editor for the app to work.

1. Go to **Supabase Dashboard** > **SQL Editor**.
2. Click **New Query**.
3. Copy and Paste the code below:

```sql
-- OPTIMIZE_PERFORMANCE.sql

CREATE OR REPLACE FUNCTION get_my_conversations(p_phone text)
RETURNS TABLE (
  phone text,
  username text,
  avatar_url text,
  is_online boolean,
  last_seen timestamptz,
  tick_color text,
  role_badge text,
  last_message_content text,
  last_message_type text,
  last_message_at timestamptz,
  unread_count bigint
) AS $$
BEGIN
  RETURN QUERY
  WITH last_messages AS (
    SELECT DISTINCT ON (
      CASE WHEN sender_id = p_phone THEN receiver_id ELSE sender_id END
    )
      CASE WHEN sender_id = p_phone THEN receiver_id ELSE sender_id END AS contact_phone,
      content,
      type,
      created_at
    FROM messages
    WHERE sender_id = p_phone OR receiver_id = p_phone
    ORDER BY 
      CASE WHEN sender_id = p_phone THEN receiver_id ELSE sender_id END, 
      created_at DESC
  ),
  unread_counts AS (
     SELECT
        sender_id,
        count(*) as count
     FROM messages
     WHERE receiver_id = p_phone AND read_status = false
     GROUP BY sender_id
  )
  SELECT
    p.phone,
    p.username,
    p.avatar_url,
    p.is_online,
    p.last_seen,
    p.tick_color,
    p.role_badge,
    lm.content,
    lm.type,
    lm.created_at,
    COALESCE(uc.count, 0)
  FROM last_messages lm
  JOIN profiles p ON p.phone = lm.contact_phone
  LEFT JOIN unread_counts uc ON uc.sender_id = lm.contact_phone
  ORDER BY lm.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Add INDEX for performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, created_at DESC);
```

4. Click **Run**.

## 2. Deploy Updates
After running the SQL, deploy the code changes to the live site.

```bash
npm run publish
```

## What we fixed:
- **Instant Load**: Replaced "Download All Messages" with "Get Recent Chats" (RPC).
- **Faster Chat Open**: Only loads the last 50 messages initially (Pagination).
- **Less Data**: Significantly reduced data usage for users.
