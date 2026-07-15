import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUsers, createUser, updateUser, deleteUser } from '../users';

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

describe('getUsers', () => {
  it('includes ?restaurantId= when a tenant is given', async () => {
    mockFetchOnce([]);
    await getUsers('r1');
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/users\?restaurantId=r1$/), expect.anything());
  });

  it('omits the query param when no tenant is given', async () => {
    mockFetchOnce([]);
    await getUsers();
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/users$/), expect.anything());
  });
});

describe('createUser', () => {
  it('POSTs username/password/restaurantId/roleNames', async () => {
    const payload = { username: 'newuser', password: 'pw', restaurantId: 'r1', roleNames: ['Cashier'] };
    mockFetchOnce({ id: 'u2', ...payload });

    await createUser(payload);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/users$/),
      expect.objectContaining({ method: 'POST', body: JSON.stringify(payload) })
    );
  });
});

describe('updateUser', () => {
  it('PATCHes the partial update', async () => {
    mockFetchOnce({ id: 'u1', roles: ['Chef'] });

    await updateUser('u1', { roleNames: ['Chef'] });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/users\/u1$/),
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ roleNames: ['Chef'] }) })
    );
  });
});

describe('deleteUser', () => {
  it('DELETEs the user', async () => {
    mockFetchOnce({ message: 'Deleted' });

    await deleteUser('u1');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/users\/u1$/),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});
