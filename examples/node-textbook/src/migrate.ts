import { Pool } from 'pg';
import { loadConfig } from './config.js';
// One deliberately small, versioned migration. No ORM schema auto-sync at startup.
export const migration = `
CREATE TABLE textbook_accounts (
  id uuid PRIMARY KEY, email text NOT NULL UNIQUE, password_hash text NOT NULL, credential_version integer NOT NULL DEFAULT 1
);
CREATE TABLE textbook_tasks (
  id uuid PRIMARY KEY, owner_id uuid NOT NULL REFERENCES textbook_accounts(id),
  title varchar(200) NOT NULL CHECK (length(title) > 0), done boolean NOT NULL DEFAULT false
);
CREATE INDEX textbook_tasks_owner ON textbook_tasks(owner_id, id);
CREATE TABLE textbook_sessions (
  sid varchar NOT NULL PRIMARY KEY, sess json NOT NULL, expire timestamp(6) NOT NULL
);
CREATE INDEX textbook_sessions_expire ON textbook_sessions(expire);
CREATE TABLE textbook_refresh_families (
  id uuid PRIMARY KEY, account_id uuid NOT NULL REFERENCES textbook_accounts(id),
  expires_at timestamptz NOT NULL, revoked boolean NOT NULL DEFAULT false
);
CREATE TABLE textbook_refresh_tokens (
  hash text PRIMARY KEY, family_id uuid NOT NULL REFERENCES textbook_refresh_families(id),
  used boolean NOT NULL DEFAULT false
);
CREATE TABLE textbook_resets (
  hash text PRIMARY KEY, account_id uuid NOT NULL REFERENCES textbook_accounts(id),
  expires_at timestamptz NOT NULL, used boolean NOT NULL DEFAULT false
);`;
export async function migrate(databaseUrl: string) {
  const pool = new Pool({ connectionString: databaseUrl, connectionTimeoutMillis: 1000,
    statement_timeout: 3000 });
  const client = await pool.connect().catch(async error => { await pool.end(); throw error; });
  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(8160910)");
    await client.query('CREATE TABLE IF NOT EXISTS textbook_migrations (version integer PRIMARY KEY)');
    const applied = await client.query('SELECT version FROM textbook_migrations WHERE version = 1');
    if (!applied.rowCount) {
      await client.query(migration);
      await client.query('INSERT INTO textbook_migrations VALUES (1)');
    }
    await client.query('COMMIT');
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch { /* Release destroys a broken connection below. */ }
    throw error;
  } finally { client.release(); await pool.end(); }
}
if (import.meta.url === new URL(process.argv[1]!, 'file:').href) {
  migrate(loadConfig().databaseUrl).then(() => console.log('Migration 1 applied or already present'))
    .catch(() => { console.error('Migration failed'); process.exitCode = 1; });
}
