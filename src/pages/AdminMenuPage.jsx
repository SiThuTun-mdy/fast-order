import { useParams } from 'react-router-dom';
import MenuManager from '../components/MenuManager';

export default function AdminMenuPage() {
  const { tenantId } = useParams();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Menu Management</h1>
      <p className="text-gray-500 text-sm mb-6">Manage this restaurant's menu items.</p>
      <MenuManager restaurantId={tenantId} />
    </div>
  );
}
