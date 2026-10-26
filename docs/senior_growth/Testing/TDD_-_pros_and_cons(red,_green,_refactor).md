# TDD - pros and cons(red, green, refactor?)?

# 🧪 Test-Driven Development (TDD) in JavaScript/Frontend

**Test-Driven Development (TDD)** is a development approach where **tests are written before the code**. The workflow follows the **Red → Green → Refactor** cycle.

---

## 1️⃣ TDD Workflow: Red → Green → Refactor

1. **Red** – Write a failing test
   - Define the **expected behavior** before implementing functionality
   - Test should fail initially because the feature doesn’t exist yet
```js
test('sum adds two numbers', () => {
   expect(sum(2, 3)).toBe(5);
});
```

* At this point, `sum` is not implemented → test fails

2. **Green** – Implement the minimal code to pass

```js
function sum(a, b) { return a + b; }
```

   * Run test → **test passes**

3. **Refactor** – Clean up code

   * Improve **readability, maintainability, or performance**
   * Ensure **tests still pass** after refactoring

```js
const sum = (a, b) => a + b; // stylistic alternative, not inherently a design improvement
```

> 🔹 Repeat this cycle for every new feature or function.

---

## 2️⃣ Pros of TDD

| Advantage                    | Explanation                                             |
| ---------------------------- | ------------------------------------------------------- |
| **Better design**            | Forces developers to think about API and behavior first |
| **Coverage feedback**       | Behavior-first tests can reveal gaps; neither high coverage nor complete edge-case testing is guaranteed |
| **Early bug detection**      | Bugs are caught immediately when code is written        |
| **Refactoring safety**       | Tests allow confident code improvements                 |
| **Documentation**            | Tests serve as executable specs                         |
| **Reduced over-engineering** | Write minimal code to satisfy tests                     |

---

## 3️⃣ Cons / Challenges of TDD

| Disadvantage                      | Explanation                                                      |
| --------------------------------- | ---------------------------------------------------------------- |
| **Slower initial development**    | Writing tests first takes time upfront                           |
| **Steep learning curve**          | Requires discipline and familiarity with testing tools           |
| **Maintenance overhead**          | Tests need updates when requirements change                      |
| **Difficult for UI/async code**   | Complex UI components or async flows can be harder to test first |
| **Risk of writing brittle tests** | Poorly written tests can break frequently, causing frustration   |

---

## 4️⃣ When to Use TDD

* Critical business logic or algorithms
* Backend services (API, calculations, transformations)
* Components or modules that need **high reliability**
* When **refactoring legacy code** (write tests first to prevent regressions)

---

## 5️⃣ Tips for Effective TDD

1. **Start small:** Test one function or behavior at a time
2. **Keep tests isolated and deterministic**
3. **Focus on behavior, not implementation**
4. **Refactor often** after passing tests to keep code clean
5. **Use fast-running tests** to maintain developer flow

---

### ✅ Summary

* **TDD = Red → Green → Refactor**
* Pros: better design, safety, coverage, documentation
* Cons: slower upfront, maintenance, UI/async challenges
* Goal: write code **driven by behavior** rather than implementation

> 💡 Senior Tip:
> Even if TDD is not strictly followed, **thinking in tests first** improves design and leads to **more maintainable, reliable code**.


## Executed red–green–refactor: validated page-size configuration {#config-tdd}

Contract: an absent limit defaults to 20. A provided limit must be a canonical decimal **string** from 1 to 50 inclusive; no coercion, partial numbers, whitespace or leading zeros. The async configuration reader accepts a JSON object, delegates that rule, and propagates malformed JSON/storage errors. A missing config file is a failure, not permission to pretend defaults loaded successfully. This is a trusted local configuration exercise; arbitrary untrusted files additionally need byte/path/access limits.

Create two files in an owned standalone directory, outside restricted `src/tests`. Node24.18.0 was used locally. This uses Node's built-in test runner so there is no package installation; in an Autocode submission retain the template's Jest/test scripts and use the same behaviors without replacing its configuration.

`limit.mjs` — final refactored implementation:

```js
import {readFile} from 'node:fs/promises';
const invalid = () => new RangeError('Limit must be an integer from 1 to 50');
export function parseLimit(raw) {
  if (raw === undefined) return 20;
  if (typeof raw !== 'string' || raw.trim() !== raw || !/^[1-9][0-9]?$/.test(raw)) throw invalid();
  const value = Number(raw);
  if (value > 50) throw invalid();
  return value;
}
export async function readPageLimit(file, load = readFile) {
  const value = JSON.parse(await load(file, 'utf8'));
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new TypeError('Invalid config');
  return parseLimit(value.limit);
}
```

`limit.test.mjs` — behavior suite, written before filling in `parseLimit`:

```js
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {parseLimit,readPageLimit} from './limit.mjs';
test('missing limit uses documented default', () => assert.equal(parseLimit(undefined), 20));
test('accepts both inclusive boundaries', () => {
  assert.equal(parseLimit('1'), 1); assert.equal(parseLimit('50'), 50);
});
test('rejects invalid range and wrong types without coercion', () => {
  for (const raw of ['0', '51', '-1', 20, null, [], {}]) assert.throws(() => parseLimit(raw), RangeError);
});
test('rejects partial numbers, whitespace, decimals and leading zeros', () => {
  for (const raw of ['20junk', ' 20', '20 ', '20\n', '2.0', '01', '']) assert.throws(() => parseLimit(raw), RangeError);
});
test('reads an owned config file and awaits cleanup', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'limit-fixture-'));
  t.after(() => rm(directory, {recursive: true, force: true}));
  const file = join(directory, 'config.json');
  await writeFile(file, JSON.stringify({limit: '7'}));
  assert.equal(await readPageLimit(file), 7);
});
test('awaits the injected loader and rejects invalid config shapes', async () => {
  let resolve;
  const pending = new Promise(r => {resolve = r;});
  let called = false;
  const result = readPageLimit('owned.json', async (file, encoding) => {
    assert.equal(file, 'owned.json'); assert.equal(encoding, 'utf8'); called = true;
    return pending;
  });
  assert.equal(called, true); resolve('{"limit":"3"}'); assert.equal(await result, 3);
  for (const text of ['null', '[]', '"text"']) await assert.rejects(() => readPageLimit('x', async () => text), TypeError);
});
test('preserves a storage failure without pretending a default succeeded', async () => {
  const failure = new Error('owned fixture error');
  await assert.rejects(() => readPageLimit('x', async () => {throw failure;}), error => error === failure);
});
test('rejects malformed JSON', async () => {
  await assert.rejects(() => readPageLimit('x', async () => '{'), SyntaxError);
});
```

Run `node --test --test-reporter=tap limit.test.mjs` in that owned directory. The deferred loader controls completion explicitly; no arbitrary sleep or real network is needed. The real-file case uses a unique temporary directory and registers awaited cleanup immediately after acquisition. It is a small filesystem integration test; the pure parser and injected-loader cases exercise separate boundaries.

| Stage | Actual change | Observed result |
|---|---|---|
| Red | Keep the reader but stub `parseLimit` as `return 20` | Exit failure: 3 tests pass, 5 fail for behavior (not an import/tool error) |
| Green | Implement the validated parser; inline the same RangeError message at each rejection | 8 pass, 0 fail |
| Refactor | Extract the error construction into `invalid`; retain the same contract | 8 pass, 0 fail |

The final source and tests were executed again after adding a trailing-newline case. JavaScript `$` can match before a final line terminator; the explicit trim equality prevents accepting that whitespace. This is an example of a gap a first passing suite can miss. Tests were not weakened to accept the stub. A syntax/style change alone does not make a refactor valuable; here the shared error constructor removes repeated contract wording without changing behavior.

TDD does not guarantee coverage, correct requirements or the absence of defects. For legacy work, characterization tests preserve observed behavior; confirm which behavior is intended before encoding an existing bug as a permanent contract. A useful test can contain several assertions establishing one coherent behavior, and a use case can involve several functions.

**Exercise acceptance:** reproduce red failure for the documented reason, green, then a behavior-preserving refactor. Add one missing edge case and demonstrate it fails the relevant defective implementation. Retain commands, exit status, failing/passing names and actual diff. Explain parser-unit versus filesystem-integration scope and ensure cleanup runs on failure. Learner practice remains required. References: [Node24 test runner, hooks and async activity](https://nodejs.org/docs/latest-v24.x/api/test.html), [Jest coverage thresholds](https://jestjs.io/docs/configuration#coveragethreshold-object).
