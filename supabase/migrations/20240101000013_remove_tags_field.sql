-- Remove tags column from tasks table since we use client_tag_id and project_tag_id
ALTER TABLE public.tasks DROP COLUMN IF EXISTS tags;

-- Update the task_client_tags view to include all necessary fields
CREATE OR REPLACE VIEW public.task_client_tags AS
SELECT 
  t.id AS task_id,
  c.id,
  c.name,
  c.emoji,
  c.color,
  'client:' || c.name AS tag
FROM public.tasks t
JOIN public.clients c ON c.id = t.client_tag_id;

-- Update the task_project_tags view to include the full project tag
CREATE OR REPLACE VIEW public.task_project_tags AS
SELECT 
  t.id AS task_id,
  p.id,
  p.name,
  c.name AS client_name,
  'project:' || c.name || '/' || p.name AS tag
FROM public.tasks t
JOIN public.projects p ON p.id = t.project_tag_id
JOIN public.clients c ON c.id = p.client_id;