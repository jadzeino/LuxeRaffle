'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CartControls } from './cart-controls';
import { formatCurrency } from '@/lib/utils/money';
import type { CartLine as CartLineData } from '@/lib/cart/summary';

export function CartLine({ line }: { line: CartLineData }) {
  const [leaving, setLeaving] = useState(false);

  return (
    <li
      className={[
        'overflow-hidden rounded-lg border border-border bg-card shadow-sm md:grid md:grid-cols-[220px_1fr]',
        'transition-all duration-300',
        leaving ? 'opacity-0 -translate-x-4 pointer-events-none' : 'opacity-100 translate-x-0',
      ].join(' ')}
      aria-hidden={leaving}
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
          <span className="text-lg font-bold">{formatCurrency(line.lineTotal)}</span>
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-2xl font-bold leading-tight">{line.raffle.name}</h2>
          <p className="mt-2 text-base leading-7 text-muted-foreground">{line.raffle.description}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            You selected <strong>{line.quantity}</strong> tickets. Availability changes only after
            purchase; <strong>{line.raffle.availableTickets}</strong> tickets are currently left.
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
            onBeforeRemove={() => setLeaving(true)}
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
  );
}
