import { createHash, randomBytes, randomUUID } from 'node:crypto';
import argon2 from 'argon2';
import type { Pool, PoolClient } from 'pg';
export const digest = (token: string) => createHash('sha256').update(token).digest('hex');
const newToken = () => randomBytes(32).toString('base64url');
export class HttpError extends Error {
  constructor(public status: number, public code: string) { super(code); }
}
export async function transaction<T>(pool: Pool, work: (client: PoolClient) => Promise<T>) {
  const client = await pool.connect();
  let broken = false;
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (primary) {
    try { await client.query('ROLLBACK'); } catch { broken = true; }
    throw primary;
  } finally { client.release(broken); }
}

// An optional API-client lab. Browser routes use sessions and never issue refresh tokens.
export async function issueRefresh(pool: Pool, accountId: string) {
  const token = newToken();
  const familyId = randomUUID();
  await transaction(pool, async client => {
    await client.query('SELECT id FROM textbook_accounts WHERE id=$1 FOR UPDATE', [accountId]);
    await client.query(`INSERT INTO textbook_refresh_families(id,account_id,expires_at)
      VALUES ($1,$2,now()+interval '7 days')`, [familyId, accountId]);
    await client.query('INSERT INTO textbook_refresh_tokens(hash,family_id) VALUES ($1,$2)',
      [digest(token), familyId]);
  });
  return { token, familyId };
}
export async function rotateRefresh(pool: Pool, presented: string): Promise<string> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(presented)) throw new HttpError(401, 'INVALID_REFRESH');
  const replacement = newToken();
  const accepted = await transaction(pool, async client => {
    // The lookup identifies the lock owner; it does not itself authorize renewal.
    const lookup = await client.query(`SELECT f.account_id, f.id FROM textbook_refresh_tokens t
      JOIN textbook_refresh_families f ON f.id=t.family_id WHERE t.hash=$1`, [digest(presented)]);
    const identity = lookup.rows[0];
    if (!identity) return false;
    // Reset and rotation use the same account→family lock order.
    await client.query('SELECT id FROM textbook_accounts WHERE id=$1 FOR UPDATE', [identity.account_id]);
    const family = await client.query(`SELECT revoked, expires_at > clock_timestamp() AS fresh
      FROM textbook_refresh_families WHERE id=$1 FOR UPDATE`, [identity.id]);
    if (!family.rows[0]?.fresh || family.rows[0].revoked) return false;
    const consumed = await client.query(`UPDATE textbook_refresh_tokens SET used=true
      WHERE hash=$1 AND used=false RETURNING hash`, [digest(presented)]);
    if (!consumed.rowCount) {
      await client.query('UPDATE textbook_refresh_families SET revoked=true WHERE id=$1', [identity.id]);
      return false; // Commit the revocation before throwing outside the transaction.
    }
    await client.query('INSERT INTO textbook_refresh_tokens(hash,family_id) VALUES ($1,$2)',
      [digest(replacement), identity.id]);
    return true;
  });
  if (!accepted) throw new HttpError(401, 'INVALID_REFRESH');
  return replacement;
}

// The caller supplies a trusted delivery adapter. The public response never contains a reset token.
export async function requestReset(pool: Pool, email: string,
  deliver: (email: string, token: string) => Promise<void>) {
  const token = newToken();
  const accountId = await transaction(pool, async client => {
    const found = await client.query('SELECT id FROM textbook_accounts WHERE email=$1 FOR UPDATE', [email]);
    const id = found.rows[0]?.id as string | undefined;
    if (!id) return undefined;
    await client.query('UPDATE textbook_resets SET used=true WHERE account_id=$1', [id]);
    await client.query(`INSERT INTO textbook_resets(hash,account_id,expires_at)
      VALUES ($1,$2,now()+interval '15 minutes')`, [digest(token), id]);
    return id;
  });
  if (accountId) await deliver(email, token); // Never hold database locks across delivery.
}
export async function completeReset(pool: Pool, token: string, password: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new HttpError(400, 'INVALID_RESET');
  // Expensive hashing is outside the transaction; the HTTP boundary rate-limits this work.
  const hash = await argon2.hash(password, { type: argon2.argon2id });
  const accepted = await transaction(pool, async client => {
    const lookup = await client.query('SELECT account_id FROM textbook_resets WHERE hash=$1', [digest(token)]);
    const id = lookup.rows[0]?.account_id;
    if (!id) return false;
    await client.query('SELECT id FROM textbook_accounts WHERE id=$1 FOR UPDATE', [id]);
    const consumed = await client.query(`UPDATE textbook_resets SET used=true WHERE hash=$1
      AND used=false AND expires_at>clock_timestamp() RETURNING account_id`, [digest(token)]);
    if (!consumed.rowCount) return false;
    await client.query('UPDATE textbook_accounts SET password_hash=$1, credential_version=credential_version+1 WHERE id=$2', [hash, id]);
    await client.query('UPDATE textbook_resets SET used=true WHERE account_id=$1', [id]);
    await client.query('UPDATE textbook_refresh_families SET revoked=true WHERE account_id=$1', [id]);
    await client.query("DELETE FROM textbook_sessions WHERE sess->>'userId'=$1", [id]);
    return true;
  });
  if (!accepted) throw new HttpError(400, 'INVALID_RESET');
}
