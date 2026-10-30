# What do you know about Decorator design pattern? Where in React.js it's used?

## Decorator Design Pattern in JavaScript and React {#%F0%9F%8E%A8-decorator-design-pattern-in-javascript-and-react}

---

## What is the Decorator Pattern? {#_1%EF%B8%8F%E2%83%A3-what-is-the-decorator-pattern}

**Definition:**  
The **Decorator pattern** is a **structural design pattern** that allows you to **dynamically add new behavior** to an object **without modifying its structure**.  

- Wrap an existing object with a new layer that **enhances or overrides functionality**.
- Promotes **open/closed principle**: open for extension, closed for modification.

### Key Concepts
- **Component:** Original object or class
- **Decorator:** Adds new behavior while keeping the original interface
- **Composition over inheritance:** Prefer wrapping objects instead of subclassing

---

## Simple JavaScript Example {#_2%EF%B8%8F%E2%83%A3-simple-javascript-example}
```js
class Coffee {
  cost() { return 5; }
}

class MilkDecorator {
  constructor(coffee) {
    this.coffee = coffee;
  }
  cost() {
    return this.coffee.cost() + 2; // add milk cost
  }
}

const plainCoffee = new Coffee();
const milkCoffee = new MilkDecorator(plainCoffee);

console.log(plainCoffee.cost()); // 5
console.log(milkCoffee.cost());  // 7
```

* Original `Coffee` object remains unchanged.
* `MilkDecorator` **extends behavior dynamically**.

---

## Decorator Pattern in React.js {#_3%EF%B8%8F%E2%83%A3-decorator-pattern-in-react-js}

In React, decorators are commonly used for **enhancing components**, often called **Higher-Order Components (HOCs)**.

### Higher-Order Component (HOC) {#%F0%9F%94%B9-higher-order-component-hoc}

* Function that **takes a component and returns an enhanced component**.
* Allows code reuse, logic separation, and behavior injection.

**Worked React example:** use the [typed event-only ActionButton adapter](../React/Composition_and_Higher-Order_Components_%28HOCs%29_in.md#typed-prop-and-ref-transparency-in-react19). It forwards props/ref, preserves caller event order, supports preventDefault, handles synchronous telemetry failure and creates the enhanced component type outside rendering.

The former withLogger sketch logged all props during render. That could expose credentials/private records and repeat side effects during interrupted/StrictMode rendering. Do not log complete props or make an analytics call just because a component function ran. Record a deliberately allowlisted event in its actual event owner and give asynchronous telemetry a bounded/error-handled policy.

An HOC is a function-to-component adapter that can resemble object decoration; it is not the same as JavaScript/TypeScript @decorator syntax. TypeScript's standard decorators and legacy experimentalDecorators have different contracts. This learning path needs the pattern and typed component adapter, not mastery of both syntax systems.

---

### Where Decorators Are Useful in React {#%F0%9F%94%B9-where-decorators-are-useful-in-react}

1. **Cross-cutting concerns**

   * Logging, analytics, error handling
2. **Authorization / Permissions**

   * Wrap components for visibility/navigation only; the server must authorize every protected operation
3. **Styling / Theming**

   * Add additional styling logic dynamically
4. **State or context injection**

   * HOCs can inject Redux or Context props

---

### Modern React Approach {#_4%EF%B8%8F%E2%83%A3-modern-react-approach}

* **HOCs** are still used, but with **React Hooks**, many decorator use cases are replaced by **custom hooks**.
* Hooks allow **composition and behavior reuse** without wrapping components, making code more readable.

---

### Key Takeaways {#%E2%9C%85-key-takeaways}

* **Decorator Pattern:** Dynamically extend object behavior.
* **In React:** Component adapters can use HOCs; do not conflate that pattern with @decorator syntax.
* Promotes **code reuse, separation of concerns, and adherence to SOLID principles**.
* Hooks can replace many HOC/decorator scenarios in modern React.


## Ordering and interface limits

The coffee wrapper preserves cost() but is not automatically every method/identity of Coffee. Nesting decorators composes behavior in order; real wrappers that add fees, discounts or resource handling may not commute. Define disposal, exceptions and exposed interface explicitly instead of promising all wrapped state/statics/ref behavior is transparent.


Official references checked 2026-10-22: [React render purity](https://react.dev/reference/rules/components-and-hooks-must-be-pure), [TypeScript decorator contracts](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#decorators).


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/patterns/What_do_you_know_about_Decorator_design_pattern_Where_in_React.js_it%27s_used.md). All learner practice remains outstanding.
