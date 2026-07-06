import { useCartDispatch } from '../context/CartContext';

export default function CartItem({ item }) {
  const dispatch = useCartDispatch();

  const setQty = (qty) =>
    dispatch({ type: 'UPDATE_QUANTITY', id: item.id, quantity: qty });

  const remove = () => dispatch({ type: 'REMOVE_ITEM', id: item.id });

  return (
    <div className="flex items-center gap-3 py-4 border-b border-gray-100 last:border-0">
      <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 select-none">
        <span role="img" aria-label={item.name}>{item.emoji}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
        <p className="text-sm text-orange-500 font-semibold">${item.price.toFixed(2)}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setQty(item.quantity - 1)}
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-colors text-lg font-medium"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
        <button
          onClick={() => setQty(item.quantity + 1)}
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-colors text-lg font-medium"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <div className="text-right ml-2">
        <p className="font-semibold text-sm text-gray-900">
          ${(item.price * item.quantity).toFixed(2)}
        </p>
        <button
          onClick={remove}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors mt-0.5"
          aria-label={`Remove ${item.name}`}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
