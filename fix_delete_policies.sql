-- Fix RLS policies for post deletion

-- Allow users to delete comments on their own posts
drop policy if exists "Users can delete comments on their posts" on public.comments;
create policy "Users can delete comments on their posts"
on public.comments for delete
to authenticated
using (
  auth.uid() in (
    select user_id from public.posts where id = comments.post_id
  )
);

-- Allow users to delete their own comments
drop policy if exists "Users can delete own comments" on public.comments;
create policy "Users can delete own comments"
on public.comments for delete
to authenticated
using (auth.uid() = user_id);

-- Allow users to delete likes on their own posts
drop policy if exists "Users can delete likes on their posts" on public.likes;
create policy "Users can delete likes on their posts"
on public.likes for delete
to authenticated
using (
  auth.uid() in (
    select user_id from public.posts where id = likes.post_id
  )
);

-- Ensure users can delete their own posts
drop policy if exists "Users can delete own posts" on public.posts;
create policy "Users can delete own posts"
on public.posts for delete
to authenticated
using (auth.uid() = user_id);
