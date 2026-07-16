import supabaseAdmin from '../../../lib/supabaseAdmin';

export async function GET() {
  const { error } = await supabaseAdmin.from('app_user').select('id').limit(1);

  return Response.json({
    supabase: {
      connected: !error,
      error: error ? error.message : null,
    },
    cors: {
      allowedOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
    },
  });
}
