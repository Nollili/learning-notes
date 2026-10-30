# What is snapshot testing? When should we avoid using it?

## Snapshot Testing in JavaScript / React (Complete Overview) {#%F0%9F%93%B8-snapshot-testing-in-javascript-react-complete-overview}

**Snapshot testing** captures the **output of a component or function** and compares it against a stored snapshot to detect unexpected changes.

---

## How Snapshot Testing Works {#_1%EF%B8%8F%E2%83%A3-how-snapshot-testing-works}

1. **Render / Execute:** Render a component or execute a function.
2. **Capture Output:** Serialize the output (DOM tree, object, or value) into a snapshot file.
3. **Compare Snapshots:** On future runs:
   - **Pass:** Output matches the stored snapshot.
   - **Fail:** Output differs → signals potential bug or intentional change.

**Example with React + Jest:**
```js
import { render } from '@testing-library/react';
import Button from './Button';

test('Button renders correctly', () => {
  const { container } = render(<Button label="Click me" />);
  expect(container).toMatchSnapshot();
});
```

* Snapshot is saved in a `__snapshots__` folder.
* If the component output changes intentionally, you **update the snapshot** using:

```bash
jest -u
```

---

## When Snapshot Testing is Useful {#_2%EF%B8%8F%E2%83%A3-when-snapshot-testing-is-useful}

* **UI components:** Capture DOM structure for React, Vue, Angular.
* **Serializable objects:** API responses, data transformations.
* **Regression testing:** Detect unintended changes in output.

**Benefits:**

* Can detect changes in the serialized output covered by the snapshot.
* Automates comparison; large snapshots can obscure meaningful changes.
* Serves as **documentation of expected output**.

---

## When to Avoid Snapshot Testing {#_3%EF%B8%8F%E2%83%A3-when-to-avoid-snapshot-testing}

| Situation                       | Reason                                                                                                     |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Highly dynamic UI**           | Frequent, trivial changes (e.g., timestamps, random IDs) break snapshots often, causing noise.             |
| **Complex stateful components** | Snapshots may become brittle and hard to maintain.                                                         |
| **Critical logic testing**      | Snapshots don’t validate behavior; functional assertions are better.                                       |
| **Over-reliance**               | Using snapshots as the **only test** can give false confidence — they test **structure**, not correctness. |

**Tip:** Use **functional tests** or **unit tests with explicit assertions** for critical logic instead of snapshots.

---

## Best Practices {#_4%EF%B8%8F%E2%83%A3-best-practices}

1. **Combine with other tests:** Snapshot + unit/integration tests.
2. **Keep snapshots small:** Test **specific components** or **sections of UI**.
3. **Avoid dynamic data in snapshots:** Use mocks or stable IDs.
4. **Review snapshot changes:** Don’t blindly update snapshots; verify intended changes.

---

### Key Takeaways {#%E2%9C%85-key-takeaways}

* A focused snapshot can detect regressions in the specific serialized output or rendered image it compares.
* Avoid overusing snapshots for **dynamic content or critical logic**.
* Always **combine with functional assertions** for meaningful test coverage.
* Proper use reduces maintenance pain and improves confidence in UI changes.

> Senior Tip:
> Treat DOM/object snapshots as **serialization contracts**. Browser screenshot baselines compare pixels; neither replaces behavior or accessibility testing.


## Which kind of snapshot is being compared?

A Jest/Vitest DOM snapshot serializes selected DOM output; an object snapshot serializes a value. It can reveal changed labels/attributes/structure, but it does not render CSS into pixels. A CSS file, font, viewport, clipping ancestor or stacking context can change appearance while a component's serialized markup stays identical. React Testing Library renders into DOM nodes; it does not snapshot React's internal virtual DOM by querying component instances.

A screenshot/visual regression test uses a real browser rendering and image comparison. Pin browser/OS/fonts/viewport/locale/theme and data; await a meaningful ready state and document.fonts.ready, control animations/time, then review differences. Do not hide an entire unstable page behind broad pixel tolerances. A first screenshot baseline is a new expectation requiring review, not proof that the design was correct. A DOM/ARIA snapshot is not automatically a screenshot merely because it describes UI.

Keep a small serialization snapshot for a deliberately reviewed structure or value. Use explicit assertions for invariants such as a disabled pending button, visible retry error, field association or status message. The adjacent React testing lesson contains runnable pending/failure/retry checks and a demonstration that changing an external stylesheet leaves serialized container markup unchanged.

When a snapshot fails, inspect the actual diff, source change and requirement before accepting a new baseline. Scope an update to the intended test and review the generated file; blindly running jest -u across the suite can ratify unrelated regressions. Do not insert arbitrary replacement IDs/timestamps to make a failure disappear if their stability is part of the behavior being tested. Prefer deterministic fixtures and reviewed serializers for genuinely irrelevant variation.


References checked2026-10-22: [Jest snapshot review/updates](https://jestjs.io/docs/snapshot-testing), [Playwright visual baseline/environment](https://playwright.dev/docs/test-snapshots), [RTL DOM testing](https://testing-library.com/docs/react-testing-library/intro/).

## Concrete browser screenshot comparison

Use the exact `reviewed visual baseline` test and three-project configuration in the [cross-browser search lesson](../Other/Cross_Browser_Progressive_Enhancement.md). It waits for document fonts before comparing the full 320px-wide search page with `toHaveScreenshot`. The fixture uses fixed local data and no animation; pin the browser binaries, OS and fonts in the learner environment as well. An engine-specific approved baseline is needed for each configured project. No baseline has been generated or reviewed here, and test discovery/type checking does not execute image comparison.

For the exercise, first approve the intended appearance, then change the stylesheet's input width or focus outline. Keep the serialized form markup unchanged and show that the DOM contract still passes while a reviewed browser image changes. Investigate a difference before updating it: an inaccessible outline or clipped control is a bug even when a new image could make the test green.

Pair the image assertion with keyboard/name/failure behavior tests and the manual accessibility matrix; pixels alone cannot establish reading order or successful use of assistive technology.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/testing/What_is_snapshot_testing_When_should_we_avoid_using_it.md). All learner practice remains outstanding.
