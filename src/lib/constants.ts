export const API_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.VERCEL_URL?.replace(/^/, 'https://') ??
  'http://localhost:3000';

// Shared between getOrders (reader) and checkoutAction (invalidator).
// Kept here because 'use server' files can only export async functions —
// exporting a plain string from one would throw at runtime.
export const ORDERS_CACHE_TAG = 'orders';
