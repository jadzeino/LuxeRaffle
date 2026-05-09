import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 text-muted-foreground">
        The page you requested is not part of the LuxeRaffle experience.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Return home</Link>
      </Button>
    </main>
  );
}
