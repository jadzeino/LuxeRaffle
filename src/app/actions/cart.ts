'use server';

import { revalidatePath } from 'next/cache';
import { getCartItems, setCartItems } from '@/lib/cart/cookies';

function refreshCartSurfaces() {
  revalidatePath('/cart');
  revalidatePath('/checkout');
}

export async function addToCart(raffleId: number, quantity = 1) {
  const items = await getCartItems();
  const existing = items.find((item) => item.id === raffleId);

  const nextItems = existing
    ? items.map((item) =>
        item.id === raffleId
          ? { ...item, quantity: Math.min(item.quantity + quantity, 20) }
          : item,
      )
    : [...items, { id: raffleId, quantity }];

  await setCartItems(nextItems);
  refreshCartSurfaces();
}

export async function updateCartItem(raffleId: number, quantity: number) {
  const items = await getCartItems();
  const nextItems =
    quantity < 1
      ? items.filter((item) => item.id !== raffleId)
      : items.map((item) =>
          item.id === raffleId
            ? { ...item, quantity: Math.min(quantity, 20) }
            : item,
        );

  await setCartItems(nextItems);
  refreshCartSurfaces();
}

export async function removeCartItem(raffleId: number) {
  const items = await getCartItems();
  await setCartItems(items.filter((item) => item.id !== raffleId));
  refreshCartSurfaces();
}
