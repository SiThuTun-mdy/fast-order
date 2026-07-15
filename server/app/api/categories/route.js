import supabaseAdmin from '../../../lib/supabaseAdmin';
import { mapCategory } from '../../../lib/mappers';

export async function GET() {
  const { data, error } = await supabaseAdmin.from('category').select('*').order('sort_order');
  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json([{ id: 'all', name: 'All Items', icon: '🍽️' }, ...data.map(mapCategory)]);
}
