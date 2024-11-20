-- Add foreign key relationships for client and project tags
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS client_tag_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS project_tag_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_client_tag_id ON public.tasks(client_tag_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_tag_id ON public.tasks(project_tag_id);

-- Create views for easier access to client and project tags
CREATE OR REPLACE VIEW public.task_client_tags AS
SELECT t.id AS task_id, c.id, c.name, c.emoji, c.color
FROM public.tasks t
JOIN public.clients c ON c.id = t.client_tag_id;

CREATE OR REPLACE VIEW public.task_project_tags AS
SELECT t.id AS task_id, p.id, p.name
FROM public.tasks t
JOIN public.projects p ON p.id = t.project_tag_id;

-- Add RLS policies for the views
ALTER VIEW public.task_client_tags OWNER TO postgres;
ALTER VIEW public.task_project_tags OWNER TO postgres;

GRANT SELECT ON public.task_client_tags TO authenticated;
GRANT SELECT ON public.task_project_tags TO authenticated;

CREATE POLICY "Users can view task client tags"
  ON public.tasks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view task project tags"
  ON public.tasks
  FOR SELECT
  USING (auth.uid() = user_id);