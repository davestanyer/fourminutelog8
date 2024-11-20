-- First, ensure we have the proper columns
ALTER TABLE public.recurring_tasks
ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS client text,
ADD COLUMN IF NOT EXISTS project text;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_client_id ON public.recurring_tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_project_id ON public.recurring_tasks(project_id);

-- Create or replace the trigger function to maintain display names and validate relationships
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
    NEW.project := NULL; -- Clear project when client is cleared
    NEW.project_id := NULL; -- Clear project_id when client is cleared
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS maintain_recurring_task_relationships_trigger ON public.recurring_tasks;

-- Create new trigger
CREATE TRIGGER maintain_recurring_task_relationships_trigger
  BEFORE INSERT OR UPDATE ON public.recurring_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.maintain_recurring_task_relationships();

-- Update RLS policies to handle client and project relationships
CREATE POLICY "Users can view recurring tasks with their clients"
  ON public.recurring_tasks
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = recurring_tasks.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Ensure the recurring_tasks table has proper foreign key constraints
ALTER TABLE public.recurring_tasks
DROP CONSTRAINT IF EXISTS recurring_tasks_client_id_fkey,
DROP CONSTRAINT IF EXISTS recurring_tasks_project_id_fkey,
ADD CONSTRAINT recurring_tasks_client_id_fkey
  FOREIGN KEY (client_id)
  REFERENCES public.clients(id)
  ON DELETE SET NULL,
ADD CONSTRAINT recurring_tasks_project_id_fkey
  FOREIGN KEY (project_id)
  REFERENCES public.projects(id)
  ON DELETE SET NULL;