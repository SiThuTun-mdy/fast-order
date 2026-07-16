import supabaseAdmin from '../../../../lib/supabaseAdmin';
import { verifyAuth, requirePermission, AuthError } from '../../../../lib/auth';

// Lets the create-user form validate a username before submitting, instead
// of only finding out about a collision from the `app_user_username_key`
// unique constraint after the fact. Not a replacement for that constraint —
// just an earlier, friendlier check for the common case.
export async function GET(request) {
  const username = new URL(request.url).searchParams.get('username');
  if (!username) return Response.json({ message: 'username is required' }, { status: 400 });

  try {
    const payload = verifyAuth(request);
    requirePermission(payload, 'user.manage');
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ message: err.message }, { status: err.status });
    throw err;
  }

  const { data, error } = await supabaseAdmin
    .from('app_user')
    .select('id')
    .eq('username', username)
    .maybeSingle();
  if (error) return Response.json({ message: error.message }, { status: 500 });

  return Response.json({ available: !data });
}
