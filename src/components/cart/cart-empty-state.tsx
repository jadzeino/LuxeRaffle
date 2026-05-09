import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CartEmptyState() {
  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
        Cart
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-foreground">
        Your garage is waiting.
      </h1>
      <p className="mt-3 text-muted-foreground">
        Add a ticket from one of the live raffles and your cart will render here
        on the server.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Browse raffles</Link>
      </Button>
    </div>
  );
}
