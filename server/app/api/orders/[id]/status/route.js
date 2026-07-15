import supabaseAdmin from '../../../../../lib/supabaseAdmin';
import { mapOrder } from '../../../../../lib/mappers';

// The confirmed->kitchen->ready transition guard lives in the
// `enforce_order_status_transition` DB trigger (fires regardless of which
// client performs the UPDATE, admin client included) — an illegal
// transition surfaces here as a Postgres exception, which we translate to
// a 400 instead of a raw 500.
export async function PATCH(request, { params }) {
  const { id } = await params;
  const { status } = await request.json();

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select('*, order_item(*)')
    .single();

  if (error) {
    if (error.message?.includes('Invalid order status transition')) {
      return Response.json({ message: error.message }, { status: 400 });
    }
    return Response.json({ message: error.message }, { status: 500 });
  }

  return Response.json(mapOrder(data));
}
