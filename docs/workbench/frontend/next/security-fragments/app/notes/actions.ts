// app/notes/actions.ts
'use server';
import { currentActor } from '../../lib/session';
import { parseRename } from '../../lib/note-input';
import { renameOwned } from '../../lib/notes';
import { revalidatePath } from 'next/cache';
export async function renameNote(form: FormData) {
  const actor = await currentActor(); // Recheck inside action, even if page redirects unauthenticated users.
  if (!actor) return { ok: false, error: 'Sign in required' };
  const rawVersion = form.get('version');
  const input = parseRename({
    id: form.get('id'), title: form.get('title'),
    version: typeof rawVersion === 'string' && /^[1-9][0-9]{0,9}$/.test(rawVersion) ? Number(rawVersion) : NaN
  });
  if (!input) return { ok: false, error: 'Invalid note edit' };
  const updated = await renameOwned(actor.id, input);
  if (!updated) return { ok: false, error: 'Unavailable or changed; refresh your notes' };
  revalidatePath('/notes'); // Fixed application-owned path, after the write succeeds.
  return { ok: true, note: updated };
}
