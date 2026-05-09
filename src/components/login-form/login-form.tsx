'use client';

import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginAction } from '@/app/actions/auth';
import { useActionState } from 'react';

export function LoginForm({
  className,
  next = '/account',
  ...props
}: React.ComponentPropsWithoutRef<'div'> & { next?: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, {});

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} noValidate>
            <input type="hidden" name="next" value={next} />
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="jane.doe@gmail.com"
                  aria-describedby={state.error ? 'login-error' : undefined}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  aria-describedby={state.error ? 'login-error' : undefined}
                  required
                />
              </div>
              {state.error ? (
                <p
                  id="login-error"
                  className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  role="alert"
                >
                  {state.error}
                </p>
              ) : null}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Signing in' : 'Sign in'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Demo account: jane.doe@gmail.com / applejuice
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
