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
