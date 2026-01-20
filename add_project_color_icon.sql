-- Add color and icon fields to projects table
ALTER TABLE public.projects
ADD COLUMN color TEXT DEFAULT 'gray',
ADD COLUMN icon TEXT DEFAULT '📁';

-- Update existing projects with default values
UPDATE public.projects
SET color = 'gray', icon = '📁'
WHERE color IS NULL OR icon IS NULL;
