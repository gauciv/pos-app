-- ============================================================
-- Extend notification triggers to also notify admin users
-- Add new trigger for new order notifications to admins
-- ============================================================

-- 1. Replace order status trigger to ALSO notify admins
create or replace function public.notify_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
  v_body  text;
  v_collector_body text;
  v_admin_body text;
  v_collector_name text;
begin
  if OLD.status is distinct from NEW.status then
    -- Get collector name for admin notification
    select coalesce(nickname, full_name, 'Unknown')
    into v_collector_name
    from public.profiles
    where id = NEW.collector_id;

    v_title := 'Order ' || NEW.order_number;

    -- Collector-facing body
    v_collector_body := case NEW.status
      when 'confirmed'  then 'Your order has been confirmed by the admin.'
      when 'processing' then 'Your order is now being processed.'
      when 'completed'  then 'Your order has been completed successfully.'
      when 'cancelled'  then 'Your order has been cancelled.'
      else 'Your order status changed to ' || NEW.status || '.'
    end;

    -- Admin-facing body
    v_admin_body := case NEW.status
      when 'confirmed'  then 'Order confirmed — submitted by ' || v_collector_name || '.'
      when 'processing' then 'Order is now being processed — collector: ' || v_collector_name || '.'
      when 'completed'  then 'Order completed — collector: ' || v_collector_name || '.'
      when 'cancelled'  then 'Order cancelled — collector: ' || v_collector_name || '.'
      else 'Order status changed to ' || NEW.status || ' — collector: ' || v_collector_name || '.'
    end;

    -- Notify the collector
    insert into public.notifications (user_id, type, title, body, data)
    values (
      NEW.collector_id,
      'order_status_changed',
      v_title,
      v_collector_body,
      jsonb_build_object(
        'order_id',     NEW.id,
        'order_number', NEW.order_number,
        'status',       NEW.status,
        'store_id',     NEW.store_id
      )
    );

    -- Notify all admins
    insert into public.notifications (user_id, type, title, body, data)
    select
      p.id,
      'order_status_changed',
      v_title,
      v_admin_body,
      jsonb_build_object(
        'order_id',     NEW.id,
        'order_number', NEW.order_number,
        'status',       NEW.status,
        'store_id',     NEW.store_id,
        'collector',    v_collector_name
      )
    from public.profiles p
    where p.role = 'admin'
      and p.is_active = true;
  end if;
  return NEW;
end;
$$;

-- 2. New trigger: notify admins when a NEW order is created
create or replace function public.notify_new_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_collector_name text;
  v_store_name text;
begin
  -- Get collector name
  select coalesce(nickname, full_name, 'Unknown')
  into v_collector_name
  from public.profiles
  where id = NEW.collector_id;

  -- Get store name
  select coalesce(name, 'Unknown store')
  into v_store_name
  from public.stores
  where id = NEW.store_id;

  -- Notify all admins about new order
  insert into public.notifications (user_id, type, title, body, data)
  select
    p.id,
    'new_order',
    'New order: ' || NEW.order_number,
    v_collector_name || ' submitted an order at ' || v_store_name || '.',
    jsonb_build_object(
      'order_id',     NEW.id,
      'order_number', NEW.order_number,
      'store_id',     NEW.store_id,
      'store_name',   v_store_name,
      'collector',    v_collector_name,
      'total',        NEW.total_amount
    )
  from public.profiles p
  where p.role = 'admin'
    and p.is_active = true;

  return NEW;
end;
$$;

create trigger trg_notify_new_order
  after insert on public.orders
  for each row execute function public.notify_new_order();

-- 3. Replace product change trigger to ALSO notify admins
create or replace function public.notify_product_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type  text;
  v_title text;
  v_body  text;
begin
  -- Out of stock (stock hits 0)
  if NEW.stock_quantity = 0 and OLD.stock_quantity > 0 then
    v_type  := 'out_of_stock';
    v_title := NEW.name || ' is out of stock';
    v_body  := 'Stock has reached 0 and can no longer be ordered.';

  -- Low stock transition (drops into <=10 zone)
  elsif NEW.stock_quantity <= 10
    and OLD.stock_quantity > 10
    and NEW.stock_quantity > 0 then
    v_type  := 'low_stock';
    v_title := NEW.name || ' is running low';
    v_body  := 'Only ' || NEW.stock_quantity || ' unit(s) remaining.';

  -- Price change
  elsif NEW.price is distinct from OLD.price then
    v_type  := 'price_changed';
    v_title := NEW.name || ' — price updated';
    v_body  := 'Price changed from ₱' || OLD.price || ' to ₱' || NEW.price || '.';

  else
    return NEW;
  end if;

  -- Notify all active collectors AND admins
  insert into public.notifications (user_id, type, title, body, data)
  select
    p.id,
    v_type,
    v_title,
    v_body,
    jsonb_build_object(
      'product_id',   NEW.id,
      'product_name', NEW.name
    )
  from public.profiles p
  where p.is_active = true
    and p.role in ('collector', 'admin');

  return NEW;
end;
$$;

-- 4. Replace new product trigger to ALSO notify admins
create or replace function public.notify_new_product()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, body, data)
  select
    p.id,
    'new_product',
    'New product: ' || NEW.name,
    'A new product has been added to the catalog.',
    jsonb_build_object(
      'product_id',   NEW.id,
      'product_name', NEW.name
    )
  from public.profiles p
  where p.is_active = true
    and p.role in ('collector', 'admin');

  return NEW;
end;
$$;
