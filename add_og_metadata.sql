-- Add Open Graph metadata columns to posts table for link previews
-- Run this migration in Supabase SQL Editor

ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS og_title text,
ADD COLUMN IF NOT EXISTS og_description text,
ADD COLUMN IF NOT EXISTS og_image text,
ADD COLUMN IF NOT EXISTS og_site_name text;

-- Add comment for documentation
COMMENT ON COLUMN public.posts.og_title IS 'Open Graph title from link_url';
COMMENT ON COLUMN public.posts.og_description IS 'Open Graph description from link_url';
COMMENT ON COLUMN public.posts.og_image IS 'Open Graph image URL from link_url';
COMMENT ON COLUMN public.posts.og_site_name IS 'Open Graph site name from link_url';
