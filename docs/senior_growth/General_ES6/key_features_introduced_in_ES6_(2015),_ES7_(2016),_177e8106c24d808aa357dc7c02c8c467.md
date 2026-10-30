# ECMAScript features from ES2015 to ES2017 {#key-features-introduced-in-es6-2015-es7-2016-and-es8-2017}

## **ES6 (ECMAScript 2015): Major Features**

### **Let and Const** {#_1-let-and-const}

- `let` and `const` introduced block-scoping, replacing the problematic function-scoping of `var`.

```jsx
let x = 10; // Can be reassigned
const y = 20; // Cannot be reassigned
```

---

### **Arrow Functions** {#_2-arrow-functions}

- Shorter syntax for functions and lexical `this` binding.

```jsx
const greet = (name) => `Hello, ${name}!`;
console.log(greet("Alice")); // "Hello, Alice!"
```

---

### **Template Literals** {#_3-template-literals}

- Introduced backticks (`) for multi-line strings and string interpolation.

```jsx
const name = "Alice";
const message = `Hello, ${name}! Welcome.`;
```

---

### **Default Parameters** {#_4-default-parameters}

- Functions can have default values for parameters.

```jsx
function greet(name = "Guest") {
  return `Hello, ${name}!`;
}
console.log(greet()); // "Hello, Guest!"
```

---

### **Destructuring** {#_5-destructuring}

- Easily extract values from arrays or objects.

```jsx
const [a, b] = [1, 2];
const { name, age } = { name: "Alice", age: 25 };
```

---

### **Rest and Spread Operators** {#_6-rest-and-spread-operators}

- ES2015 introduced rest parameters and iterable/array spread. Object rest/spread properties are a separate ES2018 addition, shown below.

```jsx
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}
console.log(sum(1, 2, 3)); // 6

const arr = [1, 2, 3];
const newArr = [...arr, 4, 5]; // [1, 2, 3, 4, 5]
```

---

### **Modules** {#_7-modules}

- Introduced `import` and `export` for modular development.

```jsx
// module.js
export const greet = (name) => `Hello, ${name}!`;

// main.js
import { greet } from './module.js';
console.log(greet("Alice"));
```

---

### **Promises** {#_8-promises}

- Simplified asynchronous code handling.

```jsx
Promise.resolve({ id: 1 })
  .then(data => data.id)
  .then(id => console.log(id)); // 1; no host HTTP API is required.
```

---

### **Classes** {#_9-classes}

- Cleaner syntax for object-oriented programming.

```jsx
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return `${this.name} makes a sound.`;
  }
}
```

---

### **Enhanced Object Literals** {#_10-enhanced-object-literals}

- Simplified property initialization and added methods.

```jsx
const name = "Alice";
const obj = {
  name,
  greet() {
    return `Hello, ${this.name}`;
  },
};
```

---

## **ES7 (ECMAScript 2016): Small but Handy Features**

### **Array `includes` Method** {#_1-array-includes-method}

- Easier to check if an array contains a value.

```jsx
const numbers = [1, 2, 3];
console.log(numbers.includes(2)); // true
console.log(numbers.includes(4)); // false
```

---

### **Exponentiation Operator (`**`)** {#_2-exponentiation-operator}

- Shorter syntax for exponents.

```jsx
console.log(2 ** 3); // 8
```

---

## **ES8 (ECMAScript 2017): Enhanced Productivity**

### **Async/Await** {#_1-async-await}

- Built on Promises, making asynchronous code easier to read.

```jsx
async function fetchData(load) {
  return await load(); // Rejection propagates to the observed caller promise.
}
fetchData(() => Promise.resolve({ id: 1 }))
  .then(data => console.log(data.id))
  .catch(() => console.log('Load failed'));
```

---

### **Object.entries and Object.values** {#_2-object-entries-and-object-values}

- Extract key-value pairs or just values from objects.

```jsx
const obj = { a: 1, b: 2 };
console.log(Object.entries(obj)); // [['a', 1], ['b', 2]]
console.log(Object.values(obj)); // [1, 2]
```

---

### **String Padding** {#_3-string-padding}

- Added methods `padStart` and `padEnd` for string manipulation.

```jsx
console.log("5".padStart(3, "0")); // "005"
console.log("5".padEnd(3, "0")); // "500"
```

---

### **Trailing Commas in Function Parameters** {#_4-trailing-commas-in-function-parameters}

- Cleaner code when adding/removing parameters.

```jsx
function example(a, b,) {
  console.log(a, b);
}
```

---

### **Summary of Features**

| **Version** | **Key Features** |
| --- | --- |
| **ES6** | `let`, `const`, arrow functions, template literals, classes, modules, promises, destructuring, rest/spread |
| **ES7** | `includes` for arrays, exponentiation operator (`**`) |
| **ES8** | `async/await`, `Object.entries`, `Object.values`, string padding |

## Later syntax is not retroactively ES2015

```js
// object-properties-2018.mjs
const input = { id: 'a', nested: { count: 1 }, title: 'Original' };
const copy = { ...input, title: 'Changed' }; // Object spread: ES2018.
const { id, ...remaining } = input; // Object rest properties: ES2018.
console.log(copy.title, input.title); // Changed Original
console.log(copy.nested === input.nested); // true: shallow copy, not deep clone.
```

ES2016 exponentiation is **, while * is multiplication. ES2015 function rest collects arguments; spread consumes an iterable such as an array. Plain object property spread copies enumerable own properties instead and does not require that object to be iterable. Both array/object copying remain shallow; identity, prototypes/descriptors and mutation need deliberate ownership rules. Do not infer a browser's support solely from a publication year: select targets and distinguish syntax transformation from API polyfills/host capabilities.

Promises belong to ECMAScript; fetch is a host Web API, not a feature added by ES2015's Promise standardization. async/await uses promises and does not make I/O synchronous or block the main thread while awaiting. The examples now use injected deterministic data rather than a live public endpoint; real network boundaries still need status/schema/size/deadline handling.


Primary references checked2026-10-22: [TC39 finished proposals and publication years](https://github.com/tc39/proposals/blob/main/finished-proposals.md), [ECMAScript promise semantics](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-promise-objects). Runtime checks use Node24.18.0; older-browser verification remains separate.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/general_es6/key_features_introduced_in_ES6_%282015%29%2C_ES7_%282016%29%2C_177e8106c24d808aa357dc7c02c8c467.md). All learner practice remains outstanding; the worked examples above are explanatory material.
