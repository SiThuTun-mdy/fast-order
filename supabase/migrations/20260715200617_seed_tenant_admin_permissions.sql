-- Tenant Admin permissions ---------------------------------------------------
-- The Admin role was seeded with zero permissions (seed.sql). This grants it
-- the ability to manage its own tenant's staff, menu, and categories —
-- NOT tenant.manage, which stays SysAdmin-only (Admins can't create/delete
-- restaurants).

insert into permission (permission_name) values
  ('menu.manage'),
  ('category.manage');

insert into role_permission (role_id, permission_id)
select (select id from role where role_name = 'Admin'), id
from permission
where permission_name in ('user.manage', 'menu.manage', 'category.manage')
on conflict (role_id, permission_id) do nothing;
