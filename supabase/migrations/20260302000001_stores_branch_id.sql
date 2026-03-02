-- Add branch_id to stores for deterministic branch-to-store mapping
alter table public.stores add column if not exists branch_id uuid references public.branches(id);
create index if not exists idx_stores_branch on public.stores(branch_id);
