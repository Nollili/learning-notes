### What is the temporal dead zone? Why is this happening?

The **Temporal Dead Zone (TDZ)** in JavaScript refers to the period of time during which a `let` or `const` variable is declared but cannot be accessed. Attempting to access these variables during this time results in a `ReferenceError`.

---

### **Key Points About the Temporal Dead Zone**

1. **Scope but Uninitialized**:
Variables declared using `let` or `const` are in scope from the moment their enclosing block is entered, but they remain uninitialized until the execution reaches their declaration.
2. **Accessing Before Initialization**:
Any attempt to access the variable in the TDZ (before its declaration is encountered) will throw a `ReferenceError`.
3. **Purpose**:
The TDZ enforces better programming practices by ensuring that variables are not accessed before they are initialized, reducing bugs.

---

### **Example of the Temporal Dead Zone**

```jsx
{
  console.log(x); // ReferenceError: Cannot access 'x' before initialization
  let x = 10;
}
```

Here:

1. The variable `x` is in the TDZ from the start of the block `{` to the point where `x` is declared (`let x = 10;`).
2. Any attempt to access `x` during this period results in an error.

---

### **Why Does the Temporal Dead Zone Happen?**

The TDZ exists because of how JavaScript's **variable hoisting** works in ES6 and later:

1. **Variable Hoisting**:
    - Variables declared with `var` are hoisted to the top of their function or global scope and are initialized with `undefined`.
    - In contrast, variables declared with `let` or `const` are hoisted but remain **uninitialized** until their declaration is encountered.
2. **Strict Scoping Rules**:
    - The TDZ ensures variables declared with `let` and `const` behave more predictably and reduce bugs caused by accessing variables before their intended use.
3. **Prevent Silent Failures**:
    - With `var`, accessing a variable before its declaration silently results in `undefined`. The TDZ forces developers to avoid this potentially unintended behavior.

---

### **TDZ with `const`**

The behavior of `const` within the TDZ is similar to `let`, but it has an additional constraint: the variable must be assigned a value during its declaration.

```jsx
{
  console.log(y); // ReferenceError: Cannot access 'y' before initialization
  const y = 20;
}

```

---

### **TDZ and Function Arguments**

Default parameter initializers are evaluated left to right in their parameter environment. A later parameter binding can still be uninitialized:

```jsx
function example(x = y, y = 10) {
  // The default value of `x` depends on `y`, but `y` is not yet initialized
  console.log(x, y);
}

example(); // ReferenceError: Cannot access 'y' before initialization

```

---

### **TDZ and Loops**

The TDZ can occur in loops, especially when using `let` for block-scoped variables.

```jsx
for (let i = 0; i < 5; i++) {
  console.log(i); // Works fine
}

console.log(i); // ReferenceError: Cannot access 'i' outside the loop

```

Here:

1. The example initializes each loop binding before the body accesses it.
2. The reference after the loop is out of scope, not a TDZ access. Both can throw ReferenceError but describe different causes.

---

### **Key Takeaways**

1. The **Temporal Dead Zone** applies to `let` and `const` variables between the start of their scope and their declaration.
2. It ensures you can't use a variable before it's declared, helping avoid bugs caused by unintentionally accessing uninitialized variables.
3. It’s a behavior introduced in ES6 to improve the predictability and reliability of block-scoped variables.
## Lexical environments, shadowing and closure lifetime

A lexical binding is resolved through the environment chain established by source nesting, not by the caller's variables. Hoisting describes declaration-instantiation behavior; the engine does not literally move source lines. `var` creates a function/script-scoped binding initialized to undefined; let/const/class bindings have initialization boundaries. Reading a shadowed inner binding before initialization does not fall back to the outer binding.

```js
let name = 'outer';
try {
  { console.log(name); let name = 'inner'; }
} catch (error) { console.log(error.name); } // ReferenceError: inner TDZ
console.log(typeof neverDeclaredHere); // 'undefined' for an unresolvable name
try {
  { console.log(typeof later); let later = 1; }
} catch (error) { console.log(error.name); } // ReferenceError, even with typeof
```

A closure retains access to bindings after the creating function returns. It captures a binding, not automatically a frozen copy of its value.

```js
function makeCounter() {
  let value = 0;
  return { increment: () => ++value, read: () => value };
}
const counter = makeCounter();
counter.increment();
console.log(counter.read()); // 1; both closures share one binding

const shared = [];
for (var i = 0; i < 3; i++) shared.push(() => i);
const separate = [];
for (let j = 0; j < 3; j++) separate.push(() => j);
console.log(shared.map(read => read()));   // [3,3,3]
console.log(separate.map(read => read())); // [0,1,2]
```

The let loop creates per-iteration bindings; an IIFE/factory can provide similar isolation when maintaining old var code. A retained closure can keep captured data alive when a timer/listener/cache owns the function. Remove listeners and release callbacks according to ownership; engines can optimize unused bindings, so do not assume every byte of the original scope stays retained. No cleanup is needed merely because a closure exists and is unreachable.

**Debugging:** distinguish name not found, binding uninitialized, and initialized undefined. Pause at the failing read, inspect the innermost matching declaration and its initialization path; check shadowing/default parameters/module cycles before changing let to var. Replacing let with var can hide a defect by returning undefined instead of fixing ordering.

**Exercise:** predict both callback arrays, build two independent counters, and reproduce both typeof cases. Acceptance: results match above; counters do not share state across factory calls; explain a real listener's closure lifetime and cleanup; reproduce a TDZ caused by shadowing without mislabelling the out-of-loop example. Retain isolated failing cases and corrected versions.

Official references: [ECMAScript environment records](https://tc39.es/ecma262/multipage/executable-code-and-execution-contexts.html#sec-environment-records), [declarations](https://tc39.es/ecma262/multipage/ecmascript-language-statements-and-declarations.html). Checked2026-10-20; Node24.18.0 runtime baseline.
