import { LoginForm } from '@/components/login-form/login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to LuxeRaffle to view orders and complete checkout.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="flex w-full items-center justify-center bg-muted/30 p-6 py-20 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm next={next} />
      </div>
    </main>
  );
}
