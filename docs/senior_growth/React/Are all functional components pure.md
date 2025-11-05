### Are all functional components pure?

No, not all functional components in React are **pure**. While functional components can be written as **pure functions**, their purity depends on how they are implemented. Let's explore what this means in the context of React:

### **What is a Pure Function?**

A pure function is a function that:

1. Always produces the same output for the same input.
2. Has no side effects (e.g., modifying variables outside its scope, making API calls, etc.).

Example of a pure function:

```jsx
const add = (a, b) => a + b;
```

---

### **Functional Components in React**

React functional components are JavaScript functions that return JSX. By default, they are not inherently pure or impure; their purity depends on how they are written.

### **Example of a Pure Functional Component**:

```jsx
const Greeting = ({ name }) => <h1>Hello, {name}!</h1>;
```

- For the same `name` prop, the output (rendered JSX) will always be the same.
- There are no side effects, making it a pure component.

---

### **Impure Functional Components**

A functional component becomes **impure** if:

1. It performs side effects (e.g., making an API call, modifying state, logging to the console).
2. It produces different outputs for the same inputs, due to reliance on external factors like global variables or untracked state.

### **Example of an Impure Functional Component**:

```jsx
const ImpureGreeting = ({ name }) => {
  console.log("Rendering component"); // Side effect
  return <h1>Hello, {name}!</h1>;
};
```

- The `console.log` is a side effect, making the component impure.

Another example:

```jsx
let counter = 0;

const Counter = () => {
  counter++; // Modifying external state
  return <h1>Counter: {counter}</h1>;
};
```

- The component's output depends on the external `counter` variable, so it's impure.

---

### **Purity in React's Context**

In React, **pure components** are those that:

- Render the same output given the same props and state.
- Do not rely on external variables or cause unintended side effects.

React provides tools like **React.memo** to optimize functional components and treat them as "pure" from a performance standpoint.

### **Using React.memo**:

```jsx
const PureGreeting = React.memo(({ name }) => <h1>Hello, {name}!</h1>);
```

- `React.memo` prevents unnecessary re-renders if the `name` prop hasn't changed.

---

### **Side Effects with Hooks**

Functional components often perform side effects using hooks like `useEffect`, `useState`, or `useReducer`. These components are not strictly pure, but the side effects are managed in a controlled way, which aligns with React's principles.

### **Example**:

```jsx
const FetchData = ({ userId }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/user/${userId}`)
      .then((response) => response.json())
      .then((data) => setData(data));
  }, [userId]); // Side effect (API call) managed using useEffect.

  return data ? <div>{data.name}</div> : <div>Loading...</div>;
};
```

- This is not a pure function because of the side effect (`fetch`), but it adheres to React's functional paradigm.

---

### **When Purity Matters**

- **Optimization**: Pure functional components can be optimized with tools like `React.memo`.
- **Predictability**: Pure components are easier to test and debug because their behavior is deterministic.
- **Code Clarity**: Writing pure components encourages better separation of concerns.

---

### **Conclusion**

Not all functional components are pure, and they don’t need to be. While React encourages writing predictable, declarative components, it's common and acceptable to introduce side effects (e.g., fetching data or updating state) using hooks. Strive to make components as pure as possible, while handling side effects in a controlled and predictable manner.