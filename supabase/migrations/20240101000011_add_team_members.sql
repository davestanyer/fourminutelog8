-- Create team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_owner_id, member_id)
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Policies for team_members table
CREATE POLICY "Users can view their team members"
  ON public.team_members
  FOR SELECT
  USING (auth.uid() = team_owner_id OR auth.uid() = member_id);

CREATE POLICY "Users can add team members"
  ON public.team_members
  FOR INSERT
  WITH CHECK (auth.uid() = team_owner_id);

CREATE POLICY "Users can update their team members"
  ON public.team_members
  FOR UPDATE
  USING (auth.uid() = team_owner_id);

CREATE POLICY "Users can remove team members"
  ON public.team_members
  FOR DELETE
  USING (auth.uid() = team_owner_id);

-- Create function to check if user exists before adding to team
CREATE OR REPLACE FUNCTION public.add_team_member(
  member_email TEXT,
  member_role TEXT DEFAULT 'member'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_user_id UUID;
  team_member_record RECORD;
BEGIN
  -- Check if user exists
  SELECT id INTO found_user_id
  FROM public.users
  WHERE email = member_email;

  IF found_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User not found'
    );
  END IF;

  -- Check if user is already a team member
  IF EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_owner_id = auth.uid()
    AND member_id = found_user_id
  ) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User is already a team member'
    );
  END IF;

  -- Add user to team
  INSERT INTO public.team_members (team_owner_id, member_id, role)
  VALUES (auth.uid(), found_user_id, member_role)
  RETURNING * INTO team_member_record;

  RETURN json_build_object(
    'success', true,
    'data', team_member_record
  );
END;
$$;