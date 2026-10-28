// rename-plan.ts
export type Principal = Readonly<{ userId: string; tenantId: string }>;
export class RenameRejected extends Error {
  constructor(readonly code: 'unauthenticated' | 'invalid') { super(code); }
}
export function planRename(actor: Principal | null, input: unknown) {
  if (!actor) throw new RenameRejected('unauthenticated');
  if (!input || typeof input !== 'object' || Array.isArray(input)
    || Object.keys(input).length !== 3 || Object.keys(input).some(key => !['id', 'title', 'version'].includes(key))
    || !('id' in input) || typeof input.id !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(input.id)
    || !('title' in input) || typeof input.title !== 'string' || !input.title.trim() || input.title.length > 80
    || !('version' in input) || typeof input.version !== 'number' || !Number.isSafeInteger(input.version)
    || input.version < 1 || input.version >= Number.MAX_SAFE_INTEGER) throw new RenameRejected('invalid');
  return {
    text: `UPDATE notes SET title = $1, version = version + 1
           WHERE id = $2 AND tenant_id = $3 AND owner_id = $4 AND version = $5
           RETURNING id, title, version`,
    values: [input.title.trim(), input.id, actor.tenantId, actor.userId, input.version] as const,
  };
}
