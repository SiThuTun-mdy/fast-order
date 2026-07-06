---
name: user-order-flow
description: Conventions and gotchas for this app's customer order flow (menu browsing → cart → checkout → order status tracking). Use when adding order fields, changing order status/lifecycle, editing the checkout form, or touching CartContext, useOrders, api/orders.js, or the order-related mock-server routes.
---

# User Order Flow

The customer journey is: `MenuPage` → add to cart (`CartContext`) → `CartPage` → `CheckoutPage` → `createOrder` → redirect to `OrderStatusPage` → `useOrder` polls until ready.

## Cart state (`src/context/CartContext.jsx`)

- Cart is a flat array of `{ ...menuItem, quantity }`, held in a `useReducer` with actions `ADD_ITEM`, `REMOVE_ITEM`, `UPDATE_QUANTITY`, `CLEAR_CART`. All updates are immutable (`map`/`filter`, never in-place mutation) — keep new actions the same way.
- `UPDATE_QUANTITY` with `quantity <= 0` removes the item rather than storing a zero/negative quantity — reuse this instead of adding a separate "remove if zero" check at the call site.
- Derived values (`useCartTotal`, `useCartCount`) are plain `reduce()` over context on every render, not memoized. Fine at this cart size; if you add a derived value, follow the same pattern rather than introducing `useMemo` inconsistently.
- Two contexts (`CartContext` for state, `CartDispatchContext` for dispatch) so components that only dispatch (like `CartItem`) don't re-render on cart changes. Keep this split when adding cart-adjacent components.

## Order creation (`src/api/orders.js`, `CheckoutPage.jsx`)

- `createOrder` posts to `/orders` via the shared axios client (`src/api/client.js`, which unwraps `response.data` in an interceptor — API functions return data directly, not a response object).
- **Known gotcha**: every function in `api/orders.js` has a bare `catch` that treats *any* failure (network down, 500, validation error) as "offline" and fabricates a local fallback (mock menu data, or a `sessionStorage`-backed fake order with a client-simulated status timeline). This means a real server error currently looks identical to success from the UI's perspective. If you add a new API call, decide deliberately whether it needs this same offline-fallback behavior — don't copy the pattern reflexively onto endpoints where masking a server error would be actively harmful (e.g. anything payment-related).
- The tax rate (`0.1`) is duplicated as a literal in `CartPage.jsx`, `CheckoutPage.jsx`, and implicitly assumed in the order total sent to the server — there's no shared constant. If you change the tax rate, grep for `* 0.1` across `src/pages/` rather than assuming one edit covers it.
- Cart items are trimmed to `{ id, name, price, quantity, emoji }` before being sent as `order.items` — if a menu item gains a new field the checkout summary or kitchen display needs, add it explicitly to that mapping in `CheckoutPage.jsx:39-45`.

## Order status lifecycle

- Status values: `confirmed` → `kitchen` → `ready`, matching `STEPS` in `OrderStatusPage.jsx` and `STATUS_CONFIG` in `OrderStatusBadge.jsx`. If you add a new status, update both, plus the `valid` array in `mock-server/server.js`'s `PATCH /api/orders/:id/status` handler (`server.js:84`) and the `simulatedStatus` offline timeline in `api/orders.js:41-46`.
- Server-side, `mock-server/server.js` auto-advances a newly created order via `setTimeout(15_000)` → `kitchen` and `setTimeout(45_000)` → `ready` (`server.js:63-64`), persisting to `mock-server/data.json` on every write. `advanceStatus` refuses to move an order that's already `ready` (`server.js:25`) — preserve that guard if you touch it, so a stale timer can't un-ready an order a human already marked ready via the admin PATCH.
- Client-side, `useOrder` (`src/hooks/useOrders.js`) polls `getOrder` every 5s and stops when `status === 'ready'` **or** when the fetch errors — the error stop-condition was added specifically to fix an infinite-polling bug (see `useOrders.test.js` for the regression test). Don't remove the `|| error` from that guard without reintroducing that bug.
- Offline/fallback status is *simulated by elapsed time* (`simulatedStatus` in `api/orders.js`), independent of the server's real timers. These two clocks aren't synced — that's expected for the demo fallback, not a bug to "fix" by wiring them together unless asked.

## Mock server data (`mock-server/server.js`, `mock-server/data.json`)

- `POST /api/orders` spreads `...req.body` after setting `id`, so a client-supplied `id`/other field can currently override server-generated values except `status`/`createdAt`/`updatedAt` (those are set after the spread). If you add a new server-assigned field to order creation, place it **after** the `...req.body` spread, not before, or it's silently overridable by the client.
- `data.json` is real persisted state, read/written synchronously on every request. Tests that touch it must back it up and restore it (see `mock-server/__tests__/server.test.js`) — prefer a temp-file copy over overwriting the real file in place if you add more integration tests here.
