'use client';

import { useId, useOptimistic, useState, useTransition } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { addToCart } from '@/app/actions/cart';
import { Button } from '@/components/ui/button';

export function AddToCartButton({
  raffleId,
  raffleName,
}: {
  raffleId: number;
  raffleName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useOptimistic(false);
  const [announcement, setAnnouncement] = useState('');
  const [error, setError] = useState('');
  const liveRegionId = useId();
  const router = useRouter();

  return (
    <>
      <Button
        type="button"
        className="h-11 flex-1 border border-input bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground"
        disabled={isPending}
        aria-describedby={liveRegionId}
        aria-label={`Add ${raffleName} ticket to cart`}
        onClick={() => {
          startTransition(async () => {
            setAdded(true);
            setError('');

            try {
              await addToCart(raffleId);
              setAnnouncement(`${raffleName} ticket added to cart.`);
              router.refresh();
            } catch {
              setError('We could not update your cart. Please try again.');
              setAnnouncement(`Could not add ${raffleName} ticket to cart.`);
            }
          });
        }}
      >
        <ShoppingBag aria-hidden="true" />
        {added ? 'Add more' : isPending ? 'Adding' : 'Add'}
      </Button>
      <span id={liveRegionId} className="sr-only" aria-live="polite">
        {announcement}
      </span>
      {error ? (
        <span className="sr-only" role="alert">
          {error}
        </span>
      ) : null}
    </>
  );
}
