// bounded-memo.mjs
export function memoizeBounded(fn, capacity = 128) {
  if (typeof fn !== 'function' || !Number.isSafeInteger(capacity) || capacity < 1 || capacity > 1024) {
    throw new TypeError('Invalid memoization contract');
  }
  const entries = []; // Most recently used entry is last.
  function memoized(...args) {
    const index = entries.findIndex(entry => Object.is(entry.receiver, this)
      && entry.args.length === args.length
      && entry.args.every((arg, i) => Object.is(arg, args[i])));
    if (index !== -1) {
      const [entry] = entries.splice(index, 1);
      entries.push(entry);
      return entry.result; // Includes false, 0, empty string, null and undefined.
    }
    const result = Reflect.apply(fn, this, args); // Throws are not cached.
    entries.push({ receiver: this, args, result });
    if (entries.length > capacity) entries.shift();
    return result;
  }
  memoized.clear = () => { entries.length = 0; };
  return memoized;
}

export const fibMemo = memoizeBounded(function fib(n) {
  if (!Number.isSafeInteger(n) || n < 0 || n > 70) throw new RangeError('Expected integer0..70');
  return n < 2 ? BigInt(n) : fibMemo(n - 1) + fibMemo(n - 2);
}, 128);
console.log(fibMemo(40)); // 102334155n; this bounded exercise uses exact BigInt results.
