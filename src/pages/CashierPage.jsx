import { useEffect, useState, useCallback } from 'react';
import { getOrders, updateOrderStatus } from '../api/orders';
import OrderStatusBadge from '../components/OrderStatusBadge';

export default function CashierPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

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

  const handleConfirm = async (id) => {
    setConfirmingId(id);
    try {
      await updateOrderStatus(id, 'kitchen');
      await loadOrders();
    } finally {
      setConfirmingId(null);
    }
  };

  const toggleExpanded = (id) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-4xl animate-bounce mb-4">⏳</div>
        <p className="text-gray-500">Loading orders…</p>
      </div>
    );
  }

  const sorted = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Cashier</h1>
      <p className="text-gray-500 text-sm mb-6">
        Confirm payment for orders waiting at the counter.
      </p>

      {sorted.length === 0 ? (
        <p className="text-gray-500 text-sm">No orders yet.</p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((order) => {
            const isExpanded = expandedId === order.id;
            return (
              <li
                key={order.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleExpanded(order.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpanded(order.id);
                    }
                  }}
                  className="w-full p-4 flex items-center justify-between gap-4 text-left cursor-pointer"
                  aria-expanded={isExpanded}
                >
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      #{order.id} · {order.customerName}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {order.orderType === 'dine-in'
                        ? `Dine In — Table ${order.tableNumber}`
                        : 'Takeout'}{' '}
                      · ${order.total?.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                    {order.status === 'confirmed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirm(order.id);
                        }}
                        disabled={confirmingId === order.id}
                        className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                      >
                        {confirmingId === order.id ? 'Confirming…' : 'Confirm'}
                      </button>
                    )}
                    <span
                      className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    >
                      ▾
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                    <p className="text-gray-500 text-xs mb-2">
                      {order.phone}
                      {order.notes && ` · Note: ${order.notes}`}
                    </p>
                    <ul className="space-y-1.5 mb-3">
                      {order.items?.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between text-sm text-gray-700"
                        >
                          <span>
                            {item.emoji} {item.name} × {item.quantity}
                          </span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-gray-200 pt-2 space-y-1 text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${order.subtotal?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>${order.tax?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-gray-900">
                        <span>Total</span>
                        <span>${order.total?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
