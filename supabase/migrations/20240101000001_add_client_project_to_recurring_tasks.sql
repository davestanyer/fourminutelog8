-- First remove the tags column if it exists
ALTER TABLE public.recurring_tasks 
DROP COLUMN IF EXISTS tags;

-- Add client and project columns
ALTER TABLE public.recurring_tasks 
ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS client text,
ADD COLUMN IF NOT EXISTS project text;

-- Create an index to improve query performance
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_client_id ON public.recurring_tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_project_id ON public.recurring_tasks(project_id);

-- Add trigger function to maintain referential integrity
CREATE OR REPLACE FUNCTION check_project_belongs_to_client()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.project_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.clients c ON c.id = p.client_id
      WHERE p.id = NEW.project_id
      AND c.id = NEW.client_id
    ) THEN
      RAISE EXCEPTION 'Project must belong to the selected client';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS ensure_project_client_match ON public.recurring_tasks;
CREATE TRIGGER ensure_project_client_match
  BEFORE INSERT OR UPDATE ON public.recurring_tasks
  FOR EACH ROW
  EXECUTE FUNCTION check_project_belongs_to_client();