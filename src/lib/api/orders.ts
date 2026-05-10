import { fetchJson, fetchJsonWithRetry } from '@/lib/api/client';
import {
  createOrderResponseSchema,
  ordersSchema,
  type OrderItem,
} from '@/lib/schemas/order';
import { ORDERS_CACHE_TAG } from '@/lib/constants';

export async function getOrders(token: string) {
  return fetchJsonWithRetry('/api/orders', ordersSchema, {
    next: { revalidate: 3600, tags: [ORDERS_CACHE_TAG] },
    headers: { Authorization: `Bearer ${token}` },
    timeoutMs: 6500,
  });
}

// POST mutations must use plain fetchJson — retrying a mutation risks
// creating duplicate orders if the first attempt succeeded silently.
export async function createOrder(token: string, items: OrderItem[]) {
  return fetchJson('/api/orders', createOrderResponseSchema, {
    method: 'POST',
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items }),
    timeoutMs: 6500,
  });
}
