import supabaseAdmin from '../../../lib/supabaseAdmin';
import { mapCategory } from '../../../lib/mappers';
import { verifyAuth, requirePermission, assertTenantAccess, AuthError } from '../../../lib/auth';

// GET stays fully public/unauthenticated — the customer-facing MenuPage
// relies on this. The synthetic "All Items" entry only makes sense for that
// unscoped, customer-facing view, so it's skipped when an admin scopes the
// call to a single tenant via restaurantId.
export async function GET(request) {
  const restaurantId = request ? new URL(request.url).searchParams.get('restaurantId') : null;

  let query = supabaseAdmin.from('category').select('*').order('sort_order');
  if (restaurantId) query = query.eq('restaurant_id', restaurantId);

  const { data, error } = await query;
  if (error) return Response.json({ message: error.message }, { status: 500 });

  const categories = data.map(mapCategory);
  if (!restaurantId) categories.unshift({ id: 'all', name: 'All Items', icon: '🍽️' });
  return Response.json(categories);
}

// category.id is a manually-keyed slug (text primary key), not generated —
// the caller supplies it explicitly.
export async function POST(request) {
  const { id, name, icon, restaurantId, sortOrder } = await request.json();

  try {
    const payload = verifyAuth(request);
    requirePermission(payload, 'category.manage');
    assertTenantAccess(payload, restaurantId);
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ message: err.message }, { status: err.status });
    throw err;
  }

  const { data, error } = await supabaseAdmin
    .from('category')
    .insert({ id, name, icon, sort_order: sortOrder ?? 0, restaurant_id: restaurantId })
    .select()
    .single();
  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json(mapCategory(data), { status: 201 });
}
