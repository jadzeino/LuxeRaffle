import { cache } from 'react';
import { z } from 'zod';
import { API_BASE_URL } from '@/lib/constants';
import { ApiError, ValidationError } from './errors';

type FetchJsonOptions = RequestInit & {
  next?: NextFetchRequestConfig;
  timeoutMs?: number;
};

export async function fetchJson<TSchema extends z.ZodTypeAny>(
  path: string,
  schema: TSchema,
  options: FetchJsonOptions = {},
): Promise<z.infer<TSchema>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 8000);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new ApiError(message || 'Request failed.', response.status);
    }

    const json = await response.json();
    const parsed = schema.safeParse(json);

    if (!parsed.success) {
      throw new ValidationError();
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof ApiError || error instanceof ValidationError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('The request timed out. Please try again.');
    }

    throw new ApiError('We could not reach LuxeRaffle services.');
  } finally {
    clearTimeout(timeout);
  }
}

export const fetchJsonMemoized = cache(fetchJson);

// Delays before attempt 1 and attempt 2 (attempt 0 fires immediately).
const RETRY_DELAYS_MS = [300, 800] as const;

/**
 * Wraps fetchJson with up to `maxRetries` additional attempts on 5xx and
 * network/timeout errors. 4xx and ValidationError are thrown immediately —
 * they signal application errors that a retry cannot fix.
 *
 * Retry attempts force `cache: 'no-store'` so Next.js does not serve the
 * memoised failed response back instead of hitting the network again.
 *
 * Do NOT use for POST mutations (createOrder, login) — retrying a mutation
 * risks duplicate side-effects.
 */
export async function fetchJsonWithRetry<TSchema extends z.ZodTypeAny>(
  path: string,
  schema: TSchema,
  options: FetchJsonOptions = {},
  maxRetries = 2,
): Promise<z.infer<TSchema>> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      await new Promise<void>((r) =>
        setTimeout(r, RETRY_DELAYS_MS[attempt - 1] ?? 800),
      );
    }

    // On retry: force a fresh network hit. next.revalidate and cache:'no-store'
    // are mutually exclusive in Next.js — strip `next` before setting the flag.
    let attemptOptions: FetchJsonOptions = options;
    if (attempt > 0) {
      const { next: _omit, ...rest } = options;
      attemptOptions = { ...rest, cache: 'no-store' };
    }

    try {
      return await fetchJson(path, schema, attemptOptions);
    } catch (error) {
      if (error instanceof ApiError && error.status !== undefined && error.status < 500) throw error;
      if (error instanceof ValidationError) throw error;
      lastError = error;
    }
  }

  throw lastError;
}
