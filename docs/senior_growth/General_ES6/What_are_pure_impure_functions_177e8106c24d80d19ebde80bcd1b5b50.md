# What are pure / impure functions? {#what-are-pure-impure-functions}

## **Pure Functions**

A **pure function** is one that:

1. **Has no side effects**: It does not modify any external state or variables. The function's execution only depends on its input parameters and does not affect anything outside of the function.
2. **Always produces the same output for the same input**: If you call a pure function with the same arguments, it will always return the same result. This property is called **referential transparency**.

### **Characteristics of Pure Functions:**

- No **mutations** of variables outside the function (no side effects).
- **No reliance on external state** (e.g., no global variables or I/O operations).
- **Predictable output**: Given the same inputs, it will always return the same result.

### **Example of a Pure Function:**

```jsx
function add(a, b) {
  return a + b;
}
console.log(add(2, 3)); // Always returns 5, no side effects.
```

### **Benefits of Pure Functions:**

- Easier to **test**: Since the output only depends on the input, you can easily test and validate pure functions.
- **Composability**: Pure functions can be easily composed with other functions to build complex operations.
- **Parallelism**: Since pure functions do not alter shared state, independent computations may be parallelizable when input snapshots/ownership are also safe; workers, shared memory and effectful getters can invalidate naive assumptions.

---

## **Impure Functions**

An **impure function** is one that:

1. **Has side effects**: It may modify variables outside its scope (e.g., global state, arguments) or interact with external systems like databases, files, or the UI.
2. **May depend on external state**: Time, randomness or I/O can change results. Impurity requires an observable effect or external dependency, not necessarily both; a deterministic logger is still impure.

### **Characteristics of Impure Functions:**

- They **alter external state** (e.g., modifying global variables, changing the state of an object).
- They **depend on external state** (e.g., using global variables or reading from a database).
- **Possibly non-deterministic**: Some impure functions always return the same result but still log, mutate or perform I/O.

### **Example of an Impure Function:**

```js
let counter = 0;

function incrementCounter() {
  counter += 1; // Alters the global variable `counter`
  return counter;
}

console.log(incrementCounter()); // 1
console.log(incrementCounter()); // 2 (depends on external state)

```

### **Other Examples of Impure Functions:**

- Functions that make **HTTP requests** (they depend on network conditions and server responses).
- Functions that modify the **DOM** (changing the UI state).
- Functions that generate **random numbers** (outputs can vary).

---

## **Comparison of Pure vs. Impure Functions**

| **Characteristic** | **Pure Function** | **Impure Function** |
| --- | --- | --- |
| **Input-Output Relation** | Always produces the same output for the same input | May produce different outputs for the same input |
| **Side Effects** | No side effects (does not modify external state) | Can have side effects (e.g., modifies external state or interacts with external systems) |
| **Predictability** | Deterministic under its input contract | May be deterministic; effects/dependencies require ownership |
| **Testing** | Easier to test due to lack of dependencies | Harder to test because of external dependencies |
| **Example** | `function add(a, b) { return a + b; }` | `function updateCounter() { counter += 1; }` |

---

## **When to Use Pure vs. Impure Functions**

- **Pure Functions**: Use them when you want predictable, reusable, and easily testable code. They are ideal for **business logic** and operations where the input-output relationship should be clear and deterministic.
- **Impure Functions**: Use them when you need to interact with the outside world (e.g., I/O operations, databases, or randomization). They are necessary for **side-effectful operations**, such as rendering UIs or fetching data.

---

## **Summary**

- **Pure functions** are predictable, don’t alter external state, and always produce the same result for the same input.
- **Impure functions** can produce different results each time they are called, and they might alter the state of the system or interact with external factors.

In functional programming, aiming to write **pure functions** as much as possible is a good practice because they enhance code clarity, testability, and maintainability. However, impure functions are inevitable when interacting with the outside world (e.g., file systems, APIs).

## Functional core and an explicit effect shell

```js
function receiptTotal(lines) {
  // Pure for application-owned plain records of integer cents, not hostile getters/proxies.
  let total = 0;
  for (const line of lines) {
    if (!Number.isSafeInteger(line.cents) || line.cents < 0) throw new Error('Invalid cents');
    total += line.cents;
    if (!Number.isSafeInteger(total)) throw new Error('Total overflow');
  }
  return total;
}
function publishTotal(lines, write) {
  const total = receiptTotal(lines);
  write(total); // Observable effect even if this function always returns the same total.
  return total;
}
```

Local mutation of a privately owned accumulator does not mutate observable external state. Mutating an argument, reading a changing clock/global or invoking a getter with effects does. The add function above is the pure part; the surrounding console.log is an effect. “Same input” includes relevant input values/ownership, not merely the same object reference after someone changed its fields. Fresh object allocation needs value/identity reasoning in JavaScript; a loose purity slogan does not make arbitrary memoization safe.

Deterministic errors for invalid domain values can be part of a pure partial-function contract, while logging the error is a separate effect.

Injecting `write` makes the shell testable, not pure. Keep I/O at that boundary, decide error/retry/idempotency behavior there, and keep the core independent. Rendering a React component should be pure; committing DOM changes and synchronizing effects have separate owners. A function named “get” may still be impure if it reads mutable state or logs.


References checked2026-10-22: [React pure component reasoning](https://react.dev/learn/keeping-components-pure), [JavaScript function semantics](https://tc39.es/ecma262/multipage/ecmascript-language-functions-and-classes.html). Purity is a design property under a stated contract, not a TypeScript or engine optimization guarantee.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/general_es6/What_are_pure_impure_functions_177e8106c24d80d19ebde80bcd1b5b50.md). All learner practice remains outstanding; the worked examples above are explanatory material.
