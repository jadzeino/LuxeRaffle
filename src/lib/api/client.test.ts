import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { fetchJsonWithRetry } from './client';
import { ApiError, ValidationError } from './errors';

const schema = z.object({ ok: z.boolean() });

function mockOk(body: unknown) {
  const json = JSON.stringify(body);
  return Promise.resolve({
    ok: true,
    status: 200,
    text: () => Promise.resolve(json),
    json: () => Promise.resolve(body),
  } as Response);
}

function mockError(status: number, message = 'Server error') {
  return Promise.resolve({
    ok: false,
    status,
    text: () => Promise.resolve(message),
    json: () => Promise.resolve({}),
  } as Response);
}

describe('fetchJsonWithRetry', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('returns validated data on first success without retrying', async () => {
    vi.mocked(fetch).mockReturnValue(mockOk({ ok: true }));

    const result = await fetchJsonWithRetry('/api/test', schema);

    expect(result).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('retries once after a 5xx error and returns data on second attempt', async () => {
    vi.mocked(fetch)
      .mockReturnValueOnce(mockError(503, 'Service unavailable'))
      .mockReturnValueOnce(mockOk({ ok: true }));

    const resultPromise = fetchJsonWithRetry('/api/test', schema);
    // Attach a no-op rejection handler before advancing timers so Node.js
    // does not briefly see the promise as unhandled.
    resultPromise.catch(() => {});
    // Advance past the first retry delay (300 ms).
    await vi.advanceTimersByTimeAsync(500);

    expect(await resultPromise).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('exhausts all retries and throws the last error when every attempt fails', async () => {
    vi.mocked(fetch).mockReturnValue(mockError(500));

    const resultPromise = fetchJsonWithRetry('/api/test', schema);
    // Attach the assertion handler BEFORE advancing timers so the rejection
    // is never unhandled, avoiding PromiseRejectionHandledWarning.
    const assertion = expect(resultPromise).rejects.toBeInstanceOf(ApiError);
    // Advance past both retry delays (300 ms + 800 ms).
    await vi.advanceTimersByTimeAsync(1500);
    await assertion;

    expect(fetch).toHaveBeenCalledTimes(3); // attempt 0 + 2 retries
  });

  it('throws 4xx ApiErrors immediately without retrying', async () => {
    vi.mocked(fetch).mockReturnValue(mockError(404, 'Not found'));

    await expect(fetchJsonWithRetry('/api/test', schema)).rejects.toBeInstanceOf(ApiError);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('throws ValidationError immediately without retrying when schema fails', async () => {
    // Schema expects { ok: boolean } — { name: string } is invalid.
    vi.mocked(fetch).mockReturnValue(mockOk({ name: 'wrong shape' }));

    await expect(fetchJsonWithRetry('/api/test', schema)).rejects.toBeInstanceOf(ValidationError);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('strips next options and adds cache: no-store on retry attempts', async () => {
    vi.mocked(fetch)
      .mockReturnValueOnce(mockError(503))
      .mockReturnValueOnce(mockOk({ ok: true }));

    const resultPromise = fetchJsonWithRetry('/api/test', schema, {
      next: { revalidate: 60, tags: ['test'] },
    });
    resultPromise.catch(() => {});
    await vi.advanceTimersByTimeAsync(500);
    await resultPromise;

    const [, retryOptions] = vi.mocked(fetch).mock.calls[1] as [string, RequestInit];
    expect(retryOptions.cache).toBe('no-store');
    expect(retryOptions).not.toHaveProperty('next');
  });

  it('keeps original options (including next) on the first attempt', async () => {
    vi.mocked(fetch).mockReturnValue(mockOk({ ok: true }));

    await fetchJsonWithRetry('/api/test', schema, {
      next: { revalidate: 60, tags: ['test'] },
    });

    const [, firstOptions] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit & { next?: unknown }];
    expect(firstOptions).toHaveProperty('next');
    expect(firstOptions.cache).toBeUndefined();
  });
});
