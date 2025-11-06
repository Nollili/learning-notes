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
| **Path coverage**            | % of possible execution paths tested             | Includes all combinations of branches          |

---

## 3️⃣ How to Measure Code Coverage

**Frontend / JS Tools:**
- **Jest:** Built-in coverage reporting (`--coverage`)
- **Vitest:** `--coverage` + `c8` or `istanbul`
- **Mocha + NYC / Istanbul:** `nyc mocha`
- **Coverage Reports:** Can be displayed in **text summary, HTML, or JSON**

**Example (Jest CLI):**
```bash
jest --coverage
````

Generates a report showing coverage % for **lines, functions, branches, statements**.

---

## 4️⃣ Interpreting Coverage

* **0–50%:** Insufficient, many untested paths
* **50–80%:** Moderate, room for improvement
* **80–100%:** High coverage, but **quality matters more than quantity**

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

* Code coverage = metric of **tested code**, not test quality.
* Types: **line, statement, branch, function, path**.
* Tools: Jest, Vitest, Mocha + NYC/Istanbul.
* Ideal coverage: **~80% meaningful coverage**; focus on **critical paths first**.
* Coverage should **guide testing efforts**, not replace proper test design.

> 💡 Senior Tip:
> Always combine **high coverage with well-thought-out test cases**, focusing on **behavior and edge cases** rather than just percentage numbers.

