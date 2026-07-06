import { useState, useEffect, useCallback } from 'react';
import { getOrder } from '../api/orders';

export function useOrder(orderId) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const data = await getOrder(orderId);
      setOrder(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Initial fetch
  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Poll every 5 s until order is ready, or stop if the order can't be found
  useEffect(() => {
    if (!orderId || order?.status === 'ready' || error) return;
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [orderId, order?.status, error, fetchOrder]);

  return { order, loading, error, refetch: fetchOrder };
}
