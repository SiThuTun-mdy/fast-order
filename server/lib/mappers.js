// Postgres `numeric` columns come back from supabase-js as strings (to avoid
// float precision loss) — every numeric column must be coerced to a Number
// before being sent to the frontend, which calls `.toFixed()` on these.

export function mapMenuItem(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category_id,
    price: Number(row.unit_price),
    description: row.description,
    emoji: row.emoji,
    popular: row.popular,
  };
}

export function mapCategory(row) {
  return { id: row.id, name: row.name, icon: row.icon };
}

export function mapOrderItem(row) {
  return {
    id: row.menu_id,
    name: row.name,
    price: Number(row.unit_price),
    quantity: row.quantity,
    emoji: row.emoji,
  };
}

export function mapOrder(row) {
  return {
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    orderType: row.order_type,
    tableNumber: row.table_number,
    notes: row.notes,
    items: (row.order_item ?? []).map(mapOrderItem),
    subtotal: Number(row.subtotal),
    tax: Number(row.tax),
    total: Number(row.total),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
