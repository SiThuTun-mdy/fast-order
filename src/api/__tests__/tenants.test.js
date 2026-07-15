import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTenants, getTenant, createTenant, updateTenant, deleteTenant } from '../tenants';

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

describe('getTenants', () => {
  it('returns the parsed tenant list', async () => {
    const tenants = [{ id: 'r1', name: 'QuickBite' }];
    mockFetchOnce(tenants);
    await expect(getTenants()).resolves.toEqual(tenants);
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/tenants$/), expect.anything());
  });
});

describe('getTenant', () => {
  it('requests /tenants/:id', async () => {
    mockFetchOnce({ id: 'r1' });
    await getTenant('r1');
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/tenants\/r1$/), expect.anything());
  });
});

describe('createTenant', () => {
  it('POSTs the tenant payload', async () => {
    const tenant = { name: 'New Place', address: '123 Main St', phone: '555-0100' };
    mockFetchOnce({ id: 'r2', ...tenant });

    await createTenant(tenant);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/tenants$/),
      expect.objectContaining({ method: 'POST', body: JSON.stringify(tenant) })
    );
  });
});

describe('updateTenant', () => {
  it('PATCHes the partial update', async () => {
    mockFetchOnce({ id: 'r1', name: 'Renamed' });

    await updateTenant('r1', { name: 'Renamed' });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/tenants\/r1$/),
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ name: 'Renamed' }) })
    );
  });
});

describe('deleteTenant', () => {
  it('DELETEs the tenant', async () => {
    mockFetchOnce({ message: 'Deleted' });

    await deleteTenant('r1');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/tenants\/r1$/),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('throws on failure', async () => {
    mockFetchOnce({ message: 'not found' }, { ok: false, status: 404 });
    await expect(deleteTenant('missing')).rejects.toThrow('not found');
  });
});
