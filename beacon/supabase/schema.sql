-- Beacon — Supabase schema
-- Run this once in your Supabase project: SQL Editor -> New query -> paste -> Run.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------
-- Projects
-- ---------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#2c5f8a',
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Users manage their own projects"
  on public.projects
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists projects_user_idx on public.projects (user_id);

-- ---------------------------------------------------------------
-- Tasks
-- ---------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  notes text,
  due_date date,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'done')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "Users manage their own tasks"
  on public.tasks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists tasks_user_due_idx on public.tasks (user_id, due_date);
create index if not exists tasks_user_project_idx on public.tasks (user_id, project_id);
create index if not exists tasks_user_status_idx on public.tasks (user_id, status);

-- Keep updated_at current on every edit.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();
