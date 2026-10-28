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
