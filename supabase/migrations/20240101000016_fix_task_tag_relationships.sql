-- Drop existing views
DROP VIEW IF EXISTS public.task_client_tags;
DROP VIEW IF EXISTS public.task_project_tags;

-- Add trigger to ensure project belongs to client
CREATE OR REPLACE FUNCTION check_task_project_client()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.project_tag_id IS NOT NULL THEN
    -- Get the client_id for the selected project
    SELECT client_id INTO NEW.client_tag_id
    FROM public.projects
    WHERE id = NEW.project_tag_id;
    
    IF NEW.client_tag_id IS NULL THEN
      RAISE EXCEPTION 'Project must belong to a client';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_project_client_check
  BEFORE INSERT OR UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION check_task_project_client();

-- Recreate views with proper relationships
CREATE VIEW public.task_client_tags AS
SELECT DISTINCT ON (t.id)
  t.id AS task_id,
  c.id,
  c.name,
  c.emoji,
  c.color,
  'client:' || c.name AS tag
FROM public.tasks t
JOIN public.clients c ON c.id = t.client_tag_id;

CREATE VIEW public.task_project_tags AS
SELECT DISTINCT ON (t.id)
  t.id AS task_id,
  p.id,
  p.name,
  c.name AS client_name,
  'project:' || c.name || '/' || p.name AS tag
FROM public.tasks t
JOIN public.projects p ON p.id = t.project_tag_id
JOIN public.clients c ON c.id = p.client_id;

-- Grant permissions
GRANT SELECT ON public.task_client_tags TO authenticated;
GRANT SELECT ON public.task_project_tags TO authenticated;