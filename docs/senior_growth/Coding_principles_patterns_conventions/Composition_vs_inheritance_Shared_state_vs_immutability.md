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
````

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
const canSpeak = obj => ({
  speak: () => console.log('Hello')
});

const canWalk = obj => ({
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

* Multiple parts of the system access and mutate the **same data**.
* Common in OOP where objects hold internal state.

**Example (React anti-pattern):**

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
| Shared State | Mutable, global or object state | Simple for small apps             | Hard to debug, error-prone    |
| Immutability | Never mutate, return new state  | Predictable, safe, easier to test | Extra memory, verbose updates |

---

### 🧠 Senior Developer Notes

1. **React/JSX:** Composition is preferred over inheritance (HOCs, hooks, component composition).
2. **State Management:** Favor immutability (Redux, Zustand, React state updates).
3. **Performance:** With immutability, you can leverage **pure components, memoization, and change detection** efficiently.
4. **Scalability:** Composition + immutability → easier to maintain large apps, fewer bugs from shared mutable state.

