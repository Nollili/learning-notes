# What are the different types of TypeScript (Built-in & User-defined)?

## TypeScript Types {#%F0%9F%94%B9-typescript-types}

TypeScript provides a **rich type system** that helps developers write safe and maintainable code. Types can be **built-in (primitive and advanced types)** or **user-defined**.

---

## Built-in Types {#_1%EF%B8%8F%E2%83%A3-built-in-types}

### 1.1 Primitive Types

| Type      | Description | Example |
|-----------|------------|---------|
| `string`  | Textual data | `let name: string = "Lili";` |
| `number`  | Numeric values | `let age: number = 30;` |
| `boolean` | True/false | `let isActive: boolean = true;` |
| `bigint`  | Large integers | `let big: bigint = 9007199254740991n;` |
| `symbol`  | Unique identifiers | `const id = Symbol("id");` |
| `null`   | Null value | `let nothing: null = null;` |
| `undefined` | Undefined value | `let notDefined: undefined;` |

---

### 1.2 Special Types

| Type         | Description |
|--------------|-------------|
| `any`        | Disable type checking (can be any type). |
| `unknown`    | Type-safe counterpart of `any`; must be checked before use. |
| `void`       | No return value (functions that return nothing). |
| `never`      | Represents **values that never occur**, e.g., functions that throw or infinite loops. |
| `object`     | Any non-primitive object. |
| `Array<T>` / `T[]` | Typed arrays. Example: `let numbers: number[] = [1, 2, 3];` |
| `Tuple`      | Position-specific array types; can include optional/rest elements. Example: `[string, number]` |
| `Enum`       | Named constants. Example: `enum Color { Red, Green, Blue }` |

---

### 1.3 Utility Types (Built-in TS helpers)

- **Partial`<T>`** → Makes all properties optional.
- **Required`<T>`** → Makes all properties required.
- **Readonly`<T>`** → Makes all properties read-only.
- **Pick<T, K>** → Select a subset of properties from a type.
- **Omit<T, K>** → Remove a subset of properties from a type.
- **Record<K, T>** → Creates an object type with keys `K` and values `T`.
- **ReturnType`<T>`** → Infers the return type of a function.
- **Parameters`<T>`** → Infers parameter types of a function.

```ts
type Person = { name: string; age: number };
type PartialPerson = Partial<Person>; // { name?: string; age?: number }
```

---

## User-defined Types {#_2%EF%B8%8F%E2%83%A3-user-defined-types}

### 2.1 Type Aliases

```ts
type ID = string | number;
let userId: ID = 123;
userId = "abc";
```

- `type` allows combining or defining **custom types**.

---

### 2.2 Interfaces

```ts
interface User {
  name: string;
  age: number;
  email?: string; // optional
}

const user: User = { name: "Lili", age: 25 };
```

- Interfaces define **contracts for objects or classes**.
- Can be **extended**.

```ts
interface Employee extends User {
  position: string;
}
```

---

### 2.3 Classes

```ts
class Person {
  constructor(public name: string, public age: number) {}
}

const p = new Person("Lili", 25);
```

- Classes can implement **interfaces** to enforce type structure.

---

### 2.4 Generics

```ts
function identity<T>(value: T): T {
  return value;
}
```

- Generics are **type parameters** that make code reusable for multiple types.

---

### 2.5 Literal Types

```ts
let direction: "up" | "down" | "left" | "right";
direction = "up"; // Yes
// @ts-expect-error Only the declared direction literals are allowed.
direction = "forward"; // No
```

- Restrict values to **specific constants**.

---

### 2.6 Union & Intersection Types

```ts
type A = { a: string };
type B = { b: number };

type C = A & B; // Intersection: must have both a & b
type D = A | B; // Union: can be A or B
```

- **Union (`|`)** → Value can be one of multiple types.
- **Intersection (`&`)** → Must satisfy every constituent; incompatible property requirements can produce never rather than a useful merged type.

---

### Summary {#%E2%9C%85-summary}

TypeScript types can be grouped as:

1. **Built-in / Primitive types**: string, number, boolean, void, never, any, unknown, symbol, bigint
2. **Advanced built-in types**: Tuple, Enum, Array`<T>`, Utility Types
3. **User-defined types**: Interfaces, Type Aliases, Generics, Literal types, Classes, Union/Intersection types

> Senior Tip:
> Combining built-in and user-defined types effectively allows **safe, scalable, and self-documenting code**, which is critical in large applications.

## Structural assignment, inference and fresh literals

Examples below use TypeScript5.9.3 with strict, noUncheckedIndexedAccess and exactOptionalPropertyTypes enabled. Interfaces and aliases both describe structural contracts; interfaces can merge declarations, while aliases can express unions and type transformations. Neither validates runtime input.

```ts
export {};
interface Identified { id: string }
const stored = { id: 'p1', secret: 'internal' };
const allowed: Identified = stored; // Structural compatibility permits extra fields.
// @ts-expect-error Fresh literal excess-property check catches likely mistakes.
const fresh: Identified = { id: 'p1', secret: 'internal' };
function publicDto(value: Identified): Identified { return { id: value.id }; }
console.log(publicDto(stored)); // Only id; annotation alone would not remove secret.

let mutableMode = 'light'; // string: it can change later
const literalMode = 'light'; // literal 'light'
const options = { mode: 'light' } satisfies { mode: 'light' | 'dark' };
// @ts-expect-error options.mode retained the literal 'light'.
options.mode = 'dark';
```

Excess-property checks help catch typos in fresh literals; they are not exact-object security. `satisfies` checks compatibility while preserving useful inferred information; `as` can override the checker. A union accepts a value matching a member, but only common safe operations are available until narrowing. An intersection of `{id:string}` and `{id:number}` requires an impossible id. Prefer a tagged union for alternatives rather than piling optional fields into one interface.

## Unknown boundaries and honest guards

```ts
export {};
function hasErrorCode(error: unknown): error is Error & { code: string } {
  return error instanceof Error && 'code' in error && typeof error.code === 'string';
}
function classify(error: unknown): string {
  if (hasErrorCode(error)) return error.code;
  return 'UNEXPECTED';
}
```

Proving instanceof Error does not prove Node errno fields such as code/path/syscall. Read additional properties only after checking them. Across realms or plain error payloads, instanceof may not match; validate the actual transport schema separately. `any` propagates unchecked access through return values; prefer unknown at boundaries and narrow locally. Never write a broad isUser predicate that tests only one field and promises the whole model.

## Readonly is shallow; aliases still matter

```ts
export {};
const source = { settings: { theme: 'light' }, name: 'Ada' };
const view: Readonly<typeof source> = source;
// @ts-expect-error Shallow readonly prevents this assignment through view.
view.name = 'Grace';
view.settings.theme = 'dark'; // Nested object remains mutable.
source.name = 'Grace'; // A mutable alias still changes the same object.
const modes = ['light', 'dark'] as const; // readonly literal tuple in the type system
```

`Object.freeze` provides shallow runtime freezing; `as const` changes inference without freezing the object. Deep readonly types and deep freezing have different runtime/compatibility costs; retain ownership boundaries rather than assuming a mapped type prevents all mutation. Project DTOs deliberately to avoid leaking storage-only fields.


Official references: [object types](https://www.typescriptlang.org/docs/handbook/2/objects.html), [narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html), [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator). Checked2026-10-20.

### Runtime ownership drill

```ts
export {};
const owned = { nested: { count: 1 } };
const frozen = Object.freeze(owned);
frozen.nested.count = 2; // Both runtime freeze and inferred readonly are shallow.
const inferred = { nested: { count: 1 } } as const;
// Type-only counterexample: do not run this rejected assignment as normal code.
if (false) {
  // @ts-expect-error as const makes this nested literal property readonly to the checker.
  inferred.nested.count = 2;
}
const mutableAlias = { count: 1 };
const readonlyAlias: Readonly<typeof mutableAlias> = mutableAlias;
mutableAlias.count = 3;
console.log(readonlyAlias.count); // 3: readonly access does not confer ownership.
```

A recursive DeepReadonly type is a compile-time view, not a runtime traversal; a recursive freeze utility needs policies for cycles, getters, class instances, Maps/Sets and performance. Object.freeze on a Map does not disable its set method. Prefer a narrowly owned immutable value graph or projected/copied DTO for a boundary; do not promise all arbitrary JavaScript objects become immutable from one mapped type. A structured clone is a separate data-copy operation with its own supported types; it neither validates domain constraints nor automatically freezes output.


References checked2026-10-21: [TypeScript readonly properties](https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-properties), [ECMAScript Object.freeze](https://tc39.es/ecma262/#sec-object.freeze).

## From an inventory to derived contracts

Continue with the [worked generic transformations](./Generics.md#mapped-and-utility-types). The dependent getter explains why keyof selects keys and T[K] retains the selected property's value type. The mapped examples add/remove readonly and optional modifiers; the allowlisted CoursePatch derives only editable fields, with Parameters/ReturnType following the helper signature. Conditional infer extracts an array element type, and the distribution example distinguishes string[] | number[] from (string | number)[]. These operations transform static contracts; they do not create a parser or remove fields from a runtime object.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/typescript/What_are_the_different_types_of_TypeScript_%28Built-in_%26_User-defined%29.md). All learner practice remains outstanding; the worked examples above are explanatory material.
