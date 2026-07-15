import supabaseAdmin from '../../../lib/supabaseAdmin';
import { mapRestaurant } from '../../../lib/mappers';
import { verifyAuth, requireRole, AuthError } from '../../../lib/auth';

export async function GET(request) {
  try {
    verifyAuth(request);
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ message: err.message }, { status: err.status });
    throw err;
  }

  const { data, error } = await supabaseAdmin.from('restaurant').select('*').order('name');
  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json(data.map(mapRestaurant));
}

export async function POST(request) {
  try {
    requireRole(verifyAuth(request), 'SysAdmin');
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ message: err.message }, { status: err.status });
    throw err;
  }

  const { name, address, phone } = await request.json();
  const { data, error } = await supabaseAdmin
    .from('restaurant')
    .insert({ name, address, phone })
    .select()
    .single();
  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json(mapRestaurant(data), { status: 201 });
}
