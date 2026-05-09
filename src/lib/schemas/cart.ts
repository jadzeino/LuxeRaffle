import { z } from 'zod';

export const cartItemSchema = z.object({
  id: z.number().int().positive(),
  quantity: z.number().int().min(1).max(20),
});

export const cartSchema = z.array(cartItemSchema).default([]);

export type CartItem = z.infer<typeof cartItemSchema>;
