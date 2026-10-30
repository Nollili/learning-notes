# React.memo and performance optimization {#react-memo-and-performance-optimization}

Companion owner: comparator correctness and callback behavior. Start with [memoization mechanisms](./What_is_memoization_and_how_to_achieve_it_in_React.md), then measure an actual workload. These examples are retained for their distinct failure cases.

### **React.memo** {#_1-react-memo}

* **Purpose:** `React.memo` is a **Higher-Order Component (HOC)** used to **memoize functional components**. It can skip parent-driven work when props compare equal; state/context updates can still render it. This is an optimization, not a correctness guarantee.
* **How it works:**

  ```jsx
  const MyComponent = React.memo(function MyComponent({ data }) {
    return <div>{data.value}</div>;
  });
  ```

  * React does a **shallow comparison of props** by default.
  * If props are the same as the previous render, React **skips rendering** this component.
* **Custom comparison:** return true only when output and behavior are equivalent. Include every used field/function; prefer default comparison or simpler primitive props over expensive deep comparison:

  ```jsx
  const MyComponent = React.memo(
    ({ data }) => <div>{data.value}</div>,
    (prevProps, nextProps) =>
       prevProps.data.id === nextProps.data.id &&
       Object.is(prevProps.data.value, nextProps.data.value)
  );
  ```

* **When to use:**

  * Components that **receive frequently changing props** but only need to re-render if certain props change.
  * **Pure presentational components** with expensive render logic.
* **When NOT to use:**

  * Small, cheap components — memoization has a **small overhead** itself.
  * Components that always re-render due to **parent re-renders changing many props**.

---

### **Performance Optimization in React** {#_2-performance-optimization-in-react}

First identify the measured slow interaction, then compare the cost of rendering, comparison, network and browser work.

#### **A. Avoid unnecessary re-renders**

* `React.memo` (as above) for functional components.
* `PureComponent` for class components.
* Correct **state location**: move state down/up to reduce re-render scope.
* Use `useCallback` and `useMemo` to memoize **functions** and **computed values** passed as props.

#### **B. Efficient lists**

* Use **keys** properly in lists.
* Consider **virtualization** (`react-window`, `react-virtualized`) for long lists.

#### **C. Code splitting**

* Dynamic imports + `React.lazy` + `Suspense` to **load only what’s needed**.

#### **D. Avoid expensive calculations on each render**

* Use `useMemo` for heavy computations.
* Keep render pure. User-triggered writes belong in event handlers; Effects synchronize with external systems and own cleanup.

#### **E. Profiling**

* Use **React DevTools Profiler** to identify slow components.
* Measure **renders, prop changes, and component mount times**.

#### **F. Other tips**

* Avoid unnecessary context value updates (use `useMemo` for context values).
* Keep components small and focused — reduces re-render complexity.
* Minimize inline object/array creations in props if they trigger child re-renders.

---

### **How to explain in an interview** {#_3-how-to-explain-in-an-interview}

* Show **understanding of trade-offs**, e.g., “Memoization helps, but it’s not free — it’s most useful for components that re-render often and are expensive.”
* Give a **realistic example**: “We used `React.memo` in our table row component that receives hundreds of props. Without memo, every parent re-render caused 100+ rows to re-render unnecessarily.”

---

 “In React, performance optimization often starts with **avoiding unnecessary re-renders**. For functional components, we can use `React.memo`, which is a higher-order component that memoizes a component’s output. It does a **shallow comparison of props**, and if the props haven’t changed, React skips re-rendering that component. You can also provide a custom comparison function for deep or conditional checks.

 **Pros of React.memo:**

* Reduces unnecessary renders for expensive or large components.
* Easy to implement for pure presentational components.

 **Cons:**

* Has a small performance overhead due to prop comparison.
* Doesn’t help if the props are always new objects/functions — in that case, child will still re-render.

 **When to use:**

* Components that are **render-heavy** or part of a **large list**, like table rows or cards.
* Components that receive props that **rarely change**.

 **When NOT to use:**

* Small or simple components where the render is cheap.
* Components whose props change frequently in ways that memoization won’t help.

 Beyond `React.memo`, performance optimization includes: proper **state placement** to avoid unnecessary parent re-renders, **memoizing functions and computed values** with `useCallback` and `useMemo`, **list virtualization** for long lists, and **code-splitting** with `React.lazy` and `Suspense`.

 Profiling with **React DevTools** is essential to find the real bottlenecks, because often what seems slow isn’t the actual problem. Overall, optimization is about balancing **render cost** against **memoization overhead**, and targeting the real performance hotspots rather than premature optimization.”

## Correctness before comparison cost

The old id-only comparator was incorrect: same-id/value-change updates left the screen stale. If a component also receives onSelect, the comparator must account for that function; otherwise it can retain a callback closing over old state. Mutable nested data can destroy the previous snapshot so even a custom comparator cannot recover what changed. Immutable ownership is a correctness prerequisite, not just a speed trick.

```jsx
import { memo } from 'react';
export const ValueCell = memo(function ValueCell({ id, value, onSelect }) {
  return <button onClick={() => onSelect(id)}>{value}</button>;
}); // Default per-prop Object.is; every output/behavior input is visible.
```

The arrow inside ValueCell is created when that component renders; it does not undermine its own memo boundary. A fresh wrapper created by the parent and passed as onSelect can defeat a boundary. Do not omit a dependency or callback comparison merely to suppress rendering.


Official references: [memo/custom comparator pitfalls](https://react.dev/reference/react/memo), [Profiler](https://react.dev/reference/react/Profiler). React19 baseline; checked2026-10-20. React Compiler can apply automatic memoization when enabled; these manual examples teach identity/contracts and should not be layered on blindly.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/react/react_memo.md). All learner practice remains outstanding; the worked examples above are explanatory material.
