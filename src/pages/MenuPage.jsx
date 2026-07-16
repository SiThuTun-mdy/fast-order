import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CategoryFilter from '../components/CategoryFilter';
import MenuItem from '../components/MenuItem';
import { useCartCount, useCartTotal } from '../context/CartContext';
import { getMenuItems, getCategories } from '../api/orders';

export default function MenuPage() {
  const [allCategories, setAllCategories] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const sectionRefs = useRef({});
  const isScrollingRef = useRef(false);

  const cartCount = useCartCount();
  const cartTotal = useCartTotal();

  useEffect(() => {
    Promise.all([getCategories(), getMenuItems('all')])
      .then(([cats, items]) => {
        setAllCategories(cats);
        setAllItems(items);
      })
      .finally(() => setLoading(false));
  }, []);

  const groupedItems = useMemo(
    () =>
      allCategories
        .filter((c) => c.id !== 'all')
        .map((cat) => ({
          ...cat,
          items: allItems.filter((item) => item.category === cat.id),
        }))
        .filter((group) => group.items.length > 0),
    [allCategories, allItems]
  );

  // Keep active category in sync as user scrolls
  useEffect(() => {
    if (groupedItems.length === 0) return;

    const observers = groupedItems.map(({ id }) => {
      const el = sectionRefs.current[id];
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isScrollingRef.current) {
            setActiveCategory(id);
          }
        },
        { rootMargin: '-10% 0px -80% 0px', threshold: 0 }
      );
      obs.observe(el);
      return obs;
    });

    return () => observers.forEach((obs) => obs?.disconnect());
  }, [groupedItems]);

  const handleCategoryChange = useCallback((categoryId) => {
    setActiveCategory(categoryId);
    isScrollingRef.current = true;
    setTimeout(() => { isScrollingRef.current = false; }, 1000);

    if (categoryId === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = sectionRefs.current[categoryId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Mobile sticky category bar */}
      <div className="md:hidden sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm px-4 py-3">
        <CategoryFilter
          categories={allCategories}
          selected={activeCategory}
          onChange={handleCategoryChange}
        />
      </div>

      <div className="md:flex md:gap-6">
        {/* Desktop sticky sidebar */}
        <aside className="hidden md:block w-52 lg:w-60 shrink-0 px-4 pt-6">
          <div className="sticky top-20">
            <CategoryFilter
              categories={allCategories}
              selected={activeCategory}
              onChange={handleCategoryChange}
              vertical
            />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-4 pt-6 pb-28 min-w-0">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              What are you craving? 🤤
            </h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              Fresh made to order — pick, add, and we'll handle the rest.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-36 bg-gray-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            groupedItems.map(({ id, name, icon, items }) => (
              <section
                key={id}
                ref={(el) => { sectionRefs.current[id] = el; }}
                id={`section-${id}`}
                className="mb-10 scroll-mt-32 md:scroll-mt-24"
              >
                <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  <span role="img" aria-hidden="true">{icon}</span>
                  {name}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <MenuItem key={item.id} item={item} />
                  ))}
                </div>
              </section>
            ))
          )}
        </main>
      </div>

      {/* Sticky cart CTA */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-0 right-0 px-4 z-30">
          <div className="max-w-lg mx-auto">
            <Link
              to="/cart"
              className="flex items-center justify-between bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-5 py-4 rounded-2xl shadow-lg transition-colors"
            >
              <span className="bg-yellow-400 rounded-lg px-2.5 py-0.5 text-sm">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span>
              <span>View Cart</span>
              <span>${cartTotal.toFixed(2)}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
