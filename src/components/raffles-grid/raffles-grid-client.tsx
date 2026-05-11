'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Raffle } from '@/lib/schemas/raffle';
import RaffleTile from '@/components/raffle-tile/raffle-tile';
import { RaffleCardTilt } from '@/components/raffle/raffle-card-tilt';
import { Input } from '@/components/ui/input';

const PRICE_BUCKETS = [
  { label: 'All prices', min: 0, max: Infinity },
  { label: 'Under €20', min: 0, max: 20 },
  { label: '€20 – €100', min: 20, max: 100 },
  { label: 'Over €100', min: 100, max: Infinity },
] as const;

export function RafflesGridClient({
  raffles,
  cartMap = new Map(),
}: {
  raffles: Raffle[];
  cartMap?: Map<number, number>;
}) {
  const [query, setQuery] = useState('');
  const [bucketIndex, setBucketIndex] = useState(0);

  const bucket = PRICE_BUCKETS[bucketIndex];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return raffles.filter((r) => {
      const matchesSearch = !q || r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
      const matchesPrice = r.ticketPrice >= bucket.min && r.ticketPrice < bucket.max;
      return matchesSearch && matchesPrice;
    });
  }, [raffles, query, bucket]);

  return (
    <>
      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search
            aria-hidden="true"
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            placeholder="Search raffles…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            aria-label="Search raffles"
          />
        </div>

        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Filter by ticket price</legend>
          {PRICE_BUCKETS.map((b, i) => (
            <button
              key={b.label}
              type="button"
              onClick={() => setBucketIndex(i)}
              aria-pressed={bucketIndex === i}
              className={[
                'rounded-full border px-3 py-1 text-xs font-semibold transition',
                bucketIndex === i
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground',
              ].join(' ')}
            >
              {b.label}
            </button>
          ))}
        </fieldset>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div
          className="py-16 text-center"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="text-lg font-semibold">No raffles match your filters.</p>
          <p className="mt-2 text-muted-foreground">Try a different search or price range.</p>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label={`${filtered.length} raffle${filtered.length === 1 ? '' : 's'} shown`}
        >
          {filtered.map((raffle, index) => (
            <RaffleCardTilt key={raffle.id}>
              <RaffleTile raffle={raffle} index={index} quantityInCart={cartMap.get(raffle.id) ?? 0} />
            </RaffleCardTilt>
          ))}
        </div>
      )}
    </>
  );
}
