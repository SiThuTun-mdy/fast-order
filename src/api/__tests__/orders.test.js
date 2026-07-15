import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMenuItems, getCategories, createOrder, getOrder, getOrders, updateOrderStatus } from '../orders';

// Mock at the network boundary (global fetch) — src/api/orders.js is now a
// thin wrapper around the Next.js API, so this is the seam it depends on.
function mockFetchOnce(body, { ok = true, status = ok ? 200 : 500 } = {}) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('getMenuItems', () => {
  it('requests /menu without a category filter for "all"', async () => {
    mockFetchOnce([]);
    await getMenuItems('all');
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/menu$/), expect.anything());
  });

  it('requests /menu?category=<category> for a specific category', async () => {
    mockFetchOnce([]);
    await getMenuItems('mains');
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/menu\?category=mains$/), expect.anything());
  });
});

describe('getCategories', () => {
  it('returns the parsed category list', async () => {
    const categories = [{ id: 'all', name: 'All Items', icon: '🍽️' }];
    mockFetchOnce(categories);
    await expect(getCategories()).resolves.toEqual(categories);
  });
});

describe('createOrder (checkout)', () => {
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

  it('POSTs the order payload to /orders and returns the created order', async () => {
    const created = { id: 'ORD-123', status: 'confirmed', items: orderData.items };
    mockFetchOnce(created);

    const order = await createOrder(orderData);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/orders$/),
      expect.objectContaining({ method: 'POST', body: JSON.stringify(orderData) })
    );
    expect(order).toEqual(created);
  });

  it('throws with the server-provided message on failure', async () => {
    mockFetchOnce({ message: 'insert failed' }, { ok: false, status: 500 });
    await expect(createOrder(orderData)).rejects.toThrow('insert failed');
  });
});

describe('getOrder', () => {
  it('returns the parsed order', async () => {
    const order = { id: 'ORD-1', status: 'confirmed' };
    mockFetchOnce(order);
    await expect(getOrder('ORD-1')).resolves.toEqual(order);
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/orders\/ORD-1$/), expect.anything());
  });

  it('throws "Order not found" on a 404', async () => {
    mockFetchOnce({ message: 'Order not found' }, { ok: false, status: 404 });
    await expect(getOrder('missing')).rejects.toThrow('Order not found');
  });
});

describe('getOrders', () => {
  it('returns the parsed order list', async () => {
    const orders = [{ id: 'ORD-1' }, { id: 'ORD-2' }];
    mockFetchOnce(orders);
    await expect(getOrders()).resolves.toEqual(orders);
  });
});

describe('updateOrderStatus', () => {
  it('PATCHes the status and returns the updated order', async () => {
    const updated = { id: 'ORD-1', status: 'kitchen' };
    mockFetchOnce(updated);

    const order = await updateOrderStatus('ORD-1', 'kitchen');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/orders\/ORD-1\/status$/),
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ status: 'kitchen' }) })
    );
    expect(order).toEqual(updated);
  });

  it('throws on an illegal transition', async () => {
    mockFetchOnce({ message: 'Invalid order status transition: confirmed -> ready' }, { ok: false, status: 400 });
    await expect(updateOrderStatus('ORD-1', 'ready')).rejects.toThrow('Invalid order status transition');
  });
});
