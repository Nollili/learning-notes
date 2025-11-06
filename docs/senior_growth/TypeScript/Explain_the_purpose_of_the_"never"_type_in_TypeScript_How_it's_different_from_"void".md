# Explain the purpose of the "never" type in TypeScript? How it's different from "void"?

## 🔹 TypeScript `never` vs `void`

TypeScript provides **special types** to describe functions and values with specific behaviors. Two of these are `never` and `void`.

---

## 1️⃣ `void` Type

- **Purpose:** Represents **absence of a meaningful return value**.
- Commonly used for **functions that don’t return anything**.

```ts
function logMessage(message: string): void {
  console.log(message);
}
````

* Key points:

  * Can still return `undefined` implicitly.
  * Used for functions that **perform side effects** but don’t return a value.
  * `void` can also be used as the type for variables that are expected to be `undefined`.

---

## 2️⃣ `never` Type

* **Purpose:** Represents values that **never occur**.
* Used for **functions that never return normally** or **unreachable code**.

### Examples:

#### 2.1 Function that always throws

```ts
function throwError(message: string): never {
  throw new Error(message);
}
```

* The function **never completes normally**, so TypeScript infers `never`.

#### 2.2 Function with infinite loop

```ts
function infiniteLoop(): never {
  while (true) {}
}
```

#### 2.3 Exhaustive checks in unions

```ts
type Shape = 'circle' | 'square';

function checkShape(shape: Shape) {
  switch (shape) {
    case 'circle': return 'Circle';
    case 'square': return 'Square';
    default:
      const _exhaustiveCheck: never = shape; // ❌ Compile-time error if not exhaustive
      return _exhaustiveCheck;
  }
}
```

* Ensures all possible cases are handled.
* If a new value is added to `Shape` and not handled, TS will **throw a compile-time error**.

---

## 3️⃣ Key Differences: `void` vs `never`

| Feature       | `void`                        | `never`                                  |
| ------------- | ----------------------------- | ---------------------------------------- |
| Represents    | Absence of a return value     | A value that **never occurs**            |
| Common Use    | Functions that return nothing | Functions that **throw or never finish** |
| Assignable To | Can assign `undefined`        | Cannot assign any value (except `never`) |
| Example       | `function f(): void {}`       | `function f(): never { throw Error() }`  |

---

## ✅ Summary

* **`void`** → “this function returns nothing meaningful.”
* **`never`** → “this function never returns” or “this code path cannot happen.”
* `never` is extremely useful for:

  * **Exhaustive type checking**
  * **Safety in unreachable code detection**
  * **Functions that always throw or loop infinitely**

> 💡 Senior Tip:
> Use `never` to **catch unhandled cases at compile time**—it’s a type-safe way to ensure exhaustive logic in union types.
