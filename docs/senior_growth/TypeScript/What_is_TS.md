# 🔹 What is TypeScript?

**TypeScript** is a **statically typed superset of JavaScript** developed by Microsoft. It adds **types, interfaces, enums, generics, and other modern features** to JavaScript while still compiling down to plain JavaScript, with output syntax/modules and runtime APIs chosen for the intended host.

---

## 1️⃣ Key Characteristics

- **Static Typing**: You can define types for variables, function parameters, and return values.
- **JavaScript foundation**: JavaScript syntax supplies the runtime model; the TypeScript checker may reject code that JavaScript would execute. Source/module/tooling compatibility still needs checking.
- **Compile-Time Checks**: Type errors are caught during development before running the code.
- **Supports Modern JS Features**: TS supports ES6/ESNext features like classes, async/await, modules, etc.
- **Tooling Integration**: Works seamlessly with IDEs (VSCode, WebStorm) for autocomplete, intellisense, and refactoring.

---

## 2️⃣ Example

```ts
// TypeScript example
interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return `Hello, ${user.name}!`;
}

const john: User = { name: 'John', age: 30 };
console.log(greet(john));
```

* `User` is an interface that defines the expected structure.
* TypeScript will **throw an error at compile-time** if we assign the wrong type.

---

## 3️⃣ Advantages over JavaScript

* **Catch errors early**: Reduce runtime bugs.
* **Better developer experience**: IDE autocomplete, type hints, and navigation.
* **Improved maintainability**: Makes large codebases easier to manage.
* **Self-documenting code**: Types serve as documentation for functions and objects.

---

## 4️⃣ Compilation

* TypeScript code (`.ts` or `.tsx`) is **compiled to JavaScript** using the TypeScript compiler (`tsc`).
* Output must match the selected host syntax/module format and available APIs. A target transform does not polyfill fetch, the DOM or every library API.

---

### ✅ Key Takeaways

* TS = JavaScript + Types + Compile-time Safety.
* Helps **build scalable, maintainable, and bug-resistant applications**.
* Optional typing allows gradual adoption in existing JS projects.

> 💡 Senior Tip:
> Think of TypeScript as **a safety net for JS**, making your code more predictable and robust while checking the relationships represented in its types.


## Erased contracts and actual execution

An interface annotation does not examine incoming JSON or remove fields. The compiler's type model is separate from JavaScript runtime behavior: static readonly is shallow access control, a discriminated union narrows checked alternatives, and an assertion can bypass the intended check. Start with the [worked unknown-input parser](./What_kind_of_problems_could_be_solved_by_using_TS.md#runtime-input-boundary), then the [generic contract examples](./Generics.md) for advanced relationships. The primary baseline is compiler5.9.3 strict; the [adoption note](./Pros_and_cons_of_TS_When_should_we_use_or_avoid_it.md) explains runtime stripping and incremental alternatives without changing an existing task's configuration.

**Exercise acceptance:** typecheck greet with a valid User and a deliberately wrong age/name call; retain an expected compile-time failure. Execute the valid emitted JavaScript and verify the greeting. Feed malformed JSON through the parser and show runtime rejection, then explain why assigning an interface alone could not perform that check. Run compiler checking separately from any fast transpile/dev-server step. Learner exercise completion remains required.
