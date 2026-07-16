import { Link } from 'react-router-dom';
import CartItem from '../components/CartItem';
import { useCart, useCartTotal, useCartDispatch } from '../context/CartContext';

export default function CartPage() {
  const cart = useCart();
  const total = useCartTotal();
  const dispatch = useCartDispatch();
  const tax = total * 0.1;
  const grandTotal = total + tax;

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <span className="text-5xl block mb-4">🛒</span>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some items from the menu to get started.</p>
        <Link
          to="/"
          className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Menu
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
        </div>
        <button
          onClick={() => dispatch({ type: 'CLEAR_CART' })}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-gray-100 px-4 mb-4">
        {cart.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>

      {/* Order summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Order Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax (10%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base border-t pt-2 mt-1">
            <span>Total</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Checkout CTA */}
      <Link
        to="/checkout"
        className="block w-full text-center bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-4 rounded-xl transition-colors text-base"
      >
        Proceed to Checkout · ${grandTotal.toFixed(2)}
      </Link>
    </div>
  );
}
