// lib/db.ts — Node runtime, provision DATABASE_URL outside source control.
import 'server-only';
import { Pool } from 'pg';
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL required');
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5, connectionTimeoutMillis: 3000, statement_timeout: 3000
});
