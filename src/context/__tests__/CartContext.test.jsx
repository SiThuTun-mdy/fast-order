import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  CartProvider,
  useCart,
  useCartDispatch,
  useCartTotal,
  useCartCount,
} from '../CartContext';

// data-builders: a small factory for menu-item-shaped fixtures, minimal fields only.
function buildMenuItem(overrides = {}) {
  return {
    id: 1,
    name: 'Test Burger',
    price: 10,
    emoji: '🍔',
    ...overrides,
  };
}

// Combines all four cart hooks behind CartProvider so a single renderHook call
// can dispatch actions and read back both raw cart state and derived totals.
function useCartHarness() {
  const cart = useCart();
  const dispatch = useCartDispatch();
  const total = useCartTotal();
  const count = useCartCount();
  return { cart, dispatch, total, count };
}

function renderCart() {
  return renderHook(() => useCartHarness(), { wrapper: CartProvider });
}

describe('cartReducer via CartProvider', () => {
  it('adds a new item to an empty cart with quantity 1', () => {
    const { result } = renderCart();
    const burger = buildMenuItem();

    act(() => result.current.dispatch({ type: 'ADD_ITEM', item: burger }));

    expect(result.current.cart).toEqual([{ ...burger, quantity: 1 }]);
  });

  it('increments quantity instead of duplicating when the same item is added again', () => {
    const { result } = renderCart();
    const burger = buildMenuItem();

    act(() => result.current.dispatch({ type: 'ADD_ITEM', item: burger }));
    act(() => result.current.dispatch({ type: 'ADD_ITEM', item: burger }));

    expect(result.current.cart).toEqual([{ ...burger, quantity: 2 }]);
  });

  it('keeps distinct items separate when adding different items', () => {
    const { result } = renderCart();
    const burger = buildMenuItem({ id: 1, name: 'Test Burger' });
    const fries = buildMenuItem({ id: 2, name: 'Test Fries', price: 3 });

    act(() => result.current.dispatch({ type: 'ADD_ITEM', item: burger }));
    act(() => result.current.dispatch({ type: 'ADD_ITEM', item: fries }));

    expect(result.current.cart).toEqual([
      { ...burger, quantity: 1 },
      { ...fries, quantity: 1 },
    ]);
  });

  it('removes an item by id', () => {
    const { result } = renderCart();
    const burger = buildMenuItem({ id: 1 });
    const fries = buildMenuItem({ id: 2, name: 'Test Fries' });
    act(() => result.current.dispatch({ type: 'ADD_ITEM', item: burger }));
    act(() => result.current.dispatch({ type: 'ADD_ITEM', item: fries }));

    act(() => result.current.dispatch({ type: 'REMOVE_ITEM', id: 1 }));

    expect(result.current.cart).toEqual([{ ...fries, quantity: 1 }]);
  });

  it('updates the quantity of an existing item', () => {
    const { result } = renderCart();
    const burger = buildMenuItem({ id: 1 });
    act(() => result.current.dispatch({ type: 'ADD_ITEM', item: burger }));

    act(() =>
      result.current.dispatch({ type: 'UPDATE_QUANTITY', id: 1, quantity: 5 })
    );

    expect(result.current.cart).toEqual([{ ...burger, quantity: 5 }]);
  });

  it('removes the item when quantity is updated to zero or below', () => {
    const { result } = renderCart();
    const burger = buildMenuItem({ id: 1 });
    act(() => result.current.dispatch({ type: 'ADD_ITEM', item: burger }));

    act(() =>
      result.current.dispatch({ type: 'UPDATE_QUANTITY', id: 1, quantity: 0 })
    );

    expect(result.current.cart).toEqual([]);
  });

  it('clears every item from the cart', () => {
    const { result } = renderCart();
    act(() =>
      result.current.dispatch({ type: 'ADD_ITEM', item: buildMenuItem({ id: 1 }) })
    );
    act(() =>
      result.current.dispatch({ type: 'ADD_ITEM', item: buildMenuItem({ id: 2 }) })
    );

    act(() => result.current.dispatch({ type: 'CLEAR_CART' }));

    expect(result.current.cart).toEqual([]);
  });

  it('throws for an unrecognized action type', () => {
    const { result } = renderCart();

    expect(() =>
      act(() => result.current.dispatch({ type: 'NOT_A_REAL_ACTION' }))
    ).toThrow('Unknown cart action: NOT_A_REAL_ACTION');
  });
});

describe('derived cart totals (useCartTotal / useCartCount)', () => {
  it('sums price * quantity across all items for the total', () => {
    const { result } = renderCart();
    act(() =>
      result.current.dispatch({
        type: 'ADD_ITEM',
        item: buildMenuItem({ id: 1, price: 10 }),
      })
    );
    act(() =>
      result.current.dispatch({
        type: 'UPDATE_QUANTITY',
        id: 1,
        quantity: 3,
      })
    );
    act(() =>
      result.current.dispatch({
        type: 'ADD_ITEM',
        item: buildMenuItem({ id: 2, price: 4 }),
      })
    );

    expect(result.current.total).toBe(34); // (10 * 3) + (4 * 1)
  });

  it('sums quantities across all items for the count', () => {
    const { result } = renderCart();
    act(() =>
      result.current.dispatch({ type: 'ADD_ITEM', item: buildMenuItem({ id: 1 }) })
    );
    act(() =>
      result.current.dispatch({ type: 'UPDATE_QUANTITY', id: 1, quantity: 3 })
    );
    act(() =>
      result.current.dispatch({ type: 'ADD_ITEM', item: buildMenuItem({ id: 2 }) })
    );

    expect(result.current.count).toBe(4); // 3 + 1
  });

  it('reports zero total and count for an empty cart', () => {
    const { result } = renderCart();

    expect(result.current.total).toBe(0);
    expect(result.current.count).toBe(0);
  });
});
