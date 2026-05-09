import { ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import { UserIcon } from '../user-icon/user-icon';
import { getCurrentUser } from '@/lib/auth/session';
import { getCartCount, getCartItems } from '@/lib/cart/cookies';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { MobileNav } from '@/components/layout/mobile-nav';
import type { Theme } from '@/lib/theme';

const CartCounter = ({ items }: { items: number }) => (
  <span
    key={items}
    className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white animate-[badge-bounce-in_0.3s_ease-out_both] motion-reduce:animate-none"
  >
    {items}
  </span>
);

export const AppHeader = async ({ theme }: { theme: Theme }) => {
  const [user, cartItems] = await Promise.all([getCurrentUser(), getCartItems()]);
  const amountOfCartItems = getCartCount(cartItems);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-xl font-semibold tracking-wide text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            LuxeRaffle
          </Link>

          <nav aria-label="Primary navigation" className="hidden sm:block">
            <ul className="flex gap-6 text-sm">
              <li>
                <Link
                  href="/#raffles"
                  className="text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Raffles
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Orders
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <MobileNav />
          <ThemeToggle initialTheme={theme} />
          {user ? (
            <Link
              href="/account"
              aria-label={`Account for ${user.firstName}`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <UserIcon firstName={user.firstName} />
            </Link>
          ) : (
            <Link
              href="/login"
              aria-label="Sign in"
              className="rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <User aria-hidden="true" size={22} />
            </Link>
          )}
          <Link
            href="/cart"
            aria-label={`Cart with ${amountOfCartItems} tickets`}
            className="relative rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ShoppingCart aria-hidden="true" size={22} />
            {!!amountOfCartItems && <CartCounter items={amountOfCartItems} />}
          </Link>
        </div>
      </div>
    </header>
  );
};
