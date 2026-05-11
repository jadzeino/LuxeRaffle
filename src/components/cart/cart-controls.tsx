'use client';

import { useOptimistic, useTransition } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { removeCartItem, updateCartItem } from '@/app/actions/cart';
import { Button } from '@/components/ui/button';

export function CartControls({
  raffleId,
  quantity,
  label,
  onBeforeRemove,
}: {
  raffleId: number;
  quantity: number;
  label: string;
  onBeforeRemove?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticQuantity, setOptimisticQuantity] = useOptimistic(quantity);

  const update = (nextQuantity: number) => {
    startTransition(async () => {
      setOptimisticQuantity(Math.max(0, nextQuantity));
      await updateCartItem(raffleId, nextQuantity);
    });
  };

  return (
    <div className="flex items-center gap-2" aria-live="polite">
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={isPending || optimisticQuantity <= 1}
        aria-label={`Decrease quantity for ${label}`}
        onClick={() => update(optimisticQuantity - 1)}
      >
        <Minus aria-hidden="true" />
      </Button>
      <span
        className="flex h-9 min-w-10 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-semibold"
        aria-label="Item quantity"
      >
        {optimisticQuantity}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={isPending || optimisticQuantity >= 20}
        aria-label={`Increase quantity for ${label}`}
        onClick={() => update(optimisticQuantity + 1)}
      >
        <Plus aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={isPending}
        aria-label={`Remove ${label} from cart`}
        onClick={() => {
          onBeforeRemove?.();
          startTransition(async () => {
            setOptimisticQuantity(0);
            await removeCartItem(raffleId);
          });
        }}
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </div>
  );
}
