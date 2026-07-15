import supabaseAdmin from '../../../../lib/supabaseAdmin';
import { mapOrder } from '../../../../lib/mappers';

export async function GET(request, { params }) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_item(*)')
    .eq('id', id)
    .single();
  if (error) return Response.json({ message: 'Order not found' }, { status: 404 });
  return Response.json(mapOrder(data));
}
