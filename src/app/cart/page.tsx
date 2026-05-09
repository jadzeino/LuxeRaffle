import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CartControls } from '@/components/cart/cart-controls';
import { CartEmptyState } from '@/components/cart/cart-empty-state';
import { Button } from '@/components/ui/button';
import { getRaffles } from '@/lib/api/raffles';
import { getCartItems } from '@/lib/cart/cookies';
import { buildCartSummary } from '@/lib/cart/summary';
import { formatCurrency } from '@/lib/utils/money';

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Review your LuxeRaffle ticket cart before secure checkout.',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  const [items, raffles] = await Promise.all([getCartItems(), getRaffles()]);
  const summary = buildCartSummary(items, raffles);

  if (summary.lines.length === 0) {
    return <CartEmptyState />;
  }

  return (
    <main id="main-content" className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
      <section aria-labelledby="cart-heading">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Cart
        </p>
        <h1 id="cart-heading" className="mt-2 text-3xl font-semibold">
          Review your entries
        </h1>
        <ul className="mt-8 space-y-4">
          {summary.lines.map((line) => (
            <li
              key={line.id}
              className="overflow-hidden rounded-lg border border-border bg-card shadow-sm md:grid md:grid-cols-[220px_1fr]"
            >
              <div className="relative aspect-[16/10] min-h-48 bg-muted md:h-full">
                <Image
                  src={line.raffle.image}
                  alt={line.raffle.name}
                  fill
                  sizes="(min-width: 768px) 220px, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/75 to-transparent p-4 pt-16 text-white">
                  <span className="rounded-md bg-white/95 px-3 py-1 text-sm font-semibold text-slate-950">
                    {formatCurrency(line.raffle.ticketPrice)} each
                  </span>
                  <span className="text-lg font-bold">
                    {formatCurrency(line.lineTotal)}
                  </span>
                </div>
              </div>
              <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto]">
                <div>
                  <h2 className="text-2xl font-bold leading-tight">
                    {line.raffle.name}
                  </h2>
                  <p className="mt-2 text-base leading-7 text-muted-foreground">
                    {line.raffle.description}
                  </p>
                  <p className="mt-4 text-sm text-muted-foreground">
                    You selected <strong>{line.quantity}</strong> tickets.
                    Availability changes only after purchase;{' '}
                    <strong>{line.raffle.availableTickets}</strong> tickets are
                    currently left.
                  </p>
                  {line.exceedsAvailability ? (
                    <p
                      className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
                      role="alert"
                    >
                      This selection exceeds current availability.
                    </p>
                  ) : null}
                </div>
                <div className="flex items-end justify-between gap-4 lg:flex-col lg:items-end">
                  <CartControls
                    raffleId={line.id}
                    quantity={line.quantity}
                    label={line.raffle.name}
                  />
                  <p className="text-right text-sm text-muted-foreground">
                    Line total
                    <span className="block text-xl font-bold text-foreground">
                      {formatCurrency(line.lineTotal)}
                    </span>
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
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
    </main>
  );
}
