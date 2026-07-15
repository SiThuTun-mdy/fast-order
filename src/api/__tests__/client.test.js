import { describe, it, expect, vi, beforeEach } from 'vitest';
import { request } from '../client';

function mockFetchOnce(body, { ok = true, status = ok ? 200 : 500 } = {}) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('request', () => {
  it('omits the Authorization header when no token is stored', async () => {
    mockFetchOnce({});
    await request('/menu');

    const [, options] = fetch.mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
  });

  it('attaches Authorization: Bearer <token> when a token is stored', async () => {
    localStorage.setItem('auth_token', 'abc123');
    mockFetchOnce({});
    await request('/tenants');

    const [, options] = fetch.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer abc123');
  });

  it('always sends a JSON content-type header', async () => {
    mockFetchOnce({});
    await request('/menu');

    const [, options] = fetch.mock.calls[0];
    expect(options.headers['Content-Type']).toBe('application/json');
  });

  it('throws with the server-provided message on a non-2xx response', async () => {
    mockFetchOnce({ message: 'nope' }, { ok: false, status: 400 });
    await expect(request('/tenants')).rejects.toThrow('nope');
  });
});
