# Redis Adapters: Cache Boundaries and Shared Limits

Redis is an additional dependency, not the primary source of truth for product data. This lab uses Node24, TypeScript5.9, Zod4.6 and the redis npm client6.3.0. Server commands target Redis8.10; pin/retest the deployed server patch independently. PostgreSQL remains the authoritative database. Do not add Redis to an application that does not need the measured benefit.

## Own connection and command lifetimes

Install the exact client in the application fixture and retain its lockfile. Attach an error listener before connect; an unhandled error event can terminate the process. Configure TLS/ACLs and secrets through authorized deployment configuration. Do not log the connection URL or arbitrary error text.

```ts
// redis-connection.ts
import { createClient } from 'redis';
export async function openRedis(url: string) {
  const client = createClient({
    url, socket: { connectTimeout: 1000, socketTimeout: 1000, reconnectStrategy: false },
    disableOfflineQueue: true, commandsQueueMaxLength: 64,
  });
  client.on('error', () => console.warn('redis.connection_error'));
  try { await client.connect(); } catch (error) {
    if (client.isOpen) client.destroy();
    throw error;
  }
  return {
    client,
    async close(): Promise<void> {
      if (!client.isOpen) return;
      const deadline = setTimeout(() => { if (client.isOpen) client.destroy(); }, 1000);
      try { await client.close(); } finally { clearTimeout(deadline); }
    },
  };
}
export type OwnedRedis = Awaited<ReturnType<typeof openRedis>>['client'];
```

This deliberately disables reconnect/offline queues: an optional cache can fail quickly while the service follows its fallback policy. A supervisor or a separately bounded reconnect owner can recreate the client. A queue worker requiring continuous broker availability needs a different owned reconnect policy. Avoid one set of client options for every workload.

In client6.3 use withCommandOptions({timeout:200}) for a bounded command wait. A timeout/abort does not prove the server did not apply a write. Do not automatically retry INCR or another non-idempotent effect after an uncertain reply. socketTimeout closes a stalled connection; it does not substitute for per-command and application budgets. On shutdown, stop intake, drain owned work, then close the client; the final application deadline still applies. See [ordered shutdown](./module-10-production-ready-applications.md#9-graceful-shutdown).

## Schema-checked cache-aside with bounded fallback

```ts
// product-cache.ts
import { z } from 'zod';
import type { OwnedRedis } from './redis-connection.js';
const idSchema = z.string().regex(/^[A-Za-z0-9_-]{1,80}$/);
const productSchema = z.object({
  id: idSchema, name: z.string().min(1).max(200),
  priceCents: z.number().int().nonnegative(),
}).strict();
const entrySchema = z.object({
  version: z.literal(1), tenantId: idSchema, product: productSchema,
}).strict();
export type ProductView = z.infer<typeof productSchema>;
export class CacheFallbackBusy extends Error {}
export interface CachePort {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}
export function redisCachePort(client: OwnedRedis): CachePort {
  const command = () => client.withCommandOptions({ timeout: 200 });
  return {
    get: key => command().get(key),
    set: async (key, value) => { await command().set(key, value, { EX: 60 }); },
    remove: async key => { await command().del(key); },
  };
}
export function createProductReader(deps: {
  cache: CachePort;
  readSource: (tenantId: string, id: string) => Promise<ProductView | null>;
  metric: (event: 'cache_unavailable' | 'cache_corrupt' | 'cache_fill_failed') => void;
}) {
  const inFlight = new Map<string, Promise<ProductView | null>>();
  return function find(tenantId: string, id: string): Promise<ProductView | null> {
    idSchema.parse(tenantId); idSchema.parse(id);
    const key = `product:v1:${tenantId}:${id}`;
    const existing = inFlight.get(key);
    if (existing) return existing;
    if (inFlight.size >= 8) return Promise.reject(new CacheFallbackBusy('Read capacity exhausted'));
    const task = (async () => {
      let cached: string | null = null;
      try { cached = await deps.cache.get(key); } catch { deps.metric('cache_unavailable'); }
      if (cached !== null) {
        let entry: z.infer<typeof entrySchema> | undefined;
        try {
          if (Buffer.byteLength(cached, 'utf8') > 16384) throw new Error();
          entry = entrySchema.parse(JSON.parse(cached));
        } catch { deps.metric('cache_corrupt'); }
        if (entry?.tenantId === tenantId && entry.product.id === id) return entry.product;
        if (entry !== undefined) deps.metric('cache_corrupt');
        try { await deps.cache.remove(key); } catch { /* Optional cache removal failed. */ }
      }
      // Real adapter must enforce database acquisition/query deadlines and tenant predicate.
      const raw = await deps.readSource(tenantId, id);
      if (raw === null) return null; // No negative caching in this selected policy.
      const product = productSchema.parse(raw);
      if (product.id !== id) throw new Error('Source identity mismatch');
      const encoded = JSON.stringify({ version: 1, tenantId, product });
      try { await deps.cache.set(key, encoded); } catch { deps.metric('cache_fill_failed'); }
      return product;
    })();
    inFlight.set(key, task);
    // Handle both outcomes without creating an unobserved rejecting finally promise.
    void task.then(() => { inFlight.delete(key); }, () => { inFlight.delete(key); });
    return task;
  };
}
```

Cache bytes, version, fields and tenant/product identity are validated. Old/corrupt/mismatched data becomes a miss, never a trusted cast. Cache read/fill failure does not replace a successful authoritative read with an error. Source failure and invalid source data do propagate; do not hide an unavailable database behind an empty product. The metric adapter must be synchronous/nonthrowing and emit fixed low-cardinality labels.

At most eight distinct reads are owned per instance, with no waiting queue; same-key callers share one promise. Hold that slot until actual source work ends, even if an outer HTTP deadline has fired. A permanently stuck driver then consumes capacity instead of creating unlimited replacements; configure the actual driver deadline to recover the slot. Across replicas, sum the budgets against useful database capacity. This is per-instance single-flight, not a distributed lock.

TTL60 is a bounded-staleness policy only when writes/reads obey the assumed cache contract. Deleting after a database commit can race with an older concurrent fill; a stale value may reappear until its TTL. For strict freshness use the authoritative store or a versioned/coordinated protocol, not a longer explanation of cache invalidation. Cache only public projections suitable for the authorized tenant; never cache an authorization decision as a product field. Use a server memory budget/eviction policy as well as TTL, measure cardinality and avoid arbitrary key construction. This code does not negative-cache missing products.

## One atomic shared fixed-window limit

Separate GET/INCR/EXPIRE requests can race or leave a permanent counter if the process dies before expiry. This small Lua script performs the decision, increment and expiry within one Redis execution. It uses one key and no unbounded loop.

```ts
// shared-limit.ts
import { createHmac } from 'node:crypto';
import { z } from 'zod';
import type { OwnedRedis } from './redis-connection.js';
export const fixedWindowScript = `
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
if not limit or limit < 1 or limit > 1000 or limit ~= math.floor(limit)
  or not window or window < 1 or window > 60000 or window ~= math.floor(window) then
  return redis.error_reply('invalid limit policy')
end
local current = tonumber(redis.call('GET', KEYS[1]) or '0')
if not current or current < 0 or current ~= math.floor(current) then
  return redis.error_reply('invalid counter')
end
local ttl = redis.call('PTTL', KEYS[1])
if current >= limit then
  if ttl < 0 then redis.call('PEXPIRE', KEYS[1], window); ttl = window end
  return {0, ttl}
end
redis.call('INCR', KEYS[1])
if current == 0 or ttl < 0 then redis.call('PEXPIRE', KEYS[1], window); ttl = window end
return {1, ttl}
`;
const resultSchema = z.tuple([z.union([z.literal(0), z.literal(1)]), z.number().int().nonnegative()]);
export function createSharedLimit(client: OwnedRedis, keySecret: Buffer) {
  if (keySecret.length < 32) throw new Error('Limit-key secret needs32 random bytes');
  const secret = Buffer.from(keySecret);
  return async (tenantId: string, userId: string) => {
    for (const value of [tenantId, userId]) {
      if (!/^[A-Za-z0-9_-]{1,80}$/.test(value)) throw new Error('Invalid trusted subject');
    }
    const subject = createHmac('sha256', secret).update(JSON.stringify([tenantId, userId])).digest('hex');
    const raw = await client.withCommandOptions({ timeout: 200 }).eval(fixedWindowScript, {
      keys: [`limit:invoice:v1:{${subject}}`], arguments: ['10', '10000'],
    });
    const [allowed, ttlMs] = resultSchema.parse(raw);
    return { allowed: allowed === 1, retryAfterSeconds: Math.max(1, Math.ceil(ttlMs / 1000)) };
  };
}
```

This contract permits ten attempts over a ten-second window anchored by that subject's first attempt. It is not a sliding-window or token-bucket limiter; bursts around window boundaries are a deliberate trade-off. Denied attempts do not increment the count. A dedicated versioned namespace and ACL prevent unrelated writers changing counter type/value. The script repairs a missing expiry under that namespace's policy. Validate before mutation: Redis script atomicity means no interleaving, not automatic rollback of writes after a later script error. Keep scripts fast because they block Redis execution.

Both application instances must use the same Redis authority, namespace, subject derivation and policy. The key HMAC avoids raw identity strings in keys; it is not permission enforcement. Trust the tenant/user only after authentication. A client-supplied IP or header is not a verified identity; apply the actual proxy-trust policy when using network subjects.

Wire allowed=false to429 with Retry-After. A Redis timeout/error is an unavailable limit authority: for this sensitive invoice operation, fail closed with a safe503 and alert; do not silently switch each replica to an independent “ten more” allowance. The cache reader's fail-open policy is different because it is only an optimization. A timed-out limit operation may already have consumed a slot; conservative denial is acceptable here. Replication failover/eviction can reset counters, so this is abuse control rather than a strict financial invariant. Use database constraints/transactions for money or inventory correctness.

## Practice and acceptance

Run only against an authorized isolated Redis instance with a bounded memory policy, no public listener and separate test credentials/namespace. Do not flush a shared server. Create two independent clients/adapters to represent two app replicas and close both even on failure.

**Acceptance:** many concurrent calls through both clients allow exactly ten total requests for one subject, deny the rest, return positive bounded TTL and reset after expiry. Different tenants/users are independent; the same subject maps to one key. Verify malformed counter/type handling and expiry repair in a fresh namespace. Stop the server during calls: operation returns503 under policy, connection errors are handled, command/offline queues remain bounded and shutdown terminates. Do not equate a client timeout with rollback of a consumed slot.

For cache-aside, test valid-hit/no-source-read, malformed JSON, oversized/old-version/wrong-tenant/wrong-ID entries, read outage, fill outage, source rejection and invalid source shape. Corrupt/optional-cache failures fall back once per coalesced key; eight distinct blocked reads consume the whole budget and the ninth rejects without querying the source. Release/fail a read and prove capacity is reclaimed. Demonstrate stale-fill-after-invalidation and explain why TTL permits bounded staleness rather than strong consistency. Retain actual server/client versions and observed multi-client results. A port-based fake can test control flow but cannot prove Redis Lua atomicity, TTL or failover behavior. Learner execution remains required.

References checked2026-10-21: [node-redis6.3 release](https://github.com/redis/node-redis/releases/tag/redis@6.3.0), [client configuration](https://github.com/redis/node-redis/blob/master/docs/client-configuration.md), [connection lifetime](https://redis.io/docs/latest/develop/clients/nodejs/connect/), [Redis Lua execution](https://redis.io/docs/latest/develop/programmability/eval-intro/), [INCR counter/limit patterns](https://redis.io/docs/latest/commands/incr/), [expiry semantics](https://redis.io/docs/latest/commands/expire/). Some general Redis client guides show older commandOptions/quit APIs; the primary snippets use the installed6.3 declarations and require retesting on a version change.
