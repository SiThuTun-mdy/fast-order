import { Link } from 'react-router-dom';

export default function SysAdminPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">SysAdmin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/tenant"
          className="bg-white rounded-xl border border-gray-100 p-6 hover:border-yellow-300 transition-colors"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Tenant Management</h2>
          <p className="text-sm text-gray-500">Create, edit, and remove restaurants.</p>
        </Link>

        <Link
          to="/user"
          className="bg-white rounded-xl border border-gray-100 p-6 hover:border-yellow-300 transition-colors"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-1">User Management</h2>
          <p className="text-sm text-gray-500">Manage staff accounts and role assignments.</p>
        </Link>
      </div>
    </div>
  );
}
