'use client';

import { Button } from '@/components/ui/button';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
        Service interruption
      </p>
      <h1 className="mt-3 text-3xl font-semibold">We could not load LuxeRaffle.</h1>
      <p className="mt-3 text-muted-foreground">
        The simulated API can be slow or fail occasionally. Try again in a moment.
      </p>
      <Button className="mt-6" onClick={reset}>
        Retry
      </Button>
    </main>
  );
}
