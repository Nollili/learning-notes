### Common Performance Issues in React

Subjects: React

Measure the slow interaction before choosing an optimization; network, JavaScript, React rendering and browser layout can dominate different workloads.

### **Common Performance Issues in React**

### **1. Unnecessary Re-renders**

- **Cause**: React re-renders components whenever their state or props change, which can lead to excessive re-rendering.
- **Examples**:
    - Passing new function references or object literals as props:
        
        ```jsx
        <ChildComponent onClick={() => handleClick()} /> // New function on every render
        ```
        

### **2. Overuse of State and Context**

- **Cause**: Excessive state updates or heavy use of `useContext` can trigger re-renders for all components consuming the context.

### **3. Large Component Trees**

- **Cause**: Deeply nested or overly complex component hierarchies increase rendering time.

### **4. Inefficient Reconciliation**

- **Cause**: The Virtual DOM diffing algorithm (reconciliation) may perform unnecessary comparisons if components are not optimized.

### **5. Large Initial Load Times**

- **Cause**: Loading too much data or too many assets at once can slow down the initial render.

### **6. Inefficient Event Handling**

- **Cause**: Using anonymous functions in JSX can lead to new function instances on every render.

### **7. Excessive DOM Updates**

- **Cause**: Frequent state changes leading to frequent DOM updates, particularly for animations or large datasets.

### **8. Memory Leaks**

- **Cause**: Forgetting to clean up event listeners, subscriptions, or timers in `useEffect`.

---

### **How to Improve Performance in React**

### **1. Optimize Rendering with `React.memo`**

- Use `React.memo` to prevent re-rendering of functional components when their props haven't changed.
    
    ```jsx
    const Child = React.memo(({ value }) => {
      console.log("Rendered");
      return <div>{value}</div>;
    });
    ```
    

### **2. Use `useCallback` and `useMemo`**

- Reuse function/value identities when dependencies are equal. useCallback does not prevent creation of its function argument; measure whether identity matters at a memo/subscription boundary.
    
    ```jsx
    const handleClick = useCallback(() => {
      // Handler logic
    }, []);
    
    const expensiveValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
    ```
    

### **3. Choose stable boundaries where measured**

- Inline functions and objects create new instances on every render.
    
    ```jsx
    // Simple and often sufficient; allocation alone is not a performance defect.
    <ChildComponent onClick={() => doSomething()} />
    
    // When a measured memo boundary benefits, include the reactive dependency.
    const handleClick = useCallback(() => doSomething(), [doSomething]);
    <ChildComponent onClick={handleClick} />
    ```
    

### **4. Use the `key` Prop Wisely**

- Provide stable, unique keys for list items to help React identify changes during reconciliation.
    
    ```jsx
    const items = data.map((item) => <li key={item.id}>{item.name}</li>);
    ```
    

### **5. Reduce State Complexity**

- Minimize the amount of state in components to avoid unnecessary updates.
    - Avoid deeply nested states. https://alexsidorenko.com/blog/react-update-nested-state
    - Split state into independent slices if necessary.

### **6. Optimize Context Usage**

- Avoid using a single context for unrelated pieces of state.
- Use memoized values in the context provider.
    
    ```jsx
    const contextValue = useMemo(() => ({ user, setUser }), [user]);
    ```
    

### **7. Lazy Loading**

- Use `React.lazy` and `Suspense` to load components only when needed.
- https://www.youtube.com/watch?v=nS5qbSJLGx8&ab_channel=DaveGray
    
    ```jsx
    const LazyComponent = React.lazy(() => import('./LazyComponent'));
    
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </Suspense>
    );
    ```
    

### **8. Use Virtualization for Large Lists**

- Use libraries like `react-window` or `react-virtualized` for efficiently rendering large lists by only rendering visible items.
- https://www.youtube.com/watch?v=1JoEuJQIJbs&ab_channel=CoderOne
    
    ```jsx
    // react-window1.x API; pin that major for this historical example.
    // Newer majors have different contracts; consult their official docs.
    import { FixedSizeList } from 'react-window';
    
    const MyList = ({ items }) => (
      <FixedSizeList
        height={400}
        width={300}
        itemSize={35}
        itemCount={items.length}
      >
        {({ index, style }) => <div style={style}>{items[index]}</div>}
      </FixedSizeList>
    );
    ```
    

### **9. Throttle and Debounce**

- For event handlers like `scroll` or `resize`, throttle or debounce updates to reduce re-renders.
- https://www.youtube.com/watch?v=cjIswDCKgu0&ab_channel=WebDevSimplified
- https://medium.com/@shubham3480/debouncing-and-throttling-in-react-e71c711fc6c5
    
    ```jsx
    // Fragment inside a component; debounce is the chosen library's cancellable helper.
    const handleScroll = useMemo(
      () => debounce(() => onScrollSettled(), 200),
      [onScrollSettled]
    );
    useEffect(() => {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        handleScroll.cancel();
      };
    }, [handleScroll]);
    ```
    

### **10. Optimize Third-Party Libraries**

- Analyze dependencies for performance bottlenecks and replace heavy libraries with lighter alternatives if possible.

### **11. Reduce Initial Load Time**

- Split bundles using `React.lazy` or a bundler like Webpack.
- Use code-splitting and tree-shaking to remove unused code.
https://medium.com/@balaji59321/maximizing-efficiency-with-tree-shaking-in-react-applications-848ef9994687
- Compress assets (e.g., images, JavaScript) and enable Gzip/Brotli on the server.

### **12. Profiling and Debugging**

- Use the React DevTools Profiler to identify performance bottlenecks.
- Use Chrome DevTools for network and rendering performance analysis.

---

### **Performance Checklist**

Use the [separate practice requirements and observation ledger](../../practice/frontend/react/Common_Performance_Issues_in_React.md). All learner work remains outstanding.

### **Conclusion**

Performance issues in React often stem from inefficient rendering, excessive state updates, or large component trees. By understanding and addressing these bottlenecks with tools like `React.memo`, `useCallback`, and virtualized lists, you can ensure your React application remains performant even as it scales.
## A controlled performance experiment

Define the user problem (for example typing becomes delayed with5,000rows), reproduce with representative data/device, and record a baseline browser trace. Classify network, JavaScript/React render, layout/paint and memory before selecting a technique. Deep trees or inline functions are not inherently slow; frequent updates are not necessarily DOM mutations. Virtualization reduces mounted DOM while data/cache retention can still grow.

Use React DevTools Profiler to inspect why a subtree rendered and its durations; use a browser trace for event latency/layout/paint. Console logs are rough diagnostics and development Strict Mode changes call counts. Standard production React disables Profiler timing by default; use an appropriate profiling build when collecting production-style React timings, then measure user performance with normal production output too. Keep data/browser/hardware/settings comparable and repeat runs.

**Trade-offs:** memo comparisons cost CPU and retain values; virtualization can complicate keyboard focus/measurement; splitting chunks can add waterfalls; a debounce adds latency and can lose a final event if cancelled rather than flushed. Choose cancel versus flush by domain: do not flush an autosave after its entity/user scope has changed. Server writes still need authorization/idempotency; client timing is not duplicate prevention.


Official references: [memo](https://react.dev/reference/react/memo), [useCallback](https://react.dev/reference/react/useCallback), [Profiler](https://react.dev/reference/react/Profiler), [react-window](https://github.com/bvaughn/react-window). React19 baseline; checked2026-10-20. Historical react-window1.x snippet is explicitly versioned; no need to master multiple virtualization libraries.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/react/Common_Performance_Issues_in_React.md). All learner practice remains outstanding; the worked examples above are explanatory material.
