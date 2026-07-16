import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, useCartTotal, useCartDispatch } from '../context/CartContext';
import { createOrder } from '../api/orders';

export default function CheckoutPage() {
  const cart = useCart();
  const total = useCartTotal();
  const dispatch = useCartDispatch();
  const navigate = useNavigate();

  const tax = total * 0.1;
  const grandTotal = total + tax;

  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    orderType: 'dine-in',
    tableNumber: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      const order = await createOrder({
        ...form,
        items: cart.map(({ id, name, price, quantity, emoji }) => ({
          id,
          name,
          price,
          quantity,
          emoji,
        })),
        subtotal: parseFloat(total.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(grandTotal.toFixed(2)),
      });

      dispatch({ type: 'CLEAR_CART' });
      navigate(`/order/${order.id}`);
    } catch {
      setError('Unable to place order. Please try again.');
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">Nothing in your cart.</p>
        <Link to="/" className="text-yellow-500 font-medium hover:underline">
          Back to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/cart" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Cart
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Customer form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="customerName">
              Full Name
            </label>
            <input
              id="customerName"
              name="customerName"
              type="text"
              required
              value={form.customerName}
              onChange={handleChange}
              placeholder="Jane Smith"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={form.phone}
              onChange={handleChange}
              placeholder="555-0100"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">Order Type</span>
            <div className="flex gap-3">
              {[
                { value: 'dine-in', label: '🍽️ Dine In' },
                { value: 'takeout', label: '🥡 Takeout' },
              ].map(({ value, label }) => (
                <label key={value} className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="orderType"
                    value={value}
                    checked={form.orderType === value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div
                    className={`text-center py-2.5 border-2 rounded-xl text-sm font-medium transition-colors ${
                      form.orderType === value
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {form.orderType === 'dine-in' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tableNumber">
                Table Number
              </label>
              <input
                id="tableNumber"
                name="tableNumber"
                type="text"
                required
                value={form.tableNumber}
                onChange={handleChange}
                placeholder="e.g. 7"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
              Special Instructions{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Allergies, no onions, extra sauce..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors text-base"
          >
            {submitting ? 'Placing Order…' : `Place Order · $${grandTotal.toFixed(2)}`}
          </button>
        </form>

        {/* Order summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 lg:sticky lg:top-20">
          <h2 className="font-semibold text-gray-900 mb-4 text-base">Order Summary</h2>

          <ul className="space-y-2.5 mb-4">
            {cart.map((item) => (
              <li key={item.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">
                  <span role="img" aria-hidden="true">{item.emoji}</span>{' '}
                  {item.name}{' '}
                  <span className="text-gray-400">× {item.quantity}</span>
                </span>
                <span className="font-medium text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          <div className="border-t pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t mt-1">
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
