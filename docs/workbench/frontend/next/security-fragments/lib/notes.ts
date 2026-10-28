// lib/notes.ts
import 'server-only';
import { pool } from './db';
import type { RenameInput } from './note-input';
export async function renameOwned(actorId: string, input: RenameInput) {
  const result = await pool.query<{ id: string; title: string; version: number }>(
    `UPDATE private_note SET title = $1, version = version + 1
     WHERE id = $2 AND owner_id = $3 AND version = $4
     RETURNING id, title, version`,
    [input.title, input.id, actorId, input.version]
  );
  return result.rows[0] ?? null;
}
