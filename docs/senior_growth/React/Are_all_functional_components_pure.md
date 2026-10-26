### Are all functional components pure?

No, not all functional components in React are **pure**. While functional components can be written as **pure functions**, their purity depends on how they are implemented. Let's explore what this means in the context of React:

### **What is a Pure Function?**

A pure function is a function that:

1. Always produces the same output for the same input.
2. Has no side effects (e.g., modifying variables outside its scope, making API calls, etc.).

Example of a pure function:

```jsx
const add = (a, b) => a + b;
```

---

### **Functional Components in React**

React functional components are JavaScript functions that return JSX. By default, they are not inherently pure or impure; their purity depends on how they are written.

### **Example of a Pure Functional Component**:

```jsx
const Greeting = ({ name }) => <h1>Hello, {name}!</h1>;
```

- For the same `name` prop, the output (rendered JSX) will always be the same.
- There are no side effects, making it a pure component.

---

### **Impure Functional Components**

A functional component becomes **impure** if:

1. It performs externally observable work during render (for example a request or mutation of an external object). Event-handler updates and Effect synchronization are outside render.
2. It produces different outputs for the same inputs, due to reliance on external factors like global variables or untracked state.

### **Example of an Impure Functional Component**:

```jsx
const ImpureGreeting = ({ name }) => {
  console.log("Rendering component"); // Side effect
  return <h1>Hello, {name}!</h1>;
};
```

- The `console.log` is a side effect, making the component impure.

Another example:

```jsx
let counter = 0;

const Counter = () => {
  counter++; // Modifying external state
  return <h1>Counter: {counter}</h1>;
};
```

- The component's output depends on the external `counter` variable, so it's impure.

---

### **Purity in React's Context**

In React, **pure components** are those that:

- Render the same output given the same props, state and context snapshots.
- Do not rely on external variables or cause unintended side effects.

`React.memo` may skip work when props compare equal; it cannot make impure render logic correct. Local state/context changes can still render a memoized component.

### **Using React.memo**:

```jsx
const PureGreeting = React.memo(({ name }) => <h1>Hello, {name}!</h1>);
```

- `React.memo` can reuse the render result for equal props; it is a performance optimization, not a guarantee that the function is never invoked.

---

### **Side Effects with Hooks**

A component may use state, a pure reducer and an Effect while keeping render pure. Rendering registers Effect synchronization; the Effect body runs outside render. Put user-triggered writes in event handlers, pure derived calculations in render, and external synchronization in Effects.

### **Example**:

```jsx
import { useEffect, useState } from 'react';

export function FetchData({ userId }) {
  const [result, setResult] = useState({ id: null, status: 'loading' });
  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    setResult({ id: userId, status: 'loading' });
    async function load() {
      try {
        const response = await fetch(`/api/user/${encodeURIComponent(userId)}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          await response.body?.cancel();
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        if (typeof data !== 'object' || data === null || typeof data.name !== 'string') {
          throw new Error('Invalid user response');
        }
        if (current) setResult({ id: userId, status: 'success', name: data.name });
      } catch (error) {
        if (current) setResult({ id: userId, status: 'error', message: 'User unavailable' });
      }
    }
    void load(); // load handles its rejection; cleanup owns cancellation.
    return () => { current = false; controller.abort(); };
  }, [userId]);
  if (result.id !== userId || result.status === 'loading') return <p role="status">Loading user…</p>;
  if (result.status === 'error') return <p role="alert">{result.message}</p>;
  return <p>{result.name}</p>;
}
```

- The request is owned by an Effect; render remains a calculation from snapshots. Cleanup both aborts cooperative work and invalidates its result. The result identity guard prevents an old user from flashing while the next Effect starts. A query library can own caching, retries and request deduplication for a larger application.

---

### **When Purity Matters**

- **Optimization**: Pure functional components can be optimized with tools like `React.memo`.
- **Predictability**: Pure components are easier to test and debug because their behavior is deterministic.
- **Code Clarity**: Writing pure components encourages better separation of concerns.

---

### **Conclusion**

Function syntax alone does not establish purity. React requires render logic to be idempotent and free of nonlocal side effects; updates and synchronization belong in event handlers/Effects with explicit ownership. Memoization is an optimization applied after correctness.
## Why replay-safe render matters (React19 baseline)

React may restart or abandon render work; development Strict Mode intentionally probes purity and Effect cleanup. A render-time increment, random ID, Date.now value or push into a prop array can change behavior when render is repeated. Generate stable data IDs when data is created; use React's useId for accessibility relationships, not list keys. Local mutation of a fresh array that does not escape until returned can be pure; mutating an existing prop cannot.

An Effect fetching data can run a setup/cleanup/setup sequence in development. The first request must be aborted/ignored, and subscription cleanup must exactly undo setup. The example's cancellation is not an error announcement after unmount. Add a product-specific retry button/server error distinction for production UX rather than retrying indefinitely.

**Exercise:** compare a render-time global counter with state updated by an event handler. Then rapidly switch FetchData user IDs using delayed responses. Acceptance: render has no external mutation; no stale user's name is displayed; HTTP/invalid JSON/invalid shape failures have UI; cleanup prevents late state use; Strict Mode replay leaves no duplicate subscription. A network call during development replay is not by itself evidence of a production double-write.

Official references: [React render purity](https://react.dev/reference/rules/components-and-hooks-must-be-pure), [Effect synchronization](https://react.dev/learn/synchronizing-with-effects), [avoiding unnecessary Effects](https://react.dev/learn/you-might-not-need-an-effect). Checked2026-10-20. Browser interaction tests remain required learner evidence.
