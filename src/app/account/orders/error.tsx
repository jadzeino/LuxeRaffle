'use client';

import { Button } from '@/components/ui/button';

export default function OrdersError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold">Orders unavailable</h1>
      <p className="mt-3 text-muted-foreground">
        We could not load your order history right now.
      </p>
      <Button className="mt-6" onClick={reset}>
        Retry
      </Button>
    </main>
  );
}
