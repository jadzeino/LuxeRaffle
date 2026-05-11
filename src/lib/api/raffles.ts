import { cache } from 'react';
import { fetchJsonWithRetry } from '@/lib/api/client';
import {
  rafflesSchema,
  type Raffle,
  type RafflePage,
} from '@/lib/schemas/raffle';

export type RafflePageParams = {
  cursor?: string | null;
  limit?: number;
};

export const getRaffles = cache(async (): Promise<Raffle[]> => {
  return fetchJsonWithRetry('/api/raffles', rafflesSchema, {
    next: { revalidate: 60, tags: ['raffles'] },
    timeoutMs: 6500,
  });
});

export async function getFreshRaffles(): Promise<Raffle[]> {
  return fetchJsonWithRetry('/api/raffles', rafflesSchema, {
    cache: 'no-store',
    timeoutMs: 6500,
  });
}

export const getRafflesPage = cache(
  async ({ cursor = null, limit = 24 }: RafflePageParams = {}): Promise<RafflePage> => {
    const raffles = await getRaffles();

    // The challenge API returns all raffles. This adapter keeps today's UI honest
    // while exposing the cursor-based contract a production API should provide.
    const startIndex = cursor ? Number.parseInt(cursor, 10) : 0;
    const safeStartIndex = Number.isFinite(startIndex) && startIndex > 0 ? startIndex : 0;
    const safeLimit = Math.min(Math.max(limit, 1), 48);
    const items = raffles.slice(safeStartIndex, safeStartIndex + safeLimit);
    const nextIndex = safeStartIndex + items.length;

    return {
      items,
      nextCursor: nextIndex < raffles.length ? String(nextIndex) : null,
      totalCount: raffles.length,
    };
  },
);

export async function getRaffleById(id: number) {
  const raffles = await getRaffles();
  return raffles.find((raffle) => raffle.id === id) ?? null;
}
