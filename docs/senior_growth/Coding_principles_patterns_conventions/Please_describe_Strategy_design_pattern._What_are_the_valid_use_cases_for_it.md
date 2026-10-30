# Please describe Strategy design pattern. What are the valid use cases for it?

## Strategy Design Pattern in JavaScript {#%F0%9F%8E%AF-strategy-design-pattern-in-javascript}

---

## What is the Strategy Pattern? {#_1%EF%B8%8F%E2%83%A3-what-is-the-strategy-pattern}

The **Strategy pattern** is a **behavioral design pattern** that allows you to **define a family of algorithms or behaviors**, encapsulate each one, and **make them interchangeable** at runtime.

- The client code can select or change the strategy **dynamically** without modifying the core logic.
- Promotes **Open/Closed Principle**: open for extension, closed for modification.

**Key Components:**
1. **Context:** Uses a strategy
2. **Strategy Interface:** Defines a common method
3. **Concrete Strategies:** Implement the interface with different behaviors

---

## Classic JavaScript Example {#_2%EF%B8%8F%E2%83%A3-classic-javascript-example}

```js
// Strategy Interface: all strategies must implement `execute`
class Strategy {
  execute(a, b) { throw new Error('Not implemented'); }
}

// Concrete Strategies
class AddStrategy extends Strategy {
  execute(a, b) { return a + b; }
}

class MultiplyStrategy extends Strategy {
  execute(a, b) { return a * b; }
}

// Context
class Calculator {
  constructor(strategy) {
    this.strategy = strategy;
  }
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  calculate(a, b) {
    return this.strategy.execute(a, b);
  }
}

// Usage
const calc = new Calculator(new AddStrategy());
console.log(calc.calculate(2, 3)); // 5

calc.setStrategy(new MultiplyStrategy());
console.log(calc.calculate(2, 3)); // 6
```

**Explanation:**

* `Calculator` is the **context**.
* `AddStrategy` and `MultiplyStrategy` are **concrete strategies**.
* Switching behavior is easy **without modifying Calculator**.

---

## Use Cases for Strategy Pattern {#_3%EF%B8%8F%E2%83%A3-use-cases-for-strategy-pattern}

### Dynamic Algorithms {#_1-dynamic-algorithms}

* When multiple algorithms exist for the same task and need to be chosen at runtime.
* Example: Sorting strategies (`quickSort`, `mergeSort`, `bubbleSort`) based on data size.

### Varying Business Rules {#_2-varying-business-rules}

* When behavior changes based on **conditions, user roles, or configurations**.
* Example: Pricing strategies, tax calculation, discount rules.

### Payment Gateways / APIs {#_3-payment-gateways-apis}

* Abstract multiple payment methods under a single interface.
* Example: Stripe, PayPal, BankTransfer — all implement `pay()`.

### Logging / Analytics {#_4-logging-analytics}

* Switch logging strategies dynamically (console, file, remote server).

### UI Rendering / Formatting {#_5-ui-rendering-formatting}

* Apply different formatting/rendering strategies based on type or device.
* Example: Date formatting for different locales, theme-based rendering.

---

## Benefits of Strategy Pattern {#_4%EF%B8%8F%E2%83%A3-benefits-of-strategy-pattern}

* **Encapsulation:** Keeps algorithms separate from client code.
* **Flexibility:** Swap behaviors at runtime without modifying the context.
* **Maintainability:** Easy to add new strategies without touching existing code.
* **Testable:** Each strategy can be tested independently.

---

## Strategy Pattern vs If-Else / Switch {#_5%EF%B8%8F%E2%83%A3-strategy-pattern-vs-if-else-switch}

**Without Strategy:**

```js
function calculate(a, b, type) {
  if (type === 'add') return a + b;
  if (type === 'multiply') return a * b;
}
```

**Problems:**

* Hard to scale with new behaviors
* Adding a behavior changes this dispatch point; that is acceptable for a small stable set.
* Logic is tightly coupled to context

**With Strategy:**

* New behavior can be added **without changing existing code**
* Clear separation of concerns

---

### Key Takeaways {#%E2%9C%85-key-takeaways}

* **Strategy pattern = dynamic behavior selection**
* Best for **interchangeable algorithms**, **configurable behavior**, and **runtime decision-making**
* Common in **JS/React**:

  * Payment processors
  * Form validation
  * Sorting / filtering functions
  * UI rendering logic based on state or props

> Senior Tip:
> Extract strategies when independently changing algorithms share a useful contract. A short, exhaustive switch can be the clearest design for a fixed set; adding classes alone does not improve it.


## Worked change: inject a shipping quote rule

Requirement: standard delivery costs 5, express costs 12, and orders of at least 100 receive free **standard** delivery. Rules change independently from checkout rendering. Values below are integer units in one illustrative currency; production money needs an explicit minor-unit/rounding contract.

```js
import assert from 'node:assert/strict';
const standard = subtotal => subtotal >= 100 ? 0 : 5;
const express = _subtotal => 12;
function quote(subtotal, rule) {
  if (!Number.isSafeInteger(subtotal) || subtotal < 0) throw new RangeError('Invalid subtotal');
  const fee = rule(subtotal);
  if (!Number.isSafeInteger(fee) || fee < 0) throw new RangeError('Invalid fee');
  return fee;
}
assert.equal(quote(99, standard), 5);
assert.equal(quote(100, standard), 0);
assert.equal(quote(100, express), 12);
assert.throws(() => quote(-1, standard), RangeError);
assert.throws(() => quote(100, () => NaN), RangeError);
```

This is Strategy through functions: checkout owns the calculation boundary and injects one pure algorithm. A map or switch still selects the rule at the application boundary; the pattern does not remove all decisions. Keep a switch if only two stable cases exist and no independent evolution or injection is needed. Do not catch payment failures and silently substitute another gateway: async strategies also need common timeout, cancellation, idempotency and error semantics.

**Validation:** exact example executed with Node24.18.0, all five assertions passed.

## Separate practice

Apply the [focused requirements](../../practice/engineering/patterns/Please_describe_Strategy_design_pattern._What_are_the_valid_use_cases_for_it.md). All learner practice remains outstanding.
