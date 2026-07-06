# fast-order

Simple Food Ordering Web App. Menu with Categories, Cart View, Checkout and Order Status Pages.

**Demo**: [FastOrder](https://fast-order-eosin.vercel.app/)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6 |
| Styling | Tailwind CSS v3 |
| HTTP Client | Axios |
| Backend (mock) | Express, CORS |
| Testing | Vitest, React Testing Library, Supertest, jsdom |
| Build Tool | Vite |
| Tooling | Concurrently (runs frontend + mock server together) |
| MCP Servers | Playwright, Context7 |

## Test Results

Run with `npm test`.

| Feature | Test File | Cases | Status |
|---|---|---|---|
| Cart Management | `src/context/__tests__/CartContext.test.jsx` | 11 | ✅ Passing |
| Order Status Polling | `src/hooks/__tests__/useOrders.test.js` | 6 | ✅ Passing |
| Backend API (Menu & Orders) | `mock-server/__tests__/server.test.js` | 7 | ✅ Passing |
| **Total** | 3 files | **24** | ✅ All Passing |

____

## Running the Project

```bash
npm install
npm start
```

This runs the Vite dev server (`:5173`) and the Express mock API (`:3001`) together. The app is available at `http://localhost:5173`.

____

