-- Add signature label fields to company_profile
alter table public.company_profile
  add column if not exists prepared_by text,
  add column if not exists received_by text;
