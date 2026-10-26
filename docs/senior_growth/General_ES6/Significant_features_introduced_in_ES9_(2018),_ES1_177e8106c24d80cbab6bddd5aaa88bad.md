### Significant features introduced in ES9 (2018), ES10 (2019), and ES11 (2020)

## **ES9 (ECMAScript 2018): Key Features**

### **1. Asynchronous Iteration**

- **`for await...of`** consumes async iterables and also awaits values from synchronous iterables. It does not itself limit when promises start. Mapping URLs to fetch promises starts every request eagerly; a later promise may reject before the loop reaches it. Use sequential production below, or attach handlers immediately through a bounded concurrency abstraction.

```jsx
async function* fetchJsonSequentially(urls, signal) {
  for (const url of urls) {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(`HTTP ${response.status}`);
    }
    yield await response.json(); // Validate the yielded unknown shape at its boundary.
  }
}
async function consume(urls, signal) {
  for await (const data of fetchJsonSequentially(urls, signal)) console.log(data);
}
// Caller supplies absolute URLs in Node, an AbortSignal/deadline and handles rejection.
// await consume(urls, signal);
```

---

### **2. Rest/Spread Properties for Objects**

- Previously available for arrays, `rest` and `spread` were extended to objects.

**Rest: Extract remaining properties**:

```jsx
const { a, ...rest } = { a: 1, b: 2, c: 3 };
console.log(a); // 1
console.log(rest); // { b: 2, c: 3 }
```

**Spread: Copy or merge objects**:

```jsx
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 };
console.log(obj2); // { a: 1, b: 2, c: 3 }
```

---

### **3. Promise.prototype.finally**

- Adds a `finally` method to Promises for cleanup, regardless of the Promise's resolution or rejection.

```jsx
fetch("https://api.example.com/data")
  .then((data) => console.log("Data fetched"))
  .catch((error) => console.error("Error occurred"))
  .finally(() => console.log("Cleanup done"));
```

---

### **4. Regular Expression Enhancements**

- **Unicode Property Escapes**: Match Unicode characters based on their properties.
    
    ```jsx
    const regex = /\p{Script=Greek}/u;
    console.log(regex.test("π")); // true
    ```
    
- **DotAll Mode (`s` flag)**: Allows `.` to match newline characters.
    
    ```jsx
    const regex = /foo.bar/s;
    console.log(regex.test("foo\nbar")); // true
    ```
    

---

## **ES10 (ECMAScript 2019): Key Features**

### **1. Array `flat` and `flatMap`**

- **`flat`**: Flattens nested arrays to a specified depth.
    
    ```jsx
    const arr = [1, [2, [3, [4]]]];
    console.log(arr.flat(2)); // [1, 2, 3, [4]]
    ```
    
- **`flatMap`**: Maps each element and flattens the result by one level.
    
    ```jsx
    const arr = [1, 2, 3];
    console.log(arr.flatMap((x) => [x, x * 2])); // [1, 2, 2, 4, 3, 6]
    ```
    

---

### **2. `Object.fromEntries`**

- Converts an array of key-value pairs into an object (reverse of `Object.entries`).

```jsx
const entries = [["a", 1], ["b", 2]];
const obj = Object.fromEntries(entries);
console.log(obj); // { a: 1, b: 2 }
```

---

### **3. String `trimStart` and `trimEnd`**

- Removes whitespace from the start or end of a string.

```jsx
console.log("   Hello ".trimStart()); // "Hello "
console.log("   Hello ".trimEnd()); // "   Hello"
```

---

### **4. Optional Catch Binding**

- The `catch` block no longer requires an error parameter.

```jsx
try {
  // Code that might throw
} catch {
  console.log("An error occurred");
}
```

---

### **5. Function `toString` Updates**

- For ordinary source-defined functions when source text is available, toString preserves their source text. Built-ins/bound functions can use native-code representations; it is not a portable serializer.

```jsx
function greet() {
  return "Hello!";
}
console.log(greet.toString());
// Includes the original line breaks, whitespace and double-quoted "Hello!" source.
```

---

## **ES11 (ECMAScript 2020): Key Features**

### **1. Optional Chaining (`?.`)**

- Safely access deeply nested properties without checking each level.

```jsx
const user = { profile: { name: "Alice" } };
console.log(user?.profile?.name); // "Alice"
console.log(user?.settings?.theme); // undefined
```

---

### **2. Nullish Coalescing (`??`)**

- Provides a default value only if the left-hand side is `null` or `undefined`.

```jsx
const foo = null ?? "default";
console.log(foo); // "default"

const bar = 0 ?? "default"; // Unlike `||`, doesn't treat `0` as falsy
console.log(bar); // 0
```

---

### **3. Dynamic Import**

- Allows importing modules dynamically at runtime.

```jsx
const loadModule = async () => {
  const { default: module } = await import("./module.js");
  module.doSomething();
};
loadModule()
```

---

### **4. BigInt**

- Supports arbitrarily large integers.

```jsx
const bigNumber = 123456789012345678901234567890n;
console.log(bigNumber + 1n); // 123456789012345678901234567891n
```

---

### **5. Promise.allSettled**

- Waits for all Promises to settle (resolve or reject) and returns their results.

```jsx
const promises = [
  Promise.resolve(10),
  Promise.reject("Error"),
  Promise.resolve(20),
];

Promise.allSettled(promises).then((results) => console.log(results));
// [
//   { status: "fulfilled", value: 10 },
//   { status: "rejected", reason: "Error" },
//   { status: "fulfilled", value: 20 }
// ]
```

---

### **6. GlobalThis**

- Provides a universal way to access the global object.

```jsx
console.log(globalThis); // Works in browsers, Node.js, and other environments
```

---

### **7. `String.prototype.matchAll`**

- Returns all matches of a regular expression as an iterator.

```jsx
const regex = /t(e)(st)/g;
const str = "test1test2";
for (const match of str.matchAll(regex)) {
  console.log(match);
}
// ["test", "e", "st", index: 0, input: "test1test2", ...]
// ["test", "e", "st", index: 5, input: "test1test2", ...]
```

---

### **Summary of Features**

| **Version** | **Key Features** |
| --- | --- |
| **ES9** | `for await...of`, object rest/spread, `finally`, regex improvements (`s` flag, Unicode escapes) |
| **ES10** | `flat`, `flatMap`, `Object.fromEntries`, `trimStart`, `trimEnd`, optional catch binding |
| **ES11** | Optional chaining (`?.`), nullish coalescing (`??`), dynamic import, BigInt, `Promise.allSettled` |
## Iterator ownership and regex boundaries

An iterable supplies Symbol.iterator (or Symbol.asyncIterator); its iterator supplies next() results with done/value. A generator implements this protocol while suspending at yield. Early break calls return() when available, allowing a finally block to release a resource. Use yield* to delegate to another iterable and decide who owns cleanup; a consumer abandoning a resource without closing it can retain handles.

```js
function* valuesWithCleanup() {
  try { yield* [1, 2, 3]; }
  finally { console.log('released'); }
}
for (const value of valuesWithCleanup()) { console.log(value); break; }
// 1, released
const matches = [...'test1test2'.matchAll(/t(e)(st)/g)];
console.log(matches.map(match => [match[0], match.index])); // [['test',0],['test',5]]
```

The digits do not belong to the pattern. matchAll requires a global regex when given a RegExp; capture groups are distinct from the whole match. A g regex's test/exec methods advance lastIndex, which can surprise repeated validation. Escape external literal text before constructing a regex and bound hostile inputs; nested ambiguous quantifiers can cause ReDoS. Unicode-aware flags/properties change matching semantics but are not a universal word-boundary or security solution.

**Exercise:** instrument request start times to compare eager map versus the sequential producer without calling public services. Acceptance: sequential peak concurrency1; bounded variant respects its configured cap; every rejection is handled immediately; signal abort releases active body work; iterator break runs cleanup; regex matches exclude digits at offsets0/5. Add a hostile near-match performance case in an isolated worker/process with a deadline, never an unbounded regex on the request thread.

Official references: [async iteration](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-asynciterator-interface), [generator protocols](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-generator-objects), [RegExp](https://tc39.es/ecma262/multipage/text-processing.html#sec-regexp-regular-expression-objects). Checked2026-10-20; Node24 baseline.


## Worked flags, literal escaping and Unicode limits

```js
function regexFixture() {
  const matches = [...'test1test2'.matchAll(/t(e)(st)/g)].map(match => ({
    whole: match[0], first: match[1], second: match[2], index: match.index
  }));
  const stateful = /a/g;
  const states = [stateful.test('a'), stateful.test('a'), stateful.test('a')];
  const multiline = /^second$/m.test('first\nsecond');
  const dotAll = /^first.second$/s.test('first\nsecond');
  const letters = [...'árvíz π 😀'.matchAll(/\p{L}[\p{L}\p{M}]*/gu)].map(match => match[0]);
  return { matches, states, multiline, dotAll, letters };
}
function literalMatches(text, literal) {
  if (typeof text !== 'string' || typeof literal !== 'string' || text.length > 4096 || !literal || literal.length > 256) {
    throw new Error('Invalid literal search input');
  }
  if (typeof RegExp.escape !== 'function') throw new Error('Literal regex support unavailable');
  return [...text.matchAll(new RegExp(RegExp.escape(literal), 'gu'))].map(match => match.index);
}
```

The stateful test results are true,false,true because g updates/reset lastIndex. Do not reuse that instance as a stateless field validator. m changes anchors, s changes dot matching and u enables Unicode-aware syntax/properties; g enumerates matches and y instead requires a match at lastIndex. d, on supporting runtimes, adds match indices; it does not change semantic truth. u/v are distinct mutually exclusive modes, not flags to combine casually. Unicode property escapes do not make `\b` a general multilingual word boundary. The letter fixture returns árvíz andπ, omitting the emoji; it is not universal name validation, grapheme counting or language-aware word segmentation.

RegExp.escape is a later standardized API (ES2025), not an ES2018/2020 feature. The literal helper intentionally rejects an unsupported runtime rather than silently use an incomplete hand-written escape recipe. For simple literal containment use String.includes, avoiding regex construction entirely. If a supported target lacks escape, choose and test a maintained spec-compatible polyfill or redesign the query, including delimiter/leading-digit/context cases. Never let a user choose arbitrary flags/pattern syntax for this literal-only contract.

## Hostile near-matches need a compute boundary

A pattern with ambiguous nested repetition such as `^(a+)+$` can explore many possibilities on a long a-run followed by a failing suffix. A Promise timeout on the same event loop cannot interrupt synchronous regex execution. Prefer a simpler anchored bounded pattern or a deterministic parser; input bounds are still necessary. Do not benchmark an unbounded hostile pattern on a server request/UI thread.

For an isolated exercise, run increasing short a-runs plus`!` in a dedicated worker/process; parent-enforced deadline must terminate it and consume exit/error events. Stop at the first deadline, retain runtime/length/results and do not extrapolate a universal threshold across engines. Compare the intended linear pattern `^a+$` under a strict input cap. Test success and near-failure; matching only easy positive examples hides the problem. The course's Node worker lifecycle lesson supplies termination/exit ownership; this note's author check uses only a short bounded child-process fixture, not a claim of a production regex sandbox.

**Additional acceptance:** exact match groups/indices0and5, m/s behavior, lastIndex cycling, literal punctuation/leading digits/Unicode cases, missingescape support and input bounds are tested. Show that matchAll requires g for a RegExp and does not turn captures into full matches. Record safe child-process timeout termination for a hostile near-match separately from ordinary unit timings. User regex execution, advanced parser support and learner performance evidence remain separate decisions.
