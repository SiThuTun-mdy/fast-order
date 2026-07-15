import supabaseAdmin from '../../../lib/supabaseAdmin';
import { mapMenuItem } from '../../../lib/mappers';
import { verifyAuth, requirePermission, assertTenantAccess, AuthError } from '../../../lib/auth';

// GET stays fully public/unauthenticated — the customer-facing MenuPage
// relies on this. restaurantId is an additive optional filter only used by
// the admin Menu Manager; unfiltered calls (category browsing) are unaffected.
export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const category = params.get('category');
  const restaurantId = params.get('restaurantId');

  let query = supabaseAdmin.from('menu').select('*').order('id');
  if (category && category !== 'all') query = query.eq('category_id', category);
  if (restaurantId) query = query.eq('restaurant_id', restaurantId);

  const { data, error } = await query;
  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json(data.map(mapMenuItem));
}

export async function POST(request) {
  const { name, category, restaurantId, price, description, emoji, popular } = await request.json();

  try {
    const payload = verifyAuth(request);
    requirePermission(payload, 'menu.manage');
    assertTenantAccess(payload, restaurantId);
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ message: err.message }, { status: err.status });
    throw err;
  }

  const { data, error } = await supabaseAdmin
    .from('menu')
    .insert({
      category_id: category,
      restaurant_id: restaurantId,
      name,
      unit_price: price,
      description,
      emoji,
      popular: popular ?? false,
    })
    .select()
    .single();
  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json(mapMenuItem(data), { status: 201 });
}
