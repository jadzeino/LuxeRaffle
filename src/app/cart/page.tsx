import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CartLine } from '@/components/cart/cart-line';
import { CartEmptyState } from '@/components/cart/cart-empty-state';
import { Button } from '@/components/ui/button';
import { getRaffles } from '@/lib/api/raffles';
import { getCartItems } from '@/lib/cart/cookies';
import { buildCartSummary } from '@/lib/cart/summary';
import { formatCurrency } from '@/lib/utils/money';
import type { CartItem } from '@/lib/schemas/cart';

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Review your LuxeRaffle ticket cart before secure checkout.',
  robots: {
    index: false,
    follow: false,
  },
};

// Async RSC — awaits getRaffles(), React cache() deduplicates the fetch
// across CartLines + CartSidebar so only one network request is made.
async function CartLines({ items }: { items: CartItem[] }) {
  const raffles = await getRaffles();
  const summary = buildCartSummary(items, raffles);

  if (summary.lines.length === 0) return <CartEmptyState />;

  return (
    <ul className="mt-8 space-y-4">
      {summary.lines.map((line) => (
        <CartLine key={line.id} line={line} />
      ))}
    </ul>
  );
}

async function CartSidebar({ items }: { items: CartItem[] }) {
  const raffles = await getRaffles();
  const summary = buildCartSummary(items, raffles);

  return (
    <aside
      className="h-fit rounded-lg border border-border bg-card p-6 shadow-sm lg:sticky lg:top-24"
      aria-label="Cart summary"
    >
      <h2 className="text-lg font-semibold">Order summary</h2>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Tickets</dt>
          <dd>{summary.itemCount}</dd>
        </div>
        <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
          <dt>Subtotal</dt>
          <dd>{formatCurrency(summary.subtotal)}</dd>
        </div>
      </dl>
      <Button asChild className="mt-6 w-full" size="lg">
        <Link href="/checkout">Checkout</Link>
      </Button>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        Adding tickets to cart does not reserve inventory. Ticket availability
        is confirmed when checkout completes.
      </p>
    </aside>
  );
}

function CartLinesSkeleton({ count }: { count: number }) {
  return (
    <ul className="mt-8 space-y-4" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="h-52 animate-pulse rounded-xl bg-muted md:h-44" />
      ))}
    </ul>
  );
}

function CartSidebarSkeleton() {
  return (
    <div
      className="h-64 animate-pulse rounded-lg bg-muted lg:sticky lg:top-24"
      aria-busy="true"
    />
  );
}

export default async function CartPage() {
  // Cookie read — no network, resolves in microseconds.
  // This is the only await before the page starts streaming HTML.
  const items = await getCartItems();

  if (items.length === 0) {
    return <CartEmptyState />;
  }

  return (
    <main
      id="main-content"
      className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8"
    >
      <section aria-labelledby="cart-heading">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Cart
        </p>
        <h1 id="cart-heading" className="mt-2 text-3xl font-semibold">
          Review your entries
        </h1>
        <Suspense fallback={<CartLinesSkeleton count={items.length} />}>
          <CartLines items={items} />
        </Suspense>
      </section>
      <Suspense fallback={<CartSidebarSkeleton />}>
        <CartSidebar items={items} />
      </Suspense>
    </main>
  );
}
