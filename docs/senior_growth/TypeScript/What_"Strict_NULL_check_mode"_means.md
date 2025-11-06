# What "Strict NULL check mode" means?

## ⚠️ TypeScript Strict Null Checks (`strictNullChecks`)

The **`strictNullChecks`** compiler option in TypeScript is part of **strict mode** (`strict: true`) and enforces **safer handling of `null` and `undefined` values**.

---

## 1️⃣ What It Does

- When `strictNullChecks` is **enabled**:
  - `null` and `undefined` are **not automatically assignable** to any other type.
  - You must explicitly handle or type them.
- When **disabled** (default in non-strict TS):
  - `null` and `undefined` are considered valid values for **all types**, which can cause runtime errors.

---

## 2️⃣ Example

### Without `strictNullChecks`

```ts
let name: string;
name = null;   // ✅ Allowed, can cause runtime errors later
````

### With `strictNullChecks`

```ts
let name: string;
name = null;   // ❌ Error: Type 'null' is not assignable to type 'string'

let optionalName: string | null = null; // ✅ Must explicitly allow null
```

* You must explicitly use **union types** to allow `null` or `undefined`:

```ts
function greet(name: string | null) {
  if (name) {
    console.log(`Hello, ${name}`);
  } else {
    console.log("Hello, Guest!");
  }
}
```

---

## 3️⃣ Why It Matters

* **Prevents runtime errors** caused by null/undefined values (e.g., `Cannot read property 'x' of null`).
* **Enforces explicit handling** of optional values.
* Works well with **React props, Redux state, API responses**, and other places where null or undefined might appear.

---

## 4️⃣ Best Practices

* Always enable **`strict` mode**, which includes `strictNullChecks`.
* Use **union types** to represent nullable values (`string | null`).
* Leverage **optional chaining (`?.`)** to safely access properties.
* Consider **default values** when dealing with optional inputs:

```ts
function greet(name: string | null = "Guest") {
  console.log(`Hello, ${name}`);
}
```

---

### ✅ Key Takeaways

* `strictNullChecks` forces you to **explicitly handle `null` and `undefined`**.
* It makes your code **safer, more predictable, and less prone to runtime errors**.
* Essential for **large or team projects**, especially when working with external data.

> 💡 Senior Tip:
> Treat `null` and `undefined` **as separate types**, not just “empty” values. This mindset prevents subtle bugs in production.
