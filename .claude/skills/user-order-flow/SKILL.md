---
name: user-order-flow
description: Conventions and gotchas for this app's customer order flow (menu browsing → cart → checkout → order status tracking). Use when adding order fields, changing order status/lifecycle, editing the checkout form, or touching CartContext, useOrders, api/orders.js, or the order-related Next.js API routes in server/app/api/.
---

# User Order Flow

The customer journey is: `MenuPage` → add to cart (`CartContext`) → `CartPage` → `CheckoutPage` → `createOrder` → redirect to `OrderStatusPage` → `useOrder` polls until ready.

## Cart state (`src/context/CartContext.jsx`)

- Cart is a flat array of `{ ...menuItem, quantity }`, held in a `useReducer` with actions `ADD_ITEM`, `REMOVE_ITEM`, `UPDATE_QUANTITY`, `CLEAR_CART`. All updates are immutable (`map`/`filter`, never in-place mutation) — keep new actions the same way.
- `UPDATE_QUANTITY` with `quantity <= 0` removes the item rather than storing a zero/negative quantity — reuse this instead of adding a separate "remove if zero" check at the call site.
- Derived values (`useCartTotal`, `useCartCount`) are plain `reduce()` over context on every render, not memoized. Fine at this cart size; if you add a derived value, follow the same pattern rather than introducing `useMemo` inconsistently.
- Two contexts (`CartContext` for state, `CartDispatchContext` for dispatch) so components that only dispatch (like `CartItem`) don't re-render on cart changes. Keep this split when adding cart-adjacent components.

## Order creation (`src/api/orders.js`, `CheckoutPage.jsx`)

- `createOrder` posts to `${VITE_API_BASE_URL}/orders` via the shared `request()` fetch wrapper at the top of `src/api/orders.js` — it parses JSON and, on a non-2xx response, throws `new Error(body.message)`. API functions return data directly, not a Response object. There is **no offline fallback anymore**: a failed request throws, and callers own the error UI.
- The backend (`server/app/api/orders/route.js`) creates the order atomically through the Supabase `create_order()` RPC (customer + order + items in one transaction) — don't replace it with separate table inserts.
- The tax rate (`0.1`) is duplicated as a literal in `CartPage.jsx`, `CheckoutPage.jsx`, and implicitly assumed in the order total sent to the server — there's no shared constant. If you change the tax rate, grep for `* 0.1` across `src/pages/` rather than assuming one edit covers it.
- Cart items are trimmed to `{ id, name, price, quantity, emoji }` before being sent as `order.items` — if a menu item gains a new field the checkout summary or kitchen display needs, add it explicitly to that mapping in `CheckoutPage.jsx:39-45`.

## Order status lifecycle

- Status values: `confirmed` → `kitchen` → `ready`, matching `STEPS` in `OrderStatusPage.jsx` and `STATUS_CONFIG` in `OrderStatusBadge.jsx`. The legal transition sequence is enforced in the database by the `enforce_order_status_transition` trigger (see `supabase/migrations/`), and the ids live in the `order_status` lookup table. If you add a new status, update both frontend maps, the lookup table, and the trigger — the PATCH route handler (`server/app/api/orders/[id]/status/route.js`) just forwards the update and translates a trigger rejection into a 400.
- New orders are created with status `confirmed` (default in the `create_order()` RPC) — this means "waiting to pay at the counter". `CashierPage.jsx` (route `/cashier`) lists orders via `getOrders()` and moves a `confirmed` order to `kitchen` via `updateOrderStatus(id, 'kitchen')`; `KitchenPage.jsx` (route `/kitchen`) shows `kitchen` orders and marks them `ready`. There are **no auto-advance timers** — every transition is a human action.
- Client-side, `useOrder` (`src/hooks/useOrders.js`) polls `getOrder` every 5s and stops when `status === 'ready'` **or** when the fetch errors — the error stop-condition was added specifically to fix an infinite-polling bug (see `useOrders.test.js` for the regression test). Don't remove the `|| error` from that guard without reintroducing that bug.
