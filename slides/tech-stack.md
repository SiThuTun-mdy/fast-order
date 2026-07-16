---
marp: true
paginate: true
transition: fade
# PechaKucha: 6 slides, 20s auto-advance. Do not change the count.
auto-advance: 20
---

<!-- slide 1 -->
# Tech Stack
- Client: React 18 + Vite, React Router, Tailwind v4, shadcn/ui, TanStack Table
- Server: Next.js 16 API routes (`server/`)
- Data/Auth: Supabase (Postgres, RPC, JWT)
- Testing: Vitest, Testing Library
<!-- 20s -->

---

<!-- slide 2 -->
# Agents
- `code-reviewer` — correctness bugs, React anti-patterns, complexity (post-edit)
- `design-system` — shadcn/Tailwind consistency for UI changes
- `testing-best-practices` — applies 34-rule test checklist to new/changed tests

---

<!-- slide 3 -->
# Skills
- `user-order-flow` — cart → checkout → order status conventions & gotchas
- `shadcn`, `supabase`, `supabase-server` — framework-specific guidance
- `react-vite-best-practices`, `clean-code-principles`, `testing-best-practices`

---

<!-- slide 4 -->
# Methodology
- Small, reversible edits with tests run before commit
- Proactive agent review after touching UI or business logic
- Skills auto-loaded by file path / import, not manually recalled

---

<!-- slide 5 -->
# Trigger
- Editing `src/` UI → `design-system` agent
- Editing cart/checkout/order routes → `user-order-flow` skill
- Any code change → `code-reviewer` agent before commit

---

<!-- slide 6 -->
# Commands
- `npm run dev:all` — client + API concurrently
- `npm run build:all` — build both client and server
- `npm test` — Vitest (client and `server/` each have their own)
