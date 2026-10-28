// text-history.ts
export function createTextHistory(initial: string, limit = 50) {
  const validate = (text: string) => {
    if (typeof text !== 'string' || text.length > 4000) throw new RangeError('Bounded text required');
  };
  validate(initial);
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw new RangeError('Invalid history limit');
  let value = initial;
  const past: string[] = [], future: string[] = [];
  return {
    get value() { return value; },
    get retained() { return past.length + future.length; },
    set(next: string) {
      validate(next); if (next === value) return;
      past.push(value); if (past.length > limit) past.shift();
      value = next; future.length = 0;
    },
    undo() { if (past.length) { future.push(value); value = past.pop()!; } return value; },
    redo() { if (future.length) { past.push(value); value = future.pop()!; } return value; },
  };
}
