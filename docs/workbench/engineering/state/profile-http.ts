// profile-http.ts — beside profile-race.ts in the standalone lab
import type { Profile, ProfileApi } from './profile-race.js';
export function createProfileHttpApi(send: typeof fetch = fetch): ProfileApi {
  return { async load(id, callerSignal): Promise<Profile> {
    if (!/^[A-Za-z0-9_-]{1,40}$/.test(id)) throw new Error('Invalid profile identity');
    const deadline = new AbortController();
    const signal = AbortSignal.any([callerSignal, deadline.signal]);
    const timer = setTimeout(() => deadline.abort(), 5000);
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    let onAbort = () => {};
    const interrupted = new Promise<never>((_resolve, reject) => {
      onAbort = () => reject(new DOMException('Profile request cancelled', 'AbortError'));
      signal.addEventListener('abort', onAbort, { once: true });
      if (signal.aborted) onAbort();
    });
    // A pre-aborted owner may throw before the first race is attached.
    void interrupted.catch(() => {});
    try {
      signal.throwIfAborted();
      const response = await Promise.race([send(`/api/profiles/${encodeURIComponent(id)}`, {
        method: 'GET', credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal,
      }).then(response => {
        if (signal.aborted) {
          void response.body?.cancel().catch(() => {});
          throw new DOMException('Profile request cancelled', 'AbortError');
        }
        return response;
      }), interrupted]);
      if (!response.ok || response.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase() !== 'application/json'
        || response.body === null) {
        void response.body?.cancel().catch(() => {});
        throw new Error('Profile unavailable');
      }
      reader = response.body.getReader();
      const parts: Uint8Array[] = [];
      let size = 0;
      for (let reads = 0; ; reads++) {
        signal.throwIfAborted();
        if (reads >= 512) throw new Error('Profile stream budget exceeded');
        const item = await Promise.race([reader.read(), interrupted]);
        signal.throwIfAborted();
        if (item.done) break;
        size += item.value.byteLength;
        if (size > 4096) throw new Error('Profile body too large');
        parts.push(item.value);
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const part of parts) { bytes.set(part, offset); offset += part.byteLength; }
      const raw: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
      if (!raw || typeof raw !== 'object' || !('id' in raw) || raw.id !== id || !('name' in raw)
        || typeof raw.name !== 'string' || !raw.name.trim() || raw.name.length > 80) throw new Error('Invalid profile');
      return { id, name: raw.name };
    } catch {
      if (signal.aborted) throw new DOMException('Profile request cancelled', 'AbortError');
      throw new Error('Profile unavailable');
    } finally {
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
      if (reader) {
        try { void reader.cancel().catch(() => {}); } catch { /* Cleanup cannot extend the deadline. */ }
        finally { reader.releaseLock(); }
      }
    }
  } };
}
