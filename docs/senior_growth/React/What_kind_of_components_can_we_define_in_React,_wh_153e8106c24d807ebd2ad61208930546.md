### What kind of components can we define in React, what's the difference between them?

In React, components are the building blocks of the user interface. They come in two main types: **Functional Components** and **Class Components**. 

### **1. Functional Components**

### **Definition**:

Functional components are JavaScript functions that accept props as arguments and return React elements (JSX). They are the modern standard in React, especially since the introduction of **hooks** in React 16.8.

### **Characteristics**:

- **Stateless (historically)**: Before hooks, functional components couldn't manage state or lifecycle methods.
- **With Hooks (modern)**: Functional components can now handle state and lifecycle methods using hooks like `useState`, `useEffect`, etc.
- **Simpler Syntax**: More concise and readable compared to class components.

### **Example**:

```jsx
import React, { useState, useEffect } from "react";

const Counter = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("Count updated:", count);
  }, [count]);

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
};
```

### **When to Use**:

- For most modern React development.
- When you need hooks for state or lifecycle logic.
- For simple and reusable components.

---

### **2. Class Components**

### **Definition**:

Class components are ES6 classes that extend `React.Component` and include a `render()` method that returns JSX.

### **Characteristics**:

- **Stateful**: Can manage local state using `this.state`.
- **Lifecycle Methods**: Provide explicit lifecycle methods like `componentDidMount`, `shouldComponentUpdate`, etc.
- **Verbose**: Requires more boilerplate code compared to functional components.

### **Example**:

```jsx
import React, { Component } from "react";

class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  increment = () => {
    this.setState((prevState) => ({ count: prevState.count + 1 }));
  };

  render() {
    return <button onClick={this.increment}>Count: {this.state.count}</button>;
  }
}
```

### **When to Use**:

- In legacy React applications or when maintaining older codebases.
- For complex use cases that existed before hooks.

---

### **3. Pure Components**

[https://www.youtube.com/watch?v=0whToN64bTg&ab_channel=FreeCourseUniversity](https://www.youtube.com/watch?v=0whToN64bTg&ab_channel=FreeCourseUniversity)

### **Definition**:

A special type of class component that implements a shallow comparison in `shouldComponentUpdate`. It helps optimize performance by re-rendering only when necessary.

### **Characteristics**:

- Similar to regular class components but optimized.
- Automatically prevents unnecessary renders for performance.

### **Example**:

```jsx
import React, { PureComponent } from "react";

class PureCounter extends PureComponent {
  render() {
    console.log("Rendering...");
    return <p>{this.props.value}</p>;
  }
}
```

### **When to Use**:

- For performance optimization when you know the component doesn't require deep state checks.
- Alternative: Use `React.memo` with functional components.

---

### **4. Higher-Order Components (HOCs)**

### **Definition**:

A Higher-Order Component is a function that takes a component as input and returns a new component, enhancing it with additional functionality.

### **Characteristics**:

- Not a type of component but a pattern.
- Often used for cross-cutting concerns like logging, theming, or fetching data.
- Replaced by hooks in many scenarios.

### **Example**:

```jsx
const withLogging = (WrappedComponent) => {
  return (props) => {
    useEffect(() => {
      console.log("Component mounted");
    }, []);
    return <WrappedComponent {...props} />;
  };
};

const Hello = (props) => <p>Hello, {props.name}!</p>;

const HelloWithLogging = withLogging(Hello);
```

### **When to Use**:

- To abstract common logic shared across multiple components.
- Prefer hooks for new codebases.

---

### **5. Memoized Components**

### **Definition**:

A performance optimization technique for functional components using `React.memo`. It prevents re-renders if props haven’t changed.

### **Characteristics**:

- Similar to `PureComponent` but for functional components.
- Uses shallow comparison for props.

### **Example**:

```jsx
import React from "react";

const Greeting = React.memo(({ name }) => {
  console.log("Rendering Greeting");
  return <p>Hello, {name}!</p>;
});
```

### **When to Use**:

- For functional components that re-render unnecessarily due to unchanged props.
- Combine with `useCallback` for passing stable references.

---

### **6. Controlled and Uncontrolled Components**

### **Controlled Components**:

- React manages the state of the input element.
- Example:
    
    ```jsx
    const ControlledInput = () => {
      const [value, setValue] = useState("");
    
      return (
        <input value={value} onChange={(e) => setValue(e.target.value)} />
      );
    };
    ```
    

### **Uncontrolled Components**:

- The DOM manages the state of the input element.
- Example:
    
    ```jsx
    const UncontrolledInput = () => {
      const inputRef = useRef();
    
      const handleSubmit = () => {
        console.log(inputRef.current.value);
      };
    
      return (
        <div>
          <input ref={inputRef} />
          <button onClick={handleSubmit}>Submit</button>
        </div>
      );
    };
    ```
    

---

### **Comparison Table**

| **Feature** | **Functional Components** | **Memoized Components** | **Class Components** | **Pure Components** | **HOCs** |
| --- | --- | --- | --- | --- | --- |
| **Syntax** | Simple and concise | Similar to functional components | Verbose | Similar to class components | Pattern, not a component type |
| **State Management** | Hooks (`useState`, `useReducer`) | Same as functional components | `this.state` | Same as class components | Depends on wrapped component |
| **Performance** | Hooks like `useMemo`/`useCallback` | Optimized with `React.memo` | Requires manual optimization | Optimized with shallow comparison | No direct performance impact |
| **Lifecycle Methods** | Replaced with hooks (`useEffect`) | Same as functional components | Lifecycle methods (`componentDidMount`) | Same as class components | Dependent on implementation |
| **Modern Usage** | Preferred | Common for performance tuning | Less common | Rare | Rare |

---

### **Conclusion**

- **Use Functional Components**: They are the modern and preferred way to build React applications.
- **Avoid Class Components**: Use only for legacy codebases or if required by older libraries.
- **Optimize with Hooks and Memoization**: Combine `useMemo`, `useCallback`, and `React.memo` for performance-critical apps.
- **Encapsulate Logic**: Use HOCs or custom hooks to abstract shared functionality.