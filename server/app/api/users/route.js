import supabaseAdmin from '../../../lib/supabaseAdmin';
import { mapAppUser } from '../../../lib/mappers';
import { verifyAuth, requirePermission, requireRole, assertTenantAccess, AuthError } from '../../../lib/auth';

// Explicit column list (never `select('*')`) so `password` can never leak
// here even if `mapAppUser` were ever changed carelessly — defense in depth.
const APP_USER_COLUMNS = 'id, username, restaurant_id, user_role(role(role_name))';

export async function GET(request) {
  const restaurantId = new URL(request.url).searchParams.get('restaurantId');

  try {
    const payload = verifyAuth(request);
    requirePermission(payload, 'user.manage');
    // Omitting restaurantId means "list every tenant's users" — only
    // SysAdmin may do that; a tenant Admin must always scope the call.
    if (restaurantId) assertTenantAccess(payload, restaurantId);
    else requireRole(payload, 'SysAdmin');
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ message: err.message }, { status: err.status });
    throw err;
  }

  let query = supabaseAdmin.from('app_user').select(APP_USER_COLUMNS).order('username');
  if (restaurantId) query = query.eq('restaurant_id', restaurantId);

  const { data, error } = await query;
  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json(data.map(mapAppUser));
}

// Delegates to the `create_app_user` Postgres RPC: one atomic transaction
// that hashes the password and assigns every role in one go, instead of two
// separate client-driven inserts that could leave an orphan user on failure.
export async function POST(request) {
  const { username, password, restaurantId, roleNames } = await request.json();

  try {
    const payload = verifyAuth(request);
    requirePermission(payload, 'user.manage');
    assertTenantAccess(payload, restaurantId);
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ message: err.message }, { status: err.status });
    throw err;
  }

  const { data, error } = await supabaseAdmin
    .rpc('create_app_user', {
      p_username: username,
      p_password: password,
      p_restaurant_id: restaurantId,
      p_role_names: roleNames ?? [],
    })
    .single();
  if (error) {
    // 23505 = unique_violation on app_user.username — surfaced as a 409 with
    // a message the create-user form can show as-is, instead of leaking the
    // raw "duplicate key value violates constraint app_user_username_key" text.
    if (error.code === '23505') {
      return Response.json({ message: 'Username already exists' }, { status: 409 });
    }
    return Response.json({ message: error.message }, { status: 500 });
  }

  // Built from known-good inputs rather than `data` (the RPC's `app_user`
  // return type carries the password hash) — this response never touches it.
  return Response.json(
    { id: data.id, username: data.username, restaurantId: data.restaurant_id, roles: roleNames ?? [] },
    { status: 201 }
  );
}
