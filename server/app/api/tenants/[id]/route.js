import supabaseAdmin from '../../../../lib/supabaseAdmin';
import { mapRestaurant } from '../../../../lib/mappers';
import { verifyAuth, requireRole, requirePermission, AuthError } from '../../../../lib/auth';

export async function GET(request, { params }) {
  try {
    verifyAuth(request);
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ message: err.message }, { status: err.status });
    throw err;
  }

  const { id } = await params;
  const { data, error } = await supabaseAdmin.from('restaurant').select('*').eq('id', id).single();
  if (error) return Response.json({ message: 'Tenant not found' }, { status: 404 });
  return Response.json(mapRestaurant(data));
}

export async function PATCH(request, { params }) {
  try {
    requireRole(verifyAuth(request), 'SysAdmin');
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ message: err.message }, { status: err.status });
    throw err;
  }

  const { id } = await params;
  const patch = await request.json();
  const { data, error } = await supabaseAdmin
    .from('restaurant')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json(mapRestaurant(data));
}

// Deleting a restaurant cascades (via `on delete cascade` FKs) through
// category/menu/customer/orders/order_item/app_user — no manual cleanup here.
export async function DELETE(request, { params }) {
  try {
    requirePermission(verifyAuth(request), 'tenant.manage');
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ message: err.message }, { status: err.status });
    throw err;
  }

  const { id } = await params;
  const { error } = await supabaseAdmin.from('restaurant').delete().eq('id', id);
  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json({ message: 'Deleted' });
}
