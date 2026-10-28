// use-note-query.ts — use the same pure noteKey module as mutation/server code.
import { useQuery } from '@tanstack/react-query';
import { noteSchema, type Note } from './note-contract';
import { acceptConfirmed } from './note-projection';
import { noteKey } from './note-keys';
export function useNoteQuery(userId: string, noteId: string) {
  return useQuery<Note>({
    queryKey: noteKey(userId, noteId),
    queryFn: async ({ signal }) => {
      const response = await fetch(`/api/notes/${encodeURIComponent(noteId)}`, {
        signal: AbortSignal.any([signal, AbortSignal.timeout(5000)])
      });
      if (!response.ok) { await response.body?.cancel(); throw new Error('Note unavailable'); }
      const record = noteSchema.parse(await response.json());
      if (record.id !== noteId) throw new Error('Mismatched note identity');
      return record;
    },
    structuralSharing: (old, incoming) => acceptConfirmed(old as Note | undefined, noteSchema.parse(incoming)),
    staleTime: 30_000, retry: false
  });
}
