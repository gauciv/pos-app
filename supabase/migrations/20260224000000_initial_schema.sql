-- Supabase SQL Migration
-- Run this in the Supabase SQL Editor to set up the database schema

-- ============================================
-- 1. Create tables
-- ============================================

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null default 'collector' check (role in ('collector', 'admin')),
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Stores (client locations)
create table public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  contact_name text,
  contact_phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  sku text unique,
  category_id uuid references public.categories(id),
  price numeric(10,2) not null,
  stock_quantity integer not null default 0,
  unit text not null default 'unit',
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  collector_id uuid not null references public.profiles(id),
  store_id uuid not null references public.stores(id),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'completed', 'cancelled')),
  subtotal numeric(12,2) not null,
  tax_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Order items
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  line_total numeric(12,2) not null,
  created_at timestamptz not null default now()
);

-- Inventory logs
create table public.inventory_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id),
  change_amount integer not null,
  reason text not null,
  reference_id uuid,
  performed_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ============================================
-- 2. Indexes
-- ============================================

create index idx_products_category on public.products(category_id);
create index idx_products_active on public.products(is_active);
create index idx_orders_collector on public.orders(collector_id);
create index idx_orders_store on public.orders(store_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_created on public.orders(created_at desc);
create index idx_order_items_order on public.order_items(order_id);
create index idx_inventory_logs_product on public.inventory_logs(product_id);

-- ============================================
-- 3. Functions and triggers
-- ============================================

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'collector')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.stores
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.products
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.orders
  for each row execute function public.update_updated_at();

-- Generate sequential order number
create or replace function public.generate_order_number()
returns text as $$
declare
  today text;
  seq integer;
begin
  today := to_char(now(), 'YYYYMMDD');
  select count(*) + 1 into seq
  from public.orders
  where order_number like 'ORD-' || today || '-%';
  return 'ORD-' || today || '-' || lpad(seq::text, 4, '0');
end;
$$ language plpgsql;

-- Atomic order creation function
create or replace function public.create_order(
  p_collector_id uuid,
  p_store_id uuid,
  p_notes text,
  p_items jsonb
)
returns jsonb as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(12,2) := 0;
  v_total numeric(12,2) := 0;
  v_item jsonb;
  v_product record;
  v_line_total numeric(12,2);
begin
  -- Generate order number
  v_order_number := public.generate_order_number();

  -- Validate all items and calculate totals
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product
    from public.products
    where id = (v_item->>'product_id')::uuid
      and is_active = true
    for update;

    if not found then
      raise exception 'Product % not found or inactive', v_item->>'product_id';
    end if;

    if v_product.stock_quantity < (v_item->>'quantity')::integer then
      raise exception 'Insufficient stock for product %: available %, requested %',
        v_product.name, v_product.stock_quantity, v_item->>'quantity';
    end if;

    v_line_total := v_product.price * (v_item->>'quantity')::integer;
    v_subtotal := v_subtotal + v_line_total;
  end loop;

  v_total := v_subtotal;

  -- Create the order
  insert into public.orders (id, order_number, collector_id, store_id, status, subtotal, tax_amount, total_amount, notes)
  values (gen_random_uuid(), v_order_number, p_collector_id, p_store_id, 'pending', v_subtotal, 0, v_total, p_notes)
  returning id into v_order_id;

  -- Create order items and deduct stock
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product
    from public.products
    where id = (v_item->>'product_id')::uuid;

    v_line_total := v_product.price * (v_item->>'quantity')::integer;

    -- Insert order item
    insert into public.order_items (order_id, product_id, product_name, quantity, unit_price, line_total)
    values (v_order_id, v_product.id, v_product.name, (v_item->>'quantity')::integer, v_product.price, v_line_total);

    -- Deduct stock
    update public.products
    set stock_quantity = stock_quantity - (v_item->>'quantity')::integer
    where id = v_product.id;

    -- Log inventory change
    insert into public.inventory_logs (product_id, change_amount, reason, reference_id, performed_by)
    values (v_product.id, -(v_item->>'quantity')::integer, 'order', v_order_id, p_collector_id);
  end loop;

  return jsonb_build_object('order_id', v_order_id, 'order_number', v_order_number);
end;
$$ language plpgsql security definer;

-- ============================================
-- 4. Admin role helper (SECURITY DEFINER to avoid RLS recursion)
-- ============================================

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- ============================================
-- 5. Row Level Security
-- ============================================

alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inventory_logs enable row level security;

-- Profiles policies
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin());

-- Stores policies
create policy "Authenticated users can read active stores"
  on public.stores for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage stores"
  on public.stores for all
  using (public.is_admin());

-- Categories policies
create policy "Authenticated users can read categories"
  on public.categories for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage categories"
  on public.categories for all
  using (public.is_admin());

-- Products policies
create policy "Authenticated users can read active products"
  on public.products for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage products"
  on public.products for all
  using (public.is_admin());

-- Orders policies
create policy "Collectors can read own orders"
  on public.orders for select
  using (collector_id = auth.uid());

create policy "Admins can read all orders"
  on public.orders for select
  using (public.is_admin());

create policy "Collectors can create orders"
  on public.orders for insert
  with check (collector_id = auth.uid());

create policy "Admins can update orders"
  on public.orders for update
  using (public.is_admin());

-- Order items policies
create policy "Users can read order items for their orders"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and (orders.collector_id = auth.uid() or public.is_admin())
    )
  );

create policy "Collectors can insert order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.collector_id = auth.uid()
    )
  );

-- Inventory logs policies
create policy "Admins can read inventory logs"
  on public.inventory_logs for select
  using (public.is_admin());

-- ============================================
-- 6. Enable Realtime
-- ============================================

alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.products;
