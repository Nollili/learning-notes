# What is memoization and how to achieve it in React? {#what-is-memoization-and-how-to-achieve-it-in-react}

Canonical owner: memo/useMemo/useCallback mechanisms and cache lifetime. [Comparator correctness](./react_memo.md) keeps its callback/value counterexample; [performance experiments](./performance_potimization.md) retain debounce and workload examples. General algorithmic memoization remains in [CS practice/foundations](../../cs-foundations/).

Memoization is an optimization technique used to improve the performance of functions or components by caching the results of expensive computations. When the same inputs are provided, the cached result is returned instead of recalculating, saving time and resources.

In the context of React, memoization helps optimize rendering by avoiding unnecessary re-renders of components and recalculations of values or derived state.

---

### **Memoization in React**

React provides built-in tools and patterns for memoization:

### **React.memo** {#_1-react-memo}

- Used to memoize functional components.
- Can skip parent-driven rendering when props compare equal; local state/context and React scheduling still apply.

**Usage**:

```jsx
import React from 'react';

const ChildComponent = React.memo(({ data }) => {
  console.log('ChildComponent rendered');
  return <div>{data}</div>;
});

const ParentComponent = () => {
  const [state, setState] = React.useState(0);
  return (
    <div>
      <button onClick={() => setState(state + 1)}>Increment</button>
      <ChildComponent data="Static Data" />
    </div>
  );
};

export default ParentComponent;
```

**How It Works**:

- Equal data props can skip parent-driven renders; local state/context can still update the child.
- Prevents unnecessary rendering when the `ParentComponent` updates for reasons unrelated to `ChildComponent`.

**Tradeoff**:

- React performs a shallow comparison of props. Prefer immutable snapshots and explicit stable props. A custom comparator must compare every output and behavior input and be cheaper than rendering; deep comparison is not the default remedy.

---

### **useMemo** {#_2-usememo}

- Memoizes the result of a calculation.
- Useful for expensive computations or derived state that depends on specific inputs.

**Usage**:

```jsx
import { useState, useMemo } from 'react';
function factorial(n) {
  if (!Number.isInteger(n) || n < 0 || n > 18) throw new RangeError('Use integer0–18');
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}
function Calculation({ num }) {
  const result = useMemo(() => factorial(num), [num]);
  return <p>{num}! = {result}</p>;
}
export default function MemoLab() {
  const [num, setNum] = useState(1);
  const [unrelated, setUnrelated] = useState(0);
  return <>
    <button onClick={() => setNum(n => Math.min(18, n + 1))}>Change calculation input</button>
    <button onClick={() => setUnrelated(n => n + 1)}>Unrelated update {unrelated}</button>
    <Calculation num={num} />
  </>;
}
```

**How It Works**:

- The unrelated parent update renders Calculation but can reuse its cached factorial value. Changing num invalidates that value. This bounded factorial is cheap; it demonstrates behavior, not a justified production optimization or measured benefit.

**Tradeoff**:

- Overusing `useMemo` for lightweight calculations can lead to unnecessary complexity.

---

### **useCallback** {#_3-usecallback}

- Memoizes a callback function.
- Returns a cached function identity when dependencies are equal. The argument function expression is still created/evaluated on each render; the hook does not prevent that allocation.

**Usage**:

```jsx
import React, { useState, useCallback } from 'react';

const ChildComponent = React.memo(({ onClick }) => {
  console.log('ChildComponent rendered');
  return <button onClick={onClick}>Click Me</button>;
});

const ParentComponent = ({clickHandler}) => {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
	  clickHandler();
    console.log('Button clicked');
  }, [clickHandler]);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <ChildComponent onClick={handleClick} />
    </div>
  );
};

export default ParentComponent;
```

**How It Works**:

- The `handleClick` function remains the same across renders unless its dependencies change.
- Prevents the `ChildComponent` from re-rendering due to function reference changes.

**Tradeoff**:

- Use only when necessary to avoid premature optimization.

---

### **When to Use Memoization in React**

1. **Frequent Re-renders**: If components re-render unnecessarily due to parent updates.
2. **Expensive Computations**: For calculations that are computationally heavy.
3. **Stable Function References**: When passing functions as props to child components.
4. **Performance Bottlenecks**: Profiling indicates rendering inefficiencies.

---

### **Common Mistakes**

1. **Overusing Memoization**: Memoizing lightweight computations or components with trivial props can add overhead without performance gains.
2. **Ignoring Dependencies**: Forgetting to include necessary dependencies in `useMemo` or `useCallback` can cause stale values.
3. **Relying Solely on React.memo**: Deep comparisons of complex props aren’t automatic; manual optimization might be required.

---

### **Tools to Monitor Performance**

1. **React Developer Tools Profiler**:
    - Use the Profiler to identify which components are re-rendering and why.
    - Helps decide where memoization is necessary.
2. **Use Logging**:
    - Add `console.log` statements to monitor renders.
3. **Lighthouse Audits**:
    - Check performance metrics for overall app optimization.

---
## Cache lifetime, stale closures and measurement

useMemo caches a calculation result, not the whole component render. useCallback caches a function identity, not its return value or all function allocation. Both compare dependencies by Object.is and must include every reactive input they read. Their caches may be discarded; do not rely on them for business correctness, persistent storage or a once-only side effect. Use state/ref or an external owner when durable identity/data is part of the contract.

```jsx
import { useCallback, useState } from 'react';
export function CounterButton({ report }) {
  const [count, setCount] = useState(0);
  const increment = useCallback(() => {
    setCount(previous => previous + 1); // Does not read the render's count snapshot.
    report('increment');
  }, [report]); // report is reactive; [] would retain an old report function.
  return <button onClick={increment}>{count}</button>;
}
```

A functional update can remove a dependency only when the callback no longer reads that value. Refs can hold the latest imperative value, but hiding dependencies in a ref without a clear synchronization contract can create different bugs. Prefer simpler state ownership and fewer Effect dependencies before adding caches. React Compiler, when enabled, can remove the need for much manual memoization; preserve behavior rather than coding to render counts.


Official references: [useMemo](https://react.dev/reference/react/useMemo), [useCallback](https://react.dev/reference/react/useCallback), [Profiler](https://react.dev/reference/react/Profiler). React19 baseline; checked2026-10-20.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/react/What_is_memoization_and_how_to_achieve_it_in_React.md). All learner practice remains outstanding; the worked examples above are explanatory material.
