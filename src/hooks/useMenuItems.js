import { useState, useEffect, useCallback } from 'react';
import { getMenuItems } from '../api/menu';

export function useMenuItems(restaurantId) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMenuItems = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const data = await getMenuItems(restaurantId);
      setMenuItems(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  return { menuItems, loading, error, refetch: fetchMenuItems };
}
