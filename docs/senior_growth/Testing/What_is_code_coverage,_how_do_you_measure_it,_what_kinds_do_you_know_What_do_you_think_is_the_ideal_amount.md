# What is code coverage, how do you measure it, what kinds do you know? What do you think is the ideal amount?

# 📝 Code Coverage in Software Testing

**Code coverage** is a metric that shows **how much of your code is exercised by automated tests**. It helps identify **untested areas** and improve test quality.

---

## 1️⃣ What Code Coverage Measures

- Measures the **percentage of code executed** during tests.
- Helps ensure that critical paths are tested and reduces the chance of **undetected bugs**.
- **Important:** High coverage ≠ high quality — tests still need to be meaningful.

---

## 2️⃣ Types of Code Coverage

| Type                        | What It Measures                                   | Example                                           |
|------------------------------|--------------------------------------------------|--------------------------------------------------|
| **Line coverage**            | % of lines of code executed                       | A `sum()` function line is executed in a test   |
| **Statement coverage**       | % of statements executed                          | Includes all JS statements, even multi-line    |
| **Branch coverage**          | % of branches (if/else, switch cases) executed   | Tests both true and false conditions           |
| **Function / Method coverage** | % of functions/methods called                     | Ensures all functions are invoked at least once|
| **Path coverage** (conceptual) | Combinations of branch outcomes along execution paths | Standard Jest metrics do not provide exhaustive path coverage; loops can create unbounded paths |

---

## 3️⃣ How to Measure Code Coverage

**Frontend / JS Tools:**
- **Jest:** Built-in coverage reporting (`--coverage`)
- **Vitest5:** `--coverage` with the optional `@vitest/coverage-v8` or `@vitest/coverage-istanbul` provider matching the installed Vitest version; configure `provider: 'v8'` or `'istanbul'`. “c8” is not the current Vitest provider name.
- **Mocha + NYC / Istanbul:** `nyc mocha`
- **Coverage Reports:** Can be displayed in **text summary, HTML, or JSON**

**Example (Jest CLI):**
```bash
jest --coverage
```

Generates a report showing coverage % for **lines, functions, branches, statements**.

---

## 4️⃣ Interpreting Coverage

A percentage must name its metric and denominator: which production files were included, what was excluded/generated, tool/provider/version and whether unimported files were counted. A low percentage can expose important gaps; a high one can still miss a critical assertion. Choose thresholds from risk and change scope rather than universal “good/bad” bands.

**Important:**

* Focus on **testing critical logic first** (core algorithms, components, API calls).
* Don’t blindly aim for 100% coverage — meaningless tests add maintenance cost.

---

## 5️⃣ Best Practices

1. **Combine with meaningful tests** — ensure tests check actual behavior, not just execution.
2. **Use coverage to identify gaps**, not as a strict goal.
3. **Monitor branches and edge cases** — catching bugs in conditionals is more important than hitting all lines.
4. **CI integration** — enforce minimum coverage thresholds for new code.

---

### ✅ Key Takeaways

* Code coverage = metric of **executed instrumented code**, not verified behavior or test quality.
* Types: **line, statement, branch, function, path**.
* Tools: Jest, Vitest, Mocha + NYC/Istanbul.
* No universal ideal percentage: choose risk-based line/branch/function/statement gates, include/exclude rules and direct critical-behavior tests. 80% is only an example policy.
* Coverage should **guide testing efforts**, not replace proper test design.

> 💡 Senior Tip:
> Always combine **high coverage with well-thought-out test cases**, focusing on **behavior and edge cases** rather than just percentage numbers.



## Executed counterexample: 100% coverage misses a bug

In an owned Node24.18.0 scratch directory, create:

```js
// arithmetic.mjs
export function add(a, b) { return a - b; } // Deliberate defect.
```

```js
// weak.test.mjs
import {test} from 'node:test';
import {add} from './arithmetic.mjs';
test('only executes the function', () => { add(2, 3); });
```

`node --test --test-reporter=tap --experimental-test-coverage weak.test.mjs` actually passed and reported **100% lines, branches and functions** for this one arithmetic file. This uses Node's built-in experimental coverage, not Jest/Vitest, and makes no statement about this repository's overall coverage. The function is wrong despite the report.

```js
// strong.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {add} from './arithmetic.mjs';
test('adds the two operands', () => { assert.equal(add(2, 3), 5); });
```

`node --test --test-reporter=tap strong.test.mjs` actually failed with an assertion error. This failure is useful evidence: it observes the required result. Fixing subtraction to addition is learner work; add boundary and type/domain cases according to a stated contract instead of assuming every possible numeric input is valid.

**Acceptance:** reproduce both outcomes, explain the metric/denominator and add a defect a behavioral assertion catches while coverage stays high. Configure relevant thresholds in an owned project, preserving Autocode's template Jest scripts and Module4 Cobertura settings. Record provider versions, exclusions and results. Learner practice remains required. References: [Vitest coverage providers](https://vitest.dev/guide/coverage.html), [Jest thresholds](https://jestjs.io/docs/configuration#coveragethreshold-object), [Node24 coverage](https://nodejs.org/docs/latest-v24.x/api/test.html#collecting-code-coverage).
