import jwt from 'jsonwebtoken';

export class AuthError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Reads and verifies the `Authorization: Bearer <token>` header. Throws
// AuthError (never returns null) so callers can funnel every failure through
// one catch block into a Response.
export function verifyAuth(request) {
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new AuthError('Missing or invalid Authorization header', 401);

  try {
    return jwt.verify(token, process.env.AUTH_JWT_SECRET);
  } catch {
    throw new AuthError('Invalid or expired token', 401);
  }
}

export function requireRole(payload, roleName) {
  if (!payload.roles?.includes(roleName)) throw new AuthError('Forbidden', 403);
}

export function requirePermission(payload, permissionName) {
  if (!payload.permissions?.includes(permissionName)) throw new AuthError('Forbidden', 403);
}
