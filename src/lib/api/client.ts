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
