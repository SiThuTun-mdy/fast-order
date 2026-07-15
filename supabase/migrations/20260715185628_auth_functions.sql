-- Auth RPCs backing the new custom login flow ------------------------------
-- These operate on the RBAC scaffolding (app_user/role/permission/user_role/
-- role_permission) seeded earlier. All three are SECURITY INVOKER (default)
-- and only ever called by the backend via the service_role client, which
-- already bypasses RLS — explicitly revoking from anon/authenticated stops
-- any other path from ever calling these with raw credentials.

-- login: verifies username+password, returns the user plus aggregated
-- role/permission names, or an empty result set for both "no such user" and
-- "wrong password" so the caller can't distinguish the two (no enumeration).
create or replace function login(p_username text, p_password text)
returns table (
  id            uuid,
  username      text,
  restaurant_id uuid,
  roles         text[],
  permissions   text[]
)
language plpgsql
as $$
declare
  v_user app_user%rowtype;
begin
  select * into v_user from app_user au where au.username = p_username;

  if v_user.id is null or v_user.password <> extensions.crypt(p_password, v_user.password) then
    return;
  end if;

  return query
  select
    v_user.id,
    v_user.username,
    v_user.restaurant_id,
    array(
      select r.role_name
      from user_role ur
      join role r on r.id = ur.role_id
      where ur.user_id = v_user.id
    ),
    array(
      select distinct p.permission_name
      from user_role ur
      join role_permission rp on rp.role_id = ur.role_id
      join permission p on p.id = rp.permission_id
      where ur.user_id = v_user.id
    );
end;
$$;

revoke all on function login(text, text) from public;
grant execute on function login(text, text) to service_role;

-- create_app_user: atomic insert of app_user + one user_role row per name.
-- An unknown role name raises, rolling back the whole function body
-- (plpgsql wraps it in an implicit transaction) so no orphan user is left.
create or replace function create_app_user(
  p_username text,
  p_password text,
  p_restaurant_id uuid,
  p_role_names text[]
)
returns app_user
language plpgsql
as $$
declare
  v_user      app_user%rowtype;
  v_role_name text;
  v_role_id   integer;
begin
  insert into app_user (username, password, restaurant_id)
  values (p_username, extensions.crypt(p_password, extensions.gen_salt('bf')), p_restaurant_id)
  returning * into v_user;

  foreach v_role_name in array p_role_names loop
    select id into v_role_id from role where role_name = v_role_name;
    if v_role_id is null then
      raise exception 'Unknown role: %', v_role_name;
    end if;
    insert into user_role (user_id, role_id) values (v_user.id, v_role_id);
  end loop;

  return v_user;
end;
$$;

revoke all on function create_app_user(text, text, uuid, text[]) from public;
grant execute on function create_app_user(text, text, uuid, text[]) to service_role;

-- hash_password: shared bcrypt helper for the password-reset path in
-- PATCH /api/users/:id, so hashing logic lives in one place.
create or replace function hash_password(p_password text)
returns text
language sql
as $$
  select extensions.crypt(p_password, extensions.gen_salt('bf'));
$$;

revoke all on function hash_password(text) from public;
grant execute on function hash_password(text) to service_role;
