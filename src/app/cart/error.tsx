'use client';

import { Button } from '@/components/ui/button';

export default function CartError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold">Cart unavailable</h1>
      <p className="mt-3 text-muted-foreground">
        We could not reconcile your cart with live raffle availability.
      </p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
