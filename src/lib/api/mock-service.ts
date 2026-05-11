import { readDatabase, writeDatabase } from '@/app/(please-ignore)/api/db';
import { decryptToken } from '@/lib/token';
import { ApiError } from './errors';
import { randomUUID } from 'crypto';

function mockDelay(minMs: number, maxMs: number): Promise<void> {
  const delay = Math.random() * (maxMs - minMs) + minMs;
  return new Promise<void>((resolve, reject) => {
    if (Math.random() < 0.1) {
      setTimeout(() => reject(new ApiError('The request timed out. Please try again.')), delay);
    } else {
      setTimeout(resolve, delay);
    }
  });
}

export async function getRafflesData() {
  await mockDelay(1000, 5000);
  const db = await readDatabase();
  return db.raffles;
}

export async function getOrdersData(token: string) {
  const user = decryptToken(token.replace('Bearer ', ''));
  if (!user) throw new ApiError('Unauthorized', 401);
  await mockDelay(500, 3500);
  const db = await readDatabase();
  const orderIds = db.userOrders[user.id] ?? [];
  return orderIds.map((id) => db.orders[id]);
}

export async function createOrderData(
  token: string,
  items: Array<{ id: number; quantity: number }>,
) {
  const user = decryptToken(token.replace('Bearer ', ''));
  if (!user) throw new ApiError('Unauthorized', 401);

  const db = await readDatabase();

  for (const item of items) {
    const raffle = db.raffles.find((r) => r.id === item.id);
    if (!raffle || raffle.availableTickets < item.quantity) {
      throw new ApiError('Not enough tickets available', 400);
    }
  }

  for (const item of items) {
    const raffle = db.raffles.find((r) => r.id === item.id);
    if (raffle) raffle.availableTickets -= item.quantity;
  }

  const orderId = randomUUID();
  db.orders[orderId] = { id: orderId, items };
  if (!db.userOrders[user.id]) db.userOrders[user.id] = [];
  db.userOrders[user.id].push(orderId);

  await writeDatabase(db);
  return { orderId };
}
