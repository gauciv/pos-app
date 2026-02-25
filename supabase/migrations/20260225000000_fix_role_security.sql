-- Fix: Prevent client-side role manipulation in signup
-- The trigger now only allows 'admin' role during bootstrap (when no admins exist yet).
-- After the first admin exists, all signups default to 'collector'.
-- New admins must be promoted by existing admins through the Users page.
--
-- Run this in the Supabase SQL Editor.

create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_role text := 'collector';
  v_admin_count integer;
begin
  -- Bootstrap: allow first admin signup only when no admins exist yet
  if coalesce(new.raw_user_meta_data->>'role', '') = 'admin' then
    select count(*) into v_admin_count from public.profiles where role = 'admin';
    if v_admin_count = 0 then
      v_role := 'admin';
    end if;
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    v_role
  );
  return new;
end;
$$ language plpgsql security definer;
