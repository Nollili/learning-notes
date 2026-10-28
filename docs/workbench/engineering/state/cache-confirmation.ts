// cache-confirmation.ts
import { QueryClient, queryOptions } from '@tanstack/react-query';
import { acceptConfirmed, type NoteRecord } from '../../frontend/react/forms/note-projection.js';
export type CacheScope = Readonly<{ tenantId: string; userId: string }>;
export const detailKey = (scope: CacheScope, id: string) => ['note', scope.tenantId, scope.userId, id] as const;
export const listPrefix = (scope: CacheScope) => ['notes', scope.tenantId, scope.userId] as const;
export function detailOptions(scope: CacheScope, id: string, load: () => Promise<NoteRecord>) {
  return queryOptions({
    queryKey: detailKey(scope, id),
    queryFn: async () => { const result = await load(); if (result.id !== id) throw new Error('Wrong note'); return result; },
    retry: false, staleTime: 30_000,
    structuralSharing: (old, incoming) => acceptConfirmed(old as NoteRecord | undefined, incoming as NoteRecord),
  });
}
export async function confirmRename(client: QueryClient, scope: CacheScope, input: NoteRecord,
  persist: (note: NoteRecord) => Promise<NoteRecord>): Promise<void> {
  try {
    const confirmed = await persist(input); // Exactly one attempt; caller owns transport/schema/authentication.
    if (confirmed.id !== input.id) throw new Error('Wrong note');
    client.setQueryData<NoteRecord>(detailKey(scope, input.id), old => acceptConfirmed(old, confirmed));
  } finally {
    await client.invalidateQueries({ queryKey: detailKey(scope, input.id), exact: true });
    await client.invalidateQueries({ queryKey: listPrefix(scope) });
  }
}
