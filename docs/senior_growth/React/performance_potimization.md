# Performance Optimization in React

---

## Immutable Data Structures

Immutable data structures are fundamental for predictable state updates and efficient React rendering. Functional components, combined with hooks like `useState` and `useReducer`, benefit from immutability because it enables precise state comparison during reconciliation (e.g., `Object.is` comparison).

### Why Immutability Matters

- **Snapshot ownership:** Copying each changed path avoids mutating previous state; it does not remove unrelated network or other side effects.
- **Simplified State Comparisons:** React uses `Object.is` for state equality and default per-prop memo comparison; allocating a new object alone schedules no update.
- **Improved Debugging:** Changes in immutable data structures can be tracked over time.

### Example

```javascript
const [users, setUsers] = useState([]);

const addNewUser = () => {
  setUsers((prevUsers) => [
    ...prevUsers,
    { userName: "robin", email: "robin@email.com" },
  ]);
};
```

Here, the `users` state is updated immutably using the spread operator.

**Tip:**

* **Arrays:** Use `[...array]` or `array.concat`.
* **Objects:** Use `{ ...object }` or libraries like **Immer**.

---

## React.memo

`React.memo` is a higher-order component that memoizes a component’s output to prevent unnecessary re-renders by performing a shallow comparison of props.

### Example

```javascript
const UserProfile = React.memo(({ user }) => {
  console.log("Rendering UserProfile");
  return <div>{user.name}</div>;
});
```

An unchanged user reference can skip parent-driven work; state/context changes can still render UserProfile. Do not mutate user behind a stable reference.

### When to Use

 Pure Components: Components that render the same output for the same props.
 Frequent Re-renders: Components in a frequently re-rendered subtree.

### Limitations

 Shallow Comparison: Only compares top-level props. Preserve immutable snapshots and compare the actual prop identities; a library does not make shallow comparison deep.
 Overhead: Avoid using for rarely re-rendered components, as memoization cost may outweigh benefits.

### Custom Comparison

```javascript
const UserProfile = React.memo(
  ({ user }) => <div>{user.name}</div>,
  (prevProps, nextProps) =>
    prevProps.user.id === nextProps.user.id &&
    prevProps.user.name === nextProps.user.name
);
```

The old id-only comparator hid same-id name edits. This example compares every field the component uses; adding behavior/fields requires updating the contract. Default per-prop comparison with primitive props is often simpler.

---

## React Fragments

Use **React Fragments** to avoid unnecessary DOM wrappers.

```javascript
return (
  <React.Fragment>
    Some text.
    <h2>A heading</h2>
  </React.Fragment>
);
```

Or with shorthand syntax:

```javascript
return (
  <>
    Some text.
    <h2>A heading</h2>
  </>
);
```

---

## Inline Function Definition

Defining functions inside JSX can lead to performance costs:

* Prop Diff Failure: Creates new references on each render, triggering unnecessary re-renders.
* Garbage Collection Overhead: Each render generates a new function instance.
* Unintended Side Effects: May cause child components using `React.memo` or `useEffect` to re-render.

### Inefficient Example

```javascript
<Comment
  key={comment.id}
  comment={comment}
  onClick={() => setSelectedCommentId(comment.commentId)} // Inline function
/>
```

### Optimized Approach

```javascript
import { memo, useCallback, useState } from 'react';
const Comment = memo(function Comment({ comment, selected, onSelect }) {
  return <li><button aria-pressed={selected} onClick={() => onSelect(comment.id)}>
    {comment.text}
  </button></li>;
});
export function CommentList({ comments }) {
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const handleCommentClick = useCallback(id => setSelectedCommentId(id), []);
  return <ul>{comments.map(comment => <Comment
    key={comment.id}
    comment={comment}
    selected={comment.id === selectedCommentId}
    onSelect={handleCommentClick}
  />)}</ul>;
}
```

Pass the cached function itself across the boundary. Passing `onClick={() => handleCommentClick(id)}` from the parent would create a fresh prop every render. The original example did exactly that and did not implement its claimed optimization.

---

## Throttling and Debouncing

Frequent user events like scrolling, typing, or resizing can trigger expensive operations. **Throttling** and **debouncing** help manage these efficiently.

### Throttling

Delays function execution to at most once every `n` milliseconds. Useful for:

 Infinite scrolling
 Resize events
 Scroll events

```javascript
import { throttle } from "lodash";

const handleScroll = throttle(() => {
  if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight) {
    fetchMoreData();
  }
}, 500);
```

### Debouncing

Delays execution until the event stops firing. Useful for:

 Search input
 Auto-saving

```javascript
import { debounce } from "lodash";
import { useState, useMemo } from "react";

const handleSearch = useMemo(
  () => debounce((query) => console.log("Searching for:", query), 1000),
  []
);
```

### Key Differences

| Feature          | Throttling                         | Debouncing                    |
| ---------------- | ---------------------------------- | ----------------------------- |
| Execution Timing | Executes at regular intervals      | Executes after event stops    |
| Use Case         | Continuous events (scroll, resize) | Burst events (typing, clicks) |
| Example          | Infinite scroll, scroll analytics  | Search bar, auto-save         |

**Best Practices:**

* Prefer libraries like **lodash**.
* Always remove event listeners and call cancel on pending debounced/throttled functions in Effect cleanup; include reactive callback dependencies.
* Memoize throttled/debounced functions with `useMemo`.

---

## Keys for map

Avoid using array index as a key:

```javascript
{comments.map((comment, index) => <Comment {...comment} key={index} />)}
```

### Problems

* Incorrect DOM updates
* Re-rendering issues
* Impacts stateful components

### Best Practices

* **Use unique identifiers:** `key={comment.id}`
* **Generate IDs when records are created:** persist the ID with data; never call uuid/random during each render.
* **Static/immutable lists:** Only then using index is acceptable

---

## Spreading Props on DOM Elements

Avoid spreading props directly into DOM elements:

```javascript
const CommentsText = (props) => <div {...props}>{props.text}</div>;
```

Better:

```javascript
const CommentsText = ({ text, className, id }) => <div id={id} className={className}>{text}</div>;
```

---

## CSS Animations Instead of JS Animations

### Use CSS when:

 One-shot transitions (tooltips, hover effects)
 Smaller, self-contained UI element animations

### Use JS when:

 Advanced effects (bounce, pause, rewind)
 Need precise control over animation
 Triggering animations via events
 Using `requestAnimationFrame`

---

## Server-side Rendering (SSR)

SSR can improve early content availability and crawlability, depending on server latency, caching and content. It does not guarantee faster interactivity, rankings or security.

### Client-side Rendering (CSR) Flow:

1. Browser requests page → receives HTML + JS
2. Browser requests JS bundle → renders content

### SSR Flow:

1. Browser requests page → server renders HTML + sends to browser
2. Browser still loads styles/assets, lays out and paints; interactive behavior may require hydration

### Popular SSR Solutions

* **Next.js**
* **Gatsby**


## Cleanup and optimization acceptance

The throttle/debounce snippets above are fragments, not complete component lifecycles. Create the wrapper once per relevant dependency set, install the listener in an Effect and cancel pending work in cleanup. A complete integration pattern is in [Common Performance Issues](./Common_Performance_Issues_in_React.md). If fetchMoreData is asynchronous, also prevent overlap and stale-response commits; throttling alone does not bound active requests.

```jsx
import { useEffect, useMemo } from 'react';
import { debounce } from 'lodash';
export function SearchInput({ query, onSearch }) {
  const schedule = useMemo(() => debounce(onSearch, 300), [onSearch]);
  useEffect(() => {
    schedule(query);
    return () => schedule.cancel();
  }, [query, schedule]);
  return null; // Companion scheduling component, not an unlabeled visible input.
}
```

An inline function is an allocation, not an unintended side effect by itself. It matters when an identity-sensitive child/Effect/subscription observes it and meaningful work follows. useMemo does not stop its component rendering; immutability does not prevent request races. Prop spreading into a DOM element should be an intentional public API with valid attributes, not a blanket ban; filter internal/sensitive props and preserve required ARIA/data/event contracts.


Official references: [memo](https://react.dev/reference/react/memo), [useMemo](https://react.dev/reference/react/useMemo), [useCallback](https://react.dev/reference/react/useCallback), [Effect cleanup](https://react.dev/reference/react/useEffect), [lodash debounce/cancel](https://lodash.com/docs/#debounce). React19 baseline; checked2026-10-20.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/react/performance_potimization.md). All learner practice remains outstanding; the worked examples above are explanatory material.
