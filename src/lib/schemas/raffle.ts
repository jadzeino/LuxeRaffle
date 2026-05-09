import { z } from 'zod';

export const raffleSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string().min(1),
  image: z.string().url(),
  longDescription: z.string().min(1),
  carPrice: z.preprocess((value) => {
    if (typeof value === 'string') {
      return Number(value.replace(/\./g, ''));
    }

    return value;
  }, z.number().positive()),
  ticketPrice: z.number().positive(),
  totalTickets: z.number().int().positive(),
  availableTickets: z.number().int().nonnegative(),
});

export const rafflesSchema = z.array(raffleSchema);

export const rafflePageSchema = z.object({
  items: rafflesSchema,
  nextCursor: z.string().min(1).nullable(),
  totalCount: z.number().int().nonnegative().optional(),
});

export type Raffle = z.infer<typeof raffleSchema>;
export type RafflePage = z.infer<typeof rafflePageSchema>;
