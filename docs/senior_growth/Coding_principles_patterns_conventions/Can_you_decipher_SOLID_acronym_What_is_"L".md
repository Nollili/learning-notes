# Can you decipher SOLID acronym? What is "L"?

# 🏗️ SOLID Principles in OOP

**SOLID** is an acronym describing **five principles for writing maintainable, scalable, and robust object-oriented code**.  

- S — **Single Responsibility Principle (SRP)**
- O — **Open/Closed Principle (OCP)**
- L — **Liskov Substitution Principle (LSP)**
- I — **Interface Segregation Principle (ISP)**
- D — **Dependency Inversion Principle (DIP)**

---

## 🔹 L — Liskov Substitution Principle (LSP)

**Definition:**  
> “Objects of a superclass should be replaceable with objects of a subclass **without affecting the correctness of the program**.”  
> — Barbara Liskov

In simple terms: **Subtypes must be substitutable for their base types.**

### ✅ Key Idea
- Subclasses should **honor the behavior** of their parent classes.
- They should not **break expected functionality**.
- No unexpected side effects when replacing a base class with a derived class.

---

### Example (Violation of LSP)
```js
class Bird {
  fly() { console.log('Flying'); }
}

class Penguin extends Bird {
  fly() { throw new Error('Penguins cannot fly'); }
}

function makeBirdFly(bird) {
  bird.fly();
}

const penguin = new Penguin();
makeBirdFly(penguin); // ❌ Throws error, violates LSP
````

**Problem:** `Penguin` cannot fully substitute `Bird`.

---

### Correct Approach (Respect LSP)

```js
class Bird {}
class FlyingBird extends Bird {
  fly() { console.log('Flying'); }
}
class Penguin extends Bird {}

const birds = [new FlyingBird(), new Penguin()];
// Only call fly on birds that can fly
birds.forEach(bird => {
  if (bird.fly) bird.fly(); // ✅ safe
});
```

* Alternatively, **split interfaces** so that only flying birds have `fly()` method.
* Ensures subclasses can always substitute base types without breaking behavior.

---

### ✅ Why LSP Matters

* Makes **polymorphism reliable**
* Avoids runtime errors from incompatible subclasses
* Improves **code maintainability and predictability**
* Essential for **clean, extensible OOP design**

---

> **Tip for Senior Developers:**
> When designing class hierarchies, always ask:
> *“If I replace the parent class with this subclass, will existing code still work correctly?”*



## 1️⃣ S – Single Responsibility Principle (SRP)

- **Definition:** A class or module should have **only one reason to change**, meaning it should have **only one responsibility**.
- **Why important:** Reduces complexity, improves maintainability, and makes code easier to test.
- **Example:**
```ts
  // Bad: Handles both data storage and email notification
  class UserManager {
    saveUser(user) { /* ... */ }
    sendWelcomeEmail(user) { /* ... */ }
  }

  // Good: Separate responsibilities
  class UserRepository {
    save(user) { /* ... */ }
  }
  class EmailService {
    sendWelcomeEmail(user) { /* ... */ }
  }
````

---

## 2️⃣ O – Open/Closed Principle (OCP)

* **Definition:** Software entities (classes, modules, functions) should be **open for extension but closed for modification**.
* **Why important:** Allows adding new functionality without changing existing code, reducing risk of bugs.
* **Example:**

  ```ts
  interface Shape { area(): number; }

  class Rectangle implements Shape { /* ... */ }
  class Circle implements Shape { /* ... */ }

  function calculateArea(shapes: Shape[]) {
    return shapes.reduce((sum, shape) => sum + shape.area(), 0);
  }
  ```

---

## 4️⃣ I – Interface Segregation Principle (ISP)

* **Definition:** Clients should not be forced to depend on interfaces they **do not use**. Use multiple, small, specific interfaces instead of one large one.
* **Why important:** Reduces coupling and improves maintainability.
* **Example:**

  ```ts
  interface Printer { print(): void; }
  interface Scanner { scan(): void; }

  class MultiFunctionDevice implements Printer, Scanner { /* ... */ }
  ```

---

## 5️⃣ D – Dependency Inversion Principle (DIP)

* **Definition:** High-level modules should **not depend on low-level modules**; both should depend on **abstractions**. Abstractions should not depend on details; **details should depend on abstractions**.
* **Why important:** Promotes decoupling and easier testing (e.g., via dependency injection).
* **Example:**

  ```ts
  interface MessageService { send(msg: string): void; }

  class EmailService implements MessageService { send(msg: string) { /* ... */ } }

  class Notification {
    constructor(private service: MessageService) {}
    notify(msg: string) { this.service.send(msg); }
  }
  ```