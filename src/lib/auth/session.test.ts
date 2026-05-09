import { describe, expect, it } from 'vitest';
import { decryptToken, encryptToken } from '@/lib/token';
import { userSchema } from '@/lib/schemas/auth';

describe('auth token payload validation', () => {
  it('round-trips the server-readable token payload', () => {
    const token = encryptToken({
      id: 1,
      email: 'jane.doe@gmail.com',
      firstName: 'Jane',
    });

    expect(token).toBeTruthy();
    expect(userSchema.parse(decryptToken(token as string))).toEqual({
      id: 1,
      email: 'jane.doe@gmail.com',
      firstName: 'Jane',
    });
  });

  it('rejects invalid token payloads defensively', () => {
    expect(userSchema.safeParse(decryptToken('not-a-token')).success).toBe(false);
  });
});
