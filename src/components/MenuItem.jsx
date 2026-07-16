import { useCartDispatch } from '../context/CartContext';

export default function MenuItem({ item }) {
  const dispatch = useCartDispatch();

  const handleAdd = () => {
    dispatch({ type: 'ADD_ITEM', item });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-shadow hover:shadow-md">
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 h-36 flex items-center justify-center text-5xl select-none">
        <span role="img" aria-label={item.name}>{item.emoji}</span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 leading-tight text-sm sm:text-base">
            {item.name}
          </h3>
          {item.popular && (
            <span className="flex-shrink-0 text-xs bg-yellow-100 text-yellow-600 font-medium px-2 py-0.5 rounded-full">
              Popular
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-gray-500 mb-3 flex-1 leading-relaxed">
          {item.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-900">${item.price.toFixed(2)}</span>
          <button
            onClick={handleAdd}
            className="bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}
