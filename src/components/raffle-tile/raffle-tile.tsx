import type { Raffle } from '@/lib/schemas/raffle';
import Image from 'next/image';
import { Eye } from 'lucide-react';
import { AddToCartButton } from '@/components/raffle/add-to-cart-button';
import { formatCurrency, formatNumber } from '@/lib/utils/money';
import { cn } from '@/lib/cn';

export default function RaffleTile({
  raffle,
  index = 0,
  quantityInCart = 0,
}: {
  raffle: Raffle;
  index?: number;
  quantityInCart?: number;
}) {
  const soldPercentage = Math.round(
    ((raffle.totalTickets - raffle.availableTickets) / raffle.totalTickets) * 100,
  );
  const remainingPercentage = raffle.availableTickets / raffle.totalTickets;
  const isSoldOut = raffle.availableTickets === 0;
  const isAlmostSoldOut = !isSoldOut && remainingPercentage <= 0.1;
  const progressColor = isSoldOut || isAlmostSoldOut ? 'bg-red-600' : 'bg-emerald-600';
  const statusLabel = isSoldOut
    ? 'Sold out'
    : isAlmostSoldOut
      ? 'Almost sold out'
      : `${formatNumber(raffle.availableTickets)} left`;

  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm animate-[slide-up-fade_0.4s_ease-out_both] motion-reduce:animate-none transition hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 hover:shadow-md"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative aspect-[16/11] overflow-hidden bg-muted">
        <Image
          src={raffle.image}
          alt={raffle.name}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
          className="object-cover object-center transition duration-500 hover:scale-[1.03] motion-reduce:hover:scale-100"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-4 pt-20">
          <span
            className={cn(
              'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold shadow-sm',
              isSoldOut
                ? 'border-slate-600 bg-slate-700 text-white'
                : isAlmostSoldOut
                  ? 'border-red-700 bg-red-600 text-white transition-colors hover:bg-red-700'
                  : 'border-slate-300 bg-slate-50 text-slate-950 transition-colors hover:bg-white',
            )}
          >
            {isAlmostSoldOut && (
              <span
                aria-hidden="true"
                className="mr-1.5 inline-block h-2 w-2 rounded-full bg-white animate-pulse motion-reduce:animate-none"
              />
            )}
            {statusLabel}
          </span>
          <p className="shrink-0 text-xl font-bold text-white drop-shadow-sm sm:text-2xl">
            {formatCurrency(raffle.ticketPrice)}
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {formatCurrency(raffle.carPrice)} prize
          </p>
          <h3 className="mt-2 text-2xl font-bold leading-tight text-foreground">
            {raffle.name}
          </h3>
          <p className="mt-3 line-clamp-3 text-base leading-7 text-muted-foreground">
            {raffle.description}
          </p>
        </div>
        <div className="mt-5" aria-label={`${raffle.availableTickets} tickets remaining`}>
          <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>Tickets sold</span>
            <span>{formatNumber(raffle.availableTickets)} left</span>
          </div>
          <div
            className="h-3 rounded-full bg-muted"
            role="progressbar"
            aria-label={`${raffle.name} tickets sold`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={soldPercentage}
            aria-valuetext={`${soldPercentage}% sold, ${formatNumber(
              raffle.availableTickets,
            )} tickets left`}
          >
            <div
              className={`h-3 rounded-full ${progressColor} transition-[width] duration-700 ease-out`}
              style={{ width: `${soldPercentage}%` }}
            />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <AddToCartButton raffleId={raffle.id} raffleName={raffle.name} disabled={isSoldOut} quantityInCart={quantityInCart} />
          <a
            href="#raffles"
            aria-label="View all raffles"
            className={cn(
              'inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 py-2',
              'text-sm font-semibold shadow transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'bg-slate-950 text-white hover:bg-slate-800',
              'dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100',
            )}
          >
            <Eye aria-hidden="true" />
            Details
          </a>
        </div>
      </div>
    </article>
  );
}
