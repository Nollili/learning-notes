# Practical Tips for Front-End Optimization

Subjects: React

1. **Use Keys in Lists**: Avoid index-based keys; use unique, stable identifiers.
2. **Memoization**:
    - Use `React.memo` for functional components to prevent unnecessary re-renders.
    - Use `useMemo` or `useCallback` to cache expensive computations or functions.
3. **Avoid Heavy Render Trees**: Break large components into smaller ones to limit the Virtual DOM diffing scope.
4. **Batch Updates**:
    - React automatically batches state updates in event handlers, reducing re-renders.

### **Optimizing Change Detection in React**

To reduce the cost of unnecessary renders and improve performance:

1. **`React.memo`**:
    - Wrap functional components to prevent re-renders when props haven’t changed.
    
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
4. **Avoid Inline Functions**:
    - Inline functions create new references on every render, triggering unnecessary updates.
5. **Lazy Loading**:
    - Use `React.lazy()` to load components only when needed.
6. **Batch Updates**:
    - React automatically batches updates in event handlers, reducing the number of renders.