import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/supabaseAdmin', () => ({
  default: { from: vi.fn(), rpc: vi.fn() },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'signed.jwt.token'),
    verify: vi.fn(),
  },
}));

import jwt from 'jsonwebtoken';
import supabaseAdmin from '../lib/supabaseAdmin';
import { verifyAuth, requireRole, requirePermission, AuthError } from '../lib/auth';
import { POST as login } from '../app/api/auth/login/route';
import { GET as getTenants, POST as postTenant } from '../app/api/tenants/route';
import { DELETE as deleteTenant } from '../app/api/tenants/[id]/route';
import { GET as getUsers, POST as postUser } from '../app/api/users/route';

function makeBuilder(result) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    in: vi.fn(() => builder),
    order: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    single: vi.fn(() => builder),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  return builder;
}

const sysadminPayload = {
  sub: 'user-1',
  username: 'sysadmin',
  restaurantId: 'restaurant-1',
  roles: ['SysAdmin'],
  permissions: ['order.manage', 'order.update', 'user.manage', 'tenant.manage'],
};

beforeEach(() => {
  supabaseAdmin.from.mockReset();
  supabaseAdmin.rpc.mockReset();
  jwt.sign.mockReset().mockReturnValue('signed.jwt.token');
  jwt.verify.mockReset();
});

function authedRequest(url, options = {}) {
  return new Request(url, {
    ...options,
    headers: { ...options.headers, Authorization: 'Bearer valid-token' },
  });
}

describe('verifyAuth / requireRole / requirePermission', () => {
  it('returns the decoded payload for a valid token', () => {
    jwt.verify.mockReturnValue(sysadminPayload);
    const payload = verifyAuth(authedRequest('http://localhost/api/tenants'));
    expect(payload).toEqual(sysadminPayload);
  });

  it('throws a 401 AuthError when the Authorization header is missing', () => {
    expect(() => verifyAuth(new Request('http://localhost/api/tenants'))).toThrow(AuthError);
    try {
      verifyAuth(new Request('http://localhost/api/tenants'));
    } catch (err) {
      expect(err.status).toBe(401);
    }
  });

  it('throws a 401 AuthError when jwt.verify rejects the token', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('bad signature');
    });
    expect(() => verifyAuth(authedRequest('http://localhost/api/tenants'))).toThrow(AuthError);
  });

  it('requireRole throws 403 when the role is missing', () => {
    expect(() => requireRole({ roles: ['Cashier'] }, 'SysAdmin')).toThrow(AuthError);
    try {
      requireRole({ roles: ['Cashier'] }, 'SysAdmin');
    } catch (err) {
      expect(err.status).toBe(403);
    }
  });

  it('requirePermission throws 403 when the permission is missing', () => {
    expect(() => requirePermission({ permissions: [] }, 'user.manage')).toThrow(AuthError);
  });
});

describe('POST /api/auth/login', () => {
  it('returns a token and user with no password field on success', async () => {
    supabaseAdmin.rpc.mockReturnValue(
      makeBuilder({
        data: {
          id: 'user-1',
          username: 'sysadmin',
          restaurant_id: 'restaurant-1',
          roles: ['SysAdmin'],
          permissions: ['tenant.manage'],
        },
        error: null,
      })
    );

    const res = await login(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'sysadmin', password: 'SysAdmin' }),
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.token).toBe('signed.jwt.token');
    expect(body.user).toEqual({
      id: 'user-1',
      username: 'sysadmin',
      restaurantId: 'restaurant-1',
      roles: ['SysAdmin'],
      permissions: ['tenant.manage'],
    });
    expect(JSON.stringify(body)).not.toContain('password');
  });

  it('returns an identical generic 401 for both a wrong password and an unknown user', async () => {
    supabaseAdmin.rpc.mockReturnValue(makeBuilder({ data: null, error: { message: 'no rows' } }));

    const res = await login(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'sysadmin', password: 'wrong' }),
      })
    );
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ message: 'Invalid username or password' });
  });
});

describe('GET /api/tenants', () => {
  it('returns 401 and never touches the database when no token is provided', async () => {
    const res = await getTenants(new Request('http://localhost/api/tenants'));

    expect(res.status).toBe(401);
    expect(supabaseAdmin.from).not.toHaveBeenCalled();
  });

  it('returns mapped tenants for a valid SysAdmin token', async () => {
    jwt.verify.mockReturnValue(sysadminPayload);
    supabaseAdmin.from.mockReturnValue(
      makeBuilder({ data: [{ id: 'r1', name: 'QuickBite', address: null, phone: null, created_at: '2026-01-01' }], error: null })
    );

    const res = await getTenants(authedRequest('http://localhost/api/tenants'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual([{ id: 'r1', name: 'QuickBite', address: null, phone: null, createdAt: '2026-01-01' }]);
  });
});

describe('POST /api/tenants', () => {
  it('rejects a non-SysAdmin role with 403 before touching the database', async () => {
    jwt.verify.mockReturnValue({ ...sysadminPayload, roles: ['Cashier'] });

    const res = await postTenant(
      authedRequest('http://localhost/api/tenants', { method: 'POST', body: JSON.stringify({ name: 'New Place' }) })
    );

    expect(res.status).toBe(403);
    expect(supabaseAdmin.from).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/tenants/[id]', () => {
  it('deletes via the tenant.manage permission', async () => {
    jwt.verify.mockReturnValue(sysadminPayload);
    supabaseAdmin.from.mockReturnValue(makeBuilder({ data: null, error: null }));

    const res = await deleteTenant(authedRequest('http://localhost/api/tenants/r1', { method: 'DELETE' }), {
      params: Promise.resolve({ id: 'r1' }),
    });

    expect(res.status).toBe(200);
    expect(supabaseAdmin.from).toHaveBeenCalledWith('restaurant');
  });
});

describe('GET /api/users', () => {
  it('never includes a password field even if the mocked row carries one', async () => {
    jwt.verify.mockReturnValue(sysadminPayload);
    supabaseAdmin.from.mockReturnValue(
      makeBuilder({
        data: [
          {
            id: 'u1',
            username: 'sysadmin',
            password: '$2a$06$shouldneverleak',
            restaurant_id: 'r1',
            user_role: [{ role: { role_name: 'SysAdmin' } }],
          },
        ],
        error: null,
      })
    );

    const res = await getUsers(authedRequest('http://localhost/api/users'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual([{ id: 'u1', username: 'sysadmin', restaurantId: 'r1', roles: ['SysAdmin'] }]);
    expect(JSON.stringify(body)).not.toContain('password');
  });

  it('returns 401 without a token', async () => {
    const res = await getUsers(new Request('http://localhost/api/users'));
    expect(res.status).toBe(401);
    expect(supabaseAdmin.from).not.toHaveBeenCalled();
  });
});

describe('POST /api/users', () => {
  it('calls create_app_user and never returns a password field', async () => {
    jwt.verify.mockReturnValue(sysadminPayload);
    supabaseAdmin.rpc.mockReturnValue(
      makeBuilder({
        data: { id: 'u2', username: 'newuser', password: '$2a$06$shouldneverleak', restaurant_id: 'r1' },
        error: null,
      })
    );

    const res = await postUser(
      authedRequest('http://localhost/api/users', {
        method: 'POST',
        body: JSON.stringify({ username: 'newuser', password: 'pw', restaurantId: 'r1', roleNames: ['Cashier'] }),
      })
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(supabaseAdmin.rpc).toHaveBeenCalledWith('create_app_user', {
      p_username: 'newuser',
      p_password: 'pw',
      p_restaurant_id: 'r1',
      p_role_names: ['Cashier'],
    });
    expect(body).toEqual({ id: 'u2', username: 'newuser', restaurantId: 'r1', roles: ['Cashier'] });
    expect(JSON.stringify(body)).not.toContain('password');
  });
});
