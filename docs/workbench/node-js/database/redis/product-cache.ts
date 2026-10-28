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
