export default function CategoryFilter({ categories, selected, onChange, vertical = false }) {
  if (vertical) {
    return (
      <nav className="flex flex-col gap-0.5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
          Categories
        </p>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
              selected === cat.id
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
            }`}
          >
            <span role="img" aria-hidden="true" className="text-base">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </nav>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
            selected === cat.id
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500'
          }`}
        >
          <span role="img" aria-hidden="true">{cat.icon}</span>
          {cat.name}
        </button>
      ))}
    </div>
  );
}
