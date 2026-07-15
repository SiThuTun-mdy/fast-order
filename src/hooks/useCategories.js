import { useState, useEffect, useCallback } from 'react';
import { getCategories } from '../api/categories';

export function useCategories(restaurantId) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const data = await getCategories(restaurantId);
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
}
