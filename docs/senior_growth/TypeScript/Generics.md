# What are generics in TS?

## 🔹 TypeScript Generics

**Generics** in TypeScript allow you to write **reusable, type-safe code** that works with **multiple types** without sacrificing type safety. They are like **placeholders for types**.

---

## 1️⃣ Why Generics?

- Avoid duplicating code for different types.
- Maintain **type safety** instead of using `any`.
- Useful for **functions, classes, interfaces, and types**.

---
  
## 2️⃣ Generic Functions

```ts
function identity<T>(value: T): T {
  return value;
}

const num = identity<number>(42);    // num: number
const str = identity<string>('TS');  // str: string
````

* `T` is a **type parameter**, replaced with an actual type when the function is called.
* Ensures the **return type matches the input type**.

---

## 3️⃣ Generic Interfaces

```ts
interface Box<T> {
  content: T;
}

const numberBox: Box<number> = { content: 100 };
const stringBox: Box<string> = { content: 'Hello' };
```

* Can represent **containers or collections** of different types safely.

---

## 4️⃣ Generic Classes

```ts
class Queue<T> {
  private items: T[] = [];

  enqueue(item: T) {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }
}

const numberQueue = new Queue<number>();
numberQueue.enqueue(10);
```

* `T` ensures **all items in the queue are of the same type**.

---

## 5️⃣ Generic Constraints

* Sometimes you want **specific capabilities** on type parameters.
* Use `extends` to constrain types.

```ts
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

getLength('hello');          // ✅ string has length
getLength([1, 2, 3]);       // ✅ array has length
// getLength(123);           // ❌ number has no length
```

---

## 6️⃣ Benefits of Generics

* **Type safety:** Avoids `any` and runtime type errors.
* **Reusability:** One function/class can work for many types.
* **Better documentation & IDE support:** Type relationships are explicit.
* **Predictable API:** Helps enforce **consistency across types**.

---

### ✅ Key Takeaways

* Generics = **type placeholders** for reusable code.
* Use `<T>` to define generic functions, classes, interfaces, or types.
* Combine with **constraints** (`extends`) to enforce structure or capabilities.
* Generics are **essential in libraries, data structures, and utility functions**.

> 💡 Senior Tip:
> Generics help **write flexible, strongly typed code** without sacrificing safety—think of them as “type variables” for your functions and classes.
