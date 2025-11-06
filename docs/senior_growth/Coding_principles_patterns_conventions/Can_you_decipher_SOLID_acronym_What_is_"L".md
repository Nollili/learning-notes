# Can you decipher SOLID acronym? What is "L"?

````markdown
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

```
```
