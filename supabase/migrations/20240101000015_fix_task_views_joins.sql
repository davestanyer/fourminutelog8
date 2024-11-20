-- Drop existing views
DROP VIEW IF EXISTS public.task_client_tags;
DROP VIEW IF EXISTS public.task_project_tags;

-- Recreate task_client_tags view with proper join type and unique constraint
CREATE OR REPLACE VIEW public.task_client_tags AS
SELECT DISTINCT ON (t.id)
  t.id AS task_id,
  c.id,
  c.name,
  c.emoji,
  c.color,
  'client:' || c.name AS tag
FROM public.tasks t
LEFT JOIN public.clients c ON c.id = t.client_tag_id
WHERE c.id IS NOT NULL;

-- Recreate task_project_tags view with proper join type and unique constraint
CREATE OR REPLACE VIEW public.task_project_tags AS
SELECT DISTINCT ON (t.id)
  t.id AS task_id,
  p.id,
  p.name,
  c.name AS client_name,
  'project:' || c.name || '/' || p.name AS tag
FROM public.tasks t
LEFT JOIN public.projects p ON p.id = t.project_tag_id
LEFT JOIN public.clients c ON c.id = p.client_id
WHERE p.id IS NOT NULL AND c.id IS NOT NULL;

-- Add indexes to improve performance
CREATE INDEX IF NOT EXISTS idx_tasks_client_tag_id ON public.tasks(client_tag_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_tag_id ON public.tasks(project_tag_id);

-- Ensure proper RLS policies
GRANT SELECT ON public.task_client_tags TO authenticated;
GRANT SELECT ON public.task_project_tags TO authenticated;