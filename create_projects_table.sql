-- ============================================
-- Projects Table & Posts Migration
-- ============================================

-- 1. Create projects table
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policies for projects (전체 공개)
CREATE POLICY "Projects are viewable by everyone."
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own projects."
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects."
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects."
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Add project_id column to posts table
ALTER TABLE public.posts
ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

-- 3. Create "미분류" project for each existing user
INSERT INTO public.projects (user_id, title, description, status)
SELECT DISTINCT
  user_id,
  '미분류',
  '프로젝트가 지정되지 않은 개발일지',
  'active'
FROM public.posts
WHERE user_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 4. Link existing posts to their user's "미분류" project
UPDATE public.posts p
SET project_id = (
  SELECT id FROM public.projects
  WHERE user_id = p.user_id AND title = '미분류'
  LIMIT 1
)
WHERE project_id IS NULL;

-- 5. Create index for better query performance
CREATE INDEX idx_posts_project_id ON public.posts(project_id);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);

-- 6. Function to auto-create "미분류" project for new users
CREATE OR REPLACE FUNCTION public.create_default_project_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.projects (user_id, title, description, status)
  VALUES (NEW.id, '미분류', '프로젝트가 지정되지 않은 개발일지', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger to create default project when new profile is created
DROP TRIGGER IF EXISTS on_profile_created_create_default_project ON public.profiles;
CREATE TRIGGER on_profile_created_create_default_project
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_project_for_user();
