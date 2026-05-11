import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import RafflesGrid from '@/components/raffles-grid/raffles-grid';
import { getRaffles } from '@/lib/api/raffles';
import { getCartItems } from '@/lib/cart/cookies';
import { Button } from '@/components/ui/button';
import { JsonLd } from '@/components/seo/json-ld';
import { buildHomeJsonLd } from '@/lib/seo/home-json-ld';

export const revalidate = 60;

async function RafflesSection() {
  try {
    // Both are React cache()-memoised — getCartItems reads a cookie (no network).
    const [raffles, cartItems] = await Promise.all([getRaffles(), getCartItems()]);
    const cartMap = new Map(cartItems.map((item) => [item.id, item.quantity]));

    return (
      <>
        <JsonLd data={buildHomeJsonLd(raffles)} />
        <RafflesGrid raffles={raffles} cartMap={cartMap} />
      </>
    );
  } catch {
    return <RafflesErrorState />;
  }
}

function RaffleSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8" aria-busy="true">
      <div className="mb-8 h-20 max-w-3xl animate-pulse rounded-md bg-muted" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="aspect-[4/3] animate-pulse bg-muted" />
            <div className="space-y-4 p-5">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-12 animate-pulse rounded bg-muted" />
              <div className="h-9 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RafflesErrorState() {
  return (
    <section
      id="raffles"
      className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8"
      aria-labelledby="raffles-error-heading"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
        Live collection
      </p>
      <h2 id="raffles-error-heading" className="mt-2 text-3xl font-semibold">
        Raffles are taking longer than expected.
      </h2>
      <p className="mt-3 text-muted-foreground" role="status">
        The simulated raffle service can occasionally time out. Your page is
        still available; refresh this section or try again in a moment.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Retry loading raffles</Link>
      </Button>
    </section>
  );
}

export default function Home() {
  return (
    <main id="main-content">
      <section className="relative isolate min-h-[620px] overflow-hidden bg-foreground text-background">
        <Image
          src="https://images.unsplash.com/photo-1701205143024-4d39391acd35"
          alt="Ferrari 488 GTB on display"
          fill
          priority
          sizes="100vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUEB//EACMQAAIBBAICAwAAAAAAAAAAAAECAAMEBRIhMUFRYf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCy1jNLxlOT0ZHEbiJL8h7sF8dNerJXmPWYx6j7JUgc0oiA//Z"
          className="object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
        <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-4 pb-20 pt-24 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/75">
              Verified luxury raffles
            </p>
            <h1 className="mt-5 text-5xl font-semibold leading-tight sm:text-6xl lg:text-7xl">
              LuxeRaffle
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">
              Enter raffles for world-class cars with secure account checkout,
              transparent availability, and server-rendered performance from
              the first page load.
            </p>
            <Button asChild size="lg" className="mt-8 bg-background text-foreground hover:bg-background/90">
              <a href="#raffles">View live raffles</a>
            </Button>
          </div>
        </div>
      </section>
      <Suspense fallback={<RaffleSkeleton />}>
        <RafflesSection />
      </Suspense>
    </main>
  );
}
