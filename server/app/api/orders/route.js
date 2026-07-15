import supabaseAdmin from '../../../lib/supabaseAdmin';
import { mapOrder } from '../../../lib/mappers';

export async function GET() {
  const { data, error } = await supabaseAdmin.from('orders').select('*, order_item(*)');
  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json(data.map(mapOrder));
}

// Delegates to the `create_order` Postgres RPC: one atomic transaction that
// generates the order id server-side, instead of 3 separate client-driven
// inserts. Status/id are never accepted from the request body — orders are
// always created as 'confirmed', mirroring the RLS insert-check this API
// replaces.
export async function POST(request) {
  const orderData = await request.json();

  const { data: order, error } = await supabaseAdmin
    .rpc('create_order', {
      p_customer_name: orderData.customerName,
      p_phone: orderData.phone,
      p_order_type: orderData.orderType,
      p_table_number: orderData.tableNumber,
      p_notes: orderData.notes,
      p_items: orderData.items.map((item) => ({
        menu_id: item.id,
        name: item.name,
        emoji: item.emoji,
        price: item.price,
        quantity: item.quantity,
      })),
      p_subtotal: orderData.subtotal,
      p_tax: orderData.tax,
      p_total: orderData.total,
    })
    .single();
  if (error) return Response.json({ message: error.message }, { status: 500 });

  const { data: items, error: itemsError } = await supabaseAdmin
    .from('order_item')
    .select('*')
    .eq('order_id', order.id);
  if (itemsError) return Response.json({ message: itemsError.message }, { status: 500 });

  return Response.json(mapOrder({ ...order, order_item: items }), { status: 201 });
}
