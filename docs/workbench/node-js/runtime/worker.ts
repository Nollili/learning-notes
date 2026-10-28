import { Worker } from 'node:worker_threads';

export async function runWorker<TInput, TResult>(
  filename: URL,
  workerData: TInput,
  parseResult: (value: unknown) => TResult,
  { signal, timeoutMs = 5_000 }: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<TResult> {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 2_147_483_647)
    throw new RangeError('timeoutMs must be a valid finite timer delay');
  if (typeof parseResult !== 'function') throw new TypeError('Result parser required');
  signal?.throwIfAborted();
  return new Promise<TResult>((resolve, reject) => {
    const worker = new Worker(filename, { workerData });
    let selected = false;
    type Outcome = { ok: true; value: TResult } | { ok: false; error: unknown };
    const cleanup = () => {
      worker.removeListener('message', onMessage);
      worker.removeListener('messageerror', onMessageError);
      worker.removeListener('error', onError);
      worker.removeListener('exit', onExit);
    };
    const finish = (outcome: Outcome) => {
      if (selected) return;
      selected = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      // Keep the error/exit handlers until termination has completed.
      Promise.resolve().then(() => worker.terminate()).then(() => {
        cleanup();
        if (outcome.ok) resolve(outcome.value); else reject(outcome.error);
      }, terminationError => {
        cleanup();
        reject(new AggregateError(outcome.ok ? [terminationError] :
          [outcome.error, terminationError], 'Worker cleanup failed'));
      });
    };
    const onMessage = (raw: unknown) => {
      if (selected) return;
      try { finish({ ok: true, value: parseResult(raw) }); }
      catch (error) { finish({ ok: false, error }); }
    };
    const onMessageError = (error: Error) => finish({ ok: false, error });
    const onError = (error: Error) => finish({ ok: false, error });
    const onExit = (code: number) => finish({ ok: false,
      error: new Error(`Worker exited without a result (code=${code})`) });
    const onAbort = () => finish({ ok: false, error: signal?.reason ??
      new Error('Worker aborted') });
    const timer = setTimeout(() => finish({ ok: false,
      error: new Error('Worker deadline exceeded') }), timeoutMs);
    worker.on('message', onMessage);
    worker.on('messageerror', onMessageError);
    worker.on('error', onError);
    worker.on('exit', onExit);
    signal?.addEventListener('abort', onAbort, { once: true });
    if (signal?.aborted) onAbort();
  });
}
