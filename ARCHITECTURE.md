# LuxeRaffle Architecture

## Rendering Strategy

The application defaults to React Server Components. Pages fetch data on the server, compose semantic HTML, and stream meaningful skeleton states with `loading.tsx` and local `Suspense` boundaries. Client components are limited to controls that require browser interactivity: login submission, add-to-cart, quantity updates, logout, and checkout submission.

The root layout renders header and footer directly. This avoids the prior parallel-route slot issue where direct navigation to subpages could return 404 because the layout expected `@header` and `@footer` slots without defaults for every route.

## Data Layer

`src/lib/api` centralizes server communication. `fetchJson` applies timeouts, status handling, and Zod parsing before data reaches components. API responses are never trusted blindly.

Raffles use `fetch` with `next: { revalidate: 60, tags: ['raffles'] }` plus React request memoization through `cache()`. Authenticated orders and checkout use `cache: 'no-store'` because they are user-specific and cookie-aware.

Recoverable section failures are handled locally where possible. For example, the homepage hero remains available if the simulated raffle API times out, while the raffle section renders a user-safe retry state. Route-level `error.tsx` boundaries remain in place for unexpected segment failures.

## Server and Client Boundaries

Server-rendered surfaces:

- Home raffle list
- Header auth/cart state
- Cart page
- Checkout page
- Account and order history

Client islands:

- `AddToCartButton`
- `CartControls`
- `LoginForm`
- `CheckoutForm`
- `LogoutButton`

This keeps the default route payload small and avoids SPA-style global state.

## Auth Strategy

Login uses the provided token API and stores the returned token in an HttpOnly, same-site cookie. Server utilities read and validate the token payload through `decryptToken` and Zod. Protected pages call `requireUser`, which redirects unauthenticated users to login with a safe relative `next` URL.

Tokens are not stored in `localStorage` or exposed to arbitrary client JavaScript.

## Cart Strategy

Cart state is stored in an HttpOnly cookie so it survives refreshes and renders correctly on the server. Mutations run through server actions that normalize quantities, revalidate affected paths, and let the header count update after `router.refresh`-driven action completion.

Adding tickets to the cart does not reserve inventory. The cart represents purchase intent, not a server-side hold, so public availability stays unchanged until checkout creates an order. The cart summary is derived from current raffle data, which lets the UI drop stale item IDs, show the selected quantity, and flag selections that exceed live availability.

## Checkout and Orders

Checkout requires authentication, validates the server-side cart against fresh raffle availability, submits an order through the authenticated API, clears the cart cookie, revalidates raffle data, and redirects to `/account`.

The simulated backend decrements `availableTickets` only when an order is created. That is intentional for this challenge: reservation semantics would need server-side holds, expirations, and release-on-abandon behavior, which are larger product and backend concerns.

Orders are fetched dynamically with `cache: 'no-store'` to avoid stale authenticated data.

## Accessibility

The UI uses semantic landmarks and heading hierarchy, labeled forms, visible focus states from shared primitives, `role="alert"` for errors, accessible cart labels, and `aria-live` around optimistic quantity updates. Loading states use skeleton regions with `aria-busy` rather than inert spinners. Motion is limited to short transitions and skeleton animation, with a `prefers-reduced-motion` override for users who request reduced motion.

The implementation is WCAG-minded, not a formal WCAG certification. A production release would still run automated checks, keyboard-only QA, screen-reader passes, and color-contrast review against the final brand palette.

## SEO and Performance

Metadata is defined through the App Router metadata API with title templates, descriptions, OpenGraph, Twitter card metadata, canonical URLs, `robots.ts`, and `sitemap.ts`. Public acquisition surfaces are crawlable, while private transactional routes such as cart, checkout, and account are marked `noindex`.

The homepage emits JSON-LD for the organization, website, and live raffle item list. Images use `next/image`, responsive `sizes`, priority loading for the hero, and descriptive alt text.

Performance decisions favor server rendering, request memoization, ISR for public raffle data, small client islands, and no client-only global cart/auth context.

## Production Scale Strategy

The challenge API returns the full raffle list, so the current homepage renders that server-side and caches it with a 60-second revalidation window. That is appropriate for the supplied dataset, but it is not the shape a production marketplace should use for thousands of offers or Christmas-level traffic spikes.

The API layer exposes `getRafflesPage({ cursor, limit })` as the production-facing contract. Today it adapts the challenge API by slicing the cached full response; with a real backend, the implementation should move to a cursor-paginated endpoint such as `GET /api/raffles?cursor=...&limit=24`. The UI contract can remain stable while the backend stops sending the entire catalog.

For production, raffle discovery should separate stable catalog data from volatile inventory:

- Catalog data: name, description, imagery, ticket price, prize value, total tickets. This can be CDN/edge cached and revalidated by raffle-specific tags.
- Inventory data: available tickets, sold percentage, almost-sold-out status. This should use a short TTL, stale-while-revalidate, polling for visible IDs, or Server-Sent Events for hot raffles.

The first page of raffles should stay server-rendered for SEO and fast first paint. Additional pages can be loaded through a small client island using cursor pagination, with filters and sort state represented in URL search params. This avoids fake client pagination over a huge payload while preserving crawlable acquisition content.

At peak traffic, invalidation should be granular. A purchase should not revalidate the entire raffle catalog. A real backend should invalidate tags such as `raffle:{id}` or `raffle-inventory:{id}`, and checkout must remain the authoritative place where inventory is atomically validated and decremented.

## Theming and Motion

The app supports light and dark themes with CSS variables and a small client theme toggle. The current theme is stored in a same-site cookie so the server can render the initial theme class and avoid hydration mismatch. Theme preference is intentionally not HttpOnly because it is non-sensitive UI state.

Animations are restrained: hover transitions, skeleton loading, and micro-interactions only. This keeps the premium feel without increasing cognitive load or shipping heavy animation libraries.

## Internationalization and Localization

The current challenge data is displayed with a default `en-US` locale and `EUR` currency through centralized formatting helpers. Production should not hard-code number or currency presentation in components: values such as `500,000`, `500.000`, `€500`, and `$500` vary by locale, currency, and market expectations.

Currency, number grouping, decimal separators, date/time formats, pluralization, and text direction should be locale-aware. A production implementation should introduce route or user-preference based locale resolution, localized message catalogs, translated metadata, localized structured data, and market-specific currency rules. Prices should remain numeric in APIs and only be formatted at the display boundary with `Intl.NumberFormat` or an equivalent i18n layer.

## Security Notes

The implementation demonstrates secure frontend architecture for the challenge constraints:

- HttpOnly auth and cart cookies
- same-site cookie policy
- server-side auth guards
- Zod validation of untrusted API responses
- safe relative redirects after login
- generic user-facing API errors
- baseline security headers for content sniffing, referrer policy, browser permissions, and framing

The simulated token format is base64 JSON because that is provided by the challenge. In production, this should be replaced with signed, expiring session tokens or an opaque server-side session.

## Testing

Vitest covers schema validation, cart summary behavior, and token payload validation. Playwright defines the critical user journey: add ticket, authenticate, checkout, and view account orders. A separate axe-powered Playwright audit checks the homepage for serious WCAG A/AA violations. The add-to-cart interaction includes screen-reader live-region feedback so the E2E flow exercises an accessible control rather than a purely visual micro-interaction.

The E2E test intentionally exercises server-rendered redirects and cookie-backed state rather than mocking the browser into an SPA-only happy path.
