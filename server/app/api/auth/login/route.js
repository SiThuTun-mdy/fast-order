import jwt from 'jsonwebtoken';
import supabaseAdmin from '../../../../lib/supabaseAdmin';

// Delegates credential verification to the `login` Postgres RPC, which
// returns an empty result set for both "no such user" and "wrong password" —
// this route mirrors that ambiguity in its response so failed attempts can't
// be used to enumerate valid usernames.
export async function POST(request) {
  const { username, password } = await request.json();

  const { data, error } = await supabaseAdmin
    .rpc('login', { p_username: username, p_password: password })
    .single();
  if (error || !data) {
    return Response.json({ message: 'Invalid username or password' }, { status: 401 });
  }

  const user = {
    id: data.id,
    username: data.username,
    restaurantId: data.restaurant_id,
    roles: data.roles,
    permissions: data.permissions,
  };

  const token = jwt.sign(
    { sub: user.id, username: user.username, restaurantId: user.restaurantId, roles: user.roles, permissions: user.permissions },
    process.env.AUTH_JWT_SECRET,
    { expiresIn: '8h' }
  );

  return Response.json({ token, user });
}
