import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../menu';

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
  it('requests /menu?restaurantId=<id>', async () => {
    mockFetchOnce([]);
    await getMenuItems('r1');
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/menu\?restaurantId=r1$/), expect.anything());
  });
});

describe('createMenuItem', () => {
  it('POSTs the menu item payload', async () => {
    const item = { name: 'Nachos', category: 'sides', restaurantId: 'r1', price: 6.99 };
    mockFetchOnce({ id: 1, ...item });

    await createMenuItem(item);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/menu$/),
      expect.objectContaining({ method: 'POST', body: JSON.stringify(item) })
    );
  });
});

describe('updateMenuItem', () => {
  it('PATCHes the partial update', async () => {
    mockFetchOnce({ id: 1, price: 7.99 });

    await updateMenuItem(1, { price: 7.99 });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/menu\/1$/),
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ price: 7.99 }) })
    );
  });
});

describe('deleteMenuItem', () => {
  it('DELETEs the menu item', async () => {
    mockFetchOnce({ message: 'Deleted' });

    await deleteMenuItem(1);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/menu\/1$/),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('throws with the server message on failure', async () => {
    mockFetchOnce({ message: 'Cannot delete: this item has existing orders' }, { ok: false, status: 409 });
    await expect(deleteMenuItem(1)).rejects.toThrow('existing orders');
  });
});
