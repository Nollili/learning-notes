# Please describe what is KISS, DRY, YAGNI

## Key Software Development Principles: KISS, DRY, YAGNI {#%F0%9F%93%9D-key-software-development-principles-kiss-dry-yagni}

These are **foundational principles** for writing **clean, maintainable, and efficient code**, often referenced in **senior-level discussions**.

---

Here’s a breakdown of the acronyms:

1. **KISS** — **Keep It Simple, Stupid**  
   - Focuses on **simplicity**. Don’t overcomplicate solutions.  

2. **DRY** — **Don’t Repeat Yourself**  
   - Encourages **avoiding code duplication**. Represent each shared domain rule in one authoritative place; similar syntax can express unrelated knowledge.  

3. **YAGNI** — **You Aren’t Gonna Need It**  
   - Warns against **prematurely building features** that aren’t currently required.  

---

## KISS — Keep It Simple, Stupid {#_1%EF%B8%8F%E2%83%A3-kiss-%E2%80%94-keep-it-simple-stupid}

**Definition:**  
> Favor simplicity over complexity. Avoid overengineering or making things more complicated than necessary.

**Key Ideas:**
- Write code that is **easy to read and understand**.
- Simple solutions are **more maintainable** and **less error-prone**.
- Complexity should be introduced **only when necessary**.

**Example (Bad KISS):**
```js
function getEvenNumbers(arr) {
  return arr.filter(num => num % 2 === 0 ? true : false);
}
```

**Improved (Simple):**

```js
function getEvenNumbers(arr) {
  return arr.filter(num => num % 2 === 0);
}
```

**Use Cases:**

* Algorithm design
* Component architecture in React
* API design

---

## DRY — Don’t Repeat Yourself {#_2%EF%B8%8F%E2%83%A3-dry-%E2%80%94-don-t-repeat-yourself}

**Definition:**

> Avoid duplicating code. Every piece of knowledge should have a **single, unambiguous representation**.

**Key Ideas:**

* Extract reusable functions, components, or modules.
* Prevents bugs due to **multiple copies needing updates**.
* Improves maintainability and scalability.

**Coincidental similarity, not automatically a DRY violation:**

```js
function calculateArea(width, height) { return width * height; }
function calculateVolume(width, height, depth) { return width * height * depth; }
```

**An arithmetic utility, not automatically an improvement:**

```js
function multiply(...args) {
  return args.reduce((acc, val) => acc * val, 1);
}

const area = multiply(3, 4); // 12
const volume = multiply(3, 4, 5); // 60
```

**Use Cases:**

* Shared utility functions
* React components
* CSS / styling (avoid repeated styles)

---

## YAGNI — You Aren’t Gonna Need It {#_3%EF%B8%8F%E2%83%A3-yagni-%E2%80%94-you-aren-t-gonna-need-it}

**Definition:**

> Don’t implement functionality **until it is actually needed**.

**Key Ideas:**

* Avoid speculative features or over-engineered abstractions.
* Focus on **current requirements**, not future “what ifs”.
* Reduces complexity, maintenance burden, and wasted development time.

**Example (Bad YAGNI):**

```js
function fetchData() {
  // preemptively adding caching and retry logic
}
```

**Minimal sketch (not a complete production request boundary):**

```js
function fetchData() {
  return fetch('/api/data');
}
```

* Add caching or retries when requirements justify them. YAGNI cannot remove required authorization, validation, deadlines, response-status handling, cancellation or observability. A bare fetch is only a sketch; it does not reject HTTP error status by itself.

**Use Cases:**

* Feature development
* Refactoring and architecture planning
* API design

---

## Comparison Table {#%E2%9A%96%EF%B8%8F-comparison-table}

| Principle | Focus      | Benefits                            | Risks if Ignored                 |
| --------- | ---------- | ----------------------------------- | -------------------------------- |
| KISS      | Simplicity | Easier to maintain, read, debug     | Over-engineered, complex code    |
| DRY       | Reuse      | Less duplication, fewer bugs        | Repeated logic, harder updates   |
| YAGNI     | Necessity  | Avoid wasted effort, simpler design | Overengineering, unused features |

---

### Senior Developer Tips {#%E2%9C%85-senior-developer-tips}

1. **KISS:** Start simple, then refactor as needed.
2. **DRY:** Look for patterns to abstract, but avoid **premature generalization**.
3. **YAGNI:** Implement features **only when there is a concrete requirement**.
4. Together, these principles promote **clean, maintainable, and pragmatic software design**.

> Remember: Following these principles reduces complexity while keeping code flexible for future changes.


## Decide what must change together

`calculateArea` and `calculateVolume` preserve different concepts, units and future validation. Extracting multiplication merely because the characters repeat can hide those concepts. A stronger DRY example is one authoritative `isEligibleForFreeStandardDelivery` rule shared by the quote and checkout summary, with boundary tests at 99 and 100. An invoice's tax policy and a marketing discount may both multiply by 0.2 today but change for different reasons; keep those rules separate.

Use the [executed shipping Strategy example](./Please_describe_Strategy_design_pattern._What_are_the_valid_use_cases_for_it.md#worked-change-inject-a-shipping-quote-rule) to compare costs: five behavior assertions protect the required contract; extra plugin registries or an abstract hierarchy would add no current requirement. The [creation lesson](./What_kind_of_creational_design_patterns_do_you_know.md#ownership-and-creation-checks) shows why simplifying object construction must preserve ownership.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/patterns/Please_describe_what_is_KISS%2C_DRY%2C_YAGNI.md). All learner practice remains outstanding.
