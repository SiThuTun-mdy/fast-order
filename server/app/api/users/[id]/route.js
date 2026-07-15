import supabaseAdmin from '../../../../lib/supabaseAdmin';
import { mapAppUser } from '../../../../lib/mappers';
import { verifyAuth, requirePermission, assertTenantAccess, AuthError } from '../../../../lib/auth';

const APP_USER_COLUMNS = 'id, username, restaurant_id, user_role(role(role_name))';

async function loadOwningRestaurant(id) {
  return supabaseAdmin.from('app_user').select('restaurant_id').eq('id', id).single();
}

export async function PATCH(request, { params }) {
  const { id } = await params;

  try {
    const payload = verifyAuth(request);
    requirePermission(payload, 'user.manage');
    const { data: existing, error: lookupError } = await loadOwningRestaurant(id);
    if (lookupError) return Response.json({ message: 'User not found' }, { status: 404 });
    assertTenantAccess(payload, existing.restaurant_id);
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ message: err.message }, { status: err.status });
    throw err;
  }

  const { username, password, roleNames } = await request.json();

  if (username !== undefined) {
    const { error } = await supabaseAdmin.from('app_user').update({ username }).eq('id', id);
    if (error) return Response.json({ message: error.message }, { status: 500 });
  }

  // Empty/omitted password means "leave unchanged" — hashing stays in
  // Postgres via the `hash_password` RPC, consistent with `create_app_user`.
  if (password) {
    const { data: hash, error: hashError } = await supabaseAdmin.rpc('hash_password', { p_password: password });
    if (hashError) return Response.json({ message: hashError.message }, { status: 500 });
    const { error } = await supabaseAdmin.from('app_user').update({ password: hash }).eq('id', id);
    if (error) return Response.json({ message: error.message }, { status: 500 });
  }

  if (roleNames !== undefined) {
    const { error: deleteError } = await supabaseAdmin.from('user_role').delete().eq('user_id', id);
    if (deleteError) return Response.json({ message: deleteError.message }, { status: 500 });

    if (roleNames.length > 0) {
      const { data: roles, error: rolesError } = await supabaseAdmin
        .from('role')
        .select('id, role_name')
        .in('role_name', roleNames);
      if (rolesError) return Response.json({ message: rolesError.message }, { status: 500 });
      if (roles.length !== roleNames.length) {
        return Response.json({ message: 'One or more roles not found' }, { status: 400 });
      }

      const { error: insertError } = await supabaseAdmin
        .from('user_role')
        .insert(roles.map((role) => ({ user_id: id, role_id: role.id })));
      if (insertError) return Response.json({ message: insertError.message }, { status: 500 });
    }
  }

  const { data, error } = await supabaseAdmin.from('app_user').select(APP_USER_COLUMNS).eq('id', id).single();
  if (error) return Response.json({ message: 'User not found' }, { status: 404 });
  return Response.json(mapAppUser(data));
}

// Deleting a user cascades to its `user_role` rows via `on delete cascade`.
export async function DELETE(request, { params }) {
  const { id } = await params;

  try {
    const payload = verifyAuth(request);
    requirePermission(payload, 'user.manage');
    const { data: existing, error: lookupError } = await loadOwningRestaurant(id);
    if (lookupError) return Response.json({ message: 'User not found' }, { status: 404 });
    assertTenantAccess(payload, existing.restaurant_id);
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ message: err.message }, { status: err.status });
    throw err;
  }

  const { error } = await supabaseAdmin.from('app_user').delete().eq('id', id);
  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json({ message: 'Deleted' });
}
