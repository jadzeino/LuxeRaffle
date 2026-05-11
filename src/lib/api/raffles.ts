import { cache } from 'react';
import { withRetry } from '@/lib/api/client';
import { getRafflesData } from '@/lib/api/mock-service';
import {
  rafflesSchema,
  type Raffle,
  type RafflePage,
} from '@/lib/schemas/raffle';
import { ValidationError } from './errors';

export type RafflePageParams = {
  cursor?: string | null;
  limit?: number;
};

function parseRaffles(data: unknown): Raffle[] {
  const parsed = rafflesSchema.safeParse(data);
  if (!parsed.success) throw new ValidationError();
  return parsed.data;
}

export const getRaffles = cache(async (): Promise<Raffle[]> => {
  const data = await withRetry(() => getRafflesData());
  return parseRaffles(data);
});

export async function getFreshRaffles(): Promise<Raffle[]> {
  const data = await withRetry(() => getRafflesData());
  return parseRaffles(data);
}

export const getRafflesPage = cache(
  async ({ cursor = null, limit = 24 }: RafflePageParams = {}): Promise<RafflePage> => {
    const raffles = await getRaffles();

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
