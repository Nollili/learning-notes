// src/retry-read.ts
export type RetryOptions = {
  maxRetries?: number;
  retryable: (error: unknown) => boolean;
  signal?: AbortSignal;
};
export async function retryRead<T>(read: () => Promise<T>, options: RetryOptions): Promise<T> {
  const maximum = options.maxRetries === undefined ? 2 : options.maxRetries;
  if (!Number.isInteger(maximum) || maximum < 0 || maximum > 3) throw new RangeError('Invalid retry limit');
  for (let attempt = 0; ; attempt++) {
    options.signal?.throwIfAborted();
    try {
      const result = await read();
      options.signal?.throwIfAborted();
      return result;
    } catch (error) {
      options.signal?.throwIfAborted();
      if (attempt >= maximum || !options.retryable(error)) throw error;
    }
  }
}
