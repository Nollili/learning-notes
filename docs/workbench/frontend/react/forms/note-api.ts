// note-api.ts — same-origin browser API contract from the server-security lesson.
import { noteSchema, renameSchema, type Note, type Rename } from './note-contract';
export class SaveError extends Error {
  constructor(public status: number) { super('Note could not be saved'); }
}
export async function saveNote(input: Rename): Promise<Note> {
  const body = renameSchema.parse(input);
  const response = await fetch('/api/notes', {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body), signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) { await response.body?.cancel(); throw new SaveError(response.status); }
  const confirmed = noteSchema.parse(await response.json());
  if (confirmed.id !== body.id || confirmed.version <= body.version) throw new Error('Unconfirmed note identity/version');
  return confirmed;
}
