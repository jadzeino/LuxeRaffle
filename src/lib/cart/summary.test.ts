import { describe, expect, it } from 'vitest';
import { buildCartSummary } from './summary';
import type { Raffle } from '@/lib/schemas/raffle';

const raffle: Raffle = {
  id: 1,
  name: 'Ferrari 488 GTB',
  description: 'Italian supercar',
  image: 'https://images.unsplash.com/photo-1701205143024-4d39391acd35',
  longDescription: 'A premium raffle prize.',
  carPrice: 280000,
  ticketPrice: 40,
  totalTickets: 7000,
  availableTickets: 2,
};

describe('buildCartSummary', () => {
  it('builds totals from matching raffle data', () => {
    const summary = buildCartSummary([{ id: 1, quantity: 2 }], [raffle]);

    expect(summary.itemCount).toBe(2);
    expect(summary.subtotal).toBe(80);
    expect(summary.lines[0].raffle.name).toBe('Ferrari 488 GTB');
  });

  it('drops stale cart lines and flags selections above live availability', () => {
    const summary = buildCartSummary(
      [
        { id: 1, quantity: 5 },
        { id: 999, quantity: 1 },
      ],
      [raffle],
    );

    expect(summary.lines).toHaveLength(1);
    expect(summary.lines[0].quantity).toBe(5);
    expect(summary.lines[0].exceedsAvailability).toBe(true);
    expect(summary.hasAvailabilityIssues).toBe(true);
  });
});
