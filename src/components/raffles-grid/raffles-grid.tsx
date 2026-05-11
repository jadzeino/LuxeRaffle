import type { Raffle } from '@/lib/schemas/raffle';
import { RafflesGridClient } from './raffles-grid-client';

export default function RafflesGrid({
  raffles,
  cartMap = new Map(),
}: {
  raffles: Raffle[];
  cartMap?: Map<number, number>;
}) {
  if (raffles.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="text-3xl font-semibold">No raffles are live.</h2>
        <p className="mt-3 text-muted-foreground">
          The next collection is being curated. Please check back soon.
        </p>
      </section>
    );
  }

  return (
    <section
      id="raffles"
      className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
      aria-labelledby="raffles-heading"
    >
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Live collection
          </p>
          <h2 id="raffles-heading" className="mt-2 text-3xl font-semibold">
            Curated luxury raffles
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
          New entries every 60 days. Live inventory across all active raffles.
        </p>
      </div>
      {/* Client island: search + price filter operate on server-fetched data */}
      <RafflesGridClient raffles={raffles} cartMap={cartMap} />
    </section>
  );
}
