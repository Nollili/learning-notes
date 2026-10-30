export type Note = Readonly<{ id: string; title: string }>;
export type ListOptions = Readonly<{ query?: string; limit?: number }>;

export function sortNotes(notes: readonly Note[]): Note[] {
  // Sorting the original array would change the caller's state.
  return [...notes].sort((a, b) => a.title < b.title ? -1 : a.title > b.title ? 1 :
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}

export function listNotes(notes: readonly Note[], options: ListOptions = {}): Note[] {
  const limit = options.limit === undefined ? 10 : options.limit;
  if (!Number.isInteger(limit) || limit < 0 || limit > 50) throw new RangeError('limit must be 0–50');
  if (options.query !== undefined && typeof options.query !== 'string') throw new TypeError('query must be a string');
  const query = (options.query ?? '').trim().toLowerCase();
  return sortNotes(notes.filter(note => note.title.toLowerCase().includes(query))).slice(0, limit);
}
