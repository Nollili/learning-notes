# FIRST principles - how a good unit test looks like?

## FIRST Principles for Unit Tests {#%F0%9F%A7%AA-first-principles-for-unit-tests}

**Unit tests** verify the behavior of **small, isolated units of code** (functions, methods, or components). Writing **good unit tests** is critical for maintainable, reliable software. The **FIRST principles** provide a guideline.

---

## What are FIRST Principles? {#_1%EF%B8%8F%E2%83%A3-what-are-first-principles}

The acronym **FIRST** describes **qualities of high-quality unit tests**:

| Letter | Meaning | Description |
|--------|---------|------------|
| **F**  | **Fast** | Tests should execute quickly to provide immediate feedback. Keep pure unit tests small; separate database/network integration checks instead of claiming those boundaries through mocks. |
| **I**  | **Independent** | Each test should run independently of others. No shared state or order dependency. |
| **R**  | **Repeatable** | Tests should pass consistently on any machine, any time, without relying on environment or external resources. |
| **S**  | **Self-Validating** | Tests should have **assertions** and produce a **clear pass/fail result** automatically. |
| **T**  | **Timely** | Write tests **before or alongside the code**, not after. Catch bugs early during development. |

---

## Characteristics of a Good Unit Test {#_2%EF%B8%8F%E2%83%A3-characteristics-of-a-good-unit-test}

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

## Example of a Good Unit Test {#_3%EF%B8%8F%E2%83%A3-example-of-a-good-unit-test}

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

* **Fast:** Runs in milliseconds
* **Independent:** No shared state
* **Repeatable:** Always passes with same inputs
* **Self-Validating:** Uses assertion
* **Timely:** Can be written while implementing `sum`

---

## Example with a React Component {#_4%EF%B8%8F%E2%83%A3-example-with-a-react-component}

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

## Key Takeaways {#%E2%9C%85-key-takeaways}

* **FIRST = Fast, Independent, Repeatable, Self-Validating, Timely**
* A **good unit test** is small, focused, deterministic, and readable
* Focus on **behavior verification** rather than implementation details
* Proper unit tests make **refactoring safe** and **catch bugs early**

> Senior Tip:
> Strive for a **suite of FIRST unit tests** covering all **critical business logic**, then complement with **integration and E2E tests** to check important cross-boundary behavior; no suite establishes every possible outcome.


## Fixtures, cleanup and async interactions

Follow the [executed configuration TDD lesson](./TDD_-_pros_and_cons(red,_green,_refactor).md#config-tdd). Its parser cases need no setup; its injected loader uses a deferred promise to control completion and an identity assertion for propagated failure. Its filesystem integration case creates a unique temporary directory and registers `t.after` cleanup immediately, before writing/asserting. Await both the subject and cleanup; an unreturned promise can make a test pass before work fails. Always reset mocks, timers, subscriptions and global state owned by a test.

Repeatability means declaring runtime, fixtures, time/locale/random inputs and dependencies; a database integration test can be repeatable with isolated data even though it is not a fast unit test. Do not mock away the behavior being verified: use the real database for transaction semantics and a native browser for layout/assistive-technology checks. Fake timers help test a deadline policy but do not prove actual process shutdown or network cancellation.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/testing/FIRST_principles_-_how_a_good_unit_test_looks_like.md). All learner practice remains outstanding.
