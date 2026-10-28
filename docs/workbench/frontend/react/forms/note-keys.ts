// Pure shared cache identity; contains no hook or browser dependency.
export const noteKey = (userId: string, noteId: string) => ['note', userId, noteId] as const;
