-- Create branches table
create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  location text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.branches
  for each row execute function public.update_updated_at();

alter table public.branches enable row level security;

create policy "Admins can manage branches"
  on public.branches for all
  using (public.is_admin());

create policy "Authenticated users can read branches"
  on public.branches for select
  using (auth.role() = 'authenticated');

-- Add new columns to profiles for branch-based collector management
alter table public.profiles add column if not exists nickname text;
alter table public.profiles add column if not exists display_id text unique;
alter table public.profiles add column if not exists branch_id uuid references public.branches(id);
alter table public.profiles add column if not exists tag text;

create index if not exists idx_profiles_branch on public.profiles(branch_id);
