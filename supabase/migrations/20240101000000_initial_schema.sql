-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create users table
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text not null,
  role text not null check (role in ('admin', 'user')),
  avatar_url text,
  created_at timestamptz default now() not null
);

-- Create tasks table for both todo and completed tasks
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  content text not null,
  completed boolean default false,
  completed_at timestamptz,
  time text,
  tags text[] default array[]::text[],
  created_at timestamptz default now() not null
);

-- Create recurring tasks table
create table if not exists public.recurring_tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  time text,
  tags text[] default array[]::text[],
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly')),
  week_day integer check (week_day between 0 and 6),
  month_day integer check (month_day between 1 and 31),
  created_at timestamptz default now() not null
);

-- Create clients table (optional)
create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  emoji text not null,
  color text not null,
  tags text[] default array[]::text[],
  created_at timestamptz default now() not null
);

-- Create projects table (optional)
create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id) on delete cascade not null,
  name text not null,
  description text,
  created_at timestamptz default now() not null
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.tasks enable row level security;
alter table public.recurring_tasks enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;

-- Create RLS policies
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

create policy "Users can view own recurring tasks"
  on public.recurring_tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own recurring tasks"
  on public.recurring_tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own recurring tasks"
  on public.recurring_tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own recurring tasks"
  on public.recurring_tasks for delete
  using (auth.uid() = user_id);

create policy "Users can view own clients"
  on public.clients for select
  using (auth.uid() = user_id);

create policy "Users can insert own clients"
  on public.clients for insert
  with check (auth.uid() = user_id);

create policy "Users can update own clients"
  on public.clients for update
  using (auth.uid() = user_id);

create policy "Users can delete own clients"
  on public.clients for delete
  using (auth.uid() = user_id);

create policy "Users can view projects of own clients"
  on public.projects for select
  using (
    exists (
      select 1 from public.clients
      where clients.id = client_id
      and clients.user_id = auth.uid()
    )
  );

create policy "Users can insert projects to own clients"
  on public.projects for insert
  with check (
    exists (
      select 1 from public.clients
      where clients.id = client_id
      and clients.user_id = auth.uid()
    )
  );

create policy "Users can update projects of own clients"
  on public.projects for update
  using (
    exists (
      select 1 from public.clients
      where clients.id = client_id
      and clients.user_id = auth.uid()
    )
  );

create policy "Users can delete projects of own clients"
  on public.projects for delete
  using (
    exists (
      select 1 from public.clients
      where clients.id = client_id
      and clients.user_id = auth.uid()
    )
  );

-- Create function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
security definer set search_path = public
language plpgsql
as $$
begin
  insert into public.users (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'user'
  );
  return new;
end;
$$;

-- Create trigger for new user creation
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();