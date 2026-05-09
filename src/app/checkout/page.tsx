import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { Button } from '@/components/ui/button';
import { getRaffles } from '@/lib/api/raffles';
import { requireUser } from '@/lib/auth/session';
import { getCartItems } from '@/lib/cart/cookies';
import { buildCartSummary } from '@/lib/cart/summary';
import { formatCurrency } from '@/lib/utils/money';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your authenticated LuxeRaffle ticket purchase.',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  await requireUser('/checkout');
  const [items, raffles] = await Promise.all([getCartItems(), getRaffles()]);
  const summary = buildCartSummary(items, raffles);

  if (summary.lines.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold">Nothing to checkout</h1>
        <p className="mt-3 text-muted-foreground">
          Add tickets to your cart before starting checkout.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Browse raffles</Link>
        </Button>
      </main>
    );
  }

  return (
    <main id="main-content" className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
      <section aria-labelledby="checkout-heading">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Checkout
        </p>
        <h1 id="checkout-heading" className="mt-2 text-3xl font-semibold">
          Confirm your ticket order
        </h1>
        <ul className="mt-8 space-y-4">
          {summary.lines.map((line) => (
            <li key={line.id} className="flex gap-4 rounded-lg border border-border bg-card p-4">
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
                <Image
                  src={line.raffle.image}
                  alt={line.raffle.name}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">{line.raffle.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  You selected {line.quantity} tickets at{' '}
                  {formatCurrency(line.raffle.ticketPrice)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {line.raffle.availableTickets} tickets currently left.
                  Inventory is committed after purchase.
                </p>
                {line.exceedsAvailability ? (
                  <p className="mt-2 text-sm font-medium text-destructive" role="alert">
                    Reduce this selection before checkout.
                  </p>
                ) : null}
              </div>
              <p className="font-semibold">{formatCurrency(line.lineTotal)}</p>
            </li>
          ))}
        </ul>
      </section>
      <aside className="h-fit rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Secure purchase</h2>
        <div className="my-5 flex justify-between border-y border-border py-4 font-semibold">
          <span>Total</span>
          <span>{formatCurrency(summary.subtotal)}</span>
        </div>
        <CheckoutForm disabled={summary.hasAvailabilityIssues} />
        {summary.hasAvailabilityIssues ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            Checkout is disabled until all selections fit current availability.
          </p>
        ) : null}
      </aside>
    </main>
  );
}
