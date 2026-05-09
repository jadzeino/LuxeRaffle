# LuxeRaffle

LuxeRaffle is a production-minded Next.js 15 App Router implementation of a luxury car raffle platform. The app is intentionally server-first: raffle discovery, cart rendering, authenticated account pages, and checkout composition are rendered on the server, while client JavaScript is reserved for form submissions and optimistic controls.

## Tech Stack

- Next.js 15 App Router and React 19
- TypeScript strict mode
- TailwindCSS UI primitives
- Zod response validation
- HttpOnly cookie auth and cart state
- Vitest unit tests
- Playwright critical-flow E2E test

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Demo account:

```text
jane.doe@gmail.com / applejuice
```

## Scripts

```bash
npm run dev       # Start the Next.js development server
npm run build     # Production build
npm run lint      # ESLint
npm run test      # Vitest unit tests
npm run test:e2e  # Playwright E2E flow
```

## Implemented Product Flow

1. The homepage server-fetches and validates raffles, with one-minute revalidation and skeleton streaming.
2. Add-to-cart is a small client island calling a server action.
3. Cart state is stored in an HttpOnly cookie and rendered on the server.
4. Login posts to the simulated token API, validates the response, and stores the token in an HttpOnly cookie.
5. Checkout is authenticated, submits the cookie cart through the orders API, clears the cart, and redirects to account.
6. Account and orders render server-side from authenticated API calls.

The previous direct-subpage 404 issue was fixed by removing the root layout dependency on unresolved parallel route slots and rendering header/footer directly from the layout.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for rendering, caching, auth, cart, resilience, accessibility, and testing decisions.
