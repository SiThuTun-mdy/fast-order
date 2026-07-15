import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Real authorization enforcement lives server-side (every protected API
// route checks the JWT itself) — this is UX-only guarding to avoid showing
// a broken/empty page before a redirect or a clear "not allowed" message.
export default function ProtectedRoute({ children, requireRole }) {
  const { status, user } = useAuth();

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && !user.roles?.includes(requireRole)) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h1 className="text-lg font-semibold text-gray-900 mb-1">Access denied</h1>
          <p className="text-sm text-gray-500">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return children;
}
