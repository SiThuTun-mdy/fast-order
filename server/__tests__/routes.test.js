import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/supabaseAdmin', () => ({
  default: { from: vi.fn(), rpc: vi.fn() },
}));

import supabaseAdmin from '../lib/supabaseAdmin';
import { GET as getMenu } from '../app/api/menu/route';
import { GET as getCategories } from '../app/api/categories/route';
import { GET as getOrders, POST as postOrder } from '../app/api/orders/route';
import { GET as getOrder } from '../app/api/orders/[id]/route';
import { PATCH as patchOrderStatus } from '../app/api/orders/[id]/status/route';

// Chainable query-builder mock, same shape as the previous frontend test's
// mock of the raw supabase-js client.
function makeBuilder(result) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    single: vi.fn(() => builder),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  return builder;
}

beforeEach(() => {
  supabaseAdmin.from.mockReset();
  supabaseAdmin.rpc.mockReset();
});

describe('GET /api/menu', () => {
  it('returns mapped menu items', async () => {
    const builder = makeBuilder({
      data: [{ id: 1, name: 'Burger', category_id: 'mains', unit_price: '8.99', description: '', emoji: '🍔', popular: true }],
      error: null,
    });
    supabaseAdmin.from.mockReturnValue(builder);

    const res = await getMenu(new Request('http://localhost/api/menu'));
    const body = await res.json();

    expect(body).toEqual([{ id: 1, name: 'Burger', category: 'mains', price: 8.99, description: '', emoji: '🍔', popular: true }]);
  });

  it('filters by category when provided', async () => {
    const builder = makeBuilder({ data: [], error: null });
    supabaseAdmin.from.mockReturnValue(builder);

    await getMenu(new Request('http://localhost/api/menu?category=mains'));

    expect(builder.eq).toHaveBeenCalledWith('category_id', 'mains');
  });

  it('skips the category filter for "all"', async () => {
    const builder = makeBuilder({ data: [], error: null });
    supabaseAdmin.from.mockReturnValue(builder);

    await getMenu(new Request('http://localhost/api/menu?category=all'));

    expect(builder.eq).not.toHaveBeenCalled();
  });
});

describe('GET /api/categories', () => {
  it('prepends the synthetic "all" category', async () => {
    const builder = makeBuilder({ data: [{ id: 'mains', name: 'Mains', icon: '🍽️' }], error: null });
    supabaseAdmin.from.mockReturnValue(builder);

    const res = await getCategories();
    const body = await res.json();

    expect(body[0]).toEqual({ id: 'all', name: 'All Items', icon: '🍽️' });
    expect(body[1]).toEqual({ id: 'mains', name: 'Mains', icon: '🍽️' });
  });
});

describe('POST /api/orders', () => {
  const orderData = {
    customerName: 'Jane Smith',
    phone: '555-0100',
    orderType: 'dine-in',
    tableNumber: '7',
    notes: '',
    items: [{ id: 7, name: 'Cola', price: 2.49, quantity: 2, emoji: '🥤' }],
    subtotal: 4.98,
    tax: 0.5,
    total: 5.48,
  };

  it('calls the create_order RPC and returns the order with items', async () => {
    const rpcBuilder = makeBuilder({
      data: {
        id: 'ORD-123',
        customer_name: 'Jane Smith',
        phone: '555-0100',
        order_type: 'dine-in',
        table_number: '7',
        notes: '',
        subtotal: '4.98',
        tax: '0.50',
        total: '5.48',
        status: 'confirmed',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
      error: null,
    });
    supabaseAdmin.rpc.mockReturnValue(rpcBuilder);
    const itemsBuilder = makeBuilder({
      data: [{ menu_id: 7, name: 'Cola', emoji: '🥤', unit_price: '2.49', quantity: 2 }],
      error: null,
    });
    supabaseAdmin.from.mockReturnValue(itemsBuilder);

    const res = await postOrder(
      new Request('http://localhost/api/orders', { method: 'POST', body: JSON.stringify(orderData) })
    );
    const body = await res.json();

    expect(supabaseAdmin.rpc).toHaveBeenCalledWith(
      'create_order',
      expect.objectContaining({
        p_customer_name: 'Jane Smith',
        p_phone: '555-0100',
        p_items: [{ menu_id: 7, name: 'Cola', emoji: '🥤', price: 2.49, quantity: 2 }],
      })
    );
    expect(res.status).toBe(201);
    expect(body.id).toBe('ORD-123');
    expect(body.items).toEqual([{ id: 7, name: 'Cola', price: 2.49, quantity: 2, emoji: '🥤' }]);
  });

  it('returns 500 when the RPC fails', async () => {
    supabaseAdmin.rpc.mockReturnValue(makeBuilder({ data: null, error: { message: 'rpc failed' } }));

    const res = await postOrder(
      new Request('http://localhost/api/orders', { method: 'POST', body: JSON.stringify(orderData) })
    );

    expect(res.status).toBe(500);
  });
});

describe('GET /api/orders/[id]', () => {
  it('returns 404 when the order does not exist', async () => {
    supabaseAdmin.from.mockReturnValue(makeBuilder({ data: null, error: { message: 'not found' } }));

    const res = await getOrder(new Request('http://localhost/api/orders/nope'), { params: Promise.resolve({ id: 'nope' }) });

    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/orders/[id]/status', () => {
  it('applies a legal transition', async () => {
    supabaseAdmin.from.mockReturnValue(
      makeBuilder({ data: { id: 'ORD-1', status: 'kitchen', order_item: [] }, error: null })
    );

    const res = await patchOrderStatus(
      new Request('http://localhost/api/orders/ORD-1/status', { method: 'PATCH', body: JSON.stringify({ status: 'kitchen' }) }),
      { params: Promise.resolve({ id: 'ORD-1' }) }
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe('kitchen');
  });

  it('translates the DB trigger exception for an illegal transition into a 400', async () => {
    supabaseAdmin.from.mockReturnValue(
      makeBuilder({ data: null, error: { message: 'Invalid order status transition: confirmed -> ready' } })
    );

    const res = await patchOrderStatus(
      new Request('http://localhost/api/orders/ORD-1/status', { method: 'PATCH', body: JSON.stringify({ status: 'ready' }) }),
      { params: Promise.resolve({ id: 'ORD-1' }) }
    );

    expect(res.status).toBe(400);
  });
});
