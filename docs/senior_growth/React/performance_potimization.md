# Performance Optimization in React

In this guide, we’ll cover several performance optimization techniques useful for React development. You will also learn some tips to improve rendering efficiency.

---

## Immutable Data Structures

Immutable data structures are fundamental for predictable state updates and efficient React rendering. Functional components, combined with hooks like `useState` and `useReducer`, benefit from immutability because it enables precise state comparison during reconciliation (e.g., `Object.is` comparison).

### Why Immutability Matters

- **No Side Effects:** Immutable updates prevent unintended mutations, ensuring cleaner and more predictable state management.
- **Simplified State Comparisons:** React can efficiently determine whether to re-render a component by comparing references (`===`).
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
````

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

UserProfile only re-renders if the `user` prop reference changes.

### When to Use

✅ Pure Components: Components that render the same output for the same props.
✅ Frequent Re-renders: Components in a frequently re-rendered subtree.

### Limitations

❎ Shallow Comparison: Only compares top-level props. For nested objects/arrays, use **Immer** or **immutable.js**.
❎ Overhead: Avoid using for rarely re-rendered components, as memoization cost may outweigh benefits.

### Custom Comparison

```javascript
const UserProfile = React.memo(
  ({ user }) => <div>{user.name}</div>,
  (prevProps, nextProps) => prevProps.user.id === nextProps.user.id
);
```

This ensures re-render only occurs when `user.id` changes.

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

* ❗ Prop Diff Failure: Creates new references on each render, triggering unnecessary re-renders.
* ❗ Garbage Collection Overhead: Each render generates a new function instance.
* ❗ Unintended Side Effects: May cause child components using `React.memo` or `useEffect` to re-render.

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
const handleCommentClick = useCallback((commentId) => {
  setSelectedCommentId(commentId);
}, []);

<Comment
  key={comment.id}
  comment={comment}
  onClick={() => handleCommentClick(comment.commentId)} 
/>
```

`useCallback` ensures stable function references between renders.

---

## Throttling and Debouncing

Frequent user events like scrolling, typing, or resizing can trigger expensive operations. **Throttling** and **debouncing** help manage these efficiently.

### Throttling

Delays function execution to at most once every `n` milliseconds. Useful for:

✅ Infinite scrolling
✅ Resize events
✅ Scroll events

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

✅ Search input
✅ Auto-saving

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
* Always clean up event listeners in `useEffect`.
* Memoize throttled/debounced functions with `useMemo`.

---

## Keys for map

Avoid using array index as a key:

```javascript
{comments.map((comment, index) => <Comment {...comment} key={index} />)}
```

### Problems

* ❗ Incorrect DOM updates
* ❗ Re-rendering issues
* ❗ Impacts stateful components

### Best Practices

* **Use unique identifiers:** `key={comment.id}`
* **Generate unique keys if necessary:** `uuidv4()`
* **Static/immutable lists:** Only then using index is acceptable

---

## Spreading Props on DOM Elements

Avoid spreading props directly into DOM elements:

```javascript
const CommentsText = (props) => <div {...props}>{props.text}</div>;
```

Better:

```javascript
const CommentsText = (props) => <div specificAttr={props.specificAttr}>{props.text}</div>;
```

---

## CSS Animations Instead of JS Animations

### Use CSS when:

✅ One-shot transitions (tooltips, hover effects)
✅ Smaller, self-contained UI element animations

### Use JS when:

✅ Advanced effects (bounce, pause, rewind)
✅ Need precise control over animation
✅ Triggering animations via events
✅ Using `requestAnimationFrame`

---

## Server-side Rendering (SSR)

SSR delivers content faster and improves SEO.

### Client-side Rendering (CSR) Flow:

1. Browser requests page → receives HTML + JS
2. Browser requests JS bundle → renders content

### SSR Flow:

1. Browser requests page → server renders HTML + sends to browser
2. Content is visible immediately

### Popular SSR Solutions

* **Next.js**
* **Gatsby**

