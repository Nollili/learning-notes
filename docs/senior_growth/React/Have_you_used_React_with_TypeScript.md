# Have you used React with TypeScript? {#have-you-used-react-with-typescript}

React and TypeScript are a powerful combination that enhances the development experience by providing static typing, better tooling, and improved code quality. 

### **Key Benefits of Using TypeScript with React**

1. **Static Typing**: Catch type-related bugs at compile time, reducing runtime errors.
2. **Intellisense & Autocomplete**: TypeScript enhances IDE features, making it easier to explore props, hooks, and custom functions.
3. **Improved Documentation**: Explicit types act as self-documenting code, improving maintainability.
4. **Refactoring Safety**: TypeScript ensures that renaming or modifying components and types is safer and less error-prone.
5. **Integration with Ecosystem**: Works seamlessly with popular React libraries like `React Router`, `Redux`, `Formik`, and more.

---

### **Common Use Cases of TypeScript in React**

### **Typing Props** {#_1-typing-props}

TypeScript allows you to define the structure of props a component should receive.

**Example**:

```tsx
type GreetingProps = {
  name: string;
  age?: number; // Optional prop
};

const Greeting: React.FC<GreetingProps> = ({ name, age }) => (
  <div>
    <h1>Hello, {name}!</h1>
    {age !== undefined && <p>Age: {age}</p>}
  </div>
);
```

- `name` is required, while `age` is optional.
- The TypeScript compiler will throw an error if the `Greeting` component is used without the required `name` prop.

---

### **Typing State and Refs** {#_2-typing-state-and-refs}

TypeScript works well with React’s state and `useRef`.

**State Example**:

```tsx
import React, { useState } from "react";

const Counter: React.FC = () => {
  const [count, setCount] = useState<number>(0); // Explicitly typing state
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
};
```

**Refs Example**:

```tsx
import React, { useRef } from "react";

const InputFocus: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div>
      <label>Name <input ref={inputRef} type="text" /></label>
      <button onClick={focusInput}>Focus Input</button>
    </div>
  );
};
```

---

### **Typing Hooks** {#_3-typing-hooks}

Custom hooks can also benefit from TypeScript.

**Example**:

```tsx
import { useState } from "react";

function useCounter(initialValue: number) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);

  return { count, increment, decrement };
}

const Counter: React.FC = () => {
  const { count, increment, decrement } = useCounter(0);
  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
};
```

---

### **Typing Events** {#_4-typing-events}

TypeScript provides detailed types for event handlers.

**Example**:

```tsx
const InputChangeHandler: React.FC = () => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
  };

  return <label>Name <input type="text" onChange={handleChange} /></label>;
};
```

---

### **Challenges of React with TypeScript**

1. **Learning Curve**: Developers new to TypeScript may initially find typing complex props or states challenging.
2. **Boilerplate**: Defining types and interfaces can add extra lines of code, especially for large components.
3. **Third-Party Libraries**: Some libraries may not have complete or accurate TypeScript typings, requiring manual definitions.
4. **Overhead for Simple Projects**: For very small projects, the benefits of TypeScript might not outweigh the additional setup and complexity.

---

### **Best Practices**

1. **Leverage Utility Types**:
    
    https://www.youtube.com/watch?v=EU0TB_8KHpY&ab_channel=MattPocock
    TypeScript provides built-in utility types like `Partial`, `Pick`, `Omit`, and `Record` to simplify prop and state definitions.
    
    **Example**:
    
    ```tsx
    type User = {
      id: string;
      name: string;
      email: string;
    };
    
    type UserWithoutEmail = Omit<User, "email">;
    ```
    
2. **Use Default Props or Initializers**:
Use default parameters for function components (React19 no longer applies function defaultProps). Explicit null does not trigger a default.
    
    **Example**:
    
    ```tsx
    type ButtonProps = {
      label: string;
      disabled?: boolean;
    };
    
    const Button: React.FC<ButtonProps> = ({ label, disabled = false }) => (
      <button disabled={disabled}>{label}</button>
    );
    ```
    
3. **Adopt TypeScript ESLint Rules**:
Use linting tools like [typescript-eslint](https://typescript-eslint.io/) to enforce consistent typing practices.
4. **Enable Strict Mode**:
Add `"strict": true` in `tsconfig.json` to catch more type errors.

---

### **Conclusion**

React and TypeScript work together to make applications more robust, maintainable, and developer-friendly. While it introduces some complexity, the benefits far outweigh the costs in most projects. If you're considering adopting TypeScript with React, start small and incrementally type your components and states.
## Generic controlled contracts (React19 / TypeScript5.9+)

An optional numeric prop is not a boolean condition: age0 is a real value. `age && ...` produces the number0 rather than the intended paragraph. Distinguish undefined/null/empty/zero by the domain instead of truthiness.

```tsx
import { useId } from 'react';
import type { ReactNode } from 'react';
type PickerProps<T> = {
  label: string;
  items: readonly T[];
  getKey: (item: T) => string;
  renderLabel: (item: T) => ReactNode;
  selectedId: string | null;
  onSelect: (id: string) => void;
};
export function Picker<T>({ label, items, getKey, renderLabel, selectedId, onSelect }: PickerProps<T>) {
  const groupName = useId();
  const keys = items.map(getKey);
  if (new Set(keys).size !== keys.length) throw new Error('Picker keys must be unique');
  const missing = selectedId !== null && !keys.includes(selectedId);
  return <fieldset><legend>{label}</legend>
    {items.map(item => {
      const id = getKey(item);
      return <label key={id}>
        <input type="radio" name={groupName} value={id} checked={selectedId === id} onChange={() => onSelect(id)} />
        {renderLabel(item)}
      </label>;
    })}
    {missing && <p role="status">The selected option is no longer available. Choose another.</p>}
  </fieldset>;
}
```

The single-selection example uses native radios and a unique group name per instance. Selecting a radio does not toggle it off; provide a separate Clear action when the domain permits deselection. The generic preserves each item's shape through callbacks. selectedId is always controlled (null means no selection), not sometimes undefined. Keys must be stable/unique. For a reusable picker, declare whether disabled items, empty lists and changed/deleted selected records are supported. Typechecking cannot prove key uniqueness or data freshness.

```tsx
import type { ReactNode } from 'react';
type ActionProps = { children: ReactNode } & (
  | { as: 'link'; href: string; onClick?: never }
  | { as: 'button'; onClick: () => void; href?: never }
);
export function Action(props: ActionProps) {
  return props.as === 'link'
    ? <a href={props.href}>{props.children}</a>
    : <button type="button" onClick={props.onClick}>{props.children}</button>;
}
```

A bounded discriminated API prevents invalid button/link combinations while keeping native semantics; a fully arbitrary as-prop API is more complex to type/ref-forward/test. Choose that complexity only when consumers need it. For loading/error/success props use a discriminated union, as in the TypeScript never lesson, rather than contradictory optional fields.

## Narrow imperative ref facade

```tsx
import { useImperativeHandle, useRef } from 'react';
import type { Ref } from 'react';
type FocusHandle = { focus: () => void };
export function FocusInput({ ref }: { ref?: Ref<FocusHandle> }) {
  const input = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => ({ focus: () => input.current?.focus() }), []);
  return <label>Display name <input ref={input} /></label>;
}
```

React19 permits ref as a prop; React18 uses forwardRef for this pattern. Expose the smallest imperative interface instead of letting parents mutate arbitrary DOM internals. Rendering cannot assume a ref already points to a mounted element. Event currentTarget is the typed element handling the event; target may be a descendant in bubbling interactions.


Official references: [React with TypeScript](https://react.dev/learn/typescript), [useImperativeHandle](https://react.dev/reference/react/useImperativeHandle), [React19 ref prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop). Checked2026-10-20; examples target React19/TS5.9+, not React18 unchanged.


## Exhaustive UI states and explicit ownership

Separate initial, pending, failed and ready data with a discriminant. Contradictory flags such as loading:true plus an unrelated error/data pair make rendering policy unclear. This simple contract drops old data while loading; a stale-while-refresh design needs a separate explicit state with its own data/error rules. Keep safe user-facing error codes here, and diagnostic details in the appropriate protected telemetry boundary.

```tsx
// load-view.tsx
import type { ReactNode } from 'react';
export type LoadState<T> =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'failed'; code: 'unavailable' | 'forbidden' }
  | { kind: 'ready'; data: T };
function unreachable(value: never): never {
  throw new Error('Unhandled UI state');
}
export function LoadView<T>({ state, renderData }: {
  state: LoadState<T>; renderData: (data: T) => ReactNode;
}) {
  switch (state.kind) {
    case 'idle': return <p>Choose a record.</p>;
    case 'loading': return <p role="status">Loading…</p>;
    case 'failed': return <p role="alert">{state.code === 'forbidden'
      ? 'You do not have access.' : 'Unable to load. Try again later.'}</p>;
    case 'ready': return <section aria-label="Result">{renderData(state.data)}</section>;
    default: return unreachable(state);
  }
}
```

The never check makes a newly added variant a compiler error until rendering handles it. It does not validate unknown JSON or stop stale responses: parse external data and give the request owner cancellation/request-identity rules. A successful empty collection is ready with an empty array, not a transport failure. Design empty-state wording in renderData for that domain.

Picker remains controlled: the parent owns selectedId and updates it after onSelect. It accepts no defaultValue or internal selection fallback. Duplicate keys are a programmer contract error; removing the selected item shows a status and leaves all radios unchecked until the parent chooses/clears an ID. Reordering preserves identity. Stable IDs, pure getKey and accessible text labels remain caller obligations. Separate instances get separate native radio names through useId. If disabled items become necessary, add that contract explicitly and test focus/selection policy.

For Action, the bounded link/button union is deliberate polymorphism: a button requires its action; a link requires href; mixed props fail. Arbitrary as types/ref forwarding require more complex native-attribute and ref contracts. Do not cast a universal component to any to advertise unsupported combinations. Native anchor navigation and keyboard behavior still require browser evidence.


Official references checked2026-10-22: [React TypeScript unions and hooks](https://react.dev/learn/typescript), [controlled inputs](https://react.dev/reference/react-dom/components/input), [TypeScript narrowing/exhaustiveness](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking).


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/react/Have_you_used_React_with_TypeScript.md). All learner practice remains outstanding; the worked examples above are explanatory material.
