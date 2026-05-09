import { z } from 'zod';

export const orderItemSchema = z.object({
  id: z.number().int().positive(),
  quantity: z.number().int().min(1).max(20),
});

export const orderSchema = z.object({
  id: z.string().min(1),
  items: z.array(orderItemSchema).min(1),
});

export const ordersSchema = z.array(orderSchema);

export const createOrderResponseSchema = z.object({
  orderId: z.string().min(1),
});

export type OrderItem = z.infer<typeof orderItemSchema>;
export type Order = z.infer<typeof orderSchema>;
