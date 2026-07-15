import { useEffect, useState, useCallback } from 'react';
import { getOrders, updateOrderStatus } from '../api/orders';
import OrderStatusBadge from '../components/OrderStatusBadge';

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readyingId, setReadyingId] = useState(null);

  const loadOrders = useCallback(async () => {
    const data = await getOrders();
    setOrders(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const handleMarkReady = async (id) => {
    setReadyingId(id);
    try {
      await updateOrderStatus(id, 'ready');
      await loadOrders();
    } finally {
      setReadyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-4xl animate-bounce mb-4">⏳</div>
        <p className="text-gray-500">Loading orders…</p>
      </div>
    );
  }

  const confirmedOrders = orders
    .filter((order) => order.status === 'kitchen')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Kitchen</h1>
      <p className="text-gray-500 text-sm mb-6">
        Orders confirmed and waiting to be prepared.
      </p>

      {confirmedOrders.length === 0 ? (
        <p className="text-gray-500 text-sm">No orders waiting on the kitchen.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {confirmedOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-gray-100 p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    #{order.id} · {order.customerName}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {order.orderType === 'dine-in'
                      ? `Dine In — Table ${order.tableNumber}`
                      : 'Takeout'}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <ul className="space-y-1.5 mb-4">
                {order.items?.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between text-sm text-gray-700"
                  >
                    <span>
                      {item.emoji} {item.name} × {item.quantity}
                    </span>
                  </li>
                ))}
              </ul>

              {order.notes && (
                <p className="text-xs text-gray-500 mb-4">Note: {order.notes}</p>
              )}

              <button
                onClick={() => handleMarkReady(order.id)}
                disabled={readyingId === order.id}
                className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                {readyingId === order.id ? 'Marking Ready…' : 'Mark as Ready'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
