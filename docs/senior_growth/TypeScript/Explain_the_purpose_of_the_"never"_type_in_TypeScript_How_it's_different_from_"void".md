# Explain the purpose of the "never" type in TypeScript? How it's different from "void"?

## TypeScript `never` vs `void` {#%F0%9F%94%B9-typescript-never-vs-void}

TypeScript provides **special types** to describe functions and values with specific behaviors. Two of these are `never` and `void`.

---

## `void` Type {#_1%EF%B8%8F%E2%83%A3-void-type}

- **Purpose:** Represents **absence of a meaningful return value**.
- Commonly used for **functions that don’t return anything**.

```ts
function logMessage(message: string): void {
  console.log(message);
}
```

* Key points:

  * Can still return `undefined` implicitly.
  * Used for functions that **perform side effects** but don’t return a value.
  * `void` can also be used as the type for variables that are expected to be `undefined`.

---

## `never` Type {#_2%EF%B8%8F%E2%83%A3-never-type}

* **Purpose:** Represents values that **never occur**.
* Used for **functions that never return normally** or **unreachable code**.

### Examples:

#### 2.1 Function that always throws

```ts
function throwError(message: string): never {
  throw new Error(message);
}
```

* This function explicitly annotates never; it does not demonstrate inference. Declaration and expression inference can differ, as shown below.

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
      const _exhaustiveCheck: never = shape; // Compile-time error if not exhaustive
      return _exhaustiveCheck;
  }
}
```

* Ensures all possible cases are handled.
* If a new value is added to `Shape` and not handled, TS will **throw a compile-time error**.

---

## Key Differences: `void` vs `never` {#_3%EF%B8%8F%E2%83%A3-key-differences-void-vs-never}

| Feature       | `void`                        | `never`                                  |
| ------------- | ----------------------------- | ---------------------------------------- |
| Represents    | Absence of a return value     | A value that **never occurs**            |
| Common Use    | Functions that return nothing | Functions that **throw or never finish** |
| Assignable To | Can assign `undefined`        | Cannot assign any value (except `never`) |
| Example       | `function f(): void {}`       | `function f(): never { throw Error() }`  |

---

## Summary {#%E2%9C%85-summary}

* **`void`** → “this function returns nothing meaningful.”
* **`never`** → “this function never returns” or “this code path cannot happen.”
* `never` is extremely useful for:

  * **Exhaustive type checking**
  * **Safety in unreachable code detection**
  * **Functions that always throw or loop infinitely**

> Senior Tip:
> Use `never` to **catch unhandled cases at compile time**—it’s a type-safe way to ensure exhaustive logic in union types.

## Discriminated object states and exhaustive rendering

```ts
export {};
type LoadState<T> =
  | { kind: 'idle' }
  | { kind: 'loading'; requestId: string }
  | { kind: 'success'; value: T }
  | { kind: 'error'; message: string };
function assertNever(value: never): never { throw new Error('Unexpected state'); }
function label(state: LoadState<{ name: string }>): string {
  switch (state.kind) {
    case 'idle': return 'Ready';
    case 'loading': return 'Loading';
    case 'success': return state.value.name;
    case 'error': return state.message;
    default: return assertNever(state);
  }
}
// @ts-expect-error Success must carry a value.
const broken: LoadState<string> = { kind: 'success' };
// @ts-expect-error Loading does not expose successful data.
function unsafe(state: LoadState<string>): string { return state.value; }
```

This makes contradictory combinations harder to construct than `{loading:boolean, data?:T, error?:string}`. Narrow the discriminant before accessing member-specific fields. Adding an offline/cancelled member forces the switch to handle it; never makes the missing branch visible during typechecking. Untrusted JSON still requires parsing; assertNever throws if invalid input bypasses the static contract. Use a safe UI boundary to handle unexpected failures, not a blank infinite loop.

## Inference and contextual void

```ts
export {};
function throwingDeclaration() { throw new Error('stop'); } // Inferred return void.
const throwingExpression = () => { throw new Error('stop'); }; // Inferred never.
type DeclarationResult = ReturnType<typeof throwingDeclaration>; // void
type ExpressionResult = ReturnType<typeof throwingExpression>; // never
const sink: () => void = () => 123; // Caller promises to ignore returned value.
const ignored = sink(); // Typed void; runtime value is still123.
// @ts-expect-error Explicitly annotated void body cannot return a number.
function invalidVoid(): void { return 123; }
```

A `() => void` callback means its caller will ignore the result; it does not prove the implementation returns undefined. This permits array.push callbacks in forEach. An async callback assigned to a void-returning API may leave a rejection unhandled if the API does not await it; prefer a promise-aware contract or deliberate error handling. A never-returning function has no normal return value and can be used where another return type is required, but never does not mean “null”.


Official references: [discriminated unions and never](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking), [void callback assignability](https://www.typescriptlang.org/docs/handbook/2/functions.html#return-type-void). TypeScript5.9.3 strict baseline; checked2026-10-20.

### Runtime versus checker evidence

For the contextual-void example, invoke sink in an isolated lab: JavaScript still returns123 even though the caller's static type is void. Do not “prove” never by running infiniteLoop. Instead execute label for each valid discriminated state, and add a new variant to make the exhaustiveness check fail before handling it. Keep deliberately rejected assignments as type-only fixtures; running emitted code from a negative type test can execute unsafe operations. The [generic callback lesson](./Generics.md#overloads-and-callback-variance) explains why ignoring a return value is a different relationship from accepting every callback parameter type.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/typescript/Explain_the_purpose_of_the_%22never%22_type_in_TypeScript_How_it%27s_different_from_%22void%22.md). All learner practice remains outstanding; the worked examples above are explanatory material.
