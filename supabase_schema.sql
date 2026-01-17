-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES Table
create table profiles (
  id uuid references auth.users not null primary key,
  username text unique not null,
  role text default 'user' check (role in ('user', 'admin')),
  avatar_url text,
  level int default 1,
  streak_count int default 0,
  total_minutes int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. ACTIVITY LOGS Table
create table activity_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  category text check (category in ('Coding', 'Study', 'Debug', 'Design')),
  topic text not null,
  duration_min int not null,
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. FEED POSTS Table
create table posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  type text default 'text' check (type in ('text', 'code', 'milestone')),
  code_snippet text, -- JSON or text
  language text,
  likes_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. NOTIFICATIONS Table
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null, -- Receiver
  sender_id uuid references profiles(id) on delete cascade,         -- Sender
  type text check (type in ('like', 'comment', 'system')),
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Row Level Security)
alter table profiles enable row level security;
alter table activity_logs enable row level security;
alter table posts enable row level security;
alter table notifications enable row level security;

-- Policies (Simple for MVP: Public Read, Auth Write)
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Logs are viewable by everyone" on activity_logs for select using (true);
create policy "Users can insert own logs" on activity_logs for insert with check (auth.uid() = user_id);

create policy "Posts are viewable by everyone" on posts for select using (true);
create policy "Users can insert posts" on posts for insert with check (auth.uid() = user_id);

create policy "Users can see their own notifications" on notifications for select using (auth.uid() = user_id);
-- Note: Sender needs permission to insert notification for others. 
-- For now, allow authenticated users to insert notifications (server-side logic usually handles this, but for client-side triggering):
create policy "Users can insert notifications" on notifications for insert with check (auth.role() = 'authenticated');
