# What "Strict NULL check mode" means?

## TypeScript Strict Null Checks (`strictNullChecks`) {#%E2%9A%A0%EF%B8%8F-typescript-strict-null-checks-strictnullchecks}

The **`strictNullChecks`** compiler option in TypeScript is part of **strict mode** (`strict: true`) and enforces **safer handling of `null` and `undefined` values**.

---

## What It Does {#_1%EF%B8%8F%E2%83%A3-what-it-does}

- When `strictNullChecks` is **enabled**:
  - `null` and `undefined` are distinct types and are not assignable to an ordinary `string` or object type without an appropriate union. `unknown`/`any` and specific contracts such as `void` have different assignability rules.
  - You must explicitly handle or type them.
- When **disabled** (default in non-strict TS):
  - null and undefined are broadly assignable to ordinary value types, hiding missing-value failures; this does not make the uninhabited `never` type assignable.

---

## Example {#_2%EF%B8%8F%E2%83%A3-example}

### Without `strictNullChecks`

```ts
let name: string;
name = null;   // Allowed, can cause runtime errors later
```

### With `strictNullChecks`

```ts
let name: string;
name = null;   // Error: Type 'null' is not assignable to type 'string'

let optionalName: string | null = null; // Must explicitly allow null
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

## Why It Matters {#_3%EF%B8%8F%E2%83%A3-why-it-matters}

* **Detects unsafe typed uses** of null/undefined values (e.g., `Cannot read property 'x' of null`).
* **Enforces explicit handling** of optional values.
* Works well with **React props, Redux state, API responses**, and other places where null or undefined might appear.

---

## Best Practices {#_4%EF%B8%8F%E2%83%A3-best-practices}

* Always enable **`strict` mode**, which includes `strictNullChecks`.
* Use **union types** to represent nullable values (`string | null`).
* Leverage **optional chaining (`?.`)** to safely access properties.
* Consider **default values** when dealing with optional inputs:

```ts
function greetWithDefault(name: string | null = "Guest") {
  console.log(`Hello, ${name}`);
}
greetWithDefault(undefined); // Hello, Guest
greetWithDefault(null);      // Hello, null (default is not used)

function greetNullable(name: string | null | undefined) {
  return `Hello, ${name ?? "Guest"}`;
}
console.log(greetNullable("")); // Hello,  (empty string is retained)
```

---

### Key Takeaways {#%E2%9C%85-key-takeaways}

* `strictNullChecks` forces you to **explicitly handle `null` and `undefined`**.
* It makes your code **safer, more predictable, and less prone to runtime errors**.
* Essential for **large or team projects**, especially when working with external data.

> Senior Tip:
> Treat `null` and `undefined` **as separate types**, not just “empty” values. This mindset prevents subtle bugs in production.

## Presence is a domain decision (TypeScript 5.9+)

`value || fallback` also replaces zero, false and the empty string; use `??` when only null/undefined mean missing. A truthiness check is correct only if those other values are deliberately invalid. Optional chaining stops at nullish receivers; it does not establish that a nested property or a function result is valid.

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noEmit": true,
    "target": "ES2022"
  }
}
```

The two additional flags are explicit: `strict` alone does not enable them. `noEmit` checks types without generating application JavaScript; the bundler/transpiler still needs its own build step.

```ts
export {};
type Patch = { displayName?: string | null };
const absent: Patch = {};                 // Leave unchanged.
const clear: Patch = { displayName: null }; // Explicitly clear.
// @ts-expect-error Presence with undefined is not part of this contract.
const invalid: Patch = { displayName: undefined };
const names: string[] = [];
const first = names[0]; // string | undefined with noUncheckedIndexedAccess
if (first !== undefined) console.log(first.toUpperCase());
```

At JSON transport boundaries, undefined object properties disappear during serialization; null survives. Keep PATCH omission separate from clearing a field and from creation defaults. Adding `!` or `as string` hides the compiler diagnostic without changing runtime behavior. Migration may expose many callers: tighten one boundary at a time and preserve behavioral tests instead of mass-asserting.


Official references: [strictNullChecks](https://www.typescriptlang.org/tsconfig/strictNullChecks.html), [indexed access safety](https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html), [exact optional properties](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html).


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/typescript/What_%22Strict_NULL_check_mode%22_means.md). All learner practice remains outstanding; the worked examples above are explanatory material.
