import supabaseAdmin from '../../../lib/supabaseAdmin';
import { mapMenuItem } from '../../../lib/mappers';

export async function GET(request) {
  const category = new URL(request.url).searchParams.get('category');

  let query = supabaseAdmin.from('menu').select('*').order('id');
  if (category && category !== 'all') {
    query = query.eq('category_id', category);
  }

  const { data, error } = await query;
  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json(data.map(mapMenuItem));
}
