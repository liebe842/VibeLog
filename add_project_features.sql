-- Add features column to projects table for feature management
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{"planned": [], "completed": []}'::jsonb;

-- Update existing projects to have default features structure
UPDATE projects
SET features = '{"planned": [], "completed": []}'::jsonb
WHERE features IS NULL;
