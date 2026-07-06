import { createContext, useContext, useReducer } from 'react';

const CartContext = createContext(null);
const CartDispatchContext = createContext(null);

function cartReducer(cart, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = cart.find(i => i.id === action.item.id);
      if (existing) {
        return cart.map(i =>
          i.id === action.item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...cart, { ...action.item, quantity: 1 }];
    }
    case 'REMOVE_ITEM':
      return cart.filter(i => i.id !== action.id);
    case 'UPDATE_QUANTITY':
      if (action.quantity <= 0) return cart.filter(i => i.id !== action.id);
      return cart.map(i =>
        i.id === action.id ? { ...i, quantity: action.quantity } : i
      );
    case 'CLEAR_CART':
      return [];
    default:
      throw Error('Unknown cart action: ' + action.type);
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, []);
  return (
    <CartContext.Provider value={cart}>
      <CartDispatchContext.Provider value={dispatch}>
        {children}
      </CartDispatchContext.Provider>
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

export function useCartDispatch() {
  return useContext(CartDispatchContext);
}

export function useCartTotal() {
  const cart = useCart();
  return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function useCartCount() {
  const cart = useCart();
  return cart.reduce((sum, i) => sum + i.quantity, 0);
}
