// note-projection.ts — pure helpers, no React/Query dependency.
export type NoteRecord = { id: string; title: string; version: number };
export type PendingRename = { title: string; version: number; sequence: number };
export function acceptConfirmed(current: NoteRecord | undefined, incoming: NoteRecord): NoteRecord {
  if (current && current.id !== incoming.id) throw new Error('Mismatched note identity');
  return !current || incoming.version >= current.version ? incoming : current;
}
export function projectPending(base: NoteRecord, pending: readonly PendingRename[]): NoteRecord {
  const applicable = pending.filter(edit => edit.version === base.version);
  const newest = applicable.reduce<PendingRename | undefined>((last, edit) =>
    !last || edit.sequence > last.sequence ? edit : last, undefined);
  return newest ? { ...base, title: newest.title } : base;
}
