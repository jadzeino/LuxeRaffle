# SOLUTION.md — LuxeRaffle Engineering Write-up

---

## Table of contents

1. [Challenge summary](#1-challenge-summary)
2. [What I built — feature inventory](#2-what-i-built--feature-inventory)
3. [Architecture](#3-architecture)
4. [Tech stack and package rationale](#4-tech-stack-and-package-rationale)
5. [Key engineering decisions and trade-offs](#5-key-engineering-decisions-and-trade-offs)
6. [API resilience](#6-api-resilience)
7. [Accessibility](#7-accessibility)
8. [SEO](#8-seo)
9. [Testing strategy](#9-testing-strategy)
10. [Original scaffold vs. what I changed — and why](#10-original-scaffold-vs-what-i-changed--and-why)
11. [What's next — production readiness roadmap](#11-whats-next--production-readiness-roadmap)

---

## 1. Challenge summary

The [original challenge brief](./challange.md) provided a partially wired Next.js 15 scaffold and asked for:

- Homepage raffle display with loading states and caching
- Add-to-cart flow with a live cart icon
- Cart management (quantity adjustment, removal, totals)
- User authentication (login, logout, error handling)
- *(Optional)* Checkout and account order history
- *(Optional)* Fix direct-subpage 404s

The challenge notes the simulated API is intentionally flaky — slow responses and occasional 5xx errors are expected and should be handled gracefully.

---

## 2. What I built — feature inventory

### Homepage
- Full-bleed cinematic hero with a blur-up image placeholder and a CTA that smooth-scrolls to the raffle grid
- Raffle grid server-fetched with 60-second ISR revalidation — stale-while-revalidate on repeat visits, skeleton fallback on first load via `<Suspense>`
- "In cart (N)" persistent button state: `getCartItems()` is read alongside `getRaffles()` (both memoised via `React.cache()`) and a `Map<id, qty>` flows down to each `AddToCartButton`

### Raffle grid client island (`RafflesGridClient`)
- Real-time text search across raffle name and description
- Four price-bucket toggle filters: All / Under €20 / €20–€100 / Over €100 — both applied simultaneously
- ARIA live region announces result count to screen readers
- `aria-pressed` on filter buttons for keyboard/AT users

### Raffle card
- 3D perspective tilt on mouse move (CSS custom property `--rx`/`--ry`, reset on `mouseleave`)
- Availability badge: "X left" / "Almost sold out" (pulsing dot) / "Sold out"
- Progress bar with `role="progressbar"` and `aria-valuenow` / `aria-valuetext`
- Bottom-pinned controls regardless of title or description length — flex column with `flex-1` on the text block

### Cart
- HttpOnly cookie stores `[{ id, quantity }]` — never exposed to client JS
- `CartLines` and `CartSidebar` are separate async RSCs inside `<Suspense>` boundaries; both call `getRaffles()` which is deduplicated via `React.cache()` — one network request
- Quantity controls use `useOptimistic` for instant feedback before the server action confirms
- Line items show price-per-ticket badge, line total, and an alert if quantity exceeds live availability
- Animated slide-out on removal (`opacity-0 -translate-x-4 pointer-events-none`)

### Authentication
- Edge `middleware.ts` intercepts `/account` and `/checkout` before any server render — cheapest possible guard
- Login server action posts to the token API, validates with `tokenResponseSchema`, sets an HttpOnly `luxe_auth` cookie
- On failed login the action returns `{ error, email }` — the email value is fed back into `defaultValue` so users only retype their password; inputs show `aria-invalid="true"` and a destructive ring
- Logout clears the cookie and redirects to `/`

### Checkout
- `requireUser()` redirects unauthenticated requests before any data is fetched
- Calls `getFreshRaffles()` (`cache: 'no-store'`) for a live availability check — prevents overselling
- Submits order, clears cart cookie, calls `revalidateTag('raffles')` and `revalidateTag('orders')` to bust the Data Cache for both surfaces, then redirects to `/account`
- Mutations (`createOrder`) use plain `fetchJson` — never retried to avoid duplicate orders

### Account
- Page shell (user header, logout button) renders instantly from cookie reads — no network
- `<OrdersSection>` wrapped in `<Suspense>` streams in asynchronously with `getOrders()` and `getRaffles()` in parallel via `Promise.allSettled`
- Stats strip: total orders, total tickets, total spent
- If the raffles API fails, a contextual amber degraded-mode banner replaces the line-item prices rather than crashing the page
- Monospace order IDs, per-line `qty × price` with running total

### Dark mode
- Cookie-persisted (`luxe_theme`) — server reads the cookie in the root layout and applies the `dark` class server-side, so there is never a flash of incorrect theme on initial load
- `ThemeToggle` client island writes the cookie and toggles the class on `<html>` without a full navigation

### SEO infrastructure
- `metadataBase` + per-page `title` template (`%s | LuxeRaffle`)
- OpenGraph and Twitter card metadata in the root layout
- `robots.ts` (Next.js native): `Disallow: /account, /checkout` — private pages stay out of indexes
- `sitemap.ts` (Next.js native): homepage priority 1.0 / hourly, login and cart at lower priorities
- JSON-LD `@graph` on the homepage: `Organization`, `WebSite`, `ItemList` with raffle `Product + Offer` nodes including real-time `InStock`/`SoldOut` availability

### Mobile navigation
- Drawer that opens from a hamburger button; `aria-expanded`, `aria-controls` wired correctly
- Scroll locked while open via `overflow-hidden` on `<body>`
- Closes on route change via `usePathname` effect

---

## 3. Architecture

### Rendering model

```
Homepage (ISR, 60s)
  └─ Suspense boundary
       └─ RafflesSection (async RSC) — blocks on getRaffles + getCartItems
            └─ RafflesGridClient (client island) — search/filter in JS

Cart page (dynamic — cookies() makes it so)
  └─ CartLines (async RSC in Suspense) — blocks on getRaffles
  └─ CartSidebar (async RSC in Suspense) — same getRaffles, deduplicated

Account page (dynamic — cookies() makes it so)
  └─ page shell renders from cookie immediately
  └─ OrdersSection (async RSC in Suspense)
       └─ Promise.allSettled([getOrders, getRaffles])
```

### Why pages are dynamic without `force-dynamic`

Pages that call `cookies()` — cart, account, checkout — are automatically opted into dynamic rendering by Next.js 15. The explicit `export const dynamic = 'force-dynamic'` was removed because it silently sets `cache: 'no-store'` for every `fetch()` in that route. Combined with our `getRaffles`/`getOrders` options that include `next: { revalidate, tags }`, Next.js crashes internally trying to reconcile the two contradictory cache signals (the root cause of the production 500 errors). Letting `cookies()` handle the dynamic opt-in leaves the Data Cache intact.

### Data cache strategy

| Fetch | Cache setting | Invalidated by |
|---|---|---|
| `getRaffles()` | `next: { revalidate: 60, tags: ['raffles'] }` | `checkoutAction` via `revalidateTag('raffles')` |
| `getOrders()` | `next: { revalidate: 3600, tags: ['orders'] }` | `checkoutAction` via `revalidateTag('orders')` |
| `getFreshRaffles()` | `cache: 'no-store'` | — (checkout availability check, must be live) |
| `createOrder()` | `cache: 'no-store'` | — (POST mutation, no caching) |

### Per-request deduplication

`getRaffles` and `getCartItems` are wrapped in `React.cache()`. On the cart page, `CartLines` and `CartSidebar` both call `getRaffles()` — React's cache ensures only one network request is made per server-render. The same applies to `getCartItems` on the homepage.

### Client islands (the only JS that ships)

- `RafflesGridClient` — search input + price filter buttons + filtered grid render
- `AddToCartButton` — click handler, `useTransition` pending state, `router.refresh()`
- `CartControls` — `useOptimistic` quantity display, update/remove server actions
- `CartLine` — `useState(leaving)` for removal animation
- `LoginForm` — `useActionState` for form state, `useFormStatus` for pending
- `ThemeToggle` — cookie write + `<html>` class toggle
- `MobileNav` — open/close state, body scroll lock
- `CheckoutForm` — `useActionState` for checkout error state

Everything else — headers, footers, raffle tiles, order cards — is zero-JS server HTML.

---

## 4. Tech stack and package rationale

### Next.js 15 App Router + React 19

The App Router model lets you co-locate server data fetching directly inside components with no prop-drilling to leaves. Streaming via `<Suspense>` means the page shell (header, hero, layout) reaches the browser while slow API calls are in-flight — the user sees content immediately rather than waiting for the slowest fetch.

React 19 brings stable `useActionState` and `useFormStatus` — cleaner than the `useReducer` + manual pending-state approach from React 18.

### Zod

All API response shapes are declared as Zod schemas. Benefits:

1. TypeScript types are derived from the schema (`z.infer<typeof raffleSchema>`) — no separate type file to keep in sync
2. `safeParse` makes validation failures explicit — we throw a `ValidationError` and never let malformed data reach the UI
3. `z.preprocess` handles the European dotted number format in `carPrice` ("2.800.000" → 2800000) without any ad-hoc string manipulation scattered through the UI

### Tailwind CSS + shadcn/ui

shadcn/ui gives copy-pasteable accessible Radix primitives (Button, Badge, Input) that are owned by the project — not a black-box dependency. Combined with Tailwind utility classes, the design system is easy to extend without fighting a library's opinion about theming.

### Sonner

Lightweight toast library (5 KB vs react-hot-toast's 9 KB, and better accessible role handling). Used for add-to-cart feedback so the user has a confirmation even when the button is scrolled out of view. Each toast has a meaningful description for screen readers.

### Lucide React

Tree-shakeable icon set — only icons actually imported are bundled. The consistent 2px stroke weight reads well at small sizes used in badges and cart controls.

### Vitest

Runs in the Node environment with native ESM support. The Vite resolver handles `@/` path aliases without a separate tsconfig-paths plugin. Test files live next to their source modules, making it obvious what's covered.

### Playwright + @axe-core/playwright

Playwright runs full browser scenarios against the real dev server — no mocking. The axe-core integration lets the accessibility spec assert zero serious WCAG 2.1 AA violations with three lines of code.

---

## 5. Key engineering decisions and trade-offs

### HttpOnly cookies for both cart and auth

**Decision:** Both the cart (`luxe_cart`) and auth token (`luxe_auth`) are stored in HttpOnly, SameSite=Lax cookies — never in `localStorage` or in-memory React state.

**Benefits:** XSS cannot read the token or cart contents. The server can read both without any client-side fetch. Cart state survives full page reloads and is available to RSCs without a round-trip.

**Trade-off:** The cart cannot be read by client-side JavaScript — no `document.cookie` access. Any cart mutation must go through a server action. This is the right constraint for a production app (keeps business logic on the server) but means the cart count in the header requires a server component.

### No real-time ticket reservation

**Decision:** Ticket availability is checked at checkout time, not when adding to cart. A user can add a ticket that sells out before they check out.

**Trade-off:** Simpler architecture (no distributed lock, no expiry job, no WebSocket). The challenge description explicitly calls this out for the follow-up session. At checkout, `getFreshRaffles()` (no-store) runs an availability check and returns a clear error if any selection is unavailable, preventing overselling.

### Optimistic UI without redundant state

`CartControls` uses `useOptimistic(quantity)` so the displayed count updates instantly without waiting for the server action. The `useTransition` pending flag disables the increment/decrement buttons during the action to prevent double-clicks. There is no client-side cart state outside of these two hooks — the server cookie is always the source of truth.

### POST mutations are never retried

`createOrder` and `loginAction` use plain `fetchJson` — no retry wrapper. Retrying a POST that succeeded silently would create duplicate orders or multiple sessions. Only idempotent GETs (`getRaffles`, `getOrders`) use `fetchJsonWithRetry`.

### Inline async RSC components

`CartLines`, `CartSidebar`, and `OrdersSection` are defined as local async functions inside their page files rather than as separate files. This keeps the streaming architecture readable without page → file → file indirection. The trade-off is that the page files are longer; for a larger team a `components/cart/cart-lines.server.tsx` pattern would be preferred.

### Theme as a cookie (not `next-themes`)

The `next-themes` package uses a client-side script to apply the theme class before hydration. This works but ships an extra runtime dependency. Instead, the layout reads the theme cookie on the server and applies the `dark` class to `<html>` before any content reaches the browser — no flash, no extra JavaScript.

---

## 6. API resilience

The challenge brief warns that the API is "sometimes slow, occasionally grumpy." The implementation handles this at the fetch layer.

### `fetchJsonWithRetry`

```
attempt 0  →  immediate
attempt 1  →  300 ms delay
attempt 2  →  800 ms delay
```

Retry rules:
- **5xx status**: transient server error → retry
- **Network / timeout error**: connectivity blip → retry
- **4xx status**: application error (bad request, unauthorised) → throw immediately, retry cannot fix it
- **ValidationError**: the server returned a shape we don't recognise → throw immediately, a retry would return the same bad shape

On retry attempts, `next: { revalidate }` is stripped from the fetch options before `cache: 'no-store'` is set. Next.js forbids combining these two signals; stripping `next` prevents a hard crash on the first retry.

### Graceful degradation

`OrdersSection` uses `Promise.allSettled` for its `getOrders` + `getRaffles` calls. If `getRaffles` fails (we can't show line-item prices), the page renders with order IDs and ticket counts and an amber degraded-mode banner rather than crashing with a 500.

The homepage wraps `<RafflesSection>` in a try/catch; if `getRaffles` fails even after retries, a friendly error state with a retry link is shown rather than a blank page.

---

## 7. Accessibility

Every interactive element has a keyboard path. The main decisions:

| Feature | Implementation |
|---|---|
| Skip link | `<a href="#main-content">` visible on `:focus`, positioned before the header |
| ARIA live regions | Cart quantity controls (`aria-live="polite"`), raffle grid result count, add-to-cart announcement |
| Progress bars | `role="progressbar"`, `aria-valuenow`, `aria-valuetext` with human-readable sold/remaining context |
| Price filter buttons | `role` is `button` with `aria-pressed` toggling on selection |
| Raffle tiles | `<article>` landmark, descriptive `aria-label` on Add button distinguishes same-page buttons |
| Cart controls | Each button has a unique `aria-label` including the raffle name: "Increase quantity for Ferrari 488 GTB" |
| Login form | `aria-invalid="true"` on both inputs on failure; error message has `role="alert"` |
| Motion | All animations have a `motion-reduce:` variant that disables them for users who prefer reduced motion |
| Colour contrast | All text/background combinations meet WCAG AA 4.5:1 ratio |
| Focus management | Mobile nav traps focus within the drawer; closes on `Escape` |

The automated axe-core Playwright spec asserts zero serious or critical violations against WCAG 2.1 AA rules on the homepage on every test run.

---

## 8. SEO

### Technical SEO

- `metadataBase` in the root layout resolves all relative URLs in OpenGraph/Twitter metadata
- Page titles follow a template: `Cart | LuxeRaffle`, `Account | LuxeRaffle`
- Private pages (`/account`, `/checkout`) set `robots: { index: false, follow: false }` in their `export const metadata`
- `robots.ts` disallows `/account` and `/checkout` at the crawler level
- `sitemap.ts` lists public pages with appropriate `changeFrequency` and `priority`

### Structured data (JSON-LD)

The homepage injects a `@graph` with three nodes:

1. `Organization` — site name and URL
2. `WebSite` — name, description, publisher reference
3. `ItemList` — one `Product + Offer` per raffle (up to 12), including `ticketPrice`, `priceCurrency`, and live `availability` (`InStock` / `SoldOut`)

This gives search engines enough signal to potentially show rich results for the raffle collection.

---

## 9. Testing strategy

### Unit tests (Vitest — 17 tests, 4 files)

Tests cover pure functions and the retry logic that cannot be exercised through the browser:

| File | What's tested |
|---|---|
| `client.test.ts` | `fetchJsonWithRetry`: first-try success, 5xx retry, 4xx no-retry, `ValidationError` no-retry, exhausted retries throw last error, `next` stripped on retry, `next` kept on first attempt |
| `summary.test.ts` | `buildCartSummary`: totals math, stale-line dropping, availability flags, empty cart, `remainingAfterSelection`, multi-line subtotal, `hasAvailabilityIssues` only true when at least one line exceeds stock |
| `raffle.test.ts` | `rafflesSchema`: dotted European price normalisation, invalid shape rejection |
| `session.test.ts` | Token round-trip (`encryptToken` → `decryptToken` → `userSchema.parse`), invalid token rejection |

Fake timers (`vi.useFakeTimers`) let the retry-delay tests run in milliseconds. Rejection handlers are attached before timer advancement to avoid `PromiseRejectionHandledWarning`.

### E2E tests (Playwright — 19 tests, 5 spec files)

Tests run against the real dev server on port 3210 — no mocking, no stubbing:

| File | Scenarios |
|---|---|
| `critical-flow.spec.ts` | Full login → add to cart → checkout → account order history |
| `accessibility.spec.ts` | axe-core WCAG 2.1 AA scan on the homepage |
| `responsive-accessibility.spec.ts` | Mobile viewport, no horizontal overflow, keyboard activation of Add button |
| `cart-management.spec.ts` | Empty cart state, add → cart line, increase/decrease quantity, decrease disabled at qty 1, remove → empty state, "In cart (N)" aria-label, badge count with two raffles |
| `filters.spec.ts` | Nonsense search → no-match message, clear search restores grid, `aria-pressed` toggling, combined search + filter, live region presence |
| `auth.spec.ts` | Wrong password echoes email + `aria-invalid`, redirect to originally requested page, `/checkout` gating, logout clears session |

---

## 10. Original scaffold vs. what I changed — and why

### What the scaffold provided

| File | State |
|---|---|
| `src/server-functions/getRaffles.ts` | Bare `fetch` → `.json()`, no Zod, no error handling, no caching hint |
| `src/server-functions/login.ts` | Stub — `fetch` call with commented-out body, no token storage |
| `src/server-functions/getOrders.ts` | Stub — not connected to anything |
| `src/app/layout.tsx` | Parallel route slots `@header` + `@footer` — caused 404 on direct subpage access |
| `src/app/page.tsx` | `await getRaffles()` passed raw JSON to `<RafflesGrid>` — no types, no Suspense |
| Components | `RaffleTile`, `RafflesGrid`, `UserIcon`, `LoginForm` — UI shells, no interactivity |
| No middleware | Protected routes fully accessible without auth |
| No cart | No state, no cookie, no actions |
| No tests | No unit tests, no E2E tests |

### What I replaced and why

**Parallel route slots → flat layout**

The `@header` and `@footer` parallel slots required every sub-route to have matching `@header/page.tsx` and `@footer/page.tsx` files, otherwise the layout would render 404 for any directly accessed route. The fix is to remove the slots and render `<AppHeader>` and `<AppFooter>` as direct server components inside the root layout — simpler, correct, and the layout can be an async server component that reads the theme cookie.

**`server-functions/` → `lib/api/`**

The original file names implied they were server functions (`'use server'`) but they were actually plain async functions. Mixing `'use server'` with data-fetching helpers creates a footgun (they become callable from the client via action URLs). The new `lib/api/` layer contains plain async functions; Server Actions live in `app/actions/` and are explicitly `'use server'`.

**Raw `fetch().json()` → `fetchJson` + Zod schemas**

Without validation, any API shape change silently produces incorrect renders or runtime errors. Every API boundary now has a Zod schema; `safeParse` failures throw a `ValidationError` that surfaces a user-friendly error state rather than crashing with a `Cannot read properties of undefined`.

**No Suspense → Suspense streaming everywhere**

The original `page.tsx` blocked on `await getRaffles()` before sending any HTML. On a slow or flaky API, the user saw nothing for several seconds. With `<Suspense>`, the page shell — hero, header, skeleton grid — reaches the browser immediately; the actual raffle cards fill in behind it.

**No cache → ISR + tagged revalidation**

Without any caching, every page view hit the API. `getRaffles` now caches for 60 seconds and is tagged `'raffles'`; `getOrders` caches for an hour and is tagged `'orders'`. After checkout, both tags are invalidated so the next visit sees fresh data without waiting for the TTL.

**No auth → Edge middleware + HttpOnly cookies**

Without middleware, `/account` and `/checkout` were accessible to anyone. The edge middleware runs before any server render and redirects to `/login?next=...` if the auth cookie is absent — the cheapest possible guard. The original `login.ts` stub stored nothing; the new `loginAction` writes a signed token to an HttpOnly cookie that the server reads for every protected request.

---

## 11. What's next — production readiness roadmap

These are the items I would address before shipping to real users, roughly in priority order.

### Security and auth

**Real authentication.** The current token is a base64-encoded JSON object — anyone who obtains the cookie value can decode it. Production needs signed JWTs (RS256 or HS256 with a secret rotated on deploy), or delegation to an identity provider (Auth0, Clerk, Supabase Auth). Add refresh token rotation and short-lived access tokens.

**CSRF protection.** Server actions in Next.js 15 include built-in CSRF protection via the `Origin` header check, but explicit double-submit cookie patterns should be audited for any non-action form POSTs.

**Rate limiting.** The login endpoint should be rate-limited by IP (e.g., 5 attempts per minute) to prevent credential stuffing. The Vercel Edge platform supports this natively; on self-hosted infrastructure use an API gateway or Redis-backed middleware.

**Input sanitisation.** Search input is client-side only and never sent to a server, so XSS risk is low. If search is ever moved server-side, sanitise before any database query.

### Ticket reservation

The most important missing feature for a real raffle platform. When a user clicks "Add to cart," a reservation should be created server-side that holds the ticket for 15 minutes. If checkout is not completed, the reservation expires and the ticket returns to the pool.

Implementation approach:
1. Add a `reservations` table: `{ id, raffle_id, quantity, expires_at, cart_id }`
2. `addToCart` creates or extends a reservation
3. `availableTickets` = `totalTickets - soldTickets - activeReservations`
4. A background job (cron or database trigger) expires reservations
5. The checkout availability check validates against reservations, not just sold tickets

### Real-time availability

With reservations in place, the raffle grid needs to reflect live availability without full page reloads. Options:
- **Polling**: simplest — refetch every 30s via `router.refresh()` from a client component
- **Server-Sent Events**: server pushes updates when availability changes — no client polling loop
- **WebSockets**: overkill for read-only availability display but appropriate if building a live bid/auction model

### Payment

Stripe is the standard choice. The checkout flow would change to:
1. Create a Stripe `PaymentIntent` server-side with the order total
2. Render Stripe Elements on the checkout page (client island)
3. On payment confirmation, create the order and clear the cart
4. Handle Stripe webhooks for async payment events (failed, disputed, refunded)

### Individual raffle detail pages

The challenge brief lists this for the follow-up session. The API already returns `longDescription` on each raffle; a `GET /api/raffles/[id]` endpoint (or client-side filtering from the already-fetched list) would power a detail page with:
- Full car photography gallery
- Raffle countdown timer
- Winner history
- Social sharing (OpenGraph image per raffle via `next/og`)

### Infrastructure

| Concern | Approach |
|---|---|
| Database | PostgreSQL (Supabase or Neon for serverless) replacing `data/db.json` |
| Images | Cloudinary or Uploadcare for resizing + CDN delivery; `next/image` handles display |
| Error monitoring | Sentry — capture RSC errors that would otherwise surface as 500s silently |
| Analytics | Plausible (privacy-first) or PostHog (product analytics + feature flags) |
| Load testing | k6 against the checkout and orders endpoints before launch |
| CI/CD | GitHub Actions: lint → unit tests → Playwright → build → deploy to Vercel preview |

### Testing gaps to close

- **Visual regression** — Playwright screenshots or Chromatic to catch unintended layout changes
- **Component tests** — Storybook stories for `RaffleTile`, `CartLine`, `AddToCartButton` with every state variant (sold out, in cart, pending, exceeds availability)
- **Load / stress tests** — k6 or Artillery against the API flakiness scenario at scale
- **Security scan** — OWASP ZAP or Snyk against the deployed preview URL before launch

---

*Built with Next.js 15, React 19, TypeScript, Tailwind CSS, Zod, Vitest, and Playwright.*
