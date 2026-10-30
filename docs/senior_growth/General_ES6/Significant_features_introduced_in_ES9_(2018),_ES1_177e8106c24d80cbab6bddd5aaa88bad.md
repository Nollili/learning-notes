# ECMAScript features from ES2018 to ES2020 {#significant-features-introduced-in-es9-2018-es10-2019-and-es11-2020}

## **ES9 (ECMAScript 2018): Key Features**

### **Asynchronous Iteration** {#_1-asynchronous-iteration}

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

### **Rest/Spread Properties for Objects** {#_2-rest-spread-properties-for-objects}

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

### **Promise.prototype.finally** {#_3-promise-prototype-finally}

- Adds a `finally` method to Promises for cleanup, regardless of the Promise's resolution or rejection.

```jsx
fetch("https://api.example.com/data")
  .then((data) => console.log("Data fetched"))
  .catch((error) => console.error("Error occurred"))
  .finally(() => console.log("Cleanup done"));
```

---

### **Regular Expression Enhancements** {#_4-regular-expression-enhancements}

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

### **Array `flat` and `flatMap`** {#_1-array-flat-and-flatmap}

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

### **`Object.fromEntries`** {#_2-object-fromentries}

- Converts an array of key-value pairs into an object (reverse of `Object.entries`).

```jsx
const entries = [["a", 1], ["b", 2]];
const obj = Object.fromEntries(entries);
console.log(obj); // { a: 1, b: 2 }
```

---

### **String `trimStart` and `trimEnd`** {#_3-string-trimstart-and-trimend}

- Removes whitespace from the start or end of a string.

```jsx
console.log("   Hello ".trimStart()); // "Hello "
console.log("   Hello ".trimEnd()); // "   Hello"
```

---

### **Optional Catch Binding** {#_4-optional-catch-binding}

- The `catch` block no longer requires an error parameter.

```jsx
try {
  // Code that might throw
} catch {
  console.log("An error occurred");
}
```

---

### **Function `toString` Updates** {#_5-function-tostring-updates}

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

### **Optional Chaining (`?.`)** {#_1-optional-chaining}

- Safely access deeply nested properties without checking each level.

```jsx
const user = { profile: { name: "Alice" } };
console.log(user?.profile?.name); // "Alice"
console.log(user?.settings?.theme); // undefined
```

---

### **Nullish Coalescing (`??`)** {#_2-nullish-coalescing}

- Provides a default value only if the left-hand side is `null` or `undefined`.

```jsx
const foo = null ?? "default";
console.log(foo); // "default"

const bar = 0 ?? "default"; // Unlike `||`, doesn't treat `0` as falsy
console.log(bar); // 0
```

---

### **Dynamic Import** {#_3-dynamic-import}

- Allows importing modules dynamically at runtime.

```jsx
const loadModule = async () => {
  const { default: module } = await import("./module.js");
  module.doSomething();
};
loadModule()
```

---

### **BigInt** {#_4-bigint}

- Supports arbitrarily large integers.

```jsx
const bigNumber = 123456789012345678901234567890n;
console.log(bigNumber + 1n); // 123456789012345678901234567891n
```

---

### **Promise.allSettled** {#_5-promise-allsettled}

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

### **GlobalThis** {#_6-globalthis}

- Provides a universal way to access the global object.

```jsx
console.log(globalThis); // Works in browsers, Node.js, and other environments
```

---

### **`String.prototype.matchAll`** {#_7-string-prototype-matchall}

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
  const letters = [...'árvíz π !'.matchAll(/\p{L}[\p{L}\p{M}]*/gu)].map(match => match[0]);
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

The stateful test results are true,false,true because g updates/reset lastIndex. Do not reuse that instance as a stateless field validator. m changes anchors, s changes dot matching and u enables Unicode-aware syntax/properties; g enumerates matches and y instead requires a match at lastIndex. d, on supporting runtimes, adds match indices; it does not change semantic truth. u/v are distinct mutually exclusive modes, not flags to combine casually.

Unicode property escapes do not make `\b` a general multilingual word boundary. The letter fixture returns árvíz andπ, omitting the emoji; it is not universal name validation, grapheme counting or language-aware word segmentation.

RegExp.escape is a later standardized API (ES2025), not an ES2018/2020 feature. The literal helper intentionally rejects an unsupported runtime rather than silently use an incomplete hand-written escape recipe. For simple literal containment use String.includes, avoiding regex construction entirely. If a supported target lacks escape, choose and test a maintained spec-compatible polyfill or redesign the query, including delimiter/leading-digit/context cases. Never let a user choose arbitrary flags/pattern syntax for this literal-only contract.

## Hostile near-matches need a compute boundary

A pattern with ambiguous nested repetition such as `^(a+)+$` can explore many possibilities on a long a-run followed by a failing suffix. A Promise timeout on the same event loop cannot interrupt synchronous regex execution. Prefer a simpler anchored bounded pattern or a deterministic parser; input bounds are still necessary. Do not benchmark an unbounded hostile pattern on a server request/UI thread.

For an isolated exercise, run increasing short a-runs plus`!` in a dedicated worker/process; parent-enforced deadline must terminate it and consume exit/error events. Stop at the first deadline, retain runtime/length/results and do not extrapolate a universal threshold across engines. Compare the intended linear pattern `^a+$` under a strict input cap. Test success and near-failure; matching only easy positive examples hides the problem. The course's Node worker lifecycle lesson supplies termination/exit ownership; this note's author check uses only a short bounded child-process fixture, not a claim of a production regex sandbox.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/general_es6/Significant_features_introduced_in_ES9_%282018%29%2C_ES1_177e8106c24d80cbab6bddd5aaa88bad.md). All learner practice remains outstanding; the worked examples above are explanatory material.
