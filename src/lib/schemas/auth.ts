import { z } from 'zod';

export const loginInputSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

export const tokenResponseSchema = z.object({
  token: z.string().min(1),
});

export const userSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  firstName: z.string().min(1),
});

export type AuthUser = z.infer<typeof userSchema>;
