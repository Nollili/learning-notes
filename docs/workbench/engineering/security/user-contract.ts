// user-contract.ts
export type DisplayUser = Readonly<{ id: number; displayName: string }>;
export function parseDisplayUser(value: unknown, version: 'v1' | 'v2'): DisplayUser {
  if (typeof value !== 'object' || value === null || Array.isArray(value) ||
      !('id' in value) || typeof value.id !== 'number' || !Number.isSafeInteger(value.id) || value.id <= 0) {
    throw new TypeError('Invalid user representation');
  }
  const name = version === 'v1' && 'name' in value ? value.name
    : version === 'v2' && 'displayName' in value ? value.displayName : undefined;
  if (typeof name !== 'string' || !name.trim() || name.length > 80) throw new TypeError('Invalid display name');
  return { id: value.id, displayName: name.trim() };
}
