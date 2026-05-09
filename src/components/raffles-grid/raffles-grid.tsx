import type { Raffle } from '@/lib/schemas/raffle';
import RaffleTile from '../raffle-tile/raffle-tile';

export default function RafflesGrid({ raffles }: { raffles: Raffle[] }) {
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
          Server-rendered availability, validated API responses, and cached
          raffle data refreshed every minute.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {raffles.map((raffle) => (
          <RaffleTile key={raffle.id} raffle={raffle} />
        ))}
      </div>
    </section>
  );
}
