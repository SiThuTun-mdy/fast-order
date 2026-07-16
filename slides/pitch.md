---
marp: true
theme: default
paginate: true
size: 16:9
auto-advance: 20
---

# Fast Order
### One Developer. Three AI Agents. Production-Shaped Demo.

**Stack:** React 18 · Next.js (Route Handlers) · Supabase Postgres · Vitest
**Built:** VibeCode Tour · Jul 2026

---

## The Problem & The Pipeline

Small food stalls and food houses need a fast way to take orders and let
customers track status in real time — without a POS system or spreadsheet chaos.

| BEFORE: Fragmented | AFTER: Fast Order |
|---|---|
| 📝 Paper tickets / verbal orders | 📋 Menu → Cart → Checkout |
| ❌ No order status visibility | 🔔 Real-time status polling |
| ❌ One role does everything | 🧑‍🍳 Cashier · Kitchen · Admin · SysAdmin |
| ❌ No access control | 🔒 RBAC: roles, permissions, tenants |

**Flow:** `MENU → CART → CHECKOUT → CONFIRM (Cashier) → PREPARE (Kitchen) → SERVED`

📊 13 route pages · 13 DB tables · 100 tests

---

## Multi-Agent Architecture

| Agent | Tools | Deliverables |
|---|---|---|
| 💻 Developer (Claude Code) | Context7, Supabase MCP, Playwright MCP | 32 components/pages, 13 API routes, 100 tests |
| 🎨 design-system | Read/Grep/Glob, Bash | shadcn/base-ui consistency, semantic Tailwind tokens |
| 🔎 code-reviewer | Read/Grep/Glob, Bash | Correctness bugs, React anti-patterns, complexity review |
| 🧪 testing-best-practices | Read/Grep/Glob/Write, Playwright MCP | Coverage of Cart, Auth, Orders, API client |

> **Rule:** UI changes get a design-system pass; code changes get a reviewer pass before commit.

---

## Skills — Composable & Versioned

| Phase | Skill | Output |
|---|---|---|
| **Backend** | `supabase-server`, `supabase-postgres-best-practices` | RLS-safe route handlers, migrations, query design |
| **Frontend** | `react-vite-best-practices`, `shadcn` | Component patterns, primitive composition |
| **Domain** | `user-order-flow` | Order lifecycle gotchas (menu → cart → checkout → status) |
| **Quality** | `testing-best-practices`, `clean-code-principles` | 100-test suite, readable, minimal diffs |
| **Docs** | `context7-mcp` | Up-to-date Next.js/Supabase/Tailwind APIs, no hallucinated signatures |

```
The frontend never talks to Supabase directly — every DB call routes through the
Next.js API in server/, which owns authorization: orders are only ever created as
`confirmed`, customer records are never read back to the client.
```

---

## MCP Servers — Augmented Context

| Server | Function |
|---|---|
| 📚 **Context7** | Live docs for Next.js, Supabase, Tailwind v4, base-ui |
| 🛢️ **Supabase** | Migrations, RLS, schema inspection, query debugging |
| 🧪 **Playwright** | Browser automation for E2E verification |

```
Agent calls MCP → MCP returns live, versioned docs → Agent writes correct code
first try. Tailwind v4 (@theme, no config file) and base-ui's `render=` composition
pattern are both recent enough that stale training data would have gotten them wrong.
```

---

## Results & Lessons

| By the Numbers | Top Lessons |
|---|---|
| 13 Route Pages | 1. **RBAC from day one** — SysAdmin/Admin/Cashier/Kitchen roles, no bolt-on later |
| 32 App Components/Pages | 2. **Backend owns the DB** — frontend never touches Supabase directly |
| 14 shadcn/base-ui Primitives | 3. **Mid-migration is real** — hand-rolled Tailwind → shadcn tracked via design-system agent |
| 13 API Route Handlers | 4. **Polling needs guardrails** — fixed an infinite-polling bug in order status tracking |
| 13 DB Tables (incl. RBAC + tenants) | 5. **Migrations over hotfixes** — status transitions (e.g. `canceled`) shipped as SQL migrations |
| 100 Tests (frontend + backend) | |

| NOW ✅ | NEXT 🔜 | LATER 🔮 |
|---|---|---|
| Menu, Cart, Checkout, Order Status | Multi-tenant onboarding UI | Real-time order push (no polling) |
| Cashier & Kitchen dashboards | Audit logging on admin actions | Mobile PWA |
| RBAC (SysAdmin/Admin/Cashier/Kitchen) | Username availability UX polish | Analytics dashboard |

_Built with Claude Code · VibeCode Tour · Jul 2026 · Spec-driven, agent-assisted_
