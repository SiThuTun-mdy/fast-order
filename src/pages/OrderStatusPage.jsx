import { Link, useParams } from 'react-router-dom';
import { useOrder } from '../hooks/useOrders';
import OrderStatusBadge from '../components/OrderStatusBadge';

const STEPS = [
  {
    key: 'confirmed',
    label: 'Pay at Counter',
    icon: '🧾',
    desc: 'Please pay at the cashier counter',
  },
  {
    key: 'kitchen',
    label: 'In the Kitchen',
    icon: '👨‍🍳',
    desc: 'Your meal is being prepared',
  },
  {
    key: 'ready',
    label: 'Ready for Pickup',
    icon: '🎉',
    desc: "It's your time to eat!",
  },
];

export default function OrderStatusPage() {
  const { orderId } = useParams();
  const { order, loading, error } = useOrder(orderId);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-4xl animate-bounce mb-4">⏳</div>
        <p className="text-gray-500">Loading your order…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-4xl mb-4">😕</div>
        <p className="text-gray-700 font-medium mb-2">Order not found</p>
        <p className="text-gray-500 text-sm mb-6">{error}</p>
        <Link to="/" className="text-orange-500 font-medium hover:underline">
          Back to Menu
        </Link>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">
          {order.status === 'ready'
            ? '🎉'
            : order.status === 'kitchen'
            ? '👨‍🍳'
            : '🧾'}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {order.status === 'ready'
            ? 'Your order is ready!'
            : order.status === 'confirmed'
            ? 'Please pay at the counter'
            : 'Hang tight!'}
        </h1>
        <p className="text-gray-500 text-sm">Order #{order.id}</p>
        <div className="mt-3">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Progress stepper */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5">
          Order Progress
        </h2>
        <div className="relative">
          {/* Track line */}
          <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100" aria-hidden="true" />

          <ol className="space-y-6">
            {STEPS.map((step, index) => {
              const isDone = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isPending = index > currentStepIndex;

              return (
                <li key={step.key} className="flex items-start gap-4 relative">
                  {/* Step dot */}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 transition-colors ${
                      isDone
                        ? 'bg-green-500'
                        : isCurrent
                        ? 'bg-orange-500 shadow-lg shadow-orange-200'
                        : 'bg-gray-100'
                    }`}
                  >
                    {isDone ? (
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span role="img" aria-hidden="true" className={isPending ? 'grayscale opacity-40' : ''}>
                        {step.icon}
                      </span>
                    )}
                  </div>

                  {/* Step label */}
                  <div className="pt-1.5">
                    <p
                      className={`font-semibold text-sm ${
                        isPending ? 'text-gray-400' : 'text-gray-900'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${isPending ? 'text-gray-300' : 'text-gray-500'}`}>
                      {step.desc}
                    </p>
                  </div>

                  {isCurrent && order.status !== 'ready' && (
                    <span className="ml-auto mt-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-orange-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {order.status !== 'ready' && (
          <p className="text-xs text-gray-400 mt-5 text-center">
            Auto-updating every 5 seconds…
          </p>
        )}
      </div>

      {/* Order details */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 text-sm">
          {order.orderType === 'dine-in'
            ? `🍽️ Dine In — Table ${order.tableNumber}`
            : '🥡 Takeout'}
          <span className="ml-2 text-gray-400 font-normal">· {order.customerName}</span>
        </h2>

        <ul className="space-y-2 text-sm mb-4">
          {order.items?.map((item, i) => (
            <li key={i} className="flex justify-between">
              <span className="text-gray-700">
                <span role="img" aria-hidden="true">{item.emoji}</span>{' '}
                {item.name}{' '}
                <span className="text-gray-400">× {item.quantity}</span>
              </span>
              <span className="text-gray-900 font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>

        <div className="border-t pt-3 text-sm space-y-1">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>${order.subtotal?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Tax</span>
            <span>${order.tax?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base pt-1">
            <span>Total</span>
            <span>${order.total?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Link
        to="/"
        className="block w-full text-center border-2 border-orange-200 text-orange-600 hover:bg-orange-50 font-semibold py-3 rounded-xl transition-colors"
      >
        Order More →
      </Link>
    </div>
  );
}
