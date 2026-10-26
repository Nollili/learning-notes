# Composition vs inheritance? Shared state vs immutability?

# 🆚 Composition vs Inheritance & Shared State vs Immutability

These are core concepts in **JavaScript/React** and modern software architecture, often appearing in **senior-level discussions**.

---

## 1️⃣ Composition vs Inheritance

### **Inheritance**
- One class **extends another**, reusing behavior.
- Emphasizes **is-a** relationships.
- Enables polymorphism.

**Example:**
```js
class Animal {
  speak() { console.log('Animal sound'); }
}

class Dog extends Animal {
  speak() { console.log('Woof'); }
}

const dog = new Dog();
dog.speak(); // Woof
```

✅ **Pros**

* Clear hierarchy
* Code reuse via subclassing
* Supports polymorphism

❌ **Cons**

* Tight coupling between parent and child
* Hard to modify behavior without affecting all subclasses
* Inflexible for complex, dynamic behaviors
* In JavaScript, deep hierarchies are hard to maintain

---

### **Composition**

* Build objects by **combining smaller, reusable components**.
* Emphasizes **has-a** relationships instead of is-a.
* Promotes **flexibility and decoupling**.

**Example:**

```js
const canSpeak = () => ({
  speak: () => console.log('Hello')
});

const canWalk = () => ({
  walk: () => console.log('Walking')
});

const person = { name: 'Alice', ...canSpeak(), ...canWalk() };
person.speak(); // Hello
person.walk();  // Walking
```

✅ **Pros**

* Flexible: behaviors can be added/removed dynamically
* Encourages **code reuse** without deep hierarchies
* Easier to test and maintain

❌ **Cons**

* Slightly more boilerplate than simple inheritance
* Less intuitive for those familiar with classical OOP

> **Rule of Thumb:** Prefer **composition over inheritance**, especially in JavaScript and React.

---

## 2️⃣ Shared State vs Immutability

### **Shared State**

* Multiple parts of the system access the same data. Sharing and mutability are separate axes: an immutable value can be safely shared; shared **mutable** data needs an ownership/update policy.
* Can occur in class instances, modules, closures or function-based code; it is not unique to OOP.

**Shared mutable JavaScript state (do not mutate React state this way):**

```js
const state = { count: 0 };
function increment() { state.count += 1; }
function decrement() { state.count -= 1; }
```

✅ **Pros**

* Simple and straightforward
* Easy to implement for small apps

❌ **Cons**

* Hard to track changes → bugs due to unintended mutations
* Difficult to debug in complex applications
* Not safe in concurrent/asynchronous operations

---

### **Immutability**

* Data is **never modified in place**; always create a **new copy** when changing state.
* Often combined with **pure functions**.

**Example (React pattern):**

```js
const state = { count: 0 };
function increment(state) {
  return { ...state, count: state.count + 1 };
}

const newState = increment(state);
console.log(state.count);    // 0
console.log(newState.count); // 1
```

✅ **Pros**

* Predictable and easier to reason about
* Avoids bugs from shared mutable state
* Works well with **React rendering**, **Redux**, and **concurrent JS**
* Facilitates undo/redo features

❌ **Cons**

* Can involve extra memory for large objects
* Slightly more verbose code for deep updates

---

## ⚖️ Summary Table

| Concept      | Approach / Idea                 | Pros                              | Cons                          |
| ------------ | ------------------------------- | --------------------------------- | ----------------------------- |
| Inheritance  | Extend classes (`is-a`)         | Polymorphism, reuse               | Tight coupling, inflexible    |
| Composition  | Combine objects (`has-a`)       | Flexible, reusable, decoupled     | Slightly more boilerplate     |
| Shared State | Multiple readers/owners of a value | Can share immutable snapshots cheaply | Mutation and ownership need explicit coordination |
| Immutability | Never mutate, return new state  | Predictable, safe, easier to test | Extra memory, verbose updates |

---

### 🧠 Senior Developer Notes

1. **React/JSX:** Composition is preferred over inheritance (HOCs, hooks, component composition).
2. **State Management:** Favor immutability (Redux, Zustand, React state updates).
3. **Performance:** With immutability, you can leverage **pure components, memoization, and change detection** efficiently.
4. **Scalability:** Composition + immutability → easier to maintain large apps, fewer bugs from shared mutable state.



## Deterministic async lost update

JavaScript callbacks on one event loop run one at a time, yet an `await` splits an operation. Two tasks can read the same old value and later overwrite each other. This is a logical race without threads. Immutability helps ownership but does not make a read-modify-write transaction atomic.

```js
import assert from 'node:assert/strict';
let release;
const gate = new Promise(resolve => { release = resolve; });
let count = 0;
async function unsafeIncrement() {
  const previous = count;
  await gate;
  count = previous + 1;
}
const a = unsafeIncrement(), b = unsafeIncrement();
release(); await Promise.all([a, b]);
assert.equal(count, 1); // Demonstrates the bug: one update was lost.
count = 0;
async function ownedIncrement() {
  await gate;
  // One synchronous update after awaiting; no suspension inside this local critical step.
  count = count + 1;
}
await Promise.all([ownedIncrement(), ownedIncrement()]);
assert.equal(count, 2);
const shared = Object.freeze({currency: 'EUR'});
const orderA = {settings: shared}, orderB = {settings: shared};
assert.equal(orderA.settings, orderB.settings); // Sharing is compatible with immutability.
const before = {profile: {name: 'Ada'}, settings: shared};
const after = {...before, profile: {...before.profile, name: 'Grace'}};
assert.equal(before.profile.name, 'Ada');
assert.equal(after.profile.name, 'Grace');
assert.equal(before.settings, after.settings); // Unchanged branch can be shared.
```

**Validation:** exact Node24.18.0 example passed six assertions, including the expected lost update. The repair only covers synchronous in-memory ownership on one event loop. Across processes/database writers, use the relevant transaction/atomic update/version check; don't extend this claim to distributed concurrency. In React use a functional state update (`setCount(previous => previous + 1)`) when based on previous state; request ordering separately needs an epoch/cancellation policy, as in [the large-data workflow](../EngX_Quality/Large_Data_Workflow.md).

`Object.freeze` is shallow; nested mutable objects still require an ownership policy. Spreading only the outer object retains nested aliases. Immutable updates need new objects along the changed path, not a deep copy of every unchanged branch. Composition can hide shared mutable closures too; inheritance can encapsulate immutable values. Choose based on the behavioral contract and lifetime.

**Exercise acceptance:** reproduce the race with a controlled gate, repair it without timing sleeps, and explain why the repair does not synchronize two servers. Add a nested alias failure and a structural-sharing update; demonstrate the original remains unchanged. Record memory/behavior trade-offs before introducing a clone or state library. Learner practice remains required. References: [React queued state updates](https://react.dev/learn/queueing-a-series-of-state-updates), [ECMAScript Object.freeze](https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-object.freeze).
