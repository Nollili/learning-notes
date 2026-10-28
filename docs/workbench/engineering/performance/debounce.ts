// debounce.ts
export type Options = { leading?: boolean; trailing?: boolean; maxWait?: number };
export function debounce<A extends unknown[]>(fn: (...args: A) => void, wait: number, options: Options = {}) {
  const leading = options.leading ?? false;
  const trailing = options.trailing ?? true;
  const maximum = options.maxWait;
  if (!Number.isFinite(wait) || wait <= 0 || wait > 60_000 || (!leading && !trailing)
    || (maximum !== undefined && (!Number.isFinite(maximum) || maximum < wait || maximum > 60_000 || !trailing))) {
    throw new Error('Invalid debounce options');
  }
  let quiet: ReturnType<typeof setTimeout> | undefined;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  let pending: A | undefined;
  const cancel = () => {
    clearTimeout(quiet); clearTimeout(deadline);
    quiet = undefined; deadline = undefined; pending = undefined;
  };
  const flush = () => {
    const args = pending;
    cancel(); // Clear before callback, so a reentrant call creates an independent burst.
    if (args !== undefined && trailing) fn(...args);
  };
  return {
    run(...args: A) {
      const first = quiet === undefined;
      pending = args;
      clearTimeout(quiet);
      quiet = setTimeout(flush, wait);
      if (first && maximum !== undefined) deadline = setTimeout(flush, maximum);
      if (first && leading) { pending = undefined; fn(...args); }
    },
    cancel,
    flush
  };
}
