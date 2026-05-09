'use server';

import { redirect } from 'next/navigation';
import { clearAuthToken, setAuthToken } from '@/lib/auth/session';
import { requestLoginToken } from '@/lib/api/auth';
import { loginInputSchema } from '@/lib/schemas/auth';

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginInputSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check your login details.' };
  }

  try {
    const { token } = await requestLoginToken(
      parsed.data.email,
      parsed.data.password,
    );
    await setAuthToken(token);
  } catch {
    return { error: 'Invalid email or password.' };
  }

  const next = String(formData.get('next') ?? '/account');
  redirect(next.startsWith('/') ? next : '/account');
}

export async function logoutAction() {
  await clearAuthToken();
  redirect('/');
}
