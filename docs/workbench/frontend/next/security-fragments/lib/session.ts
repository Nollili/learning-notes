// lib/session.ts
import 'server-only';
import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { pool } from './db';
export async function currentActor(): Promise<{ id: string } | null> {
  const token = (await cookies()).get('__Host-session')?.value;
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const hash = createHash('sha256').update(token).digest('hex');
  const result = await pool.query<{ user_id: string }>(
    `SELECT user_id FROM app_session
     WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now()`, [hash]
  );
  return result.rows[0] ? { id: result.rows[0].user_id } : null;
}
