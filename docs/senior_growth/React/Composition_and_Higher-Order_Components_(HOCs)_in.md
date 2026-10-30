# Composition and higher-order components in React {#composition-and-hocs-advantages-and-disadvantages-why-composition-is-recommended-against-inheritance-in-react}

Canonical owner: slots, controlled tabs and typed HOC prop/ref transparency. [The short HOC decision guide](./HOC%2C_what_is_it%2C_when_to_use.md) compares hooks/adapters without duplicating this implementation.

## Composition and Higher-Order Components (HOCs) in React {#composition-and-higher-order-components-hocs-in-react}

## **Composition** {#_1-composition}

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

### **Higher-Order Components (HOCs)** {#_2-higher-order-components-hocs}

**Definition**:

A Higher-Order Component is a **function** that takes a component as input and returns an enhanced or wrapped component. It is a pattern often used to add behavior, logic, or state to components.

**Example**:

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

React favors assembling components through explicit props and ownership instead of inheriting rendering behavior. Here's why:

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
| **Performance** | Depends on the resulting tree and actual work; profile it. | Depends on wrapper behavior, identity and subscriptions; profile it. |
| **Modern Use Case** | Widely used in modern React applications. | Becoming less common due to the introduction of hooks. |
| **Learning Curve** | Intuitive and easy to learn. | Requires understanding of HOC patterns and advanced React concepts. |

---

### **When to Use What?**

- **Use Composition**:
    - For structuring UIs and passing behaviors or components dynamically.
    - When you want a simple, declarative approach.
    - Example: Layouts, component nesting, or rendering slots.
- **Use HOCs**:
    - For component adapters, including legacy class integration or a modern API that specifically accepts a component type.
    - When abstracting cross-cutting concerns like authentication, logging, or data fetching.
    - Example: Wrapping components with logic reusable across multiple components.

---

### **Conclusion**

- **React favors composition** because:
    - It is simpler, more readable, and aligns with React’s declarative philosophy.
    - It avoids issues associated with deep inheritance chains.
- **HOCs** were widely used before hooks and still have valid use cases in older codebases, but they are gradually being replaced by **composition and custom hooks**.

## Explicit slots, controlled state and stable compound identities

React19/TypeScript baseline. Composition is an API design decision: document required content, named slots, state ownership and event meaning. A layout shell can own structure while the caller supplies a title/action/body. Passing ReactNode does not promise an interactive child has the right accessible name; callers still own the semantics of supplied content. Avoid cloning arbitrary children and guessing their purpose from array positions.

<<< ../../workbench/frontend/react/composition/composition-contracts.tsx{tsx}

The parent owns selected identity. Buttons emit IDs and rendering derives selected state from that value/items; label changes and reordering do not turn item2 into a different logical selection. Duplicate IDs fail early. If the selected item disappears/becomes disabled, the view derives the first enabled fallback. The owner decides whether to persist that canonical fallback; render must not mutate parent state or trigger a callback. No enabled items renders an explicit empty state.

This example is horizontal LTR with automatic activation for immediately available local panels. Arrow keys wrap and skip disabled items; Home/End move to first/last enabled. A panel that needs a slow fetch should use a deliberate manual-activation/loading policy rather than launch an expensive request on every focus move. RTL/vertical behavior needs a corresponding contract/test. Enter/Space use native button activation. Stable IDs, ARIA references, focus behavior and selected value are separate concerns; a React key alone does not implement all of them.

All panels remain mounted under stable IDs and inactive panels are hidden, preserving local component state. Hidden panels can still run effects/subscriptions, so their resource policy remains explicit. Unmounting inactive panels is an alternative that resets local state and changes aria-controls availability; decide whether drafts belong in the owner. If a focused tab is removed, coordinate focus recovery to a surviving control; this small example does not manage arbitrary concurrent removal of the focused DOM node.

HOCs remain useful for component adapters, including modern code; they are not restricted to pre-hook projects. Define wrapper prop injection/collisions, static fields and ref handling instead of assuming those are automatically forwarded. Create an HOC at module scope so a parent render does not manufacture a new component type and reset state. A custom hook shares stateful logic, not a single state instance across all callers. An authentication-looking wrapper can hide UI; the backend must still authorize every operation.


Official references: [React props/JSX composition](https://react.dev/learn/passing-props-to-a-component), [state ownership](https://react.dev/learn/sharing-state-between-components), [state identity](https://react.dev/learn/preserving-and-resetting-state), [WAI tabs keyboard/activation](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). Checked2026-10-21.

## Typed prop and ref transparency in React19

This focused adapter uses React19.3.0/types19 and TypeScript5.9.3. Prefer a direct composed button or a custom hook when that API is simpler; an HOC is justified here only when a caller needs an enhanced component type. The contract is intentionally specific instead of hiding unsafe generic prop injection behind assertions.

<<< ../../workbench/frontend/react/composition/action-adapter.tsx{tsx}

React19 function components receive ref as a prop; the wrapper spreads it and ActionButton forwards it to the native button. React18 needs an explicit forwardRef adapter at each appropriate boundary; copying this React19 contract into a React18 project does not make refs transparent. This example forwards supported native props, children, className and the caller click handler. It reserves aria-busy and native disabled behavior for pending/disabled state.

Omit alone does not reject every hyphenated JSX attribute; the explicit never property makes the reserved aria-busy collision a checked error. The caller owns the accessible name, request lifecycle, status/error presentation, commit semantics and any asynchronous handler rejection.

The caller handler runs first; preventDefault opts out of telemetry. A synchronous telemetry failure is intentionally contained. record returns undefined rather than void so the public type does not silently accept an async function whose promise is ignored; an asynchronous telemetry service needs a separately owned bounded/error-handled queue. No personal event payload is captured. If the caller's handler throws, its normal error policy applies and telemetry is not run. These semantics must be documented because event chaining order changes behavior.

A supplied Wrapped component must honor the same ref/disabled/handler contract; the type alone cannot make an arbitrary implementation forward props correctly. The wrapper does not copy custom static properties, preserve arbitrary generic component signatures or forward React's special key as an ordinary prop. Expose a deliberate adapter API for those requirements. Creating withActionTelemetry inside a parent render creates a new component type and can reset child state/focus; memoizing callbacks does not repair that identity mistake.


Official references checked2026-10-22: [React19 ref as prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop), [state/type identity](https://react.dev/learn/preserving-and-resetting-state), [pure rendering and effects](https://react.dev/reference/rules/components-and-hooks-must-be-pure).

<<< ../../workbench/frontend/react/composition/action-adapter-types.tsx{tsx}


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/react/Composition_and_Higher-Order_Components_%28HOCs%29_in.md). All learner practice remains outstanding; the worked examples above are explanatory material.
