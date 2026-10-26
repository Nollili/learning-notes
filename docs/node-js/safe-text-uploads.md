# A Bounded Text Upload and Its Threat Model

Continue Node24/Express5/PostgreSQL16/Zod4. This lab accepts only small UTF-8 text, stores it under an opaque application-generated key and serves it as a fixed text attachment after current access checks. It does not support multipart, images, PDFs, archives, remote URLs or executable content processing. Those formats need their own maintained parser/inspection/isolation contracts; do not widen this endpoint merely by accepting another MIME string.

## Assets, boundaries and abuse cases

Assets are private uploaded bytes, metadata/ownership, session credentials, server files, storage capacity and trustworthy operation state. The browser/body/headers are untrusted. The guard owns current identity, permission and cookie-CSRF checks; PostgreSQL owns metadata state; a private application-owned directory owns bytes. The HTTP response/log boundary must never reveal another owner's content or raw storage errors.

| Abuse case | Control in this flow | Verification / residual risk |
|---|---|---|
| Anonymous or cross-user download | Guard plus tenant/subject predicates on every metadata query | Unknown/foreign/expired IDs get the same404; in-flight authorized requests cannot be retroactively undone |
| Cookie-based cross-site upload | Existing session/Origin/CSRF middleware before body parsing | Guard adapter must implement it; a text parser or valid session alone is not CSRF protection |
| Traversal/overwrite through filename | No caller filename/path; random UUID storage key; exclusive create | Hostile filename headers cannot select storage; trusted root/parents must not be attacker-writable |
| Large/compressed/malformed bytes |8KiB parser limit, no inflation, strict UTF-8/control policy | Upstream request/rate/concurrency/storage quotas still required; this is not flood protection |
| HTML/script content | Never interpret it; fixed text/plain attachment and nosniff | Safe use depends on download headers and UI text rendering; do not embed uploaded HTML |
| Partial write or ambiguous finalization | Pending reservation, ready-only download, owner status/reconciliation | Crash cleanup/TTL needed; DB+filesystem are not an atomic commit |
| Stale/corrupted bytes | Expected byte count and SHA256 checked before response | Hash is integrity metadata, not authorization or protection from a compromised server/root |
| Parser exploit/remote fetch | No complex parser, subprocess or URL fetch exists | A later image/PDF feature needs a new threat model and isolated processing |

The table records a concrete design and residual risks, not certification or an observed security incident. Revisit when adding formats, public sharing, CDN delivery, scanners, quotas, object storage or a new identity/tenant policy. Assign a real owner/review date before deploying; keep controls linked to tests rather than mark every threat “solved.”

## Metadata states before exposing bytes

Use an isolated scratch database and directory. A trusted upload guard returns a small actor only after authentication and per-intent permission checks; for browser cookies it must also verify CSRF/Origin on write. The Task Board supplies that primary session design. The guard below is an integration port, not a second fake login implementation. SQL binds the actual actor, never a body/header owner field.

```sql
CREATE TABLE text_uploads (
  id uuid PRIMARY KEY,
  tenant text NOT NULL,
  subject text NOT NULL,
  storage_key uuid NOT NULL UNIQUE,
  bytes integer NOT NULL CHECK (bytes BETWEEN 1 AND 8192),
  sha256 text NOT NULL CHECK (sha256 ~ '^[a-f0-9]{64}$'),
  state text NOT NULL CHECK (state IN ('pending','ready')),
  expires_at timestamptz NOT NULL
);
```

```ts
// text-upload-app.ts
import express from 'express';
import type { Request, ErrorRequestHandler } from 'express';
import { randomUUID, createHash } from 'node:crypto';
import { open, realpath } from 'node:fs/promises';
import { join } from 'node:path';
import { TextDecoder } from 'node:util';
import { z } from 'zod';
export type Actor = { tenant: string; subject: string };
export class UploadDenied extends Error { constructor(readonly status: 401 | 403) { super('Denied'); } }
class InvalidText extends Error {}
class UploadPending extends Error { constructor(readonly id: string) { super('Pending'); } }
type Sql = { query(sql: string, values: unknown[]): Promise<{ rows: unknown[] }> };
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const Metadata = z.object({ id: z.string().regex(uuid), storage_key: z.string().regex(uuid),
  bytes: z.number().int().min(1).max(8192), sha256: z.string().regex(/^[a-f0-9]{64}$/),
  state: z.enum(['pending', 'ready']) }).strict();
function digest(bytes: Uint8Array) { return createHash('sha256').update(bytes).digest('hex'); }
export function inspectText(raw: unknown): Buffer {
  if (!Buffer.isBuffer(raw) || raw.length < 1 || raw.length > 8192) throw new InvalidText();
  let text: string;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(raw); }
  catch { throw new InvalidText(); }
  if (!text.trim() || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text)) throw new InvalidText();
  return raw;
}
export async function createTextUploadApp(root: string, sql: Sql,
  guard: (request: Request, intent: 'read' | 'write') => Promise<Actor>) {
  const ownedRoot = await realpath(root); // Startup config; trusted immutable parent tree.
  const app = express(); app.disable('x-powered-by');
  const authenticate = (intent: 'read' | 'write'): express.RequestHandler => async (req, res, next) => {
    res.locals.uploadActor = await guard(req, intent);
    next();
  };
  async function owned(id: unknown, actor: Actor) {
    if (typeof id !== 'string' || !uuid.test(id)) return undefined;
    const found = await sql.query(`SELECT id::text,storage_key::text,bytes,sha256,state FROM text_uploads
      WHERE id=$1::uuid AND tenant=$2 AND subject=$3 AND expires_at>statement_timestamp()`,
      [id, actor.tenant, actor.subject]);
    return found.rows[0] === undefined ? undefined : Metadata.parse(found.rows[0]);
  }
  app.post('/uploads', authenticate('write'), express.raw({ type: 'text/plain', limit: '8kb', inflate: false }),
    async (req, res) => {
      const media = req.get('content-type')?.toLowerCase().replace(/\s+/g, '');
      if (media !== 'text/plain' && media !== 'text/plain;charset=utf-8') {
        res.status(415).json({ error: 'TEXT_ONLY' }); return;
      }
      const bytes = inspectText(req.body as unknown);
      const actor = res.locals.uploadActor as Actor; // Set only by the preceding owned guard.
      const id = randomUUID(), key = randomUUID();
      try {
        await sql.query(`INSERT INTO text_uploads(id,tenant,subject,storage_key,bytes,sha256,state,expires_at)
          VALUES($1::uuid,$2,$3,$4::uuid,$5,$6,'pending',statement_timestamp()+interval '1 day')`,
          [id, actor.tenant, actor.subject, key, bytes.length, digest(bytes)]);
        const file = await open(join(ownedRoot, `${key}.bin`), 'wx', 0o600);
        try { await file.writeFile(bytes); await file.sync(); } finally { await file.close(); }
        const ready = await sql.query(`UPDATE text_uploads SET state='ready'
          WHERE id=$1::uuid AND tenant=$2 AND subject=$3 AND state='pending' RETURNING id::text`,
          [id, actor.tenant, actor.subject]);
        if (ready.rows.length !== 1) throw new Error('Finalization unavailable');
      } catch { throw new UploadPending(id); }
      res.status(201).json({ id, bytes: bytes.length });
    });
  app.get('/uploads/:id/status', authenticate('read'), async (req, res) => {
    const item = await owned(req.params.id, res.locals.uploadActor as Actor);
    res.set('Cache-Control', 'no-store');
    if (!item) { res.status(404).json({ error: 'NOT_FOUND' }); return; }
    res.json({ id: item.id, state: item.state });
  });
  app.get('/uploads/:id', authenticate('read'), async (req, res) => {
    const item = await owned(req.params.id, res.locals.uploadActor as Actor);
    if (!item || item.state !== 'ready') { res.status(404).json({ error: 'NOT_FOUND' }); return; }
    const file = await open(join(ownedRoot, `${item.storage_key}.bin`), 'r');
    const buffer = Buffer.alloc(item.bytes + 1); let size = 0;
    try {
      while (size < buffer.length) {
        const read = await file.read(buffer, size, buffer.length - size, size);
        if (read.bytesRead === 0) break;
        size += read.bytesRead;
      }
    } finally { await file.close(); }
    const bytes = buffer.subarray(0, size);
    if (size !== item.bytes || digest(bytes) !== item.sha256) throw new Error('Storage mismatch');
    res.set('Content-Disposition', 'attachment; filename="note.txt"');
    res.set('X-Content-Type-Options', 'nosniff'); res.set('Cache-Control', 'no-store');
    res.type('text/plain; charset=utf-8').send(bytes);
  });
  const errors: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    if (error instanceof UploadDenied) { res.status(error.status).json({ error: 'ACCESS_DENIED' }); return; }
    if (error instanceof InvalidText) { res.status(400).json({ error: 'INVALID_TEXT' }); return; }
    if (error instanceof UploadPending) {
      res.status(503).json({ error: 'UPLOAD_PENDING', id: error.id }); return;
    }
    const kind = typeof error === 'object' && error !== null && 'type' in error ? error.type : undefined;
    const status = kind === 'entity.too.large' ? 413 : kind === 'encoding.unsupported' ? 415 : 503;
    res.status(status).json({ error: 'UPLOAD_UNAVAILABLE' });
  };
  app.use(errors); return app;
}
```

## What the state machine guarantees—and what it leaves open

A reservation is pending before filesystem work. Only a successfully written/closed file can be finalized ready; only ready/current-owner/unexpired metadata is downloadable. The read allocates at most8193bytes and detects truncation, extra bytes or digest mismatch before sending content. The app never renders uploaded text as HTML and ignores filename headers. Text that looks like HTML remains inert attachment bytes; the inspection contract is bounded valid text/control policy, not a malware scanner or proof that an arbitrary named format is safe.

The root/parent tree is private and not attacker-writable; files are server-created and immutable. This is not an attacker-writable filesystem sandbox. Do not expose arbitrary roots, symlinks, file names or paths through the API. A compromised server/root is outside this fixture's guarantee. A real storage adapter may use no-follow/open-relative primitives or versioned object storage under a stronger threat model. Current actor values come only from the guard; do not deserialize an actor from a source/body/model response.

A failed reserve/finalize acknowledgment may have committed. The code returns a server-generated ID with a controlled pending outcome instead of deleting bytes blindly and potentially breaking a committed ready row. The authenticated status route resolves current authoritative state; a missing ID, still-pending ID and ready ID drive explicit UI recovery. Pending/partial/abandoned artifacts need bounded cleanup and monitoring. A crash after file creation can leave a pending row/file; expiry/cleanup must cover both states. This endpoint is not idempotent across new POSTs: an automatic retry can create another object. Add a durable caller-operation policy before promising duplicate-upload prevention, as explained in the [approved-write recovery lesson](../python-for-ai/approved-writes.md).

The table here is distinct from the generic retention fixture. Integrate its pending/ready metadata and private keys into the [retention/deletion adapter](./retention-and-deletion.md) explicitly; copying that sweeper without changing its table does not clean these uploads. Authentication expires access immediately; cleanup deletes owned bytes/metadata and retries safely. Do not orphan files by deleting metadata first. Record only safe counts/state/error categories, not raw text, tokens, actor credentials or absolute paths.

Per-request8KiB limits do not enforce per-user/tenant disk quotas, total concurrent uploads or a global flood budget. Guard/rate/admission limits belong before parsing; database/file deadlines, storage quotas, lifecycle cleanup and expiry indexing belong in deployment. Upload permission is checked at admission; highly sensitive revocation during an in-flight operation needs a stronger transaction/current-membership policy. Download authorization is checked anew on every request. The fixture contains no public sharing or arbitrary delete endpoint.

## Practice and acceptance

Run strict TS and actual PostgreSQL16/HTTP/private-directory tests. Supply a test guard through the port, clearly separate from the real session/CSRF implementation. Require authenticated allowed text upload/download/status, two actors with foreign IDs returning404, expired and pending metadata withheld, and denied/absent credentials rejected before parsing/storage. Attempt traversal/filename headers, HTML-like text, malformed UTF-8, forbidden controls, blank/unsupported/gzip/oversize body, corrupted/truncated/extra stored bytes, reservation failure and finalize failure. Verify controlled pending reconciliation, safe fixed responses, file permissions/exclusive creation and no bytes served before digest validation.

Retain actual metadata/file observations and close server/pools/handles. Then connect the Task Board session/CSRF guard, quotas, owned cleanup and production storage adapter in independent practice. Revisit the threat model for each new format/processor or sharing role. Native browser attachment behavior, real cookie-CSRF middleware wiring, concurrent quota races, complex-format scanning, hard file/DB deadlines, crash-injected process recovery and learner implementation remain required. Material tests can establish this narrow storage/access contract; they do not establish a general secure upload service or professional readiness.

References checked2026-10-25: [OWASP uploads](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), [OWASP threat modeling](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html), [Express raw/body limits](https://expressjs.com/en/api.html#express.raw), [Node24 file ownership APIs](https://nodejs.org/download/release/v24.18.0/docs/api/fs.html), [PostgreSQL conditional writes](https://www.postgresql.org/docs/16/sql-update.html). Guard and SQL ports require real owned adapters; no request directly supplies either dependency.
