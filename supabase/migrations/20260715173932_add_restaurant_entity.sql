-- Restaurant: top-level tenant entity ---------------------------------------
-- One restaurant owns many users (staff) and many rows of every application
-- entity (category, menu, customer, orders, order_item).

create table restaurant (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  address    text,
  phone      text,
  created_at timestamptz not null default now()
);

-- Seed the single existing restaurant with a fixed id so existing rows can be
-- backfilled deterministically and column defaults keep current insert paths
-- (create_order RPC, seeds) working unchanged.
insert into restaurant (id, name) values
  ('00000000-0000-0000-0000-000000000001', 'QuickBite');

-- One restaurant -> many users (staff) ---------------------------------------

alter table app_user
  add column restaurant_id uuid not null
    default '00000000-0000-0000-0000-000000000001'
    references restaurant(id) on delete cascade;
create index app_user_restaurant_id_idx on app_user(restaurant_id);

-- One restaurant -> many rows of each application entity ---------------------
-- The default backfills existing rows and keeps single-tenant inserts working;
-- drop the defaults when the app becomes truly multi-restaurant.

alter table category
  add column restaurant_id uuid not null
    default '00000000-0000-0000-0000-000000000001'
    references restaurant(id) on delete cascade;
create index category_restaurant_id_idx on category(restaurant_id);

alter table menu
  add column restaurant_id uuid not null
    default '00000000-0000-0000-0000-000000000001'
    references restaurant(id) on delete cascade;
create index menu_restaurant_id_idx on menu(restaurant_id);

alter table customer
  add column restaurant_id uuid not null
    default '00000000-0000-0000-0000-000000000001'
    references restaurant(id) on delete cascade;
create index customer_restaurant_id_idx on customer(restaurant_id);

alter table orders
  add column restaurant_id uuid not null
    default '00000000-0000-0000-0000-000000000001'
    references restaurant(id) on delete cascade;
create index orders_restaurant_id_idx on orders(restaurant_id);

-- Denormalized onto order_item (also derivable via orders) so per-restaurant
-- RLS/reporting never needs a join.
alter table order_item
  add column restaurant_id uuid not null
    default '00000000-0000-0000-0000-000000000001'
    references restaurant(id) on delete cascade;
create index order_item_restaurant_id_idx on order_item(restaurant_id);

-- order_status / order_type stay global lookup tables: they describe the
-- order lifecycle, not per-restaurant data.

-- Row Level Security ----------------------------------------------------------

alter table restaurant enable row level security;
create policy "restaurant public read" on restaurant
  for select to anon, authenticated using (true);
