# FIRST principles - how a good unit test looks like?

# 🧪 FIRST Principles for Unit Tests

**Unit tests** verify the behavior of **small, isolated units of code** (functions, methods, or components). Writing **good unit tests** is critical for maintainable, reliable software. The **FIRST principles** provide a guideline.

---

## 1️⃣ What are FIRST Principles?

The acronym **FIRST** describes **qualities of high-quality unit tests**:

| Letter | Meaning | Description |
|--------|---------|------------|
| **F**  | **Fast** | Tests should execute quickly to provide immediate feedback. No network, database, or heavy dependencies in unit tests. |
| **I**  | **Independent** | Each test should run independently of others. No shared state or order dependency. |
| **R**  | **Repeatable** | Tests should pass consistently on any machine, any time, without relying on environment or external resources. |
| **S**  | **Self-Validating** | Tests should have **assertions** and produce a **clear pass/fail result** automatically. |
| **T**  | **Timely** | Write tests **before or alongside the code**, not after. Catch bugs early during development. |

---

## 2️⃣ Characteristics of a Good Unit Test

1. **Small and focused**
   - Tests **one coherent behavior** per test; it may involve multiple functions or assertions
2. **Clear and readable**
   - Easy to understand what is being tested and expected
3. **Deterministic**
   - Produces the **same result every time**
4. **Fast**
   - Can be run **frequently**, e.g., on every commit
5. **Automated**
   - Runs without manual intervention in CI/CD pipelines
6. **Meaningful Assertions**
   - Test behavior, not just that the code executes
7. **Independent**
   - Can run in any order without side effects

---

## 3️⃣ Example of a Good Unit Test

```js
// Simple pure function
function sum(a, b) {
  return a + b;
}

// Unit test with FIRST principles
test('sum adds two numbers correctly', () => {
  expect(sum(2, 3)).toBe(5); // Self-validating
});
```

* ✅ **Fast:** Runs in milliseconds
* ✅ **Independent:** No shared state
* ✅ **Repeatable:** Always passes with same inputs
* ✅ **Self-Validating:** Uses assertion
* ✅ **Timely:** Can be written while implementing `sum`

---

## 4️⃣ Example with a React Component

```js
import { render, screen } from '@testing-library/react';
import Button from './Button';

test('renders button with label', () => {
  render(<Button label="Click me" />);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

* **Focused:** Only tests label rendering
* **Independent:** No external dependencies
* **Repeatable & fast:** Pure DOM render
* **Self-validating:** Assertion ensures pass/fail

---

## ✅ Key Takeaways

* **FIRST = Fast, Independent, Repeatable, Self-Validating, Timely**
* A **good unit test** is small, focused, deterministic, and readable
* Focus on **behavior verification** rather than implementation details
* Proper unit tests make **refactoring safe** and **catch bugs early**

> 💡 Senior Tip:
> Strive for a **suite of FIRST unit tests** covering all **critical business logic**, then complement with **integration and E2E tests** to check important cross-boundary behavior; no suite establishes every possible outcome.



## Fixtures, cleanup and async interactions

Follow the [executed configuration TDD lesson](./TDD_-_pros_and_cons(red,_green,_refactor).md#config-tdd). Its parser cases need no setup; its injected loader uses a deferred promise to control completion and an identity assertion for propagated failure. Its filesystem integration case creates a unique temporary directory and registers `t.after` cleanup immediately, before writing/asserting. Await both the subject and cleanup; an unreturned promise can make a test pass before work fails. Always reset mocks, timers, subscriptions and global state owned by a test.

Repeatability means declaring runtime, fixtures, time/locale/random inputs and dependencies; a database integration test can be repeatable with isolated data even though it is not a fast unit test. Do not mock away the behavior being verified: use the real database for transaction semantics and a native browser for layout/assistive-technology checks. Fake timers help test a deadline policy but do not prove actual process shutdown or network cancellation.

**Acceptance:** run the eight-case linked suite in an owned directory, show expected red failure and green/refactor success, verify temporary files are removed even on a forced assertion failure, and add an async rejection case without sleeps. Explain what the test does not cover. Existing restricted `src/tests` must remain untouched; use project-approved locations/configuration. The exact authored fixture passed locally; learner execution and cleanup-failure demonstration remain required. [Official Node test hooks/activity guidance](https://nodejs.org/docs/latest-v24.x/api/test.html) documents the APIs; use [Jest lifecycle hooks](https://jestjs.io/docs/setup-teardown) when the template uses Jest.
