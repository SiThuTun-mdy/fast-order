-- Adds a 'canceled' terminal status so the cashier can reject a pending-payment
-- order instead of only advancing it to the kitchen.

insert into order_status (id, label, sort_order) values
  ('canceled', 'Canceled', 4);

create or replace function enforce_order_status_transition()
returns trigger language plpgsql as $$
begin
  if new.status is distinct from old.status then
    if not (
      (old.status = 'confirmed' and new.status = 'kitchen') or
      (old.status = 'kitchen'   and new.status = 'ready') or
      (old.status = 'confirmed' and new.status = 'canceled')
    ) then
      raise exception 'Invalid order status transition: % -> %', old.status, new.status;
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
