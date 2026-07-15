import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Real authorization enforcement lives server-side (every protected API
// route checks the JWT itself) — this is UX-only guarding to avoid showing
// a broken/empty page before a redirect or a clear "not allowed" message.
export default function ProtectedRoute({ children, requireRole, requireTenantMatch }) {
  const { status, user } = useAuth();
  const { tenantId } = useParams();

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }

  const roleOk = !requireRole || user.roles?.includes(requireRole);
  const tenantOk =
    !requireTenantMatch || user.roles?.includes('SysAdmin') || user.restaurantId === tenantId;

  if (!roleOk || !tenantOk) {
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
