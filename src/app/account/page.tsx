import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { AlertTriangle, Receipt, Ticket } from 'lucide-react';
import { LogoutButton } from '@/components/auth/logout-button';
import { Button } from '@/components/ui/button';
import { getOrders } from '@/lib/api/orders';
import { getRaffles } from '@/lib/api/raffles';
import { getAuthToken, requireUser } from '@/lib/auth/session';
import { buildCartSummary } from '@/lib/cart/summary';
import { formatCurrency } from '@/lib/utils/money';

export const metadata: Metadata = {
  title: 'Account',
  description: 'View LuxeRaffle account details and authenticated order history.',
  robots: {
    index: false,
    follow: false,
  },
};

// Async RSC — all slow API calls (getOrders + getRaffles) live here so
// the page shell (user header + logout) can stream out immediately.
async function OrdersSection({ token }: { token: string | null }) {
  const [ordersResult, rafflesResult] = await Promise.allSettled([
    token ? getOrders(token) : Promise.resolve([]),
    getRaffles(),
  ]);

  const orders = ordersResult.status === 'fulfilled' ? ordersResult.value : [];
  const raffles = rafflesResult.status === 'fulfilled' ? rafflesResult.value : [];
  const rafflesFailed = rafflesResult.status === 'rejected';

  const summaries = orders.map((order) => ({
    order,
    summary: buildCartSummary(order.items, raffles),
  }));

  const totalSpent = summaries.reduce((acc, { summary }) => acc + summary.subtotal, 0);
  const totalTickets = summaries.reduce((acc, { summary }) => acc + summary.itemCount, 0);

  return (
    <>
      {/* Degraded-mode banner */}
      {rafflesFailed && orders.length > 0 && (
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
          <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Raffle details are temporarily unavailable. Order IDs and ticket counts are still shown below.</p>
        </div>
      )}

      {/* Stats strip */}
      {orders.length > 0 && !rafflesFailed && (
        <div className="mt-8 grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-card shadow-sm">
          <div className="px-5 py-4 text-center">
            <p className="text-2xl font-bold tabular-nums">{orders.length}</p>
            <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
              {orders.length === 1 ? 'Order' : 'Orders'}
            </p>
          </div>
          <div className="px-5 py-4 text-center">
            <p className="text-2xl font-bold tabular-nums">{totalTickets}</p>
            <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
              {totalTickets === 1 ? 'Ticket' : 'Tickets'}
            </p>
          </div>
          <div className="px-5 py-4 text-center">
            <p className="text-2xl font-bold tabular-nums">{formatCurrency(totalSpent)}</p>
            <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">Total spent</p>
          </div>
        </div>
      )}

      {/* Order history */}
      <section className="mt-10" aria-labelledby="orders-heading">
        <h2 id="orders-heading" className="mb-5 text-lg font-semibold">
          Order history
        </h2>

        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Receipt aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No orders yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your confirmed ticket bundles will appear here.
            </p>
            <Button asChild className="mt-6">
              <Link href="/">Browse raffles</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-4">
            {summaries.map(({ order, summary }) => (
              <li
                key={order.id}
                className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
              >
                {/* Order header */}
                <div className="flex flex-col justify-between gap-3 border-b border-border bg-muted/40 px-5 py-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card shadow-sm">
                      <Receipt aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Order ID</p>
                      <p className="font-mono text-sm font-medium tracking-tight">
                        {order.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Ticket aria-hidden="true" className="h-3.5 w-3.5" />
                      <span>
                        {summary.itemCount} {summary.itemCount === 1 ? 'ticket' : 'tickets'}
                      </span>
                    </div>
                    <p className="text-base font-bold">{formatCurrency(summary.subtotal)}</p>
                  </div>
                </div>

                {/* Line items */}
                {summary.lines.length > 0 ? (
                  <ul className="divide-y divide-border">
                    {summary.lines.map((line) => (
                      <li
                        key={line.id}
                        className="flex items-center justify-between gap-4 px-5 py-3.5"
                      >
                        <span className="text-sm font-medium">{line.raffle.name}</span>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="tabular-nums">
                            {line.quantity} × {formatCurrency(line.raffle.ticketPrice)}
                          </span>
                          <span className="font-medium text-foreground tabular-nums">
                            {formatCurrency(line.lineTotal)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-5 py-4 text-sm text-muted-foreground">
                    {order.items.length} ticket {order.items.length === 1 ? 'entry' : 'entries'} — details unavailable.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function OrdersSkeleton() {
  return (
    <div className="mt-10 space-y-4" aria-busy="true">
      <div className="h-5 w-36 animate-pulse rounded bg-muted" />
      <div className="h-32 animate-pulse rounded-xl bg-muted" />
      <div className="h-32 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

export default async function AccountPage() {
  // Both reads are cookie-based — no network, resolves in microseconds.
  const user = await requireUser();
  const token = await getAuthToken();

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Renders immediately from cookie reads */}
      <section className="flex flex-col justify-between gap-4 border-b border-border pb-8 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Account
          </p>
          <h1 className="mt-2 text-3xl font-bold">{user.firstName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <LogoutButton />
      </section>

      {/* Stats + orders stream in while page shell is already visible */}
      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersSection token={token} />
      </Suspense>
    </main>
  );
}
