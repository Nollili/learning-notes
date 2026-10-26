# Practical Tips for Front-End Optimization

Subjects: React

1. **Use Keys in Lists**: Avoid index-based keys; use unique, stable identifiers.
2. **Memoization**:
    - Use `React.memo` for functional components to prevent unnecessary re-renders.
    - Use `useMemo` or `useCallback` to cache expensive computations or functions.
3. **Avoid Heavy Render Trees**: Break large components into smaller ones to limit the Virtual DOM diffing scope.
4. **Batch Updates**:
    - Modern roots batch more than event handlers, including many asynchronous callbacks; snapshot/queue semantics still determine the result.

### **Optimizing Change Detection in React**

To reduce the cost of unnecessary renders and improve performance:

1. **`React.memo`**:
    - Memo can skip eligible parent-driven renders when compared props are equal; local state/context/external subscriptions can still update the component.
    
    ```jsx
    const MyComponent = React.memo(({ prop }) => { ... });
    ```
    
2. **`useCallback` and `useMemo`**:
    - Cache functions and computations to avoid re-execution during re-renders.
    
    ```jsx
    const memoizedCallback = useCallback(() => { ... }, [dependencies]);
    ```
    
3. **Keys for Lists**:
    - Use unique and stable keys to help React efficiently reconcile lists.
4. **Measure Callback Identity Where It Matters**:
    - A fresh function reference matters to a consumer whose equality/dependency contract observes it. Inline handlers are not inherently slow; useCallback has costs and does not skip invocation of the callback.
5. **Lazy Loading**:
    - Use `React.lazy()` to load components only when needed.
6. **Batch Updates**:
    - Modern automatic batching is broader than event handlers; separate intentional events and arbitrary await boundaries must not be assumed one batch.

## Predict queued state before optimizing it

Run the exact [QueueLab snapshot/functional-updater example](./Change_Detection_in_React.md#snapshot-queue-commit-and-paint). Two setCount(count+1) replacements capture the same value and yield+1; two pure n=>n+1 updaters consume queued results and yield+2. This is correctness, not a promise about an incidental number of component calls. Derived doubled is computed during render instead of synchronizing a second state through an effect.

**Acceptance:** predict then run both buttons and repeated independent clicks; retain correct count/derived output. Add a parent update and distinguish component calls, committed DOM changes and browser paint. Use profiling to locate an expensive consumer before adding memoization; test context/local-state changes and stable-key identity as well. Keep effects/handlers correct under StrictMode. A timer/debounce may reduce frequency while delaying feedback, and a transition does not offload synchronous CPU work. Native trace/performance and learner results remain unperformed.

Official references checked 2026-10-22: [queued updates](https://react.dev/learn/queueing-a-series-of-state-updates), [memo limits](https://react.dev/reference/react/memo), [render and commit](https://react.dev/learn/render-and-commit).
