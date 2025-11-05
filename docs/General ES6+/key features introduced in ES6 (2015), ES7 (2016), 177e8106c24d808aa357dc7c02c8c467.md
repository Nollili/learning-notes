# key features introduced in ES6 (2015), ES7 (2016), and ES8 (2017)

Subjects: General ES6+

## **ES6 (ECMAScript 2015): Major Features**

### **1. Let and Const**

- `let` and `const` introduced block-scoping, replacing the problematic function-scoping of `var`.

```jsx
let x = 10; // Can be reassigned
const y = 20; // Cannot be reassigned
```

---

### **2. Arrow Functions**

- Shorter syntax for functions and lexical `this` binding.

```jsx
const greet = (name) => `Hello, ${name}!`;
console.log(greet("Alice")); // "Hello, Alice!"
```

---

### **3. Template Literals**

- Introduced backticks (`) for multi-line strings and string interpolation.

```jsx
const name = "Alice";
const message = `Hello, ${name}! Welcome.`;
```

---

### **4. Default Parameters**

- Functions can have default values for parameters.

```jsx
function greet(name = "Guest") {
  return `Hello, ${name}!`;
}
console.log(greet()); // "Hello, Guest!"
```

---

### **5. Destructuring**

- Easily extract values from arrays or objects.

```jsx
const [a, b] = [1, 2];
const { name, age } = { name: "Alice", age: 25 };
```

---

### **6. Rest and Spread Operators**

- Combine (`rest`) or spread (`spread`) arrays/objects.

```jsx
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}
console.log(sum(1, 2, 3)); // 6

const arr = [1, 2, 3];
const newArr = [...arr, 4, 5]; // [1, 2, 3, 4, 5]
```

---

### **7. Modules**

- Introduced `import` and `export` for modular development.

```jsx
// module.js
export const greet = (name) => `Hello, ${name}!`;

// main.js
import { greet } from './module.js';
console.log(greet("Alice"));
```

---

### **8. Promises**

- Simplified asynchronous code handling.

```jsx
fetch("https://jsonplaceholder.typicode.com/posts/1")
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error(error));
```

---

### **9. Classes**

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

### **10. Enhanced Object Literals**

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

### **1. Array `includes` Method**

- Easier to check if an array contains a value.

```jsx
const numbers = [1, 2, 3];
console.log(numbers.includes(2)); // true
console.log(numbers.includes(4)); // false
```

---

### **2. Exponentiation Operator (`*`)**

- Shorter syntax for exponents.

```jsx
console.log(2 ** 3); // 8
```

---

## **ES8 (ECMAScript 2017): Enhanced Productivity**

### **1. Async/Await**

- Built on Promises, making asynchronous code easier to read.

```jsx
async function fetchData() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts/1");
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
fetchData();
```

---

### **2. Object.entries and Object.values**

- Extract key-value pairs or just values from objects.

```jsx
const obj = { a: 1, b: 2 };
console.log(Object.entries(obj)); // [['a', 1], ['b', 2]]
console.log(Object.values(obj)); // [1, 2]
```

---

### **3. String Padding**

- Added methods `padStart` and `padEnd` for string manipulation.

```jsx
console.log("5".padStart(3, "0")); // "005"
console.log("5".padEnd(3, "0")); // "500"
```

---

### **4. Trailing Commas in Function Parameters**

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