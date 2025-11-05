### What is memoization and how to achieve it in React?

Memoization is an optimization technique used to improve the performance of functions or components by caching the results of expensive computations. When the same inputs are provided, the cached result is returned instead of recalculating, saving time and resources.

In the context of React, memoization helps optimize rendering by avoiding unnecessary re-renders of components and recalculations of values or derived state.

---

### **Memoization in React**

React provides built-in tools and patterns for memoization:

### 1. **React.memo**

- Used to memoize functional components.
- Prevents unnecessary re-renders if the props of the component haven’t changed.

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

- The `ChildComponent` only re-renders if the `data` prop changes.
- Prevents unnecessary rendering when the `ParentComponent` updates for reasons unrelated to `ChildComponent`.

**Tradeoff**:

- React performs a shallow comparison of props. For deeply nested objects, you may need to use custom comparison functions.

---

### 2. **useMemo**

- Memoizes the result of a calculation.
- Useful for expensive computations or derived state that depends on specific inputs.

**Usage**:

```jsx
import React, { useState, useMemo } from 'react';

const ExpensiveCalculation = ({ num }) => {
  const calculateFactorial = (n) => {
    console.log('Calculating factorial');
    return n <= 1 ? 1 : n * calculateFactorial(n - 1);
  };

  const factorial = useMemo(() => calculateFactorial(num), [num]);

  return <div>Factorial of {num}: {factorial}</div>;
};

const ParentComponent = () => {
  const [count, setCount] = useState(1);
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <ExpensiveCalculation num={count} />
    </div>
  );
};

export default ParentComponent;
```

**How It Works**:

- The `factorial` is only recalculated when `num` changes, reducing redundant calculations.

**Tradeoff**:

- Overusing `useMemo` for lightweight calculations can lead to unnecessary complexity.

---

### 3. **useCallback**

- Memoizes a callback function.
- Prevents the recreation of functions during renders, which is useful for passing callbacks to memoized or child components.

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