// app/api/notes/route.ts
import { currentActor } from '../../../lib/session';
import { parseRename } from '../../../lib/note-input';
import { renameOwned } from '../../../lib/notes';
import { InputError, readSmallJson } from '../../../lib/http-input';
export const runtime = 'nodejs';
function reply(status: number, body: unknown) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
}
export async function PATCH(request: Request) {
  try {
    const origin = process.env.APP_ORIGIN;
    if (!origin) throw new Error('APP_ORIGIN required'); // Exact canonical HTTPS origin in production.
    if (request.headers.get('origin') !== origin) return reply(403, { error: 'Request origin denied' });
    const actor = await currentActor();
    if (!actor) return reply(401, { error: 'Sign in required' });
    const input = parseRename(await readSmallJson(request));
    if (!input) return reply(400, { error: 'Invalid note edit' });
    const updated = await renameOwned(actor.id, input);
    return updated ? reply(200, updated) : reply(409, { error: 'Unavailable or changed; refresh your notes' });
  } catch (error) {
    if (error instanceof InputError) return reply(error.status, { error: error.message });
    // Server observability records a safe correlation ID; never credentials/raw bodies.
    return reply(500, { error: 'Unable to save note' });
  }
}
