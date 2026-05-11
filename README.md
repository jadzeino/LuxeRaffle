# LuxeRaffle

A staff-level implementation of a luxury car raffle platform — server-first, fully accessible, production-minded.

> **Full write-up** → [SOLUTION.md](./SOLUTION.md)  
> **Original challenge brief** → [challange.md](./challange.md)

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

Demo account: **jane.doe@gmail.com** / **applejuice**

---

## What was built

| Area | What ships |
|---|---|
| Homepage | Cinematic hero + live raffle grid with Suspense skeleton streaming |
| Raffle grid | Client-side search + price-bucket filter, 3D perspective tilt on cards |
| Cart | HttpOnly-cookie cart, optimistic quantity controls, Suspense-streamed totals |
| Auth | Edge-middleware route guard, HttpOnly token cookie, login with error echo-back |
| Checkout | Availability pre-check, tagged cache invalidation, redirect to account |
| Account | Streaming shell → async orders section, stats strip, graceful API degradation |
| API resilience | `fetchJsonWithRetry` — 3 attempts at 0 / 300 / 800 ms, retries 5xx + timeouts |
| SEO | Per-page metadata, OpenGraph, Twitter card, JSON-LD, sitemap + robots |
| Accessibility | Skip-to-main, ARIA live regions, keyboard nav, `motion-reduce` guards |
| Dark mode | Cookie-persisted theme, no flash of incorrect theme on load |
| Tests | 17 Vitest unit tests + 19 Playwright E2E tests across 5 spec files |

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 App Router | RSC + streaming + server actions in one model |
| Language | TypeScript strict | Catches API shape mismatches at compile time |
| Styling | Tailwind CSS + shadcn/ui | Utility-first + accessible Radix primitives |
| Validation | Zod | Schema-first types, safe API boundary |
| Icons | Lucide React | Tree-shakeable, consistent stroke weight |
| Toasts | Sonner | Lightweight, Radix-compatible, accessible |
| Unit tests | Vitest | Native ESM, fast, Vite resolver for path aliases |
| E2E tests | Playwright + axe-core | Cross-browser, automated a11y scanning |

---

## Scripts

```bash
npm run dev        # Dev server (Turbopack)
npm run build      # Production build
npm run start      # Serve production build
npm run lint       # ESLint
npm test           # Vitest unit tests
npm run test:e2e   # Playwright E2E tests
```

---

## Project layout

```
src/
  app/
    actions/            # Server actions: cart, auth, checkout
    account/            # Account page + /orders alias
    cart/               # Cart page — Suspense streaming
    checkout/           # Checkout with availability pre-check
    login/              # Login form page
  components/
    app-header/         # Sticky nav: cart badge, user avatar, theme toggle
    cart/               # CartLine, CartControls, CartSidebar
    layout/             # Mobile drawer with focus trap
    raffle/             # AddToCartButton, RaffleCardTilt (3D perspective)
    raffle-tile/        # Raffle card server component
    raffles-grid/       # Server shell + RafflesGridClient (search/filter)
    seo/                # JsonLd script injector
    theme/              # ThemeToggle client island
  lib/
    api/                # fetchJson, fetchJsonWithRetry, getRaffles, getOrders
    auth/               # requireUser, getAuthToken, session helpers
    cart/               # Cookie helpers, buildCartSummary
    schemas/            # Zod schemas: raffle, cart, order, auth
    seo/                # JSON-LD schema builders
  middleware.ts          # Edge guard for /account and /checkout
e2e/
  critical-flow.spec.ts         # Full login → add → checkout → account journey
  accessibility.spec.ts         # axe-core WCAG 2.1 AA scan
  responsive-accessibility.spec.ts  # Mobile viewport + keyboard nav
  cart-management.spec.ts       # Add, increase, decrease, remove, empty state
  filters.spec.ts               # Search, price buckets, aria-pressed, live region
  auth.spec.ts                  # Error echo, redirect, logout, route gating
```

---

## Architecture in one diagram

```
Browser
  │
  ├─ GET /           → RSC homepage (ISR 60s revalidate)
  │                      Suspense → RafflesSection
  │                                  └─ RafflesGridClient [client island: search + filter]
  │
  ├─ GET /cart       → RSC reads cart cookie (microseconds)
  │                      Suspense → CartLines   (getRaffles — network)
  │                      Suspense → CartSidebar (getRaffles — deduplicated via cache())
  │
  ├─ GET /account    → RSC reads auth cookie (microseconds) → shell streams
  │                      Suspense → OrdersSection (getOrders + getRaffles in parallel)
  │
  ├─ middleware (Edge) → /account, /checkout gated before server render
  │
  └─ Server Actions
       addToCart / updateCartItem / removeCartItem  →  revalidatePath
       loginAction                                  →  setAuthToken cookie
       checkoutAction → createOrder → clearCart → revalidateTag('raffles') + revalidateTag('orders')
```

---

See **[SOLUTION.md](./SOLUTION.md)** for the complete decision log — architecture choices, trade-offs, package rationale, accessibility and SEO decisions, what the original scaffold contained versus what changed and why, and the full production readiness roadmap.
