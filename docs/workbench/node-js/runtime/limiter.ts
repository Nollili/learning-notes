export async function mapWithConcurrency<T, R>(
  values: readonly T[],
  limit: number,
  mapper: (value: T, signal: AbortSignal) => Promise<R>,
  signal?: AbortSignal,
  maxItems = 10_000,
): Promise<R[]> {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError('limit must be a positive integer');
  }
  if (!Number.isSafeInteger(maxItems) || maxItems < 1 || maxItems > 10_000 || values.length > maxItems) {
    throw new RangeError('Batch item budget exceeded');
  }
  for (let index = 0; index < values.length; index++) {
    if (!Object.hasOwn(values, index)) throw new RangeError('Dense owned input required');
  }
  const controller = new AbortController();
  let failed = false;
  let failure: unknown;
  const fail = (error: unknown): void => {
    if (!failed) {
      failed = true;
      failure = error; // Keep even falsy rejection reasons such as undefined.
      controller.abort(error);
    }
  };
  const onAbort = (): void => fail(signal!.reason);
  if (signal?.aborted) onAbort();
  else signal?.addEventListener('abort', onAbort, { once: true });

  const results = new Array<R>(values.length);
  let nextIndex = 0;
  async function worker(): Promise<void> {
    while (!failed) {
      const index = nextIndex++;
      if (index >= values.length) return;
      try {
        results[index] = await mapper(values[index]!, controller.signal);
      } catch (error) {
        fail(error);
      }
    }
  }
  try {
    await Promise.all(Array.from(
      { length: Math.min(limit, values.length) }, () => worker(),
    )); // Workers catch errors; this waits for all active work to drain.
    if (failed) throw failure;
    return results;
  } finally {
    signal?.removeEventListener('abort', onAbort);
  }
}
