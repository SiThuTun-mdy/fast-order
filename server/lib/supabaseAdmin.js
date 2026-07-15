import { createAdminClient } from '@supabase/server/core';

// Bypasses RLS via the secret key — this is the trusted server tier, so
// authorization rules that used to live in RLS policies (e.g. orders can
// only be inserted with status='confirmed', customer has no read access)
// are enforced in the route handlers instead.
const supabaseAdmin = createAdminClient();

export default supabaseAdmin;
