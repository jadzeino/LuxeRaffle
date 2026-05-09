import { cache } from 'react';
import { cookies } from 'next/headers';
import { cartSchema, type CartItem } from '@/lib/schemas/cart';

export const CART_COOKIE = 'luxe_cart';

const secureCookie = process.env.NODE_ENV === 'production';

function normalizeCart(items: CartItem[]) {
  const merged = new Map<number, number>();

  for (const item of items) {
    merged.set(item.id, Math.min((merged.get(item.id) ?? 0) + item.quantity, 20));
  }

  return Array.from(merged, ([id, quantity]) => ({ id, quantity })).sort(
    (a, b) => a.id - b.id,
  );
}

export const getCartItems = cache(async (): Promise<CartItem[]> => {
  const value = (await cookies()).get(CART_COOKIE)?.value;

  if (!value) {
    return [];
  }

  try {
    const parsed = cartSchema.safeParse(JSON.parse(value));
    return parsed.success ? normalizeCart(parsed.data) : [];
  } catch {
    return [];
  }
});

export async function setCartItems(items: CartItem[]) {
  (await cookies()).set(CART_COOKIE, JSON.stringify(normalizeCart(items)), {
    httpOnly: true,
    sameSite: 'lax',
    secure: secureCookie,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCart() {
  (await cookies()).delete(CART_COOKIE);
}

export function getCartCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}
