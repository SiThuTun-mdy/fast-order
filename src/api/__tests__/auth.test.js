import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login } from '../auth';

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

describe('login', () => {
  it('POSTs credentials to /auth/login and returns the token/user', async () => {
    const response = { token: 'jwt', user: { id: 'u1', username: 'sysadmin', roles: ['SysAdmin'] } };
    mockFetchOnce(response);

    const result = await login('sysadmin', 'SysAdmin');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/auth\/login$/),
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ username: 'sysadmin', password: 'SysAdmin' }) })
    );
    expect(result).toEqual(response);
  });

  it('throws the generic message on invalid credentials', async () => {
    mockFetchOnce({ message: 'Invalid username or password' }, { ok: false, status: 401 });
    await expect(login('sysadmin', 'wrong')).rejects.toThrow('Invalid username or password');
  });
});
