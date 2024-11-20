-- Drop the trigger first since we're modifying the constraint logic
DROP TRIGGER IF EXISTS ensure_project_client_match ON public.recurring_tasks;
DROP FUNCTION IF EXISTS check_project_belongs_to_client;

-- Modify the constraint to handle optional relationships
CREATE OR REPLACE FUNCTION check_project_belongs_to_client()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check if both client_id and project_id are provided
  IF NEW.project_id IS NOT NULL AND NEW.client_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = NEW.project_id
      AND p.client_id = NEW.client_id
    ) THEN
      RAISE EXCEPTION 'Project must belong to the selected client';
    END IF;
  END IF;
  
  -- If project_id is set but client_id is null, raise an error
  IF NEW.project_id IS NOT NULL AND NEW.client_id IS NULL THEN
    RAISE EXCEPTION 'Cannot assign a project without a client';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER ensure_project_client_match
  BEFORE INSERT OR UPDATE ON public.recurring_tasks
  FOR EACH ROW
  EXECUTE FUNCTION check_project_belongs_to_client();