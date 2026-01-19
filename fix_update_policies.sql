-- Fix RLS policies for post updates

-- Ensure users can update their own posts
drop policy if exists "Users can update own posts" on public.posts;
create policy "Users can update own posts"
on public.posts for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Verify select policy exists for posts
drop policy if exists "Anyone can view posts" on public.posts;
create policy "Anyone can view posts"
on public.posts for select
to authenticated
using (true);

-- Verify insert policy exists for posts
drop policy if exists "Users can insert own posts" on public.posts;
create policy "Users can insert own posts"
on public.posts for insert
to authenticated
with check (auth.uid() = user_id);
