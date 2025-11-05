### What are pure / impure functions?

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
- **Parallelism**: Since pure functions do not alter shared state, they are thread-safe and can be executed in parallel without concern for data races.

---

## **Impure Functions**

An **impure function** is one that:

1. **Has side effects**: It may modify variables outside its scope (e.g., global state, arguments) or interact with external systems like databases, files, or the UI.
2. **Does not always produce the same output for the same input**: The function might return different results depending on external factors like the current time, random values, or the state of a system.

### **Characteristics of Impure Functions:**

- They **alter external state** (e.g., modifying global variables, changing the state of an object).
- They **depend on external state** (e.g., using global variables or reading from a database).
- **Non-deterministic**: Given the same inputs, they might return different results.

### **Example of an Impure Function:**

```jsx
javascript
Copy code
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
| **Predictability** | Predictable and deterministic | Non-deterministic and can be unpredictable |
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