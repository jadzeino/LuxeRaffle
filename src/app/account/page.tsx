import Link from 'next/link';
import type { Metadata } from 'next';
import { LogoutButton } from '@/components/auth/logout-button';
import { Badge } from '@/components/ui/badge';
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

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const user = await requireUser();
  const token = await getAuthToken();
  const [orders, raffles] = await Promise.all([
    token ? getOrders(token).catch(() => []) : [],
    getRaffles(),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="flex flex-col justify-between gap-4 border-b border-border pb-8 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Account
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Welcome, {user.firstName}</h1>
          <p className="mt-2 text-muted-foreground">{user.email}</p>
        </div>
        <LogoutButton />
      </section>

      <section className="py-10" aria-labelledby="orders-heading">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 id="orders-heading" className="text-2xl font-semibold">
            Order history
          </h2>
          <Badge variant="outline">{orders.length} orders</Badge>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
            <h3 className="text-xl font-semibold">No orders yet</h3>
            <p className="mt-2 text-muted-foreground">
              Checkout your first ticket bundle and your order history will
              appear here.
            </p>
            <Button asChild className="mt-6">
              <Link href="/">Browse raffles</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => {
              const summary = buildCartSummary(order.items, raffles);

              return (
                <li key={order.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                      <h3 className="font-semibold">Order {order.id.slice(0, 8)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {summary.itemCount} tickets
                      </p>
                    </div>
                    <p className="text-lg font-semibold">
                      {formatCurrency(summary.subtotal)}
                    </p>
                  </div>
                  <ul className="mt-4 divide-y divide-border">
                    {summary.lines.map((line) => (
                      <li key={line.id} className="flex justify-between gap-4 py-3 text-sm">
                        <span>{line.raffle.name}</span>
                        <span className="text-muted-foreground">
                          {line.quantity} x {formatCurrency(line.raffle.ticketPrice)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
