import posthog from 'posthog-js';

const key = import.meta.env.VITE_POSTHOG_KEY;
const enabled = Boolean(key);

export function initAnalytics() {
  if (!enabled) return;
  posthog.init(key, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    defaults: '2025-05-24',
  });
}

function capture(event, props) {
  if (!enabled) return;
  posthog.capture(event, props);
}

export const trackAddToCart = (item) =>
  capture('product_added_to_cart', {
    item_id: item.id,
    item_name: item.name,
    price: item.price,
  });

export const trackRemoveFromCart = (item) =>
  capture('product_removed_from_cart', {
    item_id: item.id,
    item_name: item.name,
    price: item.price,
    quantity: item.quantity,
  });

export const trackCartCleared = (cart, cartTotal) =>
  capture('cart_cleared', {
    item_count: cart.length,
    cart_total: cartTotal,
  });

export const trackCheckoutStarted = ({ itemCount, subtotal, tax, total }) =>
  capture('checkout_started', {
    item_count: itemCount,
    subtotal,
    tax,
    total,
  });

export const trackOrderPlaced = ({ orderId, orderType, subtotal, tax, total, cart }) =>
  capture('order_placed', {
    order_id: orderId,
    order_type: orderType,
    item_count: cart.reduce((n, i) => n + i.quantity, 0),
    subtotal,
    tax,
    total,
    items: cart.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  });

export const trackOrderFailed = ({ orderType, total, itemCount }) =>
  capture('order_failed', {
    order_type: orderType,
    total,
    item_count: itemCount,
  });
