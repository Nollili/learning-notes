# Composition and Higher-Order Components (HOCs) in React

Subjects: React

## **1. Composition**

**Definition**:

Composition is a design principle where components are composed together by passing other components or elements as **children** or **props**. It aligns with React’s declarative nature and avoids tight coupling between components.

[https://www.youtube.com/watch?v=3XaXKiXtNjw&t=284s&ab_channel=ReactTraining](https://www.youtube.com/watch?v=3XaXKiXtNjw&t=284s&ab_channel=ReactTraining)

**Example**:

```jsx
const Card = ({ children }) => (
  <div className="card">
    {children}
  </div>
);

const App = () => (
  <Card>
    <h1>Title</h1>
    <p>Content goes here...</p>
  </Card>
);
```

### **Advantages of Composition**:

1. **Flexibility**:
    - You can customize components dynamically by passing different children or props.
2. **Readable and Declarative**:
    - Encourages readable, declarative, and modular code.
3. **Better Encapsulation**:
    - Each component handles only what it is responsible for without making assumptions about its parent or children.
4. **Simplifies Testing**:
    - Small, self-contained components are easier to test independently.
5. **Encourages Reusability**:
    - Components are built to be generic and reusable across the app.

### **Disadvantages of Composition**:

1. **Can Lead to Overuse**:
    - Over-composing components might make the tree unnecessarily deep and harder to follow.
2. **Prop Drilling**:
    - Passing props through many layers of components can become cumbersome (can be mitigated using context or state management libraries).

---

### **2. Higher-Order Components (HOCs)**

**Definition**:

A Higher-Order Component is a **function** that takes a component as input and returns an enhanced or wrapped component. It is a pattern often used to add behavior, logic, or state to components.

**Example**:

```jsx
const withLogging = (WrappedComponent) => {
  return (props) => {
    useEffect(() => {
      console.log("Component mounted");
    }, []);
    return <WrappedComponent {...props} />;
  };
};

const Button = ({ label }) => <button>{label}</button>;

const ButtonWithLogging = withLogging(Button);
```

### **Advantages of HOCs**:

1. **Code Reuse**:
    - Encapsulates shared logic (e.g., logging, authentication) into a single HOC, making it reusable.
2. **Separation of Concerns**:
    - Keeps components focused on rendering UI while HOCs handle additional logic.
3. **Dynamic Enhancements**:
    - Can add functionality to existing components without modifying them.

### **Disadvantages of HOCs**:

1. **Complex Debugging**:
    - Debugging a component wrapped by multiple HOCs can be difficult due to additional layers of abstraction.
2. **Prop Collisions**:
    - If an HOC adds props that conflict with the wrapped component's props, it can lead to bugs.
3. **Performance Overhead**:
    - Wrapping a component with multiple HOCs may introduce performance overhead.
4. **Obsolete for Many Use Cases**:
    - Since the introduction of hooks, many scenarios that required HOCs can now be handled more cleanly with custom hooks.

---

### **Composition vs. Inheritance**

React emphasizes **composition over inheritance**, deviating from traditional object-oriented programming principles. Here's why:

### **Why Composition is Recommended**:

1. **Decoupled Components**:
    - Composition avoids tight coupling between components, making them easier to test, reuse, and maintain.
2. **Simpler and More Flexible**:
    - Instead of extending a base class, you can assemble functionality by composing small, focused components.
3. **Avoids Inheritance Chains**:
    - Inheritance often leads to deep hierarchies that are hard to debug and reason about.
4. **Dynamic Behaviors**:
    - You can pass different children or props to change the behavior of a component, making it more dynamic.
5. **Encourages Function Composition**:
    - React’s functional programming paradigm aligns well with composition.

### **Example: Composition Over Inheritance**

Inheritance (not recommended):

```jsx
class BaseButton extends React.Component {
  render() {
    return <button>{this.props.label}</button>;
  }
}

class IconButton extends BaseButton {
  render() {
    return (
      <div>
        <i className="icon" />
        {super.render()}
      </div>
    );
  }
}
```

Composition (recommended):

```jsx
const IconButton = ({ icon, label }) => (
  <button>
    <i className={icon}></i>
    {label}
  </button>
);
```

---

### **Composition vs. HOCs**

| Feature | **Composition** | **HOCs** |
| --- | --- | --- |
| **Definition** | Assembling components by nesting or passing components as props. | A function that takes a component and returns an enhanced version. |
| **Readability** | Easy to read and follow (declarative). | Can become verbose and hard to debug. |
| **Flexibility** | Flexible; components can adapt to many use cases. | Less flexible; works for adding fixed behaviors or logic. |
| **Performance** | Minimal performance overhead. | Slight overhead due to wrapping. |
| **Modern Use Case** | Widely used in modern React applications. | Becoming less common due to the introduction of hooks. |
| **Learning Curve** | Intuitive and easy to learn. | Requires understanding of HOC patterns and advanced React concepts. |

---

### **When to Use What?**

- **Use Composition**:
    - For structuring UIs and passing behaviors or components dynamically.
    - When you want a simple, declarative approach.
    - Example: Layouts, component nesting, or rendering slots.
- **Use HOCs**:
    - For legacy React codebases where hooks are not available.
    - When abstracting cross-cutting concerns like authentication, logging, or data fetching.
    - Example: Wrapping components with logic reusable across multiple components.

---

### **Conclusion**

- **React favors composition** because:
    - It is simpler, more readable, and aligns with React’s declarative philosophy.
    - It avoids issues associated with deep inheritance chains.
- **HOCs** were widely used before hooks and still have valid use cases in older codebases, but they are gradually being replaced by **composition and custom hooks**.