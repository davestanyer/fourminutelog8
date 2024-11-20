-- Drop existing triggers and constraints
DROP TRIGGER IF EXISTS maintain_recurring_task_relationships_trigger ON public.recurring_tasks;
DROP FUNCTION IF EXISTS public.maintain_recurring_task_relationships();
ALTER TABLE public.recurring_tasks
DROP CONSTRAINT IF EXISTS recurring_tasks_client_id_fkey,
DROP CONSTRAINT IF EXISTS recurring_tasks_project_id_fkey;

-- Ensure columns exist with proper types
ALTER TABLE public.recurring_tasks
DROP COLUMN IF EXISTS client,
DROP COLUMN IF EXISTS project,
ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_client_id ON public.recurring_tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_project_id ON public.recurring_tasks(project_id);

-- Add explicit foreign key constraints
ALTER TABLE public.recurring_tasks
ADD CONSTRAINT recurring_tasks_client_id_fkey 
  FOREIGN KEY (client_id) 
  REFERENCES public.clients(id) 
  ON DELETE SET NULL,
ADD CONSTRAINT recurring_tasks_project_id_fkey 
  FOREIGN KEY (project_id) 
  REFERENCES public.projects(id) 
  ON DELETE SET NULL;