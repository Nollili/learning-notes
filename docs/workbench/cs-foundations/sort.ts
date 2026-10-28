export function quickSortTrace(input: readonly number[]) {
  if (input.length > 256) throw new RangeError('Teaching input limit: 256');
  for (let i = 0; i < input.length; i++) {
    if (!Object.hasOwn(input, i) || !Number.isFinite(input[i])) throw new TypeError('Expected dense finite numbers');
  }
  let comparisons = 0;
  let partitionSlots = 0;
  let maxDepth = 0;
  function visit(values: readonly number[], depth: number): number[] {
    maxDepth = Math.max(maxDepth, depth);
    if (values.length <= 1) return [...values];
    const pivot = values[values.length - 1]!;
    const left: number[] = [];
    const right: number[] = [];
    for (let i = 0; i < values.length - 1; i++) {
      const value = values[i]!;
      comparisons++;
      (value < pivot ? left : right).push(value);
      partitionSlots++;
    }
    return [...visit(left, depth + 1), pivot, ...visit(right, depth + 1)];
  }
  const values = visit(input, 1);
  return { values, comparisons, partitionSlots, maxDepth };
}
