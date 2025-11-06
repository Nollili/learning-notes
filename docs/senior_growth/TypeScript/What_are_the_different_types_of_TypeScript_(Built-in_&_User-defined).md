# What are the different types of TypeScript (Built-in & User-defined)?

## 🔹 TypeScript Types

TypeScript provides a **rich type system** that helps developers write safe and maintainable code. Types can be **built-in (primitive and advanced types)** or **user-defined**.

---

## 1️⃣ Built-in Types

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
| `Tuple`      | Fixed-length arrays with specific types per index. Example: `[string, number]` |
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
````

---

## 2️⃣ User-defined Types

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
direction = "up"; // ✅
direction = "forward"; // ❌
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
- **Intersection (`&`)** → Combines multiple types into one.

---

### ✅ Summary

TypeScript types can be grouped as:

1. **Built-in / Primitive types**: string, number, boolean, void, never, any, unknown, symbol, bigint
2. **Advanced built-in types**: Tuple, Enum, Array`<T>`, Utility Types
3. **User-defined types**: Interfaces, Type Aliases, Generics, Literal types, Classes, Union/Intersection types

> 💡 Senior Tip:
> Combining built-in and user-defined types effectively allows **safe, scalable, and self-documenting code**, which is critical in large applications.
