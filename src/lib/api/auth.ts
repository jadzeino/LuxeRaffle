import { fetchJson } from '@/lib/api/client';
import { tokenResponseSchema } from '@/lib/schemas/auth';

export async function requestLoginToken(email: string, password: string) {
  return fetchJson('/api/auth/token', tokenResponseSchema, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
    timeoutMs: 5000,
  });
}
