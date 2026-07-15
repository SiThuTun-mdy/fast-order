# fast-order

Simple Food Ordering Web App. Menu with Categories, Cart View, Checkout and Order Status Pages.

**Demo**: [FastOrder](https://fast-order-eosin.vercel.app/)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6 |
| Styling | Tailwind CSS v3 |
| Backend | Next.js (Route Handlers, `server/`) |
| Database | Supabase (Postgres) — accessed only from the Next.js backend, via `@supabase/server` |
| Testing | Vitest, React Testing Library, jsdom |
| Build Tool | Vite (frontend), Next.js (backend) |
| MCP Servers | Playwright, Context7, Supabase |

The frontend never talks to Supabase directly — it calls the Next.js API in `server/`, which owns all database access (using the Supabase secret key) and enforces the app's authorization rules (e.g. orders can only be created as `confirmed`, customer records are never read back).

## Test Results

Run with `npm test` (frontend, from the repo root) and `cd server && npm test` (backend).

| Feature | Test File | Status |
|---|---|---|
| Cart Management | `src/context/__tests__/CartContext.test.jsx` | ✅ Passing |
| Order Status Polling | `src/hooks/__tests__/useOrders.test.js` | ✅ Passing |
| Frontend API Client (fetch wrapper) | `src/api/__tests__/orders.test.js` | ✅ Passing |
| Backend Route Handlers | `server/__tests__/routes.test.js` | ✅ Passing |

____

## Running the Project

This is two independent apps: the Vite/React frontend at the repo root, and the Next.js API in `server/`. Both need their own install and their own `.env.local`, and both need to be running for the app to work.

**Backend** (`server/`) — copy `server/.env.example` to `server/.env.local` and fill in your Supabase project's URL and secret key, then apply `supabase/migrations/*.sql` and `supabase/seed.sql` (via the Supabase CLI or the Studio SQL Editor):

```bash
cd server
npm install
npm run dev
```

Serves the API at `http://localhost:3000/api`.

**Frontend** (repo root) — copy `.env.example` to `.env.local` and point `VITE_API_BASE_URL` at the backend above:

```bash
npm install
npm run dev
```

The app is available at `http://localhost:5173`.

____

