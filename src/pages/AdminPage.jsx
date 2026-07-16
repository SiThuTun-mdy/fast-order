import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminPage() {
  const { user } = useAuth();
  const tenantId = user.restaurantId;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tenant Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to={`/admin/${tenantId}/user`}
          className="bg-white rounded-xl border border-gray-100 p-6 hover:border-yellow-300 transition-colors"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-1">User Management</h2>
          <p className="text-sm text-gray-500">Manage your restaurant's staff accounts.</p>
        </Link>

        <Link
          to={`/admin/${tenantId}/menu`}
          className="bg-white rounded-xl border border-gray-100 p-6 hover:border-yellow-300 transition-colors"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Menu Management</h2>
          <p className="text-sm text-gray-500">Add, edit, and remove menu items.</p>
        </Link>

        <Link
          to={`/admin/${tenantId}/category`}
          className="bg-white rounded-xl border border-gray-100 p-6 hover:border-yellow-300 transition-colors"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Category Management</h2>
          <p className="text-sm text-gray-500">Organize your menu into categories.</p>
        </Link>
      </div>
    </div>
  );
}
