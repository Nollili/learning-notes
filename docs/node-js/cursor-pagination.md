# Deterministic Cursor Pagination

Use keyset pagination for a growing ordered feed when “continue after this row” matters more than “jump to page37.” OFFSET is simpler for small/admin result sets and arbitrary page numbers, but skipped rows still cost work and concurrent inserts can shift page boundaries. Neither approach automatically creates a snapshot across HTTP requests.

This worked path uses Node24, TypeScript5.9, Express5.3, Zod4.6 and MikroORM7.2/PostgreSQL16. It extends the [SQL workbench](./sql-query-workbench.md) with a tenant-scoped orders API. The server must authorize reading that tenant's orders; a cursor is never an access credential.

## Contract and data model

The API accepts only status=paid/draft/cancelled, sort=newest, limit1–100 and an optional opaque cursor. Unsupported query keys, duplicate values and other sorts are rejected. A different sort needs its own SQL predicate/index/cursor contract, not a user-controlled ORDER BY string.

```sql
CREATE TABLE feed_orders (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  status text NOT NULL CHECK (status IN ('paid', 'draft', 'cancelled')),
  total_cents integer NOT NULL CHECK (total_cents >= 0),
  created_at timestamptz NOT NULL
);
CREATE INDEX feed_orders_page_idx
  ON feed_orders(tenant_id, status, created_at DESC, id DESC);
```

Use actual tenant foreign keys in the complete domain. ID and created_at are immutable ordering keys under the write policy. Both are non-null. Descending continuation uses `(created_at,id) < (cursor_time,cursor_id)`, matching ORDER BY created_at DESC,id DESC. ID breaks timestamp ties. Mixed-direction sorts require a different comparison, and nullable keys need explicit handling.

PostgreSQL timestamps can retain microseconds; JavaScript Date retains milliseconds. Converting a database position to Date and back can skip or repeat rows. The SQL below projects exactly six fractional digits in UTC as text and the codec keeps that text intact. The example bounds dates to ordinary four-digit AD years rather than PostgreSQL's entire date range.

## Signed scoped cursor and query boundary

```ts
// order-pages.ts
import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
export class BadPage extends Error {}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
function isStamp(value: string): boolean {
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{6}Z$/.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 19) === value.slice(0, 19);
}
const querySchema = z.object({
  status: z.enum(['paid', 'draft', 'cancelled']).default('paid'),
  sort: z.literal('newest').default('newest'),
  limit: z.string().regex(/^(?:[1-9]|[1-9][0-9]|100)$/).transform(Number).default(20),
  cursor: z.string().min(1).max(1024).optional(),
}).strict();
export type PageQuery = z.infer<typeof querySchema>;
export function parsePageQuery(raw: unknown): PageQuery {
  const result = querySchema.safeParse(raw);
  if (!result.success) throw new BadPage('Invalid page query');
  return result.data;
}
interface Position { at: string; id: string }
export function createCursorCodec(key: Buffer) {
  if (key.length < 32) throw new Error('Cursor key must contain at least32 random bytes');
  const secret = Buffer.from(key); // Own immutable-by-caller key bytes.
  const mac = (text: string) => createHmac('sha256', secret).update(text).digest();
  return {
    scope(tenantId: string, query: Pick<PageQuery, 'status' | 'sort'>): string {
      return mac(JSON.stringify(['orders-scope-v1', tenantId, query.status, query.sort])).toString('hex');
    },
    encode(position: Position, scope: string): string {
      if (!uuid.test(position.id) || !isStamp(position.at)) throw new Error('Invalid database position');
      const body = Buffer.from(JSON.stringify([1, position.at, position.id, scope])).toString('base64url');
      return body + '.' + mac('orders-cursor-v1:' + body).toString('base64url');
    },
    decode(token: string, scope: string): Position {
      try {
        if (token.length > 1024 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/.test(token)) throw new Error();
        const [body, signature] = token.split('.') as [string, string];
        const supplied = Buffer.from(signature, 'base64url');
        if (supplied.toString('base64url') !== signature || supplied.length !== 32 ||
            !timingSafeEqual(supplied, mac('orders-cursor-v1:' + body))) throw new Error();
        const bytes = Buffer.from(body, 'base64url');
        if (bytes.toString('base64url') !== body) throw new Error();
        const data: unknown = JSON.parse(bytes.toString('utf8'));
        if (!Array.isArray(data) || data.length !== 4 || data[0] !== 1 ||
            typeof data[1] !== 'string' || !isStamp(data[1]) ||
            typeof data[2] !== 'string' || !uuid.test(data[2]) || data[3] !== scope) throw new Error();
        return { at: data[1], id: data[2] };
      } catch { throw new BadPage('Invalid page cursor'); }
    },
  };
}
const rowSchema = z.object({
  id: z.string().regex(uuid), createdAt: z.string().refine(isStamp),
  totalCents: z.number().int().nonnegative(),
}).strict();
export type OrderRow = z.infer<typeof rowSchema>;
type QueryRows = (sql: string, values: unknown[]) => Promise<unknown>;
export function createListOrders(queryRows: QueryRows, codec: ReturnType<typeof createCursorCodec>) {
  return async (tenantId: string, query: PageQuery) => {
    if (!uuid.test(tenantId)) throw new Error('Invalid trusted tenant context');
    const scope = codec.scope(tenantId, query);
    const after = query.cursor === undefined ? undefined : codec.decode(query.cursor, scope);
    const values: unknown[] = [tenantId, query.status];
    const continuation = after ? 'AND (created_at, id) < (?::timestamptz, ?::uuid)' : '';
    if (after) values.push(after.at, after.id);
    values.push(query.limit + 1);
    // Only fixed developer-owned SQL fragments are composed; all values are bound.
    const raw = await queryRows(`
      SELECT id, total_cents AS "totalCents",
        to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "createdAt"
      FROM feed_orders WHERE tenant_id = ?::uuid AND status = ? ${continuation}
      ORDER BY created_at DESC, id DESC LIMIT ?`, values);
    // A broken database projection is an internal error, not a client-validation400.
    const rows = z.array(rowSchema).parse(raw);
    const items = rows.slice(0, query.limit);
    const last = items.at(-1);
    return { items, nextCursor: rows.length > query.limit && last
      ? codec.encode({ at: last.createdAt, id: last.id }, scope) : null };
  };
}
```

The cursor's HMAC binds the position to the tenant, filter and sort. It protects integrity, not confidentiality: the Base64URL body is readable. Never place secrets or sensitive row data in it. The tenant remains derived from authenticated membership on every request. Replaying a cursor cannot widen the SQL tenant predicate. Page size may change between requests; its cap is always revalidated. A cursor-key rotation invalidates old cursors with400; clients restart the feed. Use a separate randomly generated secret loaded from validated configuration, not a password/default or the access-token key. A production rotation policy can retain a small allowlisted set of key IDs with an explicit retirement period.

The decoder bounds input before decoding, verifies the signature before trusting JSON and rejects unknown versions/shapes/scopes. A successful signature is not sufficient without schema validation. This cursor has no expiry; that is acceptable for this read continuation contract, provided authorization/filter/size checks always run. Add a bounded expiry if retention/privacy/product rules require one. Do not log full cursor/query strings.

## Express and request-scoped ORM wiring

```ts
// order-router.ts
import { Router, type RequestHandler } from 'express';
import type { EntityManager } from '@mikro-orm/postgresql';
import { BadPage, parsePageQuery, createListOrders, createCursorCodec } from './order-pages.js';
export function createOrderRouter(deps: {
  requireTenantOrdersRead: RequestHandler;
  tenantFor: (req: Parameters<RequestHandler>[0]) => string;
  emForRequest: (req: Parameters<RequestHandler>[0]) => EntityManager;
  cursorKey: Buffer;
}) {
  const router = Router();
  const codec = createCursorCodec(deps.cursorKey);
  router.get('/orders', deps.requireTenantOrdersRead, async (req, res, next) => {
    try {
      const query = parsePageQuery(req.query);
      const tenantId = deps.tenantFor(req); // Verified current membership, never req.query/body.
      const em = deps.emForRequest(req); // Existing RequestContext/fork ownership, not global EM.
      const list = createListOrders((sql, values) => em.execute(sql, values), codec);
      res.json(await list(tenantId, query));
    } catch (error) {
      if (error instanceof BadPage) return res.status(400).json({ message: error.message });
      return next(error);
    }
  });
  return router;
}
```

The required authorization middleware must authenticate and authorize reading tenant orders before tenantFor returns a context. Reuse the [authentication boundary](./module-09-authentication-authorization.md); these injected adapters make the trust dependency explicit. Do not replace the middleware with a check that an Authorization header merely exists. Use the production request logging/error handler and database deadlines from [production lifecycle](./module-10-production-ready-applications.md). Successful responses contain only ID, timestamp, amount and continuation; permission/tenant metadata is absent.

The API fetches limit+1 rows to decide whether another page exists, returns only limit rows and places the cursor after the last returned row, not the extra row. This bounds materialized results to101. A database adapter must honor the SQL LIMIT; schema validation alone does not stop an arbitrary adapter from allocating unbounded data before returning.

## What concurrent changes mean

This is a live descending feed under ordinary statement snapshots. After page1, a newer insert sorts before its cursor and will appear on refresh, not page2. Inserts with older keys can appear on later pages; deletions disappear. Immutable keys prevent an existing row moving across the boundary, but changes to eligibility/status can still affect which rows appear. Document that behavior rather than promise a frozen export.

For a consistent export, use an owned server-side snapshot/export job or materialized result with expiry and storage limits. Keeping a database transaction open across interactive HTTP page requests ties up resources and conflicts with failover/connection pooling; a cursor alone does not preserve that transaction's snapshot. An as-of timestamp can bound new keys but does not reconstruct historical updates/deletes without versioned data.

On the client, changing sort/filter resets the cursor chain and aborts/ignores stale requests. Preserve a bounded page window for infinite scrolling and support keyboard/focus behavior; see the [large-data UI lesson](../senior_growth/React/complex-forms-and-data.md). A signed cursor does not solve frontend race conditions.

## Practice and acceptance

Use a disposable database with two tenants and at least six rows. Include equal timestamps with different UUIDs, two timestamps differing only in microseconds, each status and zero total. Run the actual Express route with a real request-scoped ORM adapter. Keep keys/test fixtures outside Autocode-owned src/tests.

**Acceptance:** page through limit2 until nextCursor=null and get each initial eligible row exactly once in the specified order. Preserve the exact microseconds. Insert a newer row after page1, then prove the continuation does not repeat page1 or silently switch to OFFSET semantics; refresh reveals the new row. Repeat a tie-boundary test and delete a later row. Record the live-feed behavior for status changes explicitly. Demonstrate the OFFSET duplicate under a concurrent newer insert as a comparison, not a desired contract.

Reject malformed/oversized/noncanonical/tampered cursors, unknown versions, wrong tenant/status scope, invalid timestamps/IDs, unknown query keys, repeated query values, limit0/101/1e2 and unsupported sorts. Cursor/query errors return400, missing permission returns401/403 according to auth state, database failure reaches the central safe500/503 handler, and another tenant's row never appears. A broken database row projection must reach the internal-error path. Verify nextCursor points to the last delivered row and never the lookahead row. Test no-row and exactly-limit boundaries. Do not infer performance from six rows: inspect EXPLAIN (ANALYZE, BUFFERS) with realistic cardinality and the declared composite index. Learner implementation and retained practice evidence remain required.

References checked2026-10-21: [PostgreSQL16 row comparisons](https://www.postgresql.org/docs/16/functions-comparisons.html#ROW-WISE-COMPARISON), [LIMIT/OFFSET and unique ordering](https://www.postgresql.org/docs/16/queries-limit.html), [timestamp precision](https://www.postgresql.org/docs/16/datatype-datetime.html), [Node24 HMAC/timingSafeEqual](https://nodejs.org/download/release/v24.18.0/docs/api/crypto.html), [Zod4 basics](https://zod.dev/basics), [Express5 routing](https://expressjs.com/en/guide/routing.html).
