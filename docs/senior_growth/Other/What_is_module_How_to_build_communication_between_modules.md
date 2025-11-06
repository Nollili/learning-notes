# What is module ? How to build communication between modules?

## 🔹 JavaScript Modules

A **module** in JavaScript is a **self-contained unit of code** that encapsulates functionality (variables, functions, classes) and can **export** parts of it for use in other modules. Modules help organize code, improve maintainability, and reduce global namespace pollution.

---

## 1️⃣ What is a Module?

- Each module has its **own scope**.
- Can **export** specific elements (`export`) and **import** them in other modules (`import`).
- Promotes **reusability** and **separation of concerns**.

---

### 1.1 Example of a Module

**mathUtils.js**
```javascript
// Exporting named functions
export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

// Default export
export default function square(x) {
  return x * x;
}
````

**main.js**

```javascript
import square, { add, multiply } from './mathUtils.js';

console.log(add(2, 3));       // 5
console.log(multiply(2, 3));  // 6
console.log(square(4));        // 16
```

---

## 2️⃣ How Modules Communicate

Modules communicate using **exports and imports**. There are two main types:

### 2.1 Named Exports

* Export multiple items by name.
* Import **only what you need**.

```javascript
// moduleA.js
export const name = 'Lili';
export const age = 25;

// moduleB.js
import { name, age } from './moduleA.js';
console.log(name, age);
```

### 2.2 Default Export

* Export a single **main entity** per module.

```javascript
// moduleC.js
export default function greet() {
  console.log('Hello');
}

// moduleD.js
import greet from './moduleC.js';
greet(); // Hello
```

---

### 2.3 Dynamic Imports (Code Splitting)

* Load modules **on demand** using `import()`.

```javascript
button.addEventListener('click', async () => {
  const module = await import('./heavyModule.js');
  module.loadData();
});
```

* Useful for **lazy-loading**, reducing **initial bundle size**.

---

### 2.4 Event-based Communication

* For **decoupled modules**, sometimes an **event bus** or **Pub/Sub pattern** is used.

```javascript
// eventBus.js
const events = {};
export const on = (event, cb) => { events[event] = cb; };
export const emit = (event, data) => { events[event]?.(data); };

// moduleA.js
import { emit } from './eventBus.js';
emit('userLoggedIn', { name: 'Lili' });

// moduleB.js
import { on } from './eventBus.js';
on('userLoggedIn', data => console.log('Welcome', data.name));
```

---

### ✅ Summary

* **Modules** encapsulate code and define clear **interfaces** via `export`.
* **Communication** between modules happens via:

  * **Named exports / default exports** (static import/export)
  * **Dynamic imports** for on-demand loading
  * **Event-driven patterns** (for decoupled modules)
* Benefits:

  * Reduces global scope pollution
  * Improves **code maintainability**
  * Encourages **reusability** and **separation of concerns**

> 💡 Senior Tip:
> For large projects, combine **ES modules** with **dynamic imports** and **Pub/Sub patterns** to achieve modular, performant, and decoupled architecture.
