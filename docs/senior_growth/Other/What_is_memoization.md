# What is memoization?

## 🔹 Memoization in JavaScript

**Memoization** is an **optimization technique** where the result of an expensive function call is **cached** so that future calls with the **same inputs** can return the cached result **instead of recomputing** it.

This improves performance, especially for **CPU-intensive or repetitive computations**.

---

## 1️⃣ How Memoization Works

1. Store results of function calls in a **cache** (usually an object or Map).
2. When the function is called, check if the input exists in the cache:
   - If **yes**, return the cached result.
   - If **no**, compute the result, store it in the cache, and return it.

---

## 2️⃣ Example: Fibonacci Sequence

### Without Memoization (Inefficient)
```javascript
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

console.log(fib(40)); // Slow for large n
```

### With Memoization (Efficient)

```javascript
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
```

---

## 3️⃣ Benefits of Memoization

* **Performance improvement:** Avoids redundant computations.
* Repeated overlapping subproblems can benefit. A single factorial recursion has no overlapping subproblems; caching only helps repeated calls with reusable inputs.
* **Useful in React:** memo can skip some parent-driven renders; useMemo caches a calculation. Neither is a correctness guarantee.

---

## 4️⃣ React-Specific Memoization

* **`React.memo(Component)`** → Usually skips parent-driven rendering when each prop compares equal with Object.is; own state/context updates can still render, and React may render anyway.
* **`useMemo` hook** → Memoizes **computed values** between renders.
* **`useCallback` hook** → Can return a previous function reference while dependencies compare equal; the supplied function expression may still be evaluated/created during rendering. It does not execute/cache the function result.

```javascript
const computedValue = useMemo(() => expensiveComputation(data), [data]);
const memoizedHandler = useCallback(() => doSomething(value), [value]);
```

---

### ✅ Summary

* **Memoization:** Cache the result of function calls for efficiency.
* **When to use:** Expensive calculations, recursive functions, or frequent re-renders in React.
* **Caution:** Memoization adds memory overhead. Avoid caching **large or rarely used results** unnecessarily.

> 💡 Senior Tip:
> Use memoization **strategically**, especially in **performance-critical paths**, but don’t over-optimize trivial computations.


## Correct keys, ownership and invalidation

args.toString is not an injective tuple encoding: [1,2] and ['1,2'] collide, as do many different objects. A truthiness hit check recomputes cached0/false/empty/undefined results. JSON.stringify has different but still important limits: property ordering, unsupported values/cycles, type distinctions and serialization cost. Choose a deliberately specified domain key, an identity-based tuple or a maintained memoization library with the required equality/eviction policy.

The example compares receiver plus the entire argument tuple using Object.is, so it preserves argument types/arity/object identity, NaN equality and the +0/−0 distinction. Reflect.apply preserves the original this. It assumes synchronous deterministic behavior with respect to that key; changing this object's fields or mutating an argument makes identity-based cache results stale. Clear it or include an immutable revision in the key. A cache of authorization-sensitive results must include the complete tenant/principal/policy identity and invalidation rules; this helper provides no such application policy automatically.

This is a small, transparent LRU with linear entry search: lookup is O(capacity × argument count), plus array movement. It is not an O(1) hash cache. Entry count is bounded; retained bytes are not, because each argument/result may keep a large graph alive. Bound data sizes/lifetime and clear at the owning feature/request/session boundary. Shared module caches otherwise outlive an individual UI consumer. Returning the same cached mutable result also shares its mutations; prefer immutable outputs or explicitly copy with known cost.

Throws are not cached. Async promises require a separate policy: whether to coalesce in-flight work, evict rejected promises, enforce timeouts, and manage per-subscriber cancellation. This synchronous teaching wrapper does not implement those rules; do not use it as a generic fetch cache. Recursive fibMemo relies on enough capacity for this bounded exercise, not a theorem that any eviction policy preserves O(n) work for arbitrary recursive algorithms. BigInt result size and addition costs matter outside the small bound.

React useMemo/useCallback compare dependency entries with Object.is; an omitted/mutated dependency produces stale results. Calculations must be pure and cannot be relied on for side effects or durable storage. React can discard caches. Profile before adding memoization; if the React Compiler is enabled for supported code it can reduce manual memoization, but do not assume every project has it configured. An inexpensive calculation may cost less than comparison/retention overhead.

**Exercise acceptance:** run the exact synchronous wrapper against un-memoized results. Count calls for every falsy value; distinguish numeric/string/array/object/argument-count keys and two different receivers; verify NaN hits, +0/−0 separation, exception retry, LRU hit promotion/eviction and clear. Demonstrate stale output after mutating an object, then fix the ownership/invalidation contract. Verify fibMemo0/1/40 and invalid bounds without running huge recursion. Compare hit/miss rate and retained data against the cost of recalculation. Async cache design and learner implementation remain separate practice.

Validated with Node24.18.0; official references checked2026-10-22: [Object.is semantics](https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-object.is), [React memo](https://react.dev/reference/react/memo), [useMemo](https://react.dev/reference/react/useMemo), [useCallback](https://react.dev/reference/react/useCallback).
