-- Zhatn V2 "Liquid Retina" Schema

-- 1. Users (Enhanced Profiles)
-- Extends the existing profiles table or creates new if needed
create table if not exists public.users (
  id uuid default gen_random_uuid() primary key,
  phone text unique not null,
  username text,
  avatar_url text,
  about text default 'Hey there! I am using Zhatn.',
  is_online boolean default false,
  last_seen timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- 2. Conversations (For Groups & Private Metadata)
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  type text check (type in ('private', 'group')) not null,
  name text, -- For groups
  icon_url text, -- For groups
  created_at timestamp with time zone default now()
);

-- 3. Participants (Linking Users to Conversations)
create table if not exists public.participants (
  conversation_id uuid references public.conversations(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  role text default 'member' check (role in ('admin', 'member')),
  joined_at timestamp with time zone default now(),
  primary key (conversation_id, user_id)
);

-- 4. Messages (Enhanced)
-- Note: We might need to migrate data if you want to keep old messages, 
-- but this is a fresh schema as requested.
create table if not exists public.messages_v2 (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid references public.users(id),
  content text,
  media_url text,
  media_type text check (media_type in ('text', 'image', 'video', 'audio', 'file')),
  reply_to_id uuid references public.messages_v2(id),
  read_status boolean default false,
  created_at timestamp with time zone default now()
);

-- 5. Stories (24h Expiration)
create table if not exists public.stories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  media_url text not null,
  caption text,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone default (now() + interval '24 hours')
);

-- 6. Calls (Logs)
create table if not exists public.calls (
  id uuid default gen_random_uuid() primary key,
  caller_id uuid references public.users(id),
  receiver_id uuid references public.users(id),
  type text check (type in ('audio', 'video')),
  status text check (status in ('missed', 'completed', 'rejected')),
  duration_seconds int default 0,
  created_at timestamp with time zone default now()
);

-- RLS Policies (Simple Public Access for Prototype)
alter table public.users enable row level security;
create policy "Public users" on public.users for all using (true);

alter table public.conversations enable row level security;
create policy "Public conversations" on public.conversations for all using (true);

alter table public.participants enable row level security;
create policy "Public participants" on public.participants for all using (true);

alter table public.messages_v2 enable row level security;
create policy "Public messages" on public.messages_v2 for all using (true);

alter table public.stories enable row level security;
create policy "Public stories" on public.stories for all using (true);
