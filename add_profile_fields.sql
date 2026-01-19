-- Add bio and avatar_url fields to profiles table
alter table public.profiles
add column if not exists bio text,
add column if not exists avatar_url text;
