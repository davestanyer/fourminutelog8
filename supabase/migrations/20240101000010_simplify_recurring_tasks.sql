-- Drop existing triggers and constraints
DROP TRIGGER IF EXISTS validate_recurring_task_relationships_trigger ON public.recurring_tasks;
DROP FUNCTION IF EXISTS public.validate_recurring_task_relationships();

-- Ensure proper columns exist with simple foreign key relationships
ALTER TABLE public.recurring_tasks
DROP COLUMN IF EXISTS client,
DROP COLUMN IF EXISTS project,
ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_client_id ON public.recurring_tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_project_id ON public.recurring_tasks(project_id);