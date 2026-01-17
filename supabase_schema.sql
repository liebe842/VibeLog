-- Clean up existing tables if they exist (to ensure fresh start)
drop table if exists public.notifications cascade;
drop table if exists public.posts cascade;
drop table if exists public.logs cascade; -- 'logs' table is removed/merged into posts
drop table if exists public.activity_logs cascade; -- Handle potential old table name
drop table if exists public.profiles cascade;

-- 1. Profiles Table
-- Stores user information, statistics, and role.
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique not null,
  role text default 'user' check (role in ('user', 'admin')),
  level int default 1,
  pin text, -- [NEW] Security PIN for simple auth check or management
  stats jsonb default '{"streak": 0, "total_logs": 0}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );
  
-- 2. Posts Table (Merged with Activities)
-- Stores both the feed content and the activity data (duration, category)
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  content text not null,               -- Content of the post
  category text not null,              -- Activity Category: 'Coding', 'Study', 'Debug'
  duration_min int default 0,          -- Activity duration in minutes
  link_url text,                       -- [NEW] Link to the result/project
  image_url text,                      -- [NEW] Screenshot or related image
  likes int default 0,
  comments_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.posts enable row level security;

-- Policies for Posts
create policy "Posts are viewable by everyone."
  on public.posts for select
  using ( true );

create policy "Users can insert their own posts."
  on public.posts for insert
  with check ( auth.uid() = user_id );

-- 3. Notifications Table
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null, -- Receiver
  sender_id uuid references public.profiles(id) not null, -- Sender
  type text check (type in ('like', 'comment')),
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Policies for Notifications
create policy "Users can view their own notifications."
  on public.notifications for select
  using ( auth.uid() = user_id );

-- 4. Triggers (Optional but recommended for auto-profile creation)
-- Automatically create a profile entry when a new user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
