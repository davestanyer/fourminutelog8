-- Drop existing triggers and constraints
DROP TRIGGER IF EXISTS maintain_recurring_task_relationships_trigger ON public.recurring_tasks;
DROP FUNCTION IF EXISTS public.maintain_recurring_task_relationships();
ALTER TABLE public.recurring_tasks
DROP CONSTRAINT IF EXISTS recurring_tasks_client_id_fkey,
DROP CONSTRAINT IF EXISTS recurring_tasks_project_id_fkey;

-- Ensure columns exist with proper types
ALTER TABLE public.recurring_tasks
ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_client_id ON public.recurring_tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_project_id ON public.recurring_tasks(project_id);

-- Create trigger function for relationship management
CREATE OR REPLACE FUNCTION public.maintain_recurring_task_relationships()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate project belongs to client if both are specified
  IF NEW.project_id IS NOT NULL THEN
    IF NEW.client_id IS NULL THEN
      RAISE EXCEPTION 'Cannot assign a project without a client';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = NEW.project_id
      AND client_id = NEW.client_id
    ) THEN
      RAISE EXCEPTION 'Project must belong to the selected client';
    END IF;
  END IF;

  -- Clear project when client is removed
  IF NEW.client_id IS NULL THEN
    NEW.project_id := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER maintain_recurring_task_relationships_trigger
  BEFORE INSERT OR UPDATE ON public.recurring_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.maintain_recurring_task_relationships();

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