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
