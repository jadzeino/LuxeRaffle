import type { Raffle } from '@/lib/schemas/raffle';
import type { CartItem } from '@/lib/schemas/cart';

export type CartLine = CartItem & {
  raffle: Raffle;
  lineTotal: number;
  exceedsAvailability: boolean;
  remainingAfterSelection: number;
};

export function buildCartSummary(items: CartItem[], raffles: Raffle[]) {
  const raffleById = new Map(raffles.map((raffle) => [raffle.id, raffle]));
  const lines: CartLine[] = items.flatMap((item) => {
    const raffle = raffleById.get(item.id);

    if (!raffle) {
      return [];
    }

    return [
      {
        ...item,
        raffle,
        lineTotal: item.quantity * raffle.ticketPrice,
        exceedsAvailability: item.quantity > raffle.availableTickets,
        remainingAfterSelection: raffle.availableTickets - item.quantity,
      },
    ];
  });

  return {
    lines,
    itemCount: lines.reduce((total, line) => total + line.quantity, 0),
    subtotal: lines.reduce((total, line) => total + line.lineTotal, 0),
    hasAvailabilityIssues: lines.some((line) => line.exceedsAvailability),
  };
}
