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
```

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

* **Type relationships:** avoid unnecessary any; runtime inputs and implementation correctness still need validation/tests.
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

## Dependent keys, defaults and public contracts

```ts
export {};
function getField<T, K extends keyof T>(value: T, key: K): T[K] {
  return value[key];
}
const person = { name: 'Ada', age: 37 };
const age: number = getField(person, 'age');
// @ts-expect-error Key must belong to person.
getField(person, 'missing');

type Page<T, Cursor = string> = { items: readonly T[]; next: Cursor | null };
const page: Page<typeof person> = { items: [person], next: null };
type PersonValue = (typeof person)[keyof typeof person]; // string | number
```

`keyof T` forms a key union; `T[K]` preserves the selected value relationship. Replacing K with string loses the proof. If the key itself is a union, the result becomes the corresponding union. Constraints permit required operations without changing runtime data. Infer types from arguments when clear; explicit arguments help empty collections or ambiguous contracts. A default type argument is a type-level fallback, not a runtime default value.

Avoid a generic that appears only in the return type and pretends to parse arbitrary JSON: callers could demand any T. Accept a parser `(input: unknown) => T` and return its actual parsed result instead. Keep transport/storage/public types separate when their rules differ.

## Mapped and utility types

```ts
export {};
type Profile = { readonly id: string; name?: string; active: boolean };
type Editable<T> = { -readonly [K in keyof T]-?: T[K] };
type ConcreteProfile = Editable<Profile>;
const complete: ConcreteProfile = { id: 'p1', name: 'Ada', active: true };
type DirtyFlags<T> = { [K in keyof T]?: boolean };
const dirty: DirtyFlags<Profile> = { name: true };
type PublicProfile = Pick<Profile, 'id' | 'name'>;
type ProfileUpdate = Partial<Pick<Profile, 'name' | 'active'>>;
type Roles = 'reader' | 'editor';
const permissions: Record<Roles, readonly string[]> = {
  reader: ['read'], editor: ['read', 'write'],
};
function describe(id: string, verbose = false): string { return verbose ? `ID:${id}` : id; }
type DescribeArgs = Parameters<typeof describe>; // [id:string, verbose?:boolean]
type Description = ReturnType<typeof describe>; // string
```

Mapped types transform keys/modifiers without generating JavaScript. Pick/Omit are useful projections, Partial makes selected fields optional, Required removes optional modifiers, Readonly restricts assignment, Record covers a defined key set, and Parameters/ReturnType follow a function contract. Partial is shallow: it does not implement nested PATCH semantics, defaults, validation or authorization. With exactOptionalPropertyTypes, absence differs from a present undefined property. Do not expose `Partial<DatabaseUser>` as an update API that could accept passwordHash/role.

## Conditional types, infer and distribution

```ts
export {};
type ElementOf<T> = T extends readonly (infer E)[] ? E : never;
type Element = ElementOf<readonly { id: string }[]>; // {id:string}
type ToArray<T> = T extends unknown ? T[] : never;
type Distributed = ToArray<string | number>; // string[] | number[]
type OneArray<T> = [T] extends [unknown] ? T[] : never;
type Together = OneArray<string | number>; // (string | number)[]
const mixed: Together = ['x', 1];
// @ts-expect-error A mixed array is neither string[] nor number[].
const notDistributed: Distributed = ['x', 1];
```

A conditional with a naked type parameter distributes over union members. Tuple wrapping asks about the union as one unit. infer introduces a type variable inside the matched shape; it does not inspect runtime values. Recursive transformations can produce slow/error-prone types: keep public APIs understandable and use explicit domain aliases when a complicated generic saves little duplication.

## Overloads and callback variance

```ts
export {};
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string { return String(value); }
const text = format(12);
const uncertain: string | number = Math.random() ? 'x' : 1;
// @ts-expect-error Implementation signature is not a public union overload.
format(uncertain);
function formatEither(value: string | number): string { return String(value); }
formatEither(uncertain); // Prefer one union signature when result relationship is the same.

type Animal = { name: string };
type Dog = Animal & { bark: () => void };
const handlesDog = (dog: Dog): void => dog.bark();
// @ts-expect-error A Dog-only handler cannot safely handle every Animal.
const handlesAnimal: (animal: Animal) => void = handlesDog;
const general = (animal: Animal): void => console.log(animal.name);
const dogHandler: (dog: Dog) => void = general; // Broader input is safe.
```

Overload implementation must accommodate every public signature; callers do not see the implementation signature as an additional overload. Prefer overloads only when argument/return relationships differ meaningfully. strictFunctionTypes checks function parameter positions contravariantly in this case; method syntax has compatibility exceptions, so do not assume every callback interface is equally strict. Contextual typing can infer event/callback arguments from the consuming API, but assertions can still defeat it.


TypeScript5.9.3 strict baseline; run isolated typecheck with noUncheckedIndexedAccess/exactOptionalPropertyTypes. These examples do not require mastery of type puzzles. Official references: [generics](https://www.typescriptlang.org/docs/handbook/2/generics.html), [indexed access](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html), [mapped types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html), [conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html), [functions/overloads](https://www.typescriptlang.org/docs/handbook/2/functions.html). Checked2026-10-20.

## Applied public contracts: exact patches and contextual callbacks

Use the existing mapped/modifier examples above to derive internal views; compose utilities around an **allowlist** for an update API. Do not make an entire database model Partial. This worked example uses TypeScript5.9.3 with strict, exactOptionalPropertyTypes and noUncheckedIndexedAccess; the type tests intentionally contain rejected lines and should not be executed as application behavior.

```ts
export {};
type Course = { readonly id: string; title: string; published: boolean };
type CoursePatch = Partial<Pick<Course, 'title' | 'published'>>;
type Draft = { -readonly [K in keyof Course]-?: Course[K] };
type Dirty = { [K in keyof CoursePatch]?: boolean };
const draft: Draft = { id: 'c1', title: 'Types', published: false };
const dirty: Dirty = { title: true };
const unchanged: CoursePatch = {};
// @ts-expect-error Omitted and explicitly undefined are distinct with exact optionality.
const invalid: CoursePatch = { title: undefined };
// @ts-expect-error id is not an editable field.
const renameIdentity: CoursePatch = { id: 'other' };
function applyPatch(course: Course, patch: CoursePatch): Course {
  return { id: course.id, title: patch.title ?? course.title,
    published: patch.published ?? course.published };
}
type PatchArguments = Parameters<typeof applyPatch>;
type PatchResult = ReturnType<typeof applyPatch>;
const args: PatchArguments = [draft, { published: true }];
const result: PatchResult = applyPatch(...args);

type Events = {
  saved: { id: string; revision: number };
  failed: { code: 'conflict' | 'unavailable' };
};
type Handlers = { [K in keyof Events]: (payload: Events[K]) => void };
const handlers: Handlers = {
  saved: payload => console.log(payload.revision), // Contextually typed; no any.
  failed: payload => console.log(payload.code)
};
function notify<K extends keyof Events>(kind: K, payload: Events[K]): void {
  handlers[kind](payload);
}
notify('saved', { id: 'c1', revision: 2 });
// @ts-expect-error Saved payload requires revision.
notify('saved', { id: 'c1' });
const acceptsOnlyOne = (payload: { id: 'c1'; revision: number }): void => {};
// @ts-expect-error A callback for just c1 cannot handle every saved course.
const unsafe: Handlers['saved'] = acceptsOnlyOne;
```

`{}` leaves both patch fields unchanged; `published:false` is a valid update because nullish coalescing does not replace false. An empty title is preserved here; business validation may reject it before this internal helper runs. `title:undefined` is statically rejected, but unknown JSON still needs a parser, field-length rules and authorization. Mapped/utility types generate no runtime enforcement. Structural typing also permits extra fields through some variables: the helper deliberately projects its output rather than spreading a caller object.

A handler object supplies contextual parameter types; a separately declared unannotated callback may instead get implicit-any errors. Prefer function-valued callback properties in public contracts when strictFunctionTypes checking matters. Method syntax has bivariance compatibility exceptions. A generic kind/payload relationship is useful, but a caller with an independently union-typed kind and payload can lose correlation; model dynamic messages as a discriminated union and narrow before dispatch rather than assert away the mismatch.


Official references checked2026-10-21: [utility types](https://www.typescriptlang.org/docs/handbook/utility-types.html), [exact optional properties](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html), [function variance](https://www.typescriptlang.org/tsconfig/strictFunctionTypes.html). Learner practice remains required.


### Validate the selected key/value relationship

The dependent getter above is also the primary keyof example; it supplements the authentication note's runtime allowlist without coupling a reusable type lesson to authentication. A static key union is not an authorization or unknown-input validator.

<<< ../../workbench/frontend/typescript/keyed-contract.ts{ts}


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/typescript/Generics.md). All learner practice remains outstanding; the worked examples above are explanatory material.
