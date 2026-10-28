// json-lines.ts — byte chunks in, nonnull JSON object records out
export function jsonLines({
  maxRecordBytes = 1024 * 1024,
  maxChunkBytes = 64 * 1024,
  maxRecords = 100_000,
}: { maxRecordBytes?: number; maxChunkBytes?: number; maxRecords?: number } = {}) {
  for (const limit of [maxRecordBytes, maxChunkBytes, maxRecords])
    if (!Number.isSafeInteger(limit) || limit < 1) throw new RangeError('Positive limits required');
  return async function* parse(source: AsyncIterable<Uint8Array>,
    { signal }: { signal?: AbortSignal } = {}): AsyncGenerator<Record<string, unknown>> {
    // Fixed frame storage avoids quadratic concat and retained slices of old chunks.
    const frame = Buffer.alloc(maxRecordBytes);
    const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
    let used = 0;
    let line = 1;
    let records = 0;
    const decode = (): Record<string, unknown> | undefined => {
      let text: string;
      try { text = decoder.decode(frame.subarray(0, used)); }
      catch (error) { throw new Error(`Invalid UTF-8 on line ${line}`, { cause: error }); }
      if (!text.trim()) return undefined; // Explicit policy: ignore blank/whitespace lines.
      let value: unknown;
      try { value = JSON.parse(text); }
      catch (error) { throw new Error(`Invalid JSON on line ${line}`, { cause: error }); }
      if (value === null || typeof value !== 'object' || Array.isArray(value))
        throw new TypeError(`Expected an object record on line ${line}`);
      records += 1;
      if (records > maxRecords) throw new RangeError('Record-count limit exceeded');
      return value as Record<string, unknown>; // Proven JSON object; fields still unknown.
    };
    try {
      for await (const chunk of source) {
        signal?.throwIfAborted();
        if (!(chunk instanceof Uint8Array)) throw new TypeError('Expected byte chunks');
        if (chunk.byteLength > maxChunkBytes) throw new RangeError('Input chunk too large');
        for (const byte of chunk) {
          if (byte === 10) { // LF; JSON whitespace handling also accepts a preceding CR.
            const record = decode(); used = 0; line += 1;
            if (record !== undefined) { signal?.throwIfAborted(); yield record; }
          } else {
            if (used === maxRecordBytes) throw new RangeError(`Record too large on line ${line}`);
            frame[used++] = byte;
          }
        }
      }
      signal?.throwIfAborted();
      if (used) { const record = decode(); if (record !== undefined) yield record; }
    } finally {
      // Drop sensitive remainder even when a consumer breaks or a destination fails.
      frame.fill(0);
    }
  };
}
