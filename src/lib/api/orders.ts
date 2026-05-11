import { withRetry } from '@/lib/api/client';
import { getOrdersData, createOrderData } from '@/lib/api/mock-service';
import {
  createOrderResponseSchema,
  ordersSchema,
  type OrderItem,
} from '@/lib/schemas/order';
import { ValidationError } from './errors';

export async function getOrders(token: string) {
  const data = await withRetry(() => getOrdersData(token));
  const parsed = ordersSchema.safeParse(data);
  if (!parsed.success) throw new ValidationError();
  return parsed.data;
}

export async function createOrder(token: string, items: OrderItem[]) {
  const data = await createOrderData(token, items);
  const parsed = createOrderResponseSchema.safeParse(data);
  if (!parsed.success) throw new ValidationError();
  return parsed.data;
}
