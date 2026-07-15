import { useParams } from 'react-router-dom';
import UserManager from '../components/UserManager';

export default function AdminUserPage() {
  const { tenantId } = useParams();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">User Management</h1>
      <p className="text-gray-500 text-sm mb-6">Manage your restaurant's staff accounts.</p>
      <UserManager restaurantId={tenantId} availableRoles={['Admin', 'Cashier', 'Chef']} />
    </div>
  );
}
