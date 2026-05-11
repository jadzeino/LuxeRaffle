import { describe, expect, it } from 'vitest';
import { buildCartSummary } from './summary';
import type { Raffle } from '@/lib/schemas/raffle';

const ferrari: Raffle = {
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

const lambo: Raffle = {
  id: 2,
  name: 'Lamborghini Urus',
  description: 'Italian SUV',
  image: 'https://images.unsplash.com/photo-1',
  longDescription: 'Fast SUV.',
  carPrice: 220000,
  ticketPrice: 25,
  totalTickets: 5000,
  availableTickets: 1000,
};

describe('buildCartSummary', () => {
  it('builds totals from matching raffle data', () => {
    const summary = buildCartSummary([{ id: 1, quantity: 2 }], [ferrari]);

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
      [ferrari],
    );

    expect(summary.lines).toHaveLength(1);
    expect(summary.lines[0].quantity).toBe(5);
    expect(summary.lines[0].exceedsAvailability).toBe(true);
    expect(summary.hasAvailabilityIssues).toBe(true);
  });

  it('returns zero totals and empty lines for an empty cart', () => {
    const summary = buildCartSummary([], [ferrari]);

    expect(summary.lines).toHaveLength(0);
    expect(summary.itemCount).toBe(0);
    expect(summary.subtotal).toBe(0);
    expect(summary.hasAvailabilityIssues).toBe(false);
  });

  it('computes lineTotal and remainingAfterSelection correctly', () => {
    const summary = buildCartSummary([{ id: 1, quantity: 2 }], [ferrari]);
    const line = summary.lines[0];

    expect(line.lineTotal).toBe(80); // 2 × €40
    expect(line.remainingAfterSelection).toBe(0); // 2 available - 2 selected
    expect(line.exceedsAvailability).toBe(false);
  });

  it('sums totals correctly across multiple lines', () => {
    const summary = buildCartSummary(
      [
        { id: 1, quantity: 2 },
        { id: 2, quantity: 3 },
      ],
      [ferrari, lambo],
    );

    expect(summary.lines).toHaveLength(2);
    expect(summary.itemCount).toBe(5); // 2 + 3
    expect(summary.subtotal).toBe(155); // 2×40 + 3×25
    expect(summary.hasAvailabilityIssues).toBe(false);
  });

  it('flags hasAvailabilityIssues only when at least one line exceeds stock', () => {
    const summary = buildCartSummary(
      [
        { id: 1, quantity: 1 },  // within availability (2 left)
        { id: 2, quantity: 9999 }, // exceeds availability (1000 left)
      ],
      [ferrari, lambo],
    );

    expect(summary.lines[0].exceedsAvailability).toBe(false);
    expect(summary.lines[1].exceedsAvailability).toBe(true);
    expect(summary.hasAvailabilityIssues).toBe(true);
  });
});
