// use-note-edit.ts — mount one owner per note, under a stable QueryClientProvider.
import { useRef } from 'react';
import { useMutation, useMutationState, useQueryClient } from '@tanstack/react-query';
import { saveNote } from './note-api';
import { acceptConfirmed, projectPending, type PendingRename } from './note-projection';
import type { Note } from './note-contract';
import { noteKey } from './note-keys';
export function useNoteEdit(userId: string, noteId: string) {
  const client = useQueryClient();
  const sequence = useRef(0);
  const mutationKey = ['note.rename', userId, noteId] as const;
  const mutation = useMutation<Note, Error, PendingRename>({
    mutationKey,
    mutationFn: edit => saveNote({ id: noteId, title: edit.title, version: edit.version }),
    retry: false,
    onMutate: async () => { await client.cancelQueries({ queryKey: noteKey(userId, noteId), exact: true }); },
    onSuccess: confirmed => {
      client.setQueryData<Note>(noteKey(userId, noteId), old => acceptConfirmed(old, confirmed));
    },
    onSettled: async () => {
      await client.invalidateQueries({ queryKey: noteKey(userId, noteId), exact: true });
      await client.invalidateQueries({ queryKey: ['notes', userId] }); // All affected filtered lists.
    }
  });
  const pending = useMutationState<PendingRename>({
    filters: { mutationKey, exact: true, status: 'pending' },
    select: item => item.state.variables as PendingRename // This owned key carries only the typed edits above.
  });
  return {
    mutation,
    rename: (title: string, version: number) => mutation.mutateAsync({ title, version, sequence: ++sequence.current }),
    project: (confirmed: Note) => projectPending(confirmed, pending)
  };
}
