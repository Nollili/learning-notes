# React.Memo and Performance Optimization

### **1. React.memo**

* **Purpose:** `React.memo` is a **Higher-Order Component (HOC)** used to **memoize functional components**. It prevents unnecessary re-renders when props **haven’t changed**.
* **How it works:**

  ```jsx
  const MyComponent = React.memo(function MyComponent({ data }) {
    return <div>{data.value}</div>;
  });
  ```

  * React does a **shallow comparison of props** by default.
  * If props are the same as the previous render, React **skips rendering** this component.
* **Custom comparison:** You can provide your own function if you need **deep comparison** or special logic:

  ```jsx
  const MyComponent = React.memo(
    ({ data }) => <div>{data.value}</div>,
    (prevProps, nextProps) => prevProps.data.id === nextProps.data.id
  );
  ```

* **When to use:**

  * Components that **receive frequently changing props** but only need to re-render if certain props change.
  * **Pure presentational components** with expensive render logic.
* **When NOT to use:**

  * Small, cheap components — memoization has a **small overhead** itself.
  * Components that always re-render due to **parent re-renders changing many props**.

---

### **2. Performance Optimization in React**

You can structure this part around **common causes of slowness** and **tools/techniques to fix them**:

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
* Don’t do side effects in the render body — use `useEffect`.

#### **E. Profiling**

* Use **React DevTools Profiler** to identify slow components.
* Measure **renders, prop changes, and component mount times**.

#### **F. Other tips**

* Avoid unnecessary context value updates (use `useMemo` for context values).
* Keep components small and focused — reduces re-render complexity.
* Minimize inline object/array creations in props if they trigger child re-renders.

---

### **3. How to explain in an interview**

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
