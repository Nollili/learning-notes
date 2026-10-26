# OOP vs FP — Object-Oriented vs Functional Programming in JavaScript

JavaScript supports **both paradigms**, and understanding their differences is crucial for writing **clean, maintainable, and scalable code**.

---

## 1️⃣ Object-Oriented Programming (OOP)

**Definition:**  
OOP organizes code around **objects**, which encapsulate **state (data)** and **behavior (methods)**.

### 🔑 Key Concepts
- **Classes & Objects:** Blueprint (`class`) and instances (`object`)
- **Encapsulation:** Hide internal state; expose methods
- **Inheritance:** Share behavior between classes
- **Polymorphism:** Objects can have different implementations of the same method
- **Abstraction:** Expose only relevant interfaces

### Example:
```js
class User {
    constructor(name, role) {
        this.name = name;
        this.role = role;
    }
    greet() {
        console.log(`Hello, I am ${this.name}`);
    }
}

class Admin extends User {
    greet() {
        console.log(`Admin ${this.name} is here`);
    }
}

const alice = new User('Alice', 'user');
const bob = new Admin('Bob', 'admin');

alice.greet(); // Hello, I am Alice
bob.greet();   // Admin Bob is here
```

### ✅ Pros

* Intuitive modeling of real-world entities
* Encapsulation improves modularity
* Easy to manage complex stateful systems
* Supports polymorphism and code reuse

### ❌ Cons

* Shared mutable state can cause **side effects**
* Inheritance can lead to tight coupling
* Harder to reason about large mutable objects

---

## 2️⃣ Functional Programming (FP)

**Definition:**
FP organizes code around **pure functions**, **immutability**, and **composition**.

### 🔑 Key Concepts

* **Pure Functions:** No side effects; output depends only on input
* **Immutability:** Data is never modified; always return new data
* **First-Class Functions:** Functions can be passed as arguments or returned
* **Higher-Order Functions:** Functions that accept or return functions
* **Function Composition:** Combine small functions into larger ones

### Example:

```js
const users = [
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 30 },
];

const getNames = users => users.map(u => u.name);
const filterAdults = users => users.filter(u => u.age >= 18);

const adultNames = getNames(filterAdults(users));
console.log(adultNames); // ["Alice", "Bob"]
```

### ✅ Pros

* Easier reasoning due to pure functions
* Avoids shared mutable state → safer concurrency
* Functions are composable → more reusable
* Often leads to declarative, concise code

### ❌ Cons

* Can be less intuitive for beginners
* May involve extra memory (immutable copies)
* Some patterns harder to implement without OOP (e.g., complex hierarchical state)

---

## 3️⃣ Comparison Table

| Feature           | OOP                                                 | FP                                                    |
| ----------------- | --------------------------------------------------- | ----------------------------------------------------- |
| Main Focus        | Objects & state                                     | Functions & transformations                           |
| State             | Often encapsulated; can be mutable or immutable      | Usually transformed immutably; effects still need boundaries |
| Side Effects      | Allowed                                             | Avoided                                               |
| Composition       | Object composition, delegation and polymorphism; inheritance optional | Function composition and data transformations |
| Scalability       | Good for stateful apps                              | Good for data-heavy, stateless apps                   |
| Example Use Cases | UI components with state, games, class-based models | Data pipelines, array transformations, Redux reducers |

---

## 4️⃣ Practical Use in JS Projects

* **OOP:** React class components, Angular services, complex models
* **FP:** pure reducers and map/filter transformations. Hooks and streams can also own effects or mutable resources; using one does not automatically make code pure.
* **Hybrid:** Most modern JS apps mix OOP (for components/services) and FP (for state transformations).

---

### 🧠 Key Takeaways

1. **OOP:** Better for **stateful entities** and modeling real-world objects.
2. **FP:** Better for **stateless transformations**, predictable code, and **avoiding side effects**.
3. **In JS:** Use **FP for data manipulation** and **OOP for structural organization**.
4. **Senior tip:** Understanding both paradigms allows you to **choose the best approach per problem** and write maintainable, performant applications.


## Both styles can preserve immutable values

The table describes common styles, not restrictions of JavaScript. OOP can use composition and immutable objects; FP still needs explicit boundaries for network, storage and logging effects. Inheritance is not required for object-oriented design. Choose a representation based on invariants, ownership and how requirements change, rather than labeling every class mutable or every function pure.

```js
import assert from 'node:assert/strict';
class Quantity {
  #value;
  constructor(value) {
    if (!Number.isSafeInteger(value) || value < 0) throw new RangeError('Invalid quantity');
    this.#value = value;
  }
  get value() { return this.#value; }
  add(other) { return new Quantity(this.#value + other.value); }
}
const first = new Quantity(2), result = first.add(new Quantity(3));
assert.equal(first.value, 2);
assert.equal(result.value, 5);
assert.notEqual(first, result);
assert.throws(() => new Quantity(-1), RangeError);
assert.throws(() => new Quantity(Number.MAX_SAFE_INTEGER).add(new Quantity(1)), RangeError);
```

This class has no mutation method; addition validates the resulting invariant and returns a new value. A pure function over a validated data structure is a simpler alternative if encapsulation adds no useful guarantee. Both can call the same injected pure shipping strategy; neither requires subclassing. See [contract/substitution checks](./Can_you_decipher_SOLID_acronym_What_is_"L".md#behavioral-contracts-and-dependency-substitution) and [the async ownership race](./Composition_vs_inheritance_Shared_state_vs_immutability.md#deterministic-async-lost-update).

**Validation:** exact Node24.18.0 block passed five assertions, including invalid input and overflow. **Exercise acceptance:** implement the same small invariant using a class and a function-based representation; prove original values remain unchanged, invalid transitions are rejected and effects are injected at the boundary. Compare readability and ownership instead of declaring a universal winner. Advanced paradigm specialization is optional; learner practice remains required. [Official JavaScript class-field semantics](https://tc39.es/ecma262/multipage/ecmascript-language-functions-and-classes.html#sec-class-definitions) and [Node assertions](https://nodejs.org/docs/latest-v24.x/api/assert.html) support the language/check details.
