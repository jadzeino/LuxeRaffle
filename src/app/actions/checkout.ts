'use server';

import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getAuthToken } from '@/lib/auth/session';
import { clearCart, getCartItems } from '@/lib/cart/cookies';
import { createOrder } from '@/lib/api/orders';
import { getFreshRaffles } from '@/lib/api/raffles';
import { ORDERS_CACHE_TAG } from '@/lib/constants';

export type CheckoutState = {
  error?: string;
};

export async function checkoutAction(
  _previousState?: CheckoutState,
): Promise<CheckoutState> {
  void _previousState;
  const token = await getAuthToken();

  if (!token) {
    redirect('/login?next=/checkout');
  }

  const items = await getCartItems();

  if (items.length === 0) {
    return { error: 'Your cart is empty.' };
  }

  try {
    const raffles = await getFreshRaffles();
    const raffleById = new Map(raffles.map((raffle) => [raffle.id, raffle]));
    const unavailableItem = items.find((item) => {
      const raffle = raffleById.get(item.id);
      return !raffle || item.quantity > raffle.availableTickets;
    });

    if (unavailableItem) {
      return {
        error:
          'One or more selections exceed current ticket availability. Please update your cart before checkout.',
      };
    }

    await createOrder(token, items);
    await clearCart();
    revalidateTag('raffles');
    revalidateTag(ORDERS_CACHE_TAG);
    revalidatePath('/');
    revalidatePath('/cart');
    revalidatePath('/account');
  } catch {
    return {
      error:
        'We could not complete checkout. Please review ticket availability and try again.',
    };
  }

  redirect('/account');
}
