'use client';

import { useActionState } from 'react';
import { LockKeyhole } from 'lucide-react';
import { checkoutAction } from '@/app/actions/checkout';
import { Button } from '@/components/ui/button';

export function CheckoutForm({ disabled = false }: { disabled?: boolean }) {
  const [state, formAction, isPending] = useActionState(checkoutAction, {});

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button className="w-full" size="lg" disabled={disabled || isPending}>
        <LockKeyhole aria-hidden="true" />
        {isPending ? 'Securing checkout' : 'Complete purchase'}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Payments are simulated for this challenge. Ticket reservations are validated on submission.
      </p>
    </form>
  );
}
