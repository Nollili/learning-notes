// lib/http-input.ts
export class InputError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function readSmallJson(request: Request, limit = 4096, timeoutMs = 3000): Promise<unknown> {
  if (request.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() !== 'application/json') {
    throw new InputError(415, 'JSON required');
  }
  if (!request.body) throw new InputError(400, 'Body required');
  const reader = request.body.getReader();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new InputError(408, 'Body deadline exceeded')), timeoutMs);
  });
  try {
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    while (true) {
      const part = await Promise.race([reader.read(), deadline]);
      if (part.done) break;
      bytes += part.value.byteLength;
      if (bytes > limit) throw new InputError(413, 'Body too large');
      chunks.push(part.value);
    }
    const joined = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) { joined.set(chunk, offset); offset += chunk.byteLength; }
    try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(joined)); }
    catch { throw new InputError(400, 'Invalid JSON'); }
  } finally {
    clearTimeout(timer);
    void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
