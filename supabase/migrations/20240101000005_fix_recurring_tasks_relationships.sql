-- First, drop existing foreign keys and triggers
ALTER TABLE public.recurring_tasks
DROP CONSTRAINT IF EXISTS recurring_tasks_client_id_fkey,
DROP CONSTRAINT IF EXISTS recurring_tasks_project_id_fkey;

DROP TRIGGER IF EXISTS maintain_recurring_task_relationships_trigger ON public.recurring_tasks;
DROP FUNCTION IF EXISTS public.maintain_recurring_task_relationships();

-- Recreate foreign key constraints with explicit names
ALTER TABLE public.recurring_tasks
ADD CONSTRAINT recurring_tasks_client_id_fkey 
  FOREIGN KEY (client_id) 
  REFERENCES public.clients(id) 
  ON DELETE SET NULL,
ADD CONSTRAINT recurring_tasks_project_id_fkey 
  FOREIGN KEY (project_id) 
  REFERENCES public.projects(id) 
  ON DELETE SET NULL;

-- Create new trigger function with explicit relationship handling
CREATE OR REPLACE FUNCTION public.maintain_recurring_task_relationships()
RETURNS TRIGGER AS $$
BEGIN
  -- Only validate if project_id is provided
  IF NEW.project_id IS NOT NULL THEN
    -- Ensure client_id is set when project_id is set
    IF NEW.client_id IS NULL THEN
      RAISE EXCEPTION 'Cannot assign a project without a client';
    END IF;

    -- Ensure project belongs to the selected client
    IF NOT EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = NEW.project_id
      AND client_id = NEW.client_id
    ) THEN
      RAISE EXCEPTION 'Project must belong to the selected client';
    END IF;
  END IF;

  -- Update display names from the relationships
  IF NEW.client_id IS NOT NULL THEN
    SELECT name INTO NEW.client
    FROM public.clients
    WHERE id = NEW.client_id;
  ELSE
    NEW.client := NULL;
    NEW.project := NULL;
    NEW.project_id := NULL;
  END IF;

  IF NEW.project_id IS NOT NULL THEN
    SELECT name INTO NEW.project
    FROM public.projects
    WHERE id = NEW.project_id;
  ELSE
    NEW.project := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger
CREATE TRIGGER maintain_recurring_task_relationships_trigger
  BEFORE INSERT OR UPDATE ON public.recurring_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.maintain_recurring_task_relationships();