import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decryptToken } from '@/lib/token';
import { userSchema, type AuthUser } from '@/lib/schemas/auth';

export const AUTH_COOKIE = 'luxe_auth';

const secureCookie = process.env.NODE_ENV === 'production';

export async function getAuthToken() {
  return (await cookies()).get(AUTH_COOKIE)?.value ?? null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getAuthToken();

  if (!token) {
    return null;
  }

  const parsed = userSchema.safeParse(decryptToken(token));
  return parsed.success ? parsed.data : null;
}

export async function requireUser(next = '/account') {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return user;
}

export async function setAuthToken(token: string) {
  (await cookies()).set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: secureCookie,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthToken() {
  (await cookies()).delete(AUTH_COOKIE);
}
