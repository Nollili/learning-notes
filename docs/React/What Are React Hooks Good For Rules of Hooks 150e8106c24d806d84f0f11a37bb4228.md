# What Are React Hooks Good For? Rules of Hooks

Subjects: React

React hooks are functions introduced in React 16.8 that allow developers to use state, lifecycle methods, and other React features in functional components. They simplify component development, enhance code reusability, and align well with React's declarative programming paradigm.

### **Why Use Hooks?**

1. **State Management in Functional Components**:
    - Hooks like `useState` allow functional components to have local state without converting them to class components.
    - Example:
        
        ```jsx
        const Counter = () => {
          const [count, setCount] = useState(0);
          return <button onClick={() => setCount(count + 1)}>{count}</button>;
        };
        ```
        
2. **Side Effect Management**:
    - The `useEffect` hook replaces lifecycle methods like `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount`.
    - Example:
        
        ```jsx
        useEffect(() => {
          console.log("Count updated!");
        }, [count]); // Only runs when `count` changes
        ```
        
3. **Encapsulation of Reusable Logic**:
    - Custom hooks (`useSomething`) allow logic to be extracted and shared between components.
    - Example:
        
        ```jsx
        const useWindowWidth = () => {
          const [width, setWidth] = useState(window.innerWidth);
          useEffect(() => {
            const handleResize = () => setWidth(window.innerWidth);
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
          }, []);
          return width;
        };
        ```
        
4. **Cleaner Code**:
    - Hooks eliminate the need for verbose class components and complex lifecycle methods, making the code easier to read and maintain.
5. **Improved Composition**:
    - Hooks encourage function composition by breaking logic into smaller, reusable pieces.

---

### **Common React Hooks**

| **Hook** | **Purpose** |  |
| --- | --- | --- |
| `useState` | Manages state in a functional component. |  |
| `useEffect` | Handles side effects like data fetching, subscriptions, or DOM updates. |  |
| `useContext` | Provides access to context values without nesting consumers. |  |
| `useReducer` | Manages complex state logic, similar to `redux`. | [https://www.youtube.com/watch?v=kK_Wqx3RnHk&ab_channel=WebDevSimplified](https://www.youtube.com/watch?v=kK_Wqx3RnHk&ab_channel=WebDevSimplified) |
| `useMemo` | Optimizes performance by memoizing expensive calculations. | [https://www.youtube.com/watch?v=e4G_feMylbg&ab_channel=AtomicCode](https://www.youtube.com/watch?v=e4G_feMylbg&ab_channel=AtomicCode) |
| `useCallback` | Memoizes callback functions to avoid unnecessary re-creations. | [https://www.youtube.com/watch?v=tLvG7AGVO2c&ab_channel=AtomicCode](https://www.youtube.com/watch?v=tLvG7AGVO2c&ab_channel=AtomicCode) |
| `useRef` | Accesses DOM nodes or persists values across renders without causing re-renders. |  |
| `useLayoutEffect` | Runs synchronously after DOM mutations, useful for layout adjustments. | [https://www.youtube.com/watch?v=wU57kvYOxT4&ab_channel=WebDevSimplified](https://www.youtube.com/watch?v=wU57kvYOxT4&ab_channel=WebDevSimplified) |
| `useImperativeHandle` | Customizes instance values exposed via `ref` in parent components. | [https://www.youtube.com/watch?v=zpEyAOkytkU&ab_channel=WebDevSimplified](https://www.youtube.com/watch?v=zpEyAOkytkU&ab_channel=WebDevSimplified) |

---

### **Rules of Hooks**

React enforces two fundamental rules for using hooks to maintain predictable behavior:

1. **Only Call Hooks at the Top Level**:
    - Do not call hooks inside loops, conditions, or nested functions. This ensures hooks are called in the same order on every render, which React relies on to preserve state and effect associations.
    - ✅ Correct:
        
        ```jsx
        const MyComponent = () => {
          const [state, setState] = useState(0);
          useEffect(() => {
            console.log(state);
          }, [state]);
        };
        ```
        
    - ❌ Incorrect:
        
        ```jsx
        const MyComponent = () => {
          if (someCondition) {
            useEffect(() => {
              console.log("This may break React’s rules");
            });
          }
        };
        ```
        
2. **Only Call Hooks from React Functions**:
    - Hooks can only be used in functional components or custom hooks. They cannot be used in regular JavaScript functions or class components.
    - ✅ Correct:
        
        ```jsx
        const MyComponent = () => {
          const [state, setState] = useState(0);
        };
        const useCustomHook = () => useState(0);
        ```
        
    - ❌ Incorrect:
        
        ```jsx
        function regularFunction() {
          const [state, setState] = useState(0); // Not allowed
        }
        ```
        

---

### **Best Practices for Using Hooks**

1. **Use Dependencies Properly in `useEffect`**:
    - Always specify dependencies explicitly to avoid unexpected behaviors. Use tools like **eslint-plugin-react-hooks** for linting.
2. **Keep Hooks Simple**:
    - Break logic into smaller hooks instead of one large `useEffect` or `useState`.
3. **Use Custom Hooks for Reusability**:
    - Extract reusable logic into custom hooks to make your components cleaner and more focused.
4. **Optimize Performance with `useMemo` and `useCallback`**:
    - Prevent unnecessary re-renders and calculations in performance-sensitive components.
5. **Avoid Overusing Hooks**:
    - Use hooks judiciously to keep components manageable and avoid "callback hell."

---

### **Key Benefits of Hooks**

1. Simplifies functional components with state and side effects.
2. Encourages reusable and composable code via custom hooks.
3. Reduces boilerplate compared to class components.
4. Aligns with React's declarative and functional programming principles.