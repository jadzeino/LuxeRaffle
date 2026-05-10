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
        'overflow-hidden rounded-xl border border-border bg-card shadow-sm',
        'md:grid md:grid-cols-[240px_1fr]',
        'transition-all duration-300',
        leaving ? 'opacity-0 -translate-x-4 pointer-events-none' : 'opacity-100 translate-x-0',
      ].join(' ')}
      aria-hidden={leaving}
    >
      {/* Image — overflow-hidden + md:aspect-auto prevents aspect-ratio from
          expanding the column width beyond the 240px grid track at md+ */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted md:aspect-auto md:h-full">
        <Image
          src={line.raffle.image}
          alt={line.raffle.name}
          fill
          sizes="(min-width: 768px) 240px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10">
          <span className="inline-block rounded bg-white/95 px-2 py-0.5 text-xs font-semibold text-slate-950">
            {formatCurrency(line.raffle.ticketPrice)} / ticket
          </span>
        </div>
      </div>

      {/* Content — min-w-0 on every grid item prevents text from overflowing
          the 1fr column when headings are long */}
      <div className="flex min-w-0 flex-col gap-4 p-5 sm:p-6">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-bold leading-tight">{line.raffle.name}</h2>
          <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {line.raffle.description}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            <strong className="text-foreground">{line.raffle.availableTickets.toLocaleString()}</strong>{' '}
            tickets currently available.
          </p>
          {line.exceedsAvailability ? (
            <p
              className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
              role="alert"
            >
              Selection exceeds current availability.
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
          <CartControls
            raffleId={line.id}
            quantity={line.quantity}
            label={line.raffle.name}
            onBeforeRemove={() => setLeaving(true)}
          />
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Line total</p>
            <p className="text-xl font-bold">{formatCurrency(line.lineTotal)}</p>
          </div>
        </div>
      </div>
    </li>
  );
}
