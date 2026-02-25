-- Add display_id column to branches (immutable unique identifier)
alter table public.branches add column if not exists display_id text unique;
