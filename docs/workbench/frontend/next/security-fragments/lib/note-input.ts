// lib/note-input.ts — pure boundary parser, reusable by handler and action.
export type RenameInput = { id: string; title: string; version: number };
export function parseRename(value: unknown): RenameInput | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (Object.keys(record).some(key => !['id', 'title', 'version'].includes(key))) return null;
  const { id, title, version } = record;
  if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  if (typeof title !== 'string' || !Number.isInteger(version) || (version as number) < 1 || (version as number) > 2147483646) return null;
  const normalized = title.trim();
  if (normalized.length < 1 || normalized.length > 100) return null;
  return { id, title: normalized, version: version as number };
}
