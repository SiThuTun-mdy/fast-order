import UserManager from '../components/UserManager';

export default function UserPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">User Management</h1>
      <p className="text-gray-500 text-sm mb-6">Manage staff accounts across all tenants.</p>
      <UserManager />
    </div>
  );
}
