import supabaseAdmin from '../../../../lib/supabaseAdmin';
import { mapMenuItem } from '../../../../lib/mappers';
import { verifyAuth, requirePermission, assertTenantAccess, AuthError } from '../../../../lib/auth';

async function loadOwningRestaurant(id) {
  return supabaseAdmin.from('menu').select('restaurant_id').eq('id', id).single();
}

export async function PATCH(request, { params }) {
  const { id } = await params;

  try {
    const payload = verifyAuth(request);
    requirePermission(payload, 'menu.manage');
    const { data: existing, error: lookupError } = await loadOwningRestaurant(id);
    if (lookupError) return Response.json({ message: 'Menu item not found' }, { status: 404 });
    assertTenantAccess(payload, existing.restaurant_id);
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ message: err.message }, { status: err.status });
    throw err;
  }

  const { name, category, price, description, emoji, popular } = await request.json();
  const patch = {};
  if (name !== undefined) patch.name = name;
  if (category !== undefined) patch.category_id = category;
  if (price !== undefined) patch.unit_price = price;
  if (description !== undefined) patch.description = description;
  if (emoji !== undefined) patch.emoji = emoji;
  if (popular !== undefined) patch.popular = popular;

  const { data, error } = await supabaseAdmin.from('menu').update(patch).eq('id', id).select().single();
  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json(mapMenuItem(data));
}

// menu is referenced by order_item.menu_id (on delete restrict) — deleting a
// menu item that appears on an existing order raises Postgres error 23503.
export async function DELETE(request, { params }) {
  const { id } = await params;

  try {
    const payload = verifyAuth(request);
    requirePermission(payload, 'menu.manage');
    const { data: existing, error: lookupError } = await loadOwningRestaurant(id);
    if (lookupError) return Response.json({ message: 'Menu item not found' }, { status: 404 });
    assertTenantAccess(payload, existing.restaurant_id);
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ message: err.message }, { status: err.status });
    throw err;
  }

  const { error } = await supabaseAdmin.from('menu').delete().eq('id', id);
  if (error) {
    if (error.code === '23503') {
      return Response.json({ message: 'Cannot delete: this item has existing orders' }, { status: 409 });
    }
    return Response.json({ message: error.message }, { status: 500 });
  }
  return Response.json({ message: 'Deleted' });
}
