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
````

### With Memoization (Efficient)

```javascript
function memoize(fn) {
  const cache = {};
  return function(...args) {
    const key = args.toString();
    if (cache[key]) return cache[key];
    const result = fn(...args);
    cache[key] = result;
    return result;
  };
}

const fib = memoize(function(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
});

console.log(fib(40)); // Much faster
```

---

## 3️⃣ Benefits of Memoization

* **Performance improvement:** Avoids redundant computations.
* **Optimized recursive functions:** Like Fibonacci, factorial, pathfinding.
* **Useful in React:** `React.memo`, `useMemo` prevent unnecessary re-renders.

---

## 4️⃣ React-Specific Memoization

* **`React.memo(Component)`** → Memoizes functional components so they only re-render when props change.
* **`useMemo` hook** → Memoizes **computed values** between renders.
* **`useCallback` hook** → Memoizes **function references** to prevent re-creating them every render.

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
