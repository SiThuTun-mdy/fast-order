import { useParams } from 'react-router-dom';
import CategoryManager from '../components/CategoryManager';

export default function AdminCategoryPage() {
  const { tenantId } = useParams();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Category Management</h1>
      <p className="text-gray-500 text-sm mb-6">Organize this restaurant's menu into categories.</p>
      <CategoryManager restaurantId={tenantId} />
    </div>
  );
}
