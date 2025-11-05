# Have you used React with TypeScript?

Subjects: React

React and TypeScript are a powerful combination that enhances the development experience by providing static typing, better tooling, and improved code quality. 

### **Key Benefits of Using TypeScript with React**

1. **Static Typing**: Catch type-related bugs at compile time, reducing runtime errors.
2. **Intellisense & Autocomplete**: TypeScript enhances IDE features, making it easier to explore props, hooks, and custom functions.
3. **Improved Documentation**: Explicit types act as self-documenting code, improving maintainability.
4. **Refactoring Safety**: TypeScript ensures that renaming or modifying components and types is safer and less error-prone.
5. **Integration with Ecosystem**: Works seamlessly with popular React libraries like `React Router`, `Redux`, `Formik`, and more.

---

### **Common Use Cases of TypeScript in React**

### **1. Typing Props**

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
    {age && <p>Age: {age}</p>}
  </div>
);
```

- `name` is required, while `age` is optional.
- The TypeScript compiler will throw an error if the `Greeting` component is used without the required `name` prop.

---

### **2. Typing State and Refs**

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
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>Focus Input</button>
    </div>
  );
};
```

---

### **3. Typing Hooks**

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

### **4. Typing Events**

TypeScript provides detailed types for event handlers.

**Example**:

```tsx
const InputChangeHandler: React.FC = () => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
  };

  return <input type="text" onChange={handleChange} />;
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
Combine TypeScript’s optional types with default props for better usability.
    
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