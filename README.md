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

## Deploying to Vercel

Because the frontend and backend are two independent apps, they deploy as **two separate Vercel projects** from this same GitHub repo, distinguished by each project's **Root Directory** setting.

### 1. Backend project (`server/`)

- Import the repo into Vercel, set **Root Directory** to `server`.
- Framework preset: Next.js (auto-detected).
- Environment variables (Project Settings → Environment Variables):
  - `SUPABASE_URL`
  - `SUPABASE_SECRET_KEY`
  - `AUTH_JWT_SECRET`
  - `FRONTEND_ORIGIN` — the client project's deployed URL (set this after step 2), e.g. `https://fast-order-eosin.vercel.app`
- Deploy. Note the resulting URL, e.g. `https://fast-order-api.vercel.app`.

### 2. Frontend project (repo root)

- Import the repo into Vercel again as a second project, this time leave **Root Directory** as `.` (repo root).
- Framework preset: Vite (auto-detected). A root `vercel.json` provides the SPA fallback rewrite needed for `react-router-dom`'s `BrowserRouter`.
- Environment variables:
  - `VITE_API_BASE_URL` — the backend project's URL from step 1, with `/api` appended, e.g. `https://fast-order-api.vercel.app/api`
- Deploy.

### 3. Close the loop

Go back to the backend project's `FRONTEND_ORIGIN` env var and set it to the frontend project's actual deployed URL (needed for the `Access-Control-Allow-Origin` CORS header in `server/next.config.js`), then redeploy the backend.

Preview deployments get their own URLs per branch/PR — if you need CORS to work on preview builds too, set `FRONTEND_ORIGIN` per-environment (Production/Preview/Development) in Vercel's env var UI rather than a single shared value.

