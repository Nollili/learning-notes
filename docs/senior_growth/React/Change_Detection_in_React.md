# Change Detection in React

Canonical owner: render snapshots, update queues, commit and browser paint. Continue with [entity identity and reconciliation trade-offs](./Could_you_explain_how_change_detection_mechanism_works_in_React%2C_tradeoffs_and_benefits.md); that companion retains editable-list and key examples.

Subjects: React

### **How Change Detection Works in React**

1. **State or Props Changes**:
    - A state update, ancestor render, context change or subscribed external-store update can cause component work. Function components are called; classes use render(). A new local object alone schedules nothing.
2. **Virtual DOM and Diffing**:
    - A new Virtual DOM tree is created based on the updated state or props.
    - React compares the new Virtual DOM tree with the previous one using its **diffing algorithm**. Reconciliation uses type/key/position heuristics to determine the host changes; it is not a globally minimal tree-edit optimizer.
3. **Efficient DOM Updates**:
    - React commits host mutations after render. A commit can involve multiple DOM operations; the browser separately schedules style/layout/paint. A render can finish with no DOM mutation.
4. **Component Update Control**:
    - Developers can control updates using methods like `shouldComponentUpdate` (class components) or `React.memo` (functional components). This reduces unnecessary renders.
    
    Class `shouldComponentUpdate` is an optional optimization hook; modern function examples use memo when measurement justifies it.
    
    [https://www.youtube.com/watch?v=40Bq8kOKB74&ab_channel=DavidParker](https://www.youtube.com/watch?v=40Bq8kOKB74&ab_channel=DavidParker)
    

### **Key Mechanisms Enabling Change Detection**

1. **Immutable State**:
    - Treat state/props as immutable snapshots. Setter value comparison can bail out using Object.is; a new object is useful when submitting changed state, but object allocation itself does not notify React.
    - Example:
        

```jsx
const newState = { ...oldState, key: 'newValue' }; // Only allocates.
setState(newState); // Queues an update; setter must belong to the component.
```
        
2. **Unidirectional Data Flow**:
    - React's one-way data flow ensures that changes propagate predictably, from parent to child components. Each component decides how to handle changes to its props or state.
3. **Fiber Architecture**:
    - Fiber allows React to break the rendering work into smaller units. It prioritizes tasks like animations or user input, enabling smoother updates in complex applications.
    
    [https://www.youtube.com/watch?v=0ympFIwQFJw&ab_channel=PhilipFabianek](https://www.youtube.com/watch?v=0ympFIwQFJw&ab_channel=PhilipFabianek)
    

## Reconciliation Algorithm in React

1. **Diffing Algorithm**:
    - React compares the new Virtual DOM with the previous one (diffing).
    - Changes are tracked at the node level (e.g., element type, attributes, children).
2. **Key Optimizations**:
    - **Element Type Comparison**: If the types of two nodes (e.g., `<div>` vs `<p>`) differ, React replaces the old node entirely.
    - **Props and State Updates**: Hook state updates use Object.is for equal-value bailout; memo compares each prop by Object.is by default. Ordinary component rendering is not universal shallow observation of arbitrary objects.
    - **Keys for Lists**: Keys identify siblings across inserts/reorders and determine state preservation. Stable keys do not automatically skip rendering.
3. **Fiber Architecture** (Introduced in React 16):
    - React's Fiber is a reimplementation of its reconciliation algorithm.
    - It breaks rendering into units of work, allowing React to pause and resume rendering.
    - Supports interruptible React rendering and update priorities. It does not interrupt an arbitrary long synchronous callback or guarantee animation deadlines.

### **Trade-offs of React's Change Detection Mechanism**

### **Benefits:** {#_1-benefits}

1. **Performance**:
    - Reconciliation computes host updates while preserving intended identity; it adds CPU/memory work and makes no universal speed or globally minimal-edit guarantee.
2. **Declarative Code**:
    - React’s declarative approach abstracts away the complexity of managing manual DOM updates.
3. **Scalability**:
    - React’s diffing and reconciliation scales well with large, component-based applications.
4. **Predictability**:
    - Immutable snapshots and one-way data flow make reasoning easier; developers still must handle external synchronization and async races correctly.

### **Trade-offs:** {#_2-trade-offs}

1. **Reconciliation Overhead**:
    - The diffing process, while efficient, still adds computational overhead. For extremely frequent updates, this might be a bottleneck.
2. **Learning Curve**:
    - React’s model, especially with advanced optimization techniques (`React.memo`, `useCallback`, etc.), requires developers to think differently compared to frameworks with two-way data binding (e.g., Angular).
3. **Not Always the Fastest**:
    - For simple applications with minimal DOM updates, React’s Virtual DOM abstraction can be slower than direct DOM manipulations in vanilla JavaScript.
4. **Memory Usage**:
    - Storing multiple Virtual DOM trees and intermediate objects increases memory consumption.
## Snapshot, queue, commit and paint

```jsx
import { useState } from 'react';
export function QueueLab() {
  const [count, setCount] = useState(0);
  const doubled = count * 2; // Derived during render; no second state/Effect.
  return <>
    <output aria-live="polite">{count} / doubled {doubled}</output>
    <button onClick={() => {
      setCount(count + 1);
      setCount(count + 1);
    }}>Replace twice (+1)</button>
    <button onClick={() => {
      setCount(n => n + 1);
      setCount(n => n + 1);
    }}>Update twice (+2)</button>
  </>;
}
```

Both replacement calls capture the same render snapshot. Functional updaters consume the queued previous result and must stay pure. Reading count immediately after its setter still reads the old snapshot. Automatic batching with modern roots includes more async callbacks than older event-only batching; do not assume every awaited step shares one batch or that separate intentional clicks are merged.

Object.is treats NaN as equal to NaN and distinguishes0 from−0. Calling a setter with an equal value can skip committed work; React may still call the component before discarding a result. A parent render normally visits descendants unless an applicable optimization skips them. Context updates can reach memoized consumers. React does not intercept arbitrary property writes or deeply watch an object.

A transition marks nonurgent React rendering work; it does not move expensive synchronous JavaScript to a worker or impose network response order. Keep controlled input updates urgent; measure the expensive result subtree before introducing transitions. Reconciliation is not browser layout, and useMemo caches a value rather than the component's entire render.


Official references: [render/commit](https://react.dev/learn/render-and-commit), [queued updates](https://react.dev/learn/queueing-a-series-of-state-updates), [state snapshots](https://react.dev/learn/state-as-a-snapshot), [useState](https://react.dev/reference/react/useState). React19 baseline; checked2026-10-20.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/react/Change_Detection_in_React.md). All learner practice remains outstanding; the worked examples above are explanatory material.
