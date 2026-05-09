import { fetchJson } from '@/lib/api/client';
import {
  createOrderResponseSchema,
  ordersSchema,
  type OrderItem,
} from '@/lib/schemas/order';

export async function getOrders(token: string) {
  return fetchJson('/api/orders', ordersSchema, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
    timeoutMs: 6500,
  });
}

export async function createOrder(token: string, items: OrderItem[]) {
  return fetchJson('/api/orders', createOrderResponseSchema, {
    method: 'POST',
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items }),
    timeoutMs: 6500,
  });
}
