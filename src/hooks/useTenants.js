import { useState, useEffect, useCallback } from 'react';
import { getTenants } from '../api/tenants';

export function useTenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTenants = useCallback(async () => {
    try {
      const data = await getTenants();
      setTenants(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load tenants');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  return { tenants, loading, error, refetch: fetchTenants };
}
