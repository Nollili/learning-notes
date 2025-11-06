# What are the common pitfalls when applying a design pattern?
# ⚠️ Common Pitfalls When Applying Design Patterns in JavaScript

Design patterns are powerful tools, but **misusing them can introduce complexity, reduce maintainability, or hurt performance**. Here’s a detailed overview of common pitfalls to avoid.

---

## 1️⃣ Overengineering / Premature Optimization
- Applying patterns **before there’s a real need**.
- Example: Using Observer or Decorator for a small component that doesn’t require dynamic behavior.
- **Consequence:** Extra abstraction makes code harder to read, maintain, and debug.

**Tip:**  
> Only introduce a pattern when there’s a clear requirement or recurring problem.

---

## 2️⃣ Misusing Inheritance Instead of Composition
- Over-reliance on class hierarchies can lead to:
  - Deep, rigid inheritance trees
  - Fragile base classes where changes propagate unexpectedly
- Example: A “Bird” class with subclasses like “Penguin” violating LSP (cannot fly).

**Tip:**  
> Prefer **composition over inheritance** for flexibility and decoupling.

---

## 3️⃣ Ignoring Single Responsibility Principle
- Using a pattern but packing too much functionality into a single class/object.
- Example: A Singleton that handles logging, caching, and API requests all in one.
- **Consequence:** Difficult to test, extend, or replace.

**Tip:**  
> Keep components **focused and modular**. One pattern per responsibility.

---

## 4️⃣ Overusing HOCs or Decorators in React
- Excessive nesting of HOCs can lead to:
  - “Wrapper hell”
  - Hard-to-debug component trees
- Example: `<withAuth(withLogger(withTheme(MyComponent))) />`

**Tip:**  
> Use **hooks** and composition to simplify behavior reuse instead of deep HOC chains.

---

## 5️⃣ Breaking Liskov Substitution Principle (LSP)
- Creating subclasses that **cannot fully replace their base classes**.
- Example: Subclass overriding method in a way that throws errors for valid base-class calls.

**Tip:**  
> Ensure **subtypes respect the parent interface and behavior**.

---

## 6️⃣ Overcomplicating with Patterns for Simple Problems
- Applying patterns like Strategy, Factory, or Observer for trivial functionality.
- **Consequence:** Code becomes harder to understand and maintain.

**Tip:**  
> Evaluate **simplicity first**, then introduce patterns gradually.

---

## 7️⃣ Ignoring Immutability with State Patterns
- When combining patterns with **shared mutable state**, it can lead to:
  - Unexpected side effects
  - Hard-to-trace bugs in reactive apps (React, Redux)
- Example: A Decorator modifying an object’s state directly instead of returning a new object.

**Tip:**  
> Prefer **immutable updates** to avoid subtle state issues.

---

## 8️⃣ Mixing Multiple Patterns Indiscriminately
- Applying too many patterns together without clear boundaries.
- Example: Singleton + Factory + Observer in one module without clear separation.
- **Consequence:** Increases cognitive load, debugging difficulty, and coupling.

**Tip:**  
> Keep patterns **isolated and purposeful**. Use one pattern per concern.

---

## 9️⃣ Performance Pitfalls
- Some patterns introduce **extra objects, wrappers, or function calls**.
- Example:
  - Deeply nested Decorators or HOCs in React
  - Observer with many subscribers firing frequently
- **Consequence:** Can reduce performance, especially in UI rendering.

**Tip:**  
> Use **memoization, throttling, or selective subscriptions** where necessary.

---

## 10️⃣ Not Considering Testing Implications
- Patterns that introduce hidden state or complex interactions can make testing harder.
- Example: Singleton storing global state across tests.
- **Tip:**  
> Always design patterns with **testability** in mind:
  - Inject dependencies
  - Avoid global mutable state
  - Favor pure functions for easier unit testing

---

### ✅ Key Takeaways

1. Patterns are **tools, not rules**; apply them only when necessary.  
2. **Keep it simple** — don’t overcomplicate solutions.  
3. **Focus on readability, maintainability, and testability.**  
4. Use **composition, immutability, and modular design** to avoid pitfalls.  
5. Always evaluate **performance and side effects**, especially in reactive apps like React.

> 💡 Senior Tip:  
> A true sign of mastery is knowing **when NOT to use a pattern**.
```
