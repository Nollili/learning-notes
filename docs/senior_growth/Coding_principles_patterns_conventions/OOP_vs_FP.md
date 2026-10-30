# OOP vs FP — Object-Oriented vs Functional Programming in JavaScript

JavaScript supports **both paradigms**, and understanding their differences is crucial for writing **clean, maintainable, and scalable code**.

---

## Object-Oriented Programming (OOP) {#_1%EF%B8%8F%E2%83%A3-object-oriented-programming-oop}

**Definition:**  
OOP organizes code around **objects**, which encapsulate **state (data)** and **behavior (methods)**.

### Key Concepts {#%F0%9F%94%91-key-concepts}
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

### Pros {#%E2%9C%85-pros}

* Intuitive modeling of real-world entities
* Encapsulation improves modularity
* Easy to manage complex stateful systems
* Supports polymorphism and code reuse

### Cons {#%E2%9D%8C-cons}

* Shared mutable state can cause **side effects**
* Inheritance can lead to tight coupling
* Harder to reason about large mutable objects

---

## Functional Programming (FP) {#_2%EF%B8%8F%E2%83%A3-functional-programming-fp}

**Definition:**
FP organizes code around **pure functions**, **immutability**, and **composition**.

### Key Concepts {#%F0%9F%94%91-key-concepts-1}

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

### Pros {#%E2%9C%85-pros-1}

* Easier reasoning due to pure functions
* Avoids shared mutable state → safer concurrency
* Functions are composable → more reusable
* Often leads to declarative, concise code

### Cons {#%E2%9D%8C-cons-1}

* Can be less intuitive for beginners
* May involve extra memory (immutable copies)
* Some patterns harder to implement without OOP (e.g., complex hierarchical state)

---

## Comparison Table {#_3%EF%B8%8F%E2%83%A3-comparison-table}

| Feature           | OOP                                                 | FP                                                    |
| ----------------- | --------------------------------------------------- | ----------------------------------------------------- |
| Main Focus        | Objects & state                                     | Functions & transformations                           |
| State             | Often encapsulated; can be mutable or immutable      | Usually transformed immutably; effects still need boundaries |
| Side Effects      | Allowed                                             | Avoided                                               |
| Composition       | Object composition, delegation and polymorphism; inheritance optional | Function composition and data transformations |
| Scalability       | Good for stateful apps                              | Good for data-heavy, stateless apps                   |
| Example Use Cases | UI components with state, games, class-based models | Data pipelines, array transformations, Redux reducers |

---

## Practical Use in JS Projects {#_4%EF%B8%8F%E2%83%A3-practical-use-in-js-projects}

* **OOP:** React class components, Angular services, complex models
* **FP:** pure reducers and map/filter transformations. Hooks and streams can also own effects or mutable resources; using one does not automatically make code pure.
* **Hybrid:** Most modern JS apps mix OOP (for components/services) and FP (for state transformations).

---

### Key Takeaways {#%F0%9F%A7%A0-key-takeaways}

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

**Validation:** exact Node24.18.0 block passed five assertions, including invalid input and overflow.

## Separate practice

Apply the [focused requirements](../../practice/engineering/patterns/OOP_vs_FP.md). All learner practice remains outstanding.
