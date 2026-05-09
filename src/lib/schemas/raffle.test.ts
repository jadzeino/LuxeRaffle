import { describe, expect, it } from 'vitest';
import { rafflesSchema } from './raffle';

describe('rafflesSchema', () => {
  it('normalizes legacy dotted price strings while validating API shape', () => {
    const parsed = rafflesSchema.parse([
      {
        id: 10,
        name: 'Koenigsegg Jesko',
        description: 'Swedish hypercar',
        image: 'https://images.unsplash.com/photo-1724091663890-d84c2abfb28b',
        longDescription: 'Fast and rare.',
        carPrice: '2.800.000',
        ticketPrice: 70,
        totalTickets: 40000,
        availableTickets: 13994,
      },
    ]);

    expect(parsed[0].carPrice).toBe(2800000);
  });

  it('rejects malformed raffle responses', () => {
    expect(() => rafflesSchema.parse([{ id: 1 }])).toThrow();
  });
});
