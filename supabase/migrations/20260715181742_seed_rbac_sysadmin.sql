-- RBAC seed data: permissions, SysAdmin role, and a sysadmin user --------
-- Fills in the RBAC scaffolding from the init migration (previously
-- structural-only, nothing reads/writes these tables yet).

insert into permission (permission_name) values
  ('order.manage'),
  ('order.update'),
  ('user.manage'),
  ('tenant.manage');

insert into role (role_name) values
  ('SysAdmin');

insert into role_permission (role_id, permission_id)
select (select id from role where role_name = 'SysAdmin'), id
from permission
where permission_name in ('order.manage', 'order.update', 'user.manage', 'tenant.manage');

-- Password hashed with pgcrypto's bcrypt (extensions.gen_salt('bf'));
-- Supabase installs pgcrypto into the `extensions` schema, not `public`,
-- so the functions must be schema-qualified. This is scaffolding only —
-- no login flow reads app_user/password yet.
insert into app_user (username, password) values
  ('sysadmin', extensions.crypt('SysAdmin', extensions.gen_salt('bf')));

insert into user_role (user_id, role_id)
select
  (select id from app_user where username = 'sysadmin'),
  (select id from role where role_name = 'SysAdmin');
