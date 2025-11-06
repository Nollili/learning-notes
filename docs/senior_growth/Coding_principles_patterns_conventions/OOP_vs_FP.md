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
| State             | Mutable                                             | Immutable                                             |
| Side Effects      | Allowed                                             | Avoided                                               |
| Composition       | Inheritance, Polymorphism                           | Function composition                                  |
| Scalability       | Good for stateful apps                              | Good for data-heavy, stateless apps                   |
| Example Use Cases | UI components with state, games, class-based models | Data pipelines, array transformations, Redux reducers |

---

## 4️⃣ Practical Use in JS Projects

* **OOP:** React class components, Angular services, complex models
* **FP:** React hooks (useReducer, map/filter), RxJS streams, Redux reducers
* **Hybrid:** Most modern JS apps mix OOP (for components/services) and FP (for state transformations).

---

### 🧠 Key Takeaways

1. **OOP:** Better for **stateful entities** and modeling real-world objects.
2. **FP:** Better for **stateless transformations**, predictable code, and **avoiding side effects**.
3. **In JS:** Use **FP for data manipulation** and **OOP for structural organization**.
4. **Senior tip:** Understanding both paradigms allows you to **choose the best approach per problem** and write maintainable, performant applications.
