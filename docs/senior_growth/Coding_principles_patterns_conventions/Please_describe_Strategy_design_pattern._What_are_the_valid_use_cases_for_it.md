# Please describe Strategy design pattern. What are the valid use cases for it?

# 🎯 Strategy Design Pattern in JavaScript

---

## 1️⃣ What is the Strategy Pattern?

The **Strategy pattern** is a **behavioral design pattern** that allows you to **define a family of algorithms or behaviors**, encapsulate each one, and **make them interchangeable** at runtime.

- The client code can select or change the strategy **dynamically** without modifying the core logic.
- Promotes **Open/Closed Principle**: open for extension, closed for modification.

**Key Components:**
1. **Context:** Uses a strategy
2. **Strategy Interface:** Defines a common method
3. **Concrete Strategies:** Implement the interface with different behaviors

---

## 2️⃣ Classic JavaScript Example

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

## 3️⃣ Use Cases for Strategy Pattern

### 1. Dynamic Algorithms

* When multiple algorithms exist for the same task and need to be chosen at runtime.
* Example: Sorting strategies (`quickSort`, `mergeSort`, `bubbleSort`) based on data size.

### 2. Varying Business Rules

* When behavior changes based on **conditions, user roles, or configurations**.
* Example: Pricing strategies, tax calculation, discount rules.

### 3. Payment Gateways / APIs

* Abstract multiple payment methods under a single interface.
* Example: Stripe, PayPal, BankTransfer — all implement `pay()`.

### 4. Logging / Analytics

* Switch logging strategies dynamically (console, file, remote server).

### 5. UI Rendering / Formatting

* Apply different formatting/rendering strategies based on type or device.
* Example: Date formatting for different locales, theme-based rendering.

---

## 4️⃣ Benefits of Strategy Pattern

* ✅ **Encapsulation:** Keeps algorithms separate from client code.
* ✅ **Flexibility:** Swap behaviors at runtime without modifying the context.
* ✅ **Maintainability:** Easy to add new strategies without touching existing code.
* ✅ **Testable:** Each strategy can be tested independently.

---

## 5️⃣ Strategy Pattern vs If-Else / Switch

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

### ✅ Key Takeaways

* **Strategy pattern = dynamic behavior selection**
* Best for **interchangeable algorithms**, **configurable behavior**, and **runtime decision-making**
* Common in **JS/React**:

  * Payment processors
  * Form validation
  * Sorting / filtering functions
  * UI rendering logic based on state or props

> 💡 Senior Tip:
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

**Validation:** exact example executed with Node24.18.0, all five assertions passed. **Exercise acceptance:** add a pickup rule without editing `quote`, verify boundary/negative/output contracts for every rule, and write a short decision explaining why functions, a switch or classes best fit the actual change. Learner practice remains required. [Official Node assertion API](https://nodejs.org/docs/latest-v24.x/api/assert.html) documents the check primitives.
