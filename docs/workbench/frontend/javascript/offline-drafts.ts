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
