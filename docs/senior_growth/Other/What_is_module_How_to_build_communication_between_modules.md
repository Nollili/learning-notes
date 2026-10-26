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
```

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

A single `events[event] = callback` slot overwrites previous listeners and offers no cleanup. Use an explicit application-owned bus when several consumers genuinely need the same notification; ordinary direct function calls/imports are easier to trace when there is one owner.

```js
// eventBus.mjs — local, trusted application notification contract
export function createBus() {
  const events = new Map();
  return {
    on(event, handler) {
      if (typeof event !== 'string' || !event || event.length > 80 || typeof handler !== 'function') throw new TypeError('Invalid subscription');
      let listeners = events.get(event);
      if (!listeners) {
        if (events.size >= 20) throw new RangeError('Event budget');
        listeners = new Set(); events.set(event, listeners);
      }
      if (listeners.size >= 50) throw new RangeError('Listener budget');
      const entry = {handler}; listeners.add(entry);
      return () => {
        listeners.delete(entry);
        if (events.get(event) === listeners && listeners.size === 0) events.delete(event);
      };
    },
    async emit(event, data) {
      const snapshot = [...(events.get(event) ?? [])], failures = [];
      for (const {handler} of snapshot) {
        try { await handler(data); } catch (error) { failures.push(error); }
      }
      if (failures.length) throw new AggregateError(failures, 'Notification failed');
    },
    clear() { events.clear(); }
  };
}
```

Subscribe before emitting; this is not a durable queue and does not replay old events. The snapshot fixes the recipients for one emit: unsubscribe/clear affects future emits, not an already captured dispatch. Duplicate subscriptions are independent entries with separate idempotent cleanup functions. Handlers run sequentially and are awaited; every captured handler is attempted and failures aggregate. Completed effects are not rolled back. The caller must await/catch `emit`; handlers need their own finite I/O budgets/cancellation and must avoid recursive event cycles. This small bus does not forcibly terminate arbitrary promises, persist events or provide distributed delivery.

```js
// app.mjs
import {createBus} from './eventBus.mjs';
const bus = createBus();
const unsubscribe = bus.on('userLoggedIn', async data => {
  console.log('Welcome', data.name);
});
try { await bus.emit('userLoggedIn', {name: 'Lili'}); }
finally { unsubscribe(); bus.clear(); }
```

Do not put per-user/tenant state into an unscoped process-wide singleton. Event payloads crossing a trust boundary require runtime validation and authorization; this internal bus grants neither. UI effects should return their unsubscribe function on cleanup. Explicitly export the public surface, inspect cycles/import-time side effects and keep module resolution separate from event delivery.


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


## Verification and practice

The exact bus implementation was exercised on Node24.18.0: multiple listeners, awaited order, independent/idempotent unsubscribe, fixed snapshot when one listener removes another, aggregate rejection with later-handler delivery, listener cap, and clear→resubscribe→old-cleanup safety passed. These are local notifications, not broker or authorization tests. See [module resolution and cycles](../../node-js/module-01-nodejs-foundations.md#worked-module-failures-and-interoperability-lab) for the separately executed CJS/ESM lab.

**Exercise acceptance:** connect two consumers to an owned bus, dispose one, and assert the other remains. Emit before subscription and explain why it is not replayed. Inject one async rejection and verify documented delivery/error policy, remove listeners during dispatch and prove the snapshot rule. Demonstrate UI unmount cleanup and a finite handler deadline. Choose direct calls if pub/sub obscures ownership. Learner practice remains required. Official references: [Node EventEmitter lifecycle and async-error behavior](https://nodejs.org/docs/latest-v24.x/api/events.html), [Node module boundaries](https://nodejs.org/api/packages.html). This custom bus has different async semantics from synchronous EventEmitter; don't assume they are interchangeable.
