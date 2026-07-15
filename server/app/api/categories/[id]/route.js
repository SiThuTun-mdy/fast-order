import supabaseAdmin from '../../../../lib/supabaseAdmin';
import { mapCategory } from '../../../../lib/mappers';
import { verifyAuth, requirePermission, assertTenantAccess, AuthError } from '../../../../lib/auth';

async function loadOwningRestaurant(id) {
  return supabaseAdmin.from('category').select('restaurant_id').eq('id', id).single();
}

// id (the slug) is immutable once created — not accepted in the patch body.
export async function PATCH(request, { params }) {
  const { id } = await params;

  try {
    const payload = verifyAuth(request);
    requirePermission(payload, 'category.manage');
    const { data: existing, error: lookupError } = await loadOwningRestaurant(id);
    if (lookupError) return Response.json({ message: 'Category not found' }, { status: 404 });
    assertTenantAccess(payload, existing.restaurant_id);
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ message: err.message }, { status: err.status });
    throw err;
  }

  const { name, icon, sortOrder } = await request.json();
  const patch = {};
  if (name !== undefined) patch.name = name;
  if (icon !== undefined) patch.icon = icon;
  if (sortOrder !== undefined) patch.sort_order = sortOrder;

  const { data, error } = await supabaseAdmin.from('category').update(patch).eq('id', id).select().single();
  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json(mapCategory(data));
}

// category is referenced by menu.category_id (on delete restrict) — deleting
// a category that still has menu items raises Postgres error 23503.
export async function DELETE(request, { params }) {
  const { id } = await params;

  try {
    const payload = verifyAuth(request);
    requirePermission(payload, 'category.manage');
    const { data: existing, error: lookupError } = await loadOwningRestaurant(id);
    if (lookupError) return Response.json({ message: 'Category not found' }, { status: 404 });
    assertTenantAccess(payload, existing.restaurant_id);
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ message: err.message }, { status: err.status });
    throw err;
  }

  const { error } = await supabaseAdmin.from('category').delete().eq('id', id);
  if (error) {
    if (error.code === '23503') {
      return Response.json({ message: 'Cannot delete: this category still has menu items' }, { status: 409 });
    }
    return Response.json({ message: error.message }, { status: 500 });
  }
  return Response.json({ message: 'Deleted' });
}
