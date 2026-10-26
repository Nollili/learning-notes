# IndexedDB Schema Upgrades and Offline Draft Ownership

Use IndexedDB when an application needs structured records, indexes or transactions rather than a small synchronous preference string. Keep the [Web Storage quota/cross-tab owner](./Could_you_please_describe_with_which_Browser_APIs__177e8106c24d802caa88e9916f01fc53.md#browser-storage-budgets-and-recoverable-persistence) for theme/density; do not duplicate that codec. IndexedDB is still client-editable and can fail, be cleared or be evicted. It is not authentication, a backup or a server database transaction.

This worked draft store has **database schema version2** (adds an index) and **record format version2** (renames body→text and introduces a local revision). Those versions solve different problems. Schema changes occur in an upgrade transaction; normal read/write operations occur in their own transactions. A successful put request is not proof that its whole transaction committed: resolve saving only on transactioncomplete, reject on abort, and preserve the user's in-memory text on failure.

## Typed boundaries and one owned connection

```ts
// offline-drafts.ts
export type Draft = { v: 2; id: string; text: string; revision: number };
export class DraftStorageError extends Error {
  constructor(readonly code: 'invalid' | 'unavailable' | 'blocked' | 'timeout' | 'write_failed' | 'conflict') {
    super(code);
  }
}
export function decodeDraft(value: unknown, legacy = false): Draft {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new DraftStorageError('invalid');
  const raw = value as Record<string, unknown>;
  const text = legacy && raw.v === 1 ? raw.body : raw.text;
  const revision = legacy && raw.v === 1 ? 0 : raw.revision;
  if ((!legacy && raw.v !== 2) || (legacy && raw.v !== 1 && raw.v !== 2)
    || typeof raw.id !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(raw.id)
    || typeof text !== 'string' || text.length > 4000
    || typeof revision !== 'number' || !Number.isSafeInteger(revision) || revision < 0) {
    throw new DraftStorageError('invalid');
  }
  return { v: 2, id: raw.id, text, revision }; // Project only supported fields.
}
export function openDrafts(factory: IDBFactory, name: string): Promise<IDBDatabase> {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(name)) return Promise.reject(new DraftStorageError('invalid'));
  return new Promise((resolve, reject) => {
    let finished = false;
    let request: IDBOpenDBRequest;
    const fail = (code: 'unavailable' | 'blocked' | 'timeout') => {
      if (finished) return;
      finished = true; clearTimeout(timer); reject(new DraftStorageError(code));
    };
    const timer = setTimeout(() => {
      try { request?.transaction?.abort(); } catch { /* Already completed. */ }
      fail('timeout');
    }, 2000);
    try { request = factory.open(name, 2); }
    catch { fail('unavailable'); return; }
    request.onblocked = () => fail('blocked');
    request.onerror = () => fail('unavailable');
    request.onupgradeneeded = event => {
      const transaction = request.transaction;
      if (!transaction) { fail('unavailable'); return; }
      if (finished) { transaction.abort(); return; }
      try {
        const db = request.result;
        const store = event.oldVersion === 0
          ? db.createObjectStore('drafts', { keyPath: 'id' })
          : transaction.objectStore('drafts');
        if (!store.indexNames.contains('byRevision')) store.createIndex('byRevision', 'revision');
        if (event.oldVersion === 1) {
          const cursor = store.openCursor();
          cursor.onsuccess = () => {
            if (!cursor.result) return;
            try { cursor.result.update(decodeDraft(cursor.result.value, true)); cursor.result.continue(); }
            catch { transaction.abort(); }
          };
        }
      } catch { transaction.abort(); }
    };
    request.onsuccess = () => {
      const db = request.result;
      if (finished) { db.close(); return; } // Late success after blocked/timeout must not leak a connection.
      finished = true; clearTimeout(timer);
      db.onversionchange = () => db.close();
      resolve(db);
    };
  });
}
export function readDraft(db: IDBDatabase, id: string): Promise<Draft | null> {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) return Promise.reject(new DraftStorageError('invalid'));
  return new Promise((resolve, reject) => {
    let result: Draft | null = null;
    let transaction: IDBTransaction;
    try {
      transaction = db.transaction('drafts', 'readonly');
      const request = transaction.objectStore('drafts').get(id);
      request.onsuccess = () => {
        try { result = request.result === undefined ? null : decodeDraft(request.result); }
        catch { transaction.abort(); }
      };
      transaction.oncomplete = () => resolve(result);
      transaction.onabort = () => reject(new DraftStorageError('unavailable'));
    } catch { reject(new DraftStorageError('unavailable')); }
  });
}
export function saveDraft(db: IDBDatabase, value: unknown, expectedRevision: number | null): Promise<void> {
  let draft: Draft;
  try {
    draft = decodeDraft(value);
    if (expectedRevision !== null && (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0)) throw new Error();
    if (draft.revision !== (expectedRevision === null ? 0 : expectedRevision + 1)) throw new Error();
  } catch { return Promise.reject(new DraftStorageError('invalid')); }
  return new Promise((resolve, reject) => {
    let transaction: IDBTransaction;
    let conflict = false;
    try {
      transaction = db.transaction('drafts', 'readwrite');
      const store = transaction.objectStore('drafts');
      const current = store.get(draft.id);
      current.onsuccess = () => {
        try {
          const old = current.result === undefined ? null : decodeDraft(current.result);
          if ((expectedRevision === null && old !== null)
            || (expectedRevision !== null && old?.revision !== expectedRevision)) {
            conflict = true; transaction.abort(); return;
          }
          store.put(draft);
        } catch { transaction.abort(); }
      };
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(new DraftStorageError(conflict ? 'conflict' : 'write_failed'));
    } catch { reject(new DraftStorageError('unavailable')); }
  });
}
```

Open in an application owner after feature detection/access inside try/catch; close db on unmount/logout and show a recoverable state if versionchange closes it. Older connections can block an upgrade. This owner rejects blocked/timeout promptly and closes/aborts a late result; IndexedDB open requests have no universal cancel method, so it cannot force another tab to close or promise every pending browser operation disappeared. Notify the user to refresh/close an old tab; do not delete the database to bypass a blocked migration. Failed migration aborts rather than silently discarding malformed/future records. Preserve/export the old data through a deliberate recovery path.

The v1→v2 cursor upgrade is suitable only for a bounded small draft collection. Large upgrades block other connections longer; design staged/versioned migrations and measure them. Do not await network calls inside an IndexedDB transaction: it may become inactive before the continuation. Schedule related requests from its request callbacks or use a reviewed transaction wrapper with documented lifetime semantics. Transaction completion is the application commit signal, not a guarantee of physical-disk durability across every crash.

The stored object is untrusted unknown data on every read. Database names and record IDs come from an application-owned nonsecret account scope; all same-origin script can still access them. Client-local optimistic revision checking prevents two cooperating writers from blindly replacing the same draft in serialized readwrite transactions. It does not implement authorization or compare a **server** document version. A compromised script can bypass this helper. Quota, clone or aborted write must leave the editor's unsaved text and error/retry/export choice available; this helper never clears all drafts. The4000character bound limits one value, not total database storage or all serialized bytes. Add retention/count budgets and a visible unsynced-data policy before calling it a complete offline product.

## Worked offline editing and conflict exercise

Start with a draft{id:d1,text:old,revision:0}; save it with expectedRevision null. Read it and keep an editable in-memory copy. TabA saves revision1 from expected0; TabB's save from expected0 must fail conflict and retain B's text for comparison/merge, not overwrite A. Re-read the current record before proposing a new revision. Treat a BroadcastChannel/storage notification as invalidation and re-read; notifications are not the record of truth or a transaction lock. IndexedDB writes do not emit Web Storage events automatically.

When offline, distinguish “saved on this device” from “synced to server”. navigator.onLine is a connectivity hint, not proof that your authenticated API is reachable. Retry synchronization only after the endpoint is reachable under owned deadlines and a bounded policy. Send an authorized server mutation with the server's version/If-Match and an idempotency key when required; a local revision number cannot replace those. A409/412 needs conflict UI and retained local text; a timeout is ambiguous and must not trigger uncontrolled duplicate writes. Logout/account switch must cancel old sync owners and prevent another account seeing private cached text. Browser eviction can still lose the only local copy; persistence permission and export/server-sync policy need explicit UX.

**Exercise acceptance:** seed schema1/body records, open schema2 and verify migrated text/revision/index; abort an invalid/future legacy migration without deleting source data. Test fresh open, unsupported/denied factory, blocked upgrade, versionchange closure and late-open cleanup. Prove save waits for transactioncomplete, failed transaction does not publish success, read restores validated records, stale/local concurrent revision is rejected, input projection/limits hold and owner closes connections. Simulate quota/eviction by injected failures or controlled deletion only in disposable fixtures; do not clear real user data. Then implement the described offline/server conflict and recovery UI and run native two-tab/offline/private-mode tests. In-memory emulator checks cover API control flow, not actual disk durability, browser quota/eviction, partitions, native event timing or learner completion.

Validation baseline: TypeScript5.9.3 strict/exact/indexed; fake-indexeddb6.2.6 only in an isolated Node24.18.0 test project. It is a test emulator, not a browser polyfill or evidence of native browser behavior. No application dependency is added by this note.

References checked2026-10-22: [IndexedDB transactions/upgrades](https://www.w3.org/TR/IndexedDB/), [Storage quota/persistence](https://storage.spec.whatwg.org/), [Web Storage event contract](https://html.spec.whatwg.org/multipage/webstorage.html), [fake-indexeddb scope](https://github.com/dumbmatter/fakeIndexedDB). IndexedDB3 publication is a working draft; target-browser support remains a deployment check.
