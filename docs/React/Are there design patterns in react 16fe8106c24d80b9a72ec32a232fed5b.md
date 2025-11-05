# Are there design patterns in react?

Subjects: React

React encourages the use of design patterns to create maintainable, reusable, and efficient code. Below are some commonly used design patterns in React, along with explanations and examples:

---

### **1. Container-Presenter Pattern**

- **Description**: Separates the logic (container) and UI (presenter) components.
    - **Container**: Handles state and business logic.
    - **Presenter**: Focuses purely on rendering UI and receiving props.

**Advantages**:

- Clear separation of concerns
- Easier to test components independently.

**Example**:

```jsx
// Container Component
const UserContainer = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/user')
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  return <UserPresenter user={user} />;
};

// Presenter Component
const UserPresenter = ({ user }) => {
  if (!user) return <p>Loading...</p>;
  return <div>{user.name}</div>;
};
```

---

### **2. Higher-Order Components (HOC)**

- **Description**: A function that takes a component and returns a new component with added functionality.
- Commonly used for reusability (e.g., adding authentication, logging, or data fetching).

**Advantages**:

- Encourages code reuse.
- Useful for cross-cutting concerns.

**Example**:

```jsx
const withLoading = (WrappedComponent) => (props) => {
  return props.isLoading ? <p>Loading...</p> : <WrappedComponent {...props} />;
};

// Usage
const MyComponent = ({ data }) => <div>{data}</div>;
const MyComponentWithLoading = withLoading(MyComponent);

<MyComponentWithLoading isLoading={true} data="Hello" />;
```

**Disadvantages**:

- Can lead to complex nesting and debugging ("wrapper hell").

---

### **3. Render Props**

https://www.youtube.com/watch?v=3IdCQ7QAs38&ab_channel=TheCodeCreative

- **Description**: A component that uses a render function (or children as a function) to share logic.

**Advantages**:

- Greater flexibility than HOCs.
- Avoids some issues with prop collisions.

**Example**:

```jsx
const DataFetcher = ({ render }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  return render(data);
};

// Usage
<DataFetcher render={(data) => (data ? <p>{data.message}</p> : <p>Loading...</p>)} />;
```

**Disadvantages**:

- Can result in deeply nested render trees.

---

### **4. Compound Components**

https://www.youtube.com/watch?v=N_WgBU3S9W8&ab_channel=CosdenSolutions

- **Description**: Components designed to work together with shared context or logic, allowing flexibility in usage.

**Advantages**:

- Improves composability.
- Makes APIs more expressive.

**Example**:

```jsx
const Tabs = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);

  return React.Children.map(children, (child, index) =>
    React.cloneElement(child, { activeTab, setActiveTab, index })
  );
};

const Tab = ({ index, activeTab, setActiveTab, children }) => (
  <button
    style={{ fontWeight: activeTab === index ? 'bold' : 'normal' }}
    onClick={() => setActiveTab(index)}
  >
    {children}
  </button>
);

const TabPanel = ({ index, activeTab, children }) =>
  activeTab === index ? <div>{children}</div> : null;

// Usage
<Tabs>
  <Tab>Tab 1</Tab>
  <Tab>Tab 2</Tab>
  <TabPanel>Panel 1 Content</TabPanel>
  <TabPanel>Panel 2 Content</TabPanel>
</Tabs>;
```

---

### **5. Controlled vs. Uncontrolled Components**

https://www.youtube.com/watch?v=8IGlJqy6cFQ&ab_channel=CodeRyan

- **Controlled Components**:
    - React fully controls the component's state via props.
    - Example: `<input value={state} onChange={handleChange} />`
- **Uncontrolled Components**:
    - DOM manages its own state, accessed using refs.
    - Example: `<input ref={inputRef} />`

**Advantages**:

- Controlled components provide predictable behavior.
- Uncontrolled components can reduce overhead in specific cases (e.g., simple forms).

---

### **6. Context API for Dependency Injection**

https://www.youtube.com/watch?v=MSpDAuDPqNw&ab_channel=WebDevCody

- **Description**: Use React's `Context` to avoid prop drilling by sharing state or logic at a higher level.

**Advantages**:

- Reduces prop drilling.
- Improves code readability.

**Example**:

```jsx
const UserContext = React.createContext();

const App = () => {
  const [user] = useState({ name: 'John' });

  return (
    <UserContext.Provider value={user}>
      <Profile />
    </UserContext.Provider>
  );
};

const Profile = () => {
  const user = useContext(UserContext);
  return <p>{user.name}</p>;
};
```

**Disadvantages**:

- Overusing context can lead to tightly coupled components.
- May trigger unnecessary re-renders if not optimized.

---

### **7. Hooks for Custom Logic**

https://www.youtube.com/watch?v=I2Bgi0Qcdvc&ab_channel=CosdenSolutions

- **Description**: Create reusable logic with custom hooks.

**Advantages**:

- Promotes reuse of non-visual logic.
- Cleaner and more modular than HOCs or render props.

**Example**:

```jsx
const useFetch = (url) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((data) => setData(data));
  }, [url]);

  return data;
};

// Usage
const App = () => {
  const data = useFetch('/api/data');
  return data ? <p>{data.message}</p> : <p>Loading...</p>;
};
```

---

### **8. Flux/Redux Architecture**

https://www.youtube.com/watch?v=_shA5Xwe8_4&ab_channel=Fireship

https://www.youtube.com/watch?v=WFL6B_g1R3o&ab_channel=Gitcoder

https://www.youtube.com/watch?v=j5xXV8epngw&ab_channel=Codewithjimmy

- **Description**: Centralizes state management using a unidirectional data flow (state → view → actions → reducer → state).

**Advantages**:

- Simplifies debugging with tools like Redux DevTools.
- Scales well for large applications.

**Example**:

```jsx
import { createStore } from 'redux';
import { Provider, useSelector, useDispatch } from 'react-redux';

const reducer = (state = { count: 0 }, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    default:
      return state;
  }
};

const store = createStore(reducer);

const Counter = () => {
  const count = useSelector((state) => state.count);
  const dispatch = useDispatch();
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>Increment</button>
    </div>
  );
};

const App = () => (
  <Provider store={store}>
    <Counter />
  </Provider>
);
```

---

### **9. Portals for Rendering Outside DOM Hierarchy**

https://www.youtube.com/watch?v=kUwyGQ1AzhU&ab_channel=frontend-coder

- **Description**: Use React Portals to render children outside their parent component’s DOM hierarchy.

**Advantages**:

- Useful for modals, tooltips, and popups.

**Example**:

```jsx
import ReactDOM from 'react-dom';

const Modal = ({ children }) => {
  return ReactDOM.createPortal(
    <div className="modal">{children}</div>,
    document.getElementById('modal-root')
  );
};
```

---

### **10. Functional Programming Concepts**

- Functional patterns like immutability, pure functions, and higher-order functions are naturally encouraged in React.

**Advantages**:

- Promotes clean, testable, and predictable code.

---

### **Conclusion**

React supports diverse design patterns to solve various problems in UI development. **Composition**, **hooks**, and **context** are modern patterns recommended over older paradigms like HOCs or inheritance. Choosing the right pattern depends on the complexity and scalability requirements of your project.