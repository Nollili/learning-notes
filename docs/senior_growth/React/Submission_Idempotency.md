# A Submission Intent from React to PostgreSQL

Debouncing search is useful; delaying a save button is not a correctness boundary. This senior front-end lab connects UI ownership to an intermediate Node/PostgreSQL transaction. Use React19.3, Node24.18, TypeScript5.9.3, node-postgres and PostgreSQL16.13. The code is a narrow create-note command, not a payment API or a complete authentication service.

## One intent, one key, one receipt

Define the user intent before choosing a key. Here a trimmed title submitted once creates one note. The UI generates a random UUID for that intent and retains the **same key and exact title** after an ambiguous transport failure. A successful receipt ends the intent; a new note gets a new key. Independently generated keys represent independent commands, even if their titles happen to match. If the business forbids duplicate titles, add its own uniqueness rule: idempotency does not infer business equivalence.

Pending state gives feedback and disables controls. A synchronous ref blocks multiple submissions before React commits a render. Neither protects against multiple tabs, malicious clients, restarts or network retries. The database combines a scoped command key, a digest of the canonical command, the business insert and a receipt in one transaction. An already-used key with another payload is a conflict; the same command returns the original note ID. The digest is not a secret, authentication credential or signature.

```sql
CREATE TABLE saved_notes(id uuid PRIMARY KEY, tenant text NOT NULL, subject text NOT NULL, title text NOT NULL);
CREATE TABLE note_commands(tenant text NOT NULL, subject text NOT NULL, key uuid NOT NULL,
 digest text NOT NULL, note_id uuid REFERENCES saved_notes(id), PRIMARY KEY(tenant, subject, key));
```

The schema deliberately retains receipts. Do not delete them on a short TTL and promise indefinite replay safety. Establish a published retry/retention horizon and an expired-key policy before adding cleanup; old keys can otherwise create new work. The foreign key also means deleting a note needs an explicit receipt/tombstone policy. This minimal fixture has no delete endpoint.

```ts
// create-note.ts
import { createHash, randomUUID } from 'node:crypto';
export type Actor = { tenant: string; subject: string };
type Client = { query(sql: string, values?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>; release(error?: Error): void };
type Pool = { connect(): Promise<Client> };
export class Conflict extends Error {}
export async function createNote(pool: Pool, actor: Actor, key: string, rawTitle: string) {
  if (!actor.tenant || !actor.subject || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(key) ||
      typeof rawTitle !== 'string' || !rawTitle.trim() || rawTitle.length > 200) throw new Error('Invalid command');
  const title = rawTitle.trim();
  const digest = createHash('sha256').update(JSON.stringify(['create-note:v1', title])).digest('hex');
  const client = await pool.connect();
  let discard: Error | undefined;
  try {
    await client.query('BEGIN ISOLATION LEVEL READ COMMITTED');
    await client.query("SET LOCAL lock_timeout = '1s'");
    await client.query("SET LOCAL statement_timeout = '2s'");
    const reserved = await client.query(`INSERT INTO note_commands(tenant, subject, key, digest)
      VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING RETURNING key`, [actor.tenant, actor.subject, key, digest]);
    let id: unknown;
    if (reserved.rows.length) {
      id = randomUUID();
      await client.query('INSERT INTO saved_notes(id, tenant, subject, title) VALUES($1,$2,$3,$4)',
        [id, actor.tenant, actor.subject, title]);
      await client.query('UPDATE note_commands SET note_id=$4 WHERE tenant=$1 AND subject=$2 AND key=$3',
        [actor.tenant, actor.subject, key, id]);
    } else {
      const receipt = (await client.query(`SELECT digest, note_id FROM note_commands
        WHERE tenant=$1 AND subject=$2 AND key=$3`, [actor.tenant, actor.subject, key])).rows[0];
      if (!receipt || receipt.digest !== digest) throw new Conflict('Key already used for a different command');
      id = receipt.note_id;
    }
    if (typeof id !== 'string') throw new Error('Invalid receipt');
    await client.query('COMMIT');
    return { id };
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch { discard = new Error('Transaction rollback failed'); }
    throw error;
  } finally { client.release(discard); }
}
```

At READ COMMITTED, conflicting unique-key inserts wait for the other transaction. After it commits, the next SELECT statement sees its receipt; if it rolls back, the waiting insert can reserve the key itself. The note and receipt commit together, so a competing caller cannot observe a committed half-written command from this function. Lock and statement timeouts bound waits; they do not prove an uncertain COMMIT failed. A response lost after commit must retry the same key.

The connection owner releases on every path and discards it if rollback fails. Configure pool acquisition, idle-transaction and application deadlines too; the local statement setting is not a whole-request deadline.

The `Pool` interface is a small SQL port compatible with a node-postgres adapter. Supply the authenticated current actor after authorization; never populate it from body fields. Before calling this function, an HTTP adapter must enforce session/Origin/CSRF for cookie writes, current permission, a bounded JSON body, exact input schema and a single canonical UUID command key. Reject duplicate key headers rather than pick one. Project unknown JSON before using typed arguments.

Translate invalid input to400, changed-key-content conflict to409, and storage uncertainty to a fixed retriable outcome without leaking SQL or promising rollback. Return only the receipt ID to the owning user. Apply current authorization on replay as well as initial execution; a receipt is not a permanent access grant. No real cookie/HTTP adapter is supplied by this lab.

## Pending UI with an honest ambiguous outcome

```tsx
// note-form.tsx
import { useEffect, useRef, useState } from 'react';
export type CreateApi = (command: { key: string; title: string }, signal: AbortSignal) => Promise<{ id: string }>;
export function NoteForm({ api }: { api: CreateApi }) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'uncertain' | 'saved'>('idle');
  const pending = useRef(false);
  const intent = useRef<{ key: string; title: string } | null>(null);
  const controller = useRef<AbortController | null>(null);
  const epoch = useRef(0);
  useEffect(() => () => { ++epoch.current; controller.current?.abort(); }, []);
  async function submit() {
    if (pending.current || (!intent.current && !title.trim())) return;
    const command = intent.current ?? { key: crypto.randomUUID(), title: title.trim() };
    intent.current = command;
    pending.current = true;
    const version = epoch.current;
    const abort = new AbortController(); controller.current = abort;
    setStatus('pending');
    try {
      await api(command, abort.signal);
      if (epoch.current !== version) return;
      intent.current = null; setTitle(''); setStatus('saved');
    } catch {
      if (epoch.current === version) setStatus('uncertain');
    } finally {
      if (epoch.current === version) { pending.current = false; controller.current = null; }
    }
  }
  return <form onSubmit={event => { event.preventDefault(); void submit(); }}>
    <label>Title<input value={title} maxLength={200} disabled={status === 'pending' || status === 'uncertain'}
      onChange={event => { setTitle(event.currentTarget.value); setStatus('idle'); }} /></label>
    <button disabled={status === 'pending' || !title.trim()}>
      {status === 'uncertain' ? 'Retry same save' : 'Save'}
    </button>
    <p role="status">{status === 'pending' ? 'Saving…' : status === 'uncertain'
      ? 'Outcome unknown. Retry the same save.' : status === 'saved' ? 'Saved.' : ''}</p>
  </form>;
}
```

The API port validates a bounded receipt before resolving and enforces an owned finite request deadline. Its HTTP implementation sends the command key and exact payload with the existing authentication/CSRF contract. It must distinguish definitive validation/conflict failures from ambiguous network/storage outcomes for a production UI. This narrow component conservatively treats any rejection as unknown, preserves the payload and offers only retry. Add explicit conflict/reconciliation/support UI before shipping; repeatedly retrying a definite409 cannot repair a changed-payload bug.

Unmount aborts the client wait and invalidates late UI commits; it cannot undo a server transaction. Keep `api` stable for this mounted owner and remount with an account/tenant-specific key when identity changes. Do not let an old session's intent retry using a new account. This component retains its intent only while mounted. Navigation/reload recovery needs an authorized operation-status view or a reviewed session-scoped durable outbox containing the key and exact payload.

Do not blindly persist sensitive drafts/credentials to localStorage. If the last response was lost, clearing the form or generating a fresh key can create a second note.

Editing is disabled while the outcome is uncertain because this simple UI cannot reconcile two versions of one command. An advanced design can retain the original immutable intent and let the user work on a separate new draft, with explicit operation history. Do not silently repurpose the old key for edited content. A deliberate “create another” action after success gets another key. After an unknown result, “cancel” means stop waiting, not undo the operation; deletion/compensation needs a distinct authorized command.

## Verify the whole boundary

**Worked failure:** React sends key K/title T; the database inserts note N and receipt K→N; the reply is dropped; UI says outcome unknown; retry sends K/T; the transaction reads K→N and returns N. Six concurrent requests with K/T also return N once. K/changed-T gets409. Another authenticated subject has a different key namespace and must never read the first subject's receipt.


Keep irreversible email/payment/publication outside this transaction. Use an outbox and the downstream service's idempotency contract; a PostgreSQL receipt cannot atomically roll back an external service. For optimistic edits, include resource identity and expected version in the canonical command; idempotency alone does not prevent lost updates.

**Validation performed:** both exact sources compiled with strict/noUncheckedIndexedAccess/exactOptionalPropertyTypes. An actual disposable PostgreSQL16 cluster passed six competing callers, same-result replay, changed content, owner/tenant separation, failure rollback, lost reply and lock-timeout/retry checks. Four React/JSDOM tests passed pending/same-tick suppression, exact retry, unmount abort and an integrated component→real PostgreSQL lost-response retry creating one row. The integrated test calls the service port directly, not HTTP. No browser, real authentication/CSRF, HTTP adapter, reload recovery, external side effect or production fault tolerance was tested. The private cluster was stopped. Learner practice remains required.

References checked2026-10-25: [React useRef](https://react.dev/reference/react/useRef), [PostgreSQL INSERT/ON CONFLICT](https://www.postgresql.org/docs/16/sql-insert.html), [READ COMMITTED](https://www.postgresql.org/docs/16/transaction-iso.html), [node-postgres transactions](https://node-postgres.com/features/transactions).


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/react/Submission_Idempotency.md). All learner practice remains outstanding; the worked examples above are explanatory material.
