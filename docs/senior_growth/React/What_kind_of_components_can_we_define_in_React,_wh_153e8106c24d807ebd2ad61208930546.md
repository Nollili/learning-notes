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
- For a custom error boundary using the supported class API; a maintained boundary library can expose a convenient function-oriented usage API.

---

### **3. Pure Components**

[https://www.youtube.com/watch?v=0whToN64bTg&ab_channel=FreeCourseUniversity](https://www.youtube.com/watch?v=0whToN64bTg&ab_channel=FreeCourseUniversity)

### **Definition**:

A special type of class component that implements a shallow comparison in `shouldComponentUpdate`. It can skip rendering when shallowly compared props/state are unchanged; own context and React lifecycle behavior still matter.

### **Characteristics**:

- Similar to regular class components but optimized.
- Shallow comparison is an optimization; mutable nested props can hide required changes.

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
import { useEffect } from 'react';

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

A performance optimization technique for functional components using `React.memo`. It can skip parent-driven rendering when props compare equal; it is not a rendering guarantee.

### **Characteristics**:

- Similar to `PureComponent` but for functional components.
- Compares each prop with Object.is by default; state/context updates can still render.

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
    import { useState } from 'react';

    const ControlledInput = () => {
      const [value, setValue] = useState("");
    
      return (
        <label>Name <input value={value} onChange={(e) => setValue(e.target.value)} /></label>
      );
    };
    ```
    

### **Uncontrolled Components**:

- The DOM manages the state of the input element.
- Example:
    
    ```jsx
    import { useRef, useState } from 'react';

    const UncontrolledInput = () => {
      const inputRef = useRef(null);
      const [submitted, setSubmitted] = useState('');
    
      const handleSubmit = () => {
        setSubmitted(inputRef.current?.value ?? '');
      };
    
      return (
        <div>
          <label>Name <input ref={inputRef} /></label>
          <button type="button" onClick={handleSubmit}>Submit</button>
          <output>{submitted}</output>
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
- **Class components remain supported**: prefer functions for new ordinary components; a custom error boundary is a current class-API use case.
- **Optimize with Hooks and Memoization**: Combine `useMemo`, `useCallback`, and `React.memo` for performance-critical apps.
- **Encapsulate Logic**: Use HOCs or custom hooks to abstract shared functionality.

## A current class use case: a contained render failure

Function components cannot implement getDerivedStateFromError/componentDidCatch as hooks. A custom boundary uses the supported class API, or choose a maintained error-boundary integration. A try/catch around creating a JSX element does not catch a later descendant render failure.

```tsx
// panel-boundary.tsx
import { Component } from 'react';
import type { ReactNode } from 'react';
type Props = { children: ReactNode; reportFailure?: (code: 'PANEL_RENDER_FAILED') => void };
type State = { failed: boolean };
export class PanelBoundary extends Component<Props, State> {
  state: State = { failed: false };
  static getDerivedStateFromError(): State { return { failed: true }; }
  componentDidCatch(): void { this.props.reportFailure?.('PANEL_RENDER_FAILED'); }
  render() {
    return this.state.failed ? <p role="alert">This panel is unavailable.</p> : this.props.children;
  }
}
```

The fallback hides raw exception messages/stacks and replaces only this subtree. The optional reportFailure callback belongs to a safe bounded telemetry adapter and must not throw; the example sends a fixed category, not props/PII/error payloads. Boundary errors themselves need an outer fallback. Typical event-handler/timer/unawaited-promise failures need their own handling; this boundary is not an HTTP error handler or a server-rendering recovery guarantee. React has specific transition/error integration behavior; use the installed version's documented contract rather than assuming every asynchronous exception is caught.

Changing only children after a caught failure keeps this boundary in its failed state. A deliberate parent-owned key such as recordId/attempt can remount it when navigation or an explicit recovery action justifies a new attempt. Resetting blindly while the same child still throws creates a repeated failure, not recovery. Keyed remount also discards local subtree state and affects focus; preserve unrelated user drafts elsewhere. Do not retry a committed server mutation just because a UI boundary reset.

**Acceptance drill:** render a throwing child with an unaffected sibling outside the boundary; require a safe alert, intact sibling and fixed telemetry code without the private exception string. Rerender a healthy child with the same key and verify fallback persists; change the recovery key and verify the healthy child appears. Confirm a still-throwing child remains a failure after remount. Typecheck the exact boundary and keep render recovery evidence separate from browser focus/AT, server errors and learner practice.

Validated baseline React19.3.0/@types/react19/TypeScript5.9.3. Official reference checked2026-10-22: [Component and error boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary). Hooks and performance wrappers are separate from this error-containment capability.

For working reducer/ref contracts, continue with the [pure reducer and scoped Context examples](./What_Are_React_Hooks_Good_For_Rules_of_Hooks.md#refs-pure-reducers-scoped-context-and-custom-hooks) and [typed imperative ref facade](./Have_you_used_React_with_TypeScript.md#narrow-imperative-ref-facade). These are implementations with ownership/validation exercises, not merely hook names.
