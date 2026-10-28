// Application-owned dense, ascending finite numbers; finite target; no concurrent mutation.
export function lowerBound(values: readonly number[], target: number): number {
  if (!Number.isFinite(target)) throw new RangeError('Expected finite target');
  let lo = 0;
  let hi = values.length;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const value = values[mid]!; // Invariant proves mid is inside this dense array.
    if (value < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
export function binarySearchFirst(values: readonly number[], target: number): number {
  const position = lowerBound(values, target);
  return position < values.length && values[position] === target ? position : -1;
}
