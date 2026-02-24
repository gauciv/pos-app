-- Fix: Recursive RLS policies causing 500 errors
-- The admin policies on profiles queried profiles itself, causing infinite recursion.
-- This migration creates a SECURITY DEFINER function that bypasses RLS to check admin role,
-- then replaces all recursive policies with calls to this function.

-- ============================================
-- 1. Create is_admin() helper function
-- ============================================

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- ============================================
-- 2. Fix profiles policies (was self-referencing)
-- ============================================

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin());

-- ============================================
-- 3. Fix other table policies (were querying profiles with RLS)
-- ============================================

-- Stores
drop policy if exists "Admins can manage stores" on public.stores;
create policy "Admins can manage stores"
  on public.stores for all
  using (public.is_admin());

-- Categories
drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories"
  on public.categories for all
  using (public.is_admin());

-- Products
drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products"
  on public.products for all
  using (public.is_admin());

-- Orders
drop policy if exists "Admins can read all orders" on public.orders;
create policy "Admins can read all orders"
  on public.orders for select
  using (public.is_admin());

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
  on public.orders for update
  using (public.is_admin());

-- Order items
drop policy if exists "Users can read order items for their orders" on public.order_items;
create policy "Users can read order items for their orders"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and (orders.collector_id = auth.uid() or public.is_admin())
    )
  );

-- Inventory logs
drop policy if exists "Admins can read inventory logs" on public.inventory_logs;
create policy "Admins can read inventory logs"
  on public.inventory_logs for select
  using (public.is_admin());
