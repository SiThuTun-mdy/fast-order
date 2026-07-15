import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../categories';

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

describe('getCategories', () => {
  it('requests /categories?restaurantId=<id>', async () => {
    mockFetchOnce([]);
    await getCategories('r1');
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/categories\?restaurantId=r1$/), expect.anything());
  });
});

describe('createCategory', () => {
  it('POSTs the category payload', async () => {
    const category = { id: 'snacks', name: 'Snacks', icon: '🥨', restaurantId: 'r1', sortOrder: 6 };
    mockFetchOnce(category);

    await createCategory(category);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/categories$/),
      expect.objectContaining({ method: 'POST', body: JSON.stringify(category) })
    );
  });
});

describe('updateCategory', () => {
  it('PATCHes the partial update', async () => {
    mockFetchOnce({ id: 'snacks', name: 'Renamed' });

    await updateCategory('snacks', { name: 'Renamed' });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/categories\/snacks$/),
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ name: 'Renamed' }) })
    );
  });
});

describe('deleteCategory', () => {
  it('DELETEs the category', async () => {
    mockFetchOnce({ message: 'Deleted' });

    await deleteCategory('snacks');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/categories\/snacks$/),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('throws with the server message when the category still has menu items', async () => {
    mockFetchOnce({ message: 'Cannot delete: this category still has menu items' }, { ok: false, status: 409 });
    await expect(deleteCategory('snacks')).rejects.toThrow('still has menu items');
  });
});
