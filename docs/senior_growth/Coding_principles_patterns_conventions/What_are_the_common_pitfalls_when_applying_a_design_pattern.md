# What are the common pitfalls when applying a design pattern?
## Common Pitfalls When Applying Design Patterns in JavaScript {#%E2%9A%A0%EF%B8%8F-common-pitfalls-when-applying-design-patterns-in-javascript}

Design patterns are powerful tools, but **misusing them can introduce complexity, reduce maintainability, or hurt performance**. Here’s a detailed overview of common pitfalls to avoid.

---

## Overengineering / Premature Optimization {#_1%EF%B8%8F%E2%83%A3-overengineering-premature-optimization}
- Applying patterns **before there’s a real need**.
- Example: Using Observer or Decorator for a small component that doesn’t require dynamic behavior.
- **Consequence:** Extra abstraction makes code harder to read, maintain, and debug.

**Tip:**  
> Only introduce a pattern when there’s a clear requirement or recurring problem.

---

## Misusing Inheritance Instead of Composition {#_2%EF%B8%8F%E2%83%A3-misusing-inheritance-instead-of-composition}
- Over-reliance on class hierarchies can lead to:
  - Deep, rigid inheritance trees
  - Fragile base classes where changes propagate unexpectedly
- Example: A “Bird” class with subclasses like “Penguin” violating LSP (cannot fly).

**Tip:**  
> Prefer **composition over inheritance** for flexibility and decoupling.

---

## Ignoring Single Responsibility Principle {#_3%EF%B8%8F%E2%83%A3-ignoring-single-responsibility-principle}
- Using a pattern but packing too much functionality into a single class/object.
- Example: A Singleton that handles logging, caching, and API requests all in one.
- **Consequence:** Difficult to test, extend, or replace.

**Tip:**  
> Keep components **focused and modular**. One pattern per responsibility.

---

## Overusing HOCs or Decorators in React {#_4%EF%B8%8F%E2%83%A3-overusing-hocs-or-decorators-in-react}
- Excessive nesting of HOCs can lead to:
  - “Wrapper hell”
  - Hard-to-debug component trees
- Invalid JSX illustration replaced with a valid two-step composition (the HOCs and component must be defined/imported):

```jsx
const Enhanced = withAuth(withLogger(withTheme(MyComponent)));
// Inside a parent render:
<Enhanced />;
```

Create the enhanced component at module scope when appropriate; recreating a component type during each render can reset subtree state.

**Tip:**  
> Use **hooks** and composition to simplify behavior reuse instead of deep HOC chains.

---

## Breaking Liskov Substitution Principle (LSP) {#_5%EF%B8%8F%E2%83%A3-breaking-liskov-substitution-principle-lsp}
- Creating subclasses that **cannot fully replace their base classes**.
- Example: Subclass overriding method in a way that throws errors for valid base-class calls.

**Tip:**  
> Ensure **subtypes respect the parent interface and behavior**.

---

## Overcomplicating with Patterns for Simple Problems {#_6%EF%B8%8F%E2%83%A3-overcomplicating-with-patterns-for-simple-problems}
- Applying patterns like Strategy, Factory, or Observer for trivial functionality.
- **Consequence:** Code becomes harder to understand and maintain.

**Tip:**  
> Evaluate **simplicity first**, then introduce patterns gradually.

---

## Ignoring Immutability with State Patterns {#_7%EF%B8%8F%E2%83%A3-ignoring-immutability-with-state-patterns}
- When combining patterns with **shared mutable state**, it can lead to:
  - Unexpected side effects
  - Hard-to-trace bugs in reactive apps (React, Redux)
- Example: A Decorator modifying an object’s state directly instead of returning a new object.

**Tip:**  
> Prefer **immutable updates** to avoid subtle state issues.

---

## Mixing Multiple Patterns Indiscriminately {#_8%EF%B8%8F%E2%83%A3-mixing-multiple-patterns-indiscriminately}
- Applying too many patterns together without clear boundaries.
- Example: Singleton + Factory + Observer in one module without clear separation.
- **Consequence:** Increases cognitive load, debugging difficulty, and coupling.

**Tip:**  
> Keep patterns **isolated and purposeful**. Use one pattern per concern.

---

## Performance Pitfalls {#_9%EF%B8%8F%E2%83%A3-performance-pitfalls}
- Some patterns introduce **extra objects, wrappers, or function calls**.
- Example:
  - Deeply nested Decorators or HOCs in React
  - Observer with many subscribers firing frequently
- **Consequence:** Can reduce performance, especially in UI rendering.

**Tip:**  
> Use **memoization, throttling, or selective subscriptions** where necessary.

---

## Not Considering Testing Implications {#_10%EF%B8%8F%E2%83%A3-not-considering-testing-implications}
- Patterns that introduce hidden state or complex interactions can make testing harder.
- Example: Singleton storing global state across tests.
- **Tip:**  
> Always design patterns with **testability** in mind:
  - Inject dependencies
  - Avoid global mutable state
  - Favor pure functions for easier unit testing

---

### Key Takeaways {#%E2%9C%85-key-takeaways}

1. Patterns are **tools, not rules**; apply them only when necessary.  
2. **Keep it simple** — don’t overcomplicate solutions.  
3. **Focus on readability, maintainability, and testability.**  
4. Use **composition, immutability, and modular design** to avoid pitfalls.  
5. Always evaluate **performance and side effects**, especially in reactive apps like React.

> Senior Tip:
> A true sign of mastery is knowing **when NOT to use a pattern**.


## Refactor from a concrete change

Use [shipping-rule Strategy](./Please_describe_Strategy_design_pattern._What_are_the_valid_use_cases_for_it.md#worked-change-inject-a-shipping-quote-rule) when algorithms change independently, [creation/ownership checks](./What_kind_of_creational_design_patterns_do_you_know.md#ownership-and-creation-checks) when construction leaks mutable state, and [DRY's domain-rule distinction](./Please_describe_what_is_KISS,_DRY,_YAGNI.md#decide-what-must-change-together) to avoid extracting coincidental syntax. A pattern is justified by clearer ownership or a required variation point, not by the count of patterns in a module.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/patterns/What_are_the_common_pitfalls_when_applying_a_design_pattern.md). All learner practice remains outstanding.
