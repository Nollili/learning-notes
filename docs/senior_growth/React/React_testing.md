# Jest, Vite, and React Testing Library (RTL)

### **1. Overview of React Testing**

* **Purpose:** Ensure components and logic work as expected, reduce regressions, and improve confidence in refactoring.
* **Types of tests:**

  1. **Unit tests:** Test individual functions or components in isolation.
  2. **Integration tests:** Test how components work together.
  3. **End-to-end (E2E) tests:** Simulate user flows across the app (e.g., Cypress, Playwright).

---

### **2. Jest**

* **Role:** Test runner and assertion library.
* **Features:**

  * Runs tests and reports results.
  * Supports **mocks, spies, snapshot testing, timers**.
* **Usage in React:** Often combined with React Testing Library.
* **Example:**

```js
import { sum } from './utils';
test('adds 1 + 2 to equal 3', () => {
  expect(sum(1,2)).toBe(3);
});
```

* Jest is framework-agnostic. Inspect the project runner/configuration instead of assuming every React project uses Jest.

---

### **3. React Testing Library (RTL)**

* **Role:** Focused on **testing React components from the user’s perspective**.
* **Philosophy:** Don’t test implementation details; test **what the user sees and interacts with**.
* **Key APIs:**

  * `render()`: Renders React components into DOM nodes using React DOM; the test environment may be jsdom or a real browser.
  * `screen`: Queries rendered output (`getByText`, `getByRole`, etc.).
  * `fireEvent` or `userEvent`: Simulates user interactions.
* **Example:**

```js
import { render, screen } from '@testing-library/react';
import Button from './Button';

test('renders button text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

* Works seamlessly with Jest.

---

### **4. Vite / Vitest**

* **Role:** Modern alternative to Jest for projects using Vite.
* **Vitest** is **a Vite-native test runner**, designed for speed and ESM support.
* **Features:**

  * Integrates with Vite transformation/configuration; startup and execution speed depend on the actual project.
  * Native ESM support, TypeScript support out-of-the-box.
  * Many APIs resemble Jest, but mocking, ESM, timers, configuration and snapshot details need migration checks.
* **Use case:** A coherent choice for this Vite-oriented learning path; benchmark before promising CI speedups.

---

### **5. Best Practices**

1. **Unit vs Integration:**

   * Use Jest or Vitest for **unit tests** and logic testing.
   * Use RTL for **component behavior and integration tests**.
2. **Test user interactions, not implementation:**

   * Query by text, label, or role, not by class names or internal state.
3. **Snapshots sparingly:**

   * Only for stable components that rarely change.
4. **Use the supported project runner/configuration** and measure performance before changing it.
5. **Keep tests maintainable and focused:**

   * One behavior per test, descriptive names, fast execution.

---

**Interview Summary Line:**

> “For React testing, I typically use **React Testing Library** to test components from a user perspective, combined with **Jest** or **Vitest** as the test runner. Jest is widely used and feature-rich, while Vitest integrates with Vite tooling; actual speed depends on the project. Best practice is to focus on testing **behavior, not implementation**, and write maintainable, fast tests that cover both unit and integration scenarios.”



## DOM behavior, serialized output and browser pixels

RTL queries rendered DOM output; it does not test React's internal element tree or a "virtual DOM" API. A jsdom test runs a DOM simulation without a real layout/paint engine. Querying a button's accessible role/name and interacting through user-event gives useful behavior evidence; it does not prove screen-reader behavior, visual clipping, hit testing, mobile keyboards or browser layout. A real browser test covers another boundary, and manual accessibility checks still matter.

Use accessible role/name or label queries before test IDs. getBy throws immediately when missing; queryBy is useful for absence; findBy waits for an asynchronous appearance. Await user-event14 interactions. waitFor retries its callback: assertions belong there, but repeatedly clicking/saving inside it can duplicate side effects. Use controlled deferred promises instead of arbitrary sleeps to test pending/error transitions.

### Worked component and runnable behavior checks

Validated baseline: React19.3.0, RTL16.3.3/DOM Testing Library10.4.2, user-event14.6.8, jsdom30.1.3, Vitest5.0.5 and Node24.18.0. Use a separate learner project; preserve any existing task's build/test configuration. For Autocode tasks, never add or change src/tests and keep their required Jest script. These example files belong in an ordinary standalone lab_tests directory.

```tsx
// SaveButton.tsx
import { useEffect, useRef, useState } from 'react';

export function SaveButton({ save }: { save: () => Promise<void> }) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'saved' | 'failed'>('idle');
  const inFlight = useRef(false);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  async function submit() {
    if (inFlight.current) return;
    inFlight.current = true;
    setStatus('pending');
    try { await save(); if (mounted.current) setStatus('saved'); }
    catch { if (mounted.current) setStatus('failed'); }
    finally { inFlight.current = false; }
  }
  return <div>
    <button type="button" disabled={status === 'pending'} onClick={() => { void submit(); }}>
      {status === 'pending' ? 'Saving…' : status === 'failed' ? 'Retry save' : status === 'saved' ? 'Save again' : 'Save'}
    </button>
    {status === 'saved' && <p role="status">Saved successfully.</p>}
    {status === 'failed' && <p role="alert">Save failed. Retry when ready.</p>}
  </div>;
}
```

The local lock prevents a second invocation while the first promise is pending; it does not establish server idempotency. The caller owns the actual persistence operation and its authorization/deadline/commit/retry policy. Unmounting this UI suppresses local completion updates, not a committed write. The component deliberately does not claim to cancel the save or reconcile another record's mutation; use a keyed command/state owner for that larger workflow.

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { environment: 'jsdom', include: ['lab_tests/**/*.test.tsx'],
          setupFiles: ['./lab_tests/setup.ts'], restoreMocks: true },
});
```

```ts
// lab_tests/setup.ts
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
afterEach(() => { cleanup(); });
```

```tsx
// lab_tests/SaveButton.test.tsx
import { StrictMode } from 'react';
import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { SaveButton } from '../SaveButton.js';

test('pending disables duplicate requests, then reports confirmed completion', async () => {
  let complete: () => void = () => { throw new Error('Save not started'); };
  const save = vi.fn(() => new Promise<void>(resolve => { complete = resolve; }));
  const user = userEvent.setup();
  render(<StrictMode><SaveButton save={save} /></StrictMode>);
  await user.click(screen.getByRole('button', { name: 'Save' }));
  const pending = screen.getByRole<HTMLButtonElement>('button', { name: 'Saving…' });
  expect(pending.disabled).toBe(true);
  await user.click(pending);
  expect(save).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('status')).toBeNull();
  await act(async () => { complete(); });
  expect((await screen.findByRole('status')).textContent).toBe('Saved successfully.');
  expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Save again' }).disabled).toBe(false);
});

test('failure is visible and retry is an explicit new attempt', async () => {
  const save = vi.fn<() => Promise<void>>()
    .mockRejectedValueOnce(new Error('PRIVATE_SERVER_DIAGNOSTIC')).mockResolvedValueOnce(undefined);
  const user = userEvent.setup();
  render(<SaveButton save={save} />);
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect((await screen.findByRole('alert')).textContent).toBe('Save failed. Retry when ready.');
  expect(document.body.textContent).not.toContain('PRIVATE_SERVER_DIAGNOSTIC');
  await user.click(screen.getByRole('button', { name: 'Retry save' }));
  expect((await screen.findByRole('status')).textContent).toBe('Saved successfully.');
  expect(save).toHaveBeenCalledTimes(2);
});

test('serialized markup does not measure an external stylesheet change', () => {
  const { container } = render(<SaveButton save={async () => {}} />);
  const before = container.innerHTML;
  const style = document.createElement('style');
  style.textContent = 'button { color: rgb(255, 0, 0); font-size: 40px; }';
  document.head.append(style);
  try { expect(container.innerHTML).toBe(before); }
  finally { style.remove(); }
});
```

In that standalone lab, install matching pinned dependencies/types and run vitest run plus a separate tsc --noEmit check. A passing Vitest transformation does not prove TypeScript has checked all types. The last test deliberately changes a stylesheet outside the serialized container: equal markup cannot establish equal pixels. It is a test-boundary demonstration, not a visual baseline.

### Failure cases and verification limits

A mocked save adapter proves component handling of the promise outcomes, not the actual HTTP endpoint, database commit or retry idempotency. Add adapter integration/E2E tests where those contracts matter. Restore mocks/timers and close owned resources; test isolation should not depend on execution order. Avoid snapshot-updating away a behavior failure. Prefer one clear assertion set per observable transition over asserting internal hook calls or an incidental number of renders.

**Exercise acceptance:** run the exact tests and strict typecheck; change the button's accessible name, remove pending protection, suppress the error or report success before resolution and confirm the relevant behavior test fails. Separately inspect keyboard focus, long translations, zoom, contrast, mobile touch and real screen-reader output in a browser. Pin versions/environment and retain results. Browser visual/accessibility and learner practice remain required; jsdom tests are explicitly not those checks.

Official references checked2026-10-22: [RTL DOM testing](https://testing-library.com/docs/react-testing-library/intro/), [user-event14 interactions](https://testing-library.com/docs/user-event/intro/), [Vitest environments](https://vitest.dev/guide/environment.html), [Vitest setup](https://vitest.dev/guide/), [browser screenshots](https://playwright.dev/docs/test-snapshots).

## Worked browser boundary and accessibility checks

Continue with the [HTML-first search fixture and browser projects](../Other/Cross_Browser_Progressive_Enhancement.md). Its exact Playwright tests exercise a keyboard GET form with JavaScript disabled, enhanced asynchronous results, a failed JSON request followed by the regular HTML fallback, narrow-viewport overflow and a screenshot comparison. This is a separate small full-stack fixture; it does not imply that the mocked SaveButton has a tested production persistence endpoint.

The role/name queries, Enter-key submission and visible status assertions are concrete accessibility-related regression checks. They can catch a missing label, renamed control, broken keyboard submission or absent result state. They do not establish the announcement timing of a live region, sensible focus after a full navigation, screen-reader task completion or WCAG conformance. Use the linked manual evidence matrix for those boundaries. A test that merely finds role="status" cannot prove it was announced.

**Combined exercise acceptance:** run the SaveButton pending/error/retry tests, then run the browser fixture in an allowed environment. Remove its input label and confirm the accessible-name locator fails; break the ordinary form action and confirm the JavaScript-disabled test fails; reject the JSON request and retain input plus a working fallback. Record which layer catches each mutation. Complete the specified manual keyboard/reader/zoom cases separately. Current material includes executable component tests and browser test definitions; native browser, screenshot and assistive-technology results remain unperformed here.


### One primary learning runner, with separate boundaries

Use Vitest with RTL/user-event for this standalone Vite-oriented component lab and Playwright for the supplied real-browser fixture. Existing Jest/Autocode projects keep their configured runner and protected test directory; mastering another runner is not the missing behavior requirement. The actual SaveButton tests cover a pending duplicate guard, confirmed completion, visible failure and explicit retry. The browser fixture covers a different public HTML/JSON workflow, not a production save endpoint.

Reconcile evidence by layer: strict compiler checks validate represented types; component tests exercise DOM/promise handling; endpoint/database tests validate their actual contracts; native screenshots/keyboard/reader observations cover boundaries the simulation lacks. Follow the [accessibility audit and baseline workflow](../A11y/Can_we_test,_measure_a11y_somehow.md#choose-the-smallest-reproducible-test-path) without treating authored browser tests or a skipped environment as a pass. Learner component/browser implementation and manual practice remain required.
