# Are there design patterns in react? {#are-there-design-patterns-in-react}

Choose a pattern to clarify ownership or a changing policy; each additional layer has a cost.

---

### **Container-Presenter Pattern** {#_1-container-presenter-pattern}

- **Description**: Separates the logic (container) and UI (presenter) components.
    - **Container**: Handles state and business logic.
    - **Presenter**: Focuses purely on rendering UI and receiving props.

**Advantages**:

- Clear separation of concerns
- Easier to test components independently.

**Example**:

```jsx
// Uses useFetch and parseUser defined in the custom-hook section below.
const UserContainer = () => {
  const result = useFetch('/api/user', parseUser);
  return <UserPresenter result={result} />;
};
const UserPresenter = ({ result }) => {
  if (result.status === 'loading') return <p role="status">Loading…</p>;
  if (result.status === 'error') return <p role="alert">User unavailable</p>;
  return <p>{result.data.name}</p>;
};
```

---

### **Higher-Order Components (HOC)** {#_2-higher-order-components-hoc}

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

### **Render Props** {#_3-render-props}

https://www.youtube.com/watch?v=3IdCQ7QAs38&ab_channel=TheCodeCreative

- **Description**: A component that uses a render function (or children as a function) to share logic.

**Advantages**:

- Greater flexibility than HOCs.
- Avoids some issues with prop collisions.

**Example**:

```jsx
// Uses the shared useFetch hook and parseMessage below.
const DataFetcher = ({ render }) => render(useFetch('/api/data', parseMessage));
<DataFetcher render={result => {
  if (result.status === 'loading') return <p role="status">Loading…</p>;
  if (result.status === 'error') return <p role="alert">Data unavailable</p>;
  return <p>{result.data.message}</p>;
}} />;
```

**Disadvantages**:

- Can result in deeply nested render trees.

---

### **Compound Components** {#_4-compound-components}

https://www.youtube.com/watch?v=N_WgBU3S9W8&ab_channel=CosdenSolutions

- **Description**: Components designed to work together with shared context or logic, allowing flexibility in usage.

**Advantages**:

- Improves composability.
- Makes APIs more expressive.

**Example**:

```jsx
import { createContext, useContext, useId, useState } from 'react';
const TabsContext = createContext(null);
function useTabs() {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tabs children require a Tabs provider');
  return context;
}
function Tabs({ defaultValue, children }) {
  const [active, setActive] = useState(defaultValue);
  const prefix = useId();
  return <TabsContext.Provider value={{ active, setActive, prefix }}>{children}</TabsContext.Provider>;
}
function TabList({ label, children }) {
  return <div role="tablist" aria-label={label}>{children}</div>;
}
function Tab({ value, children }) {
  const { active, setActive, prefix } = useTabs();
  function move(event) {
    const tabs = [...event.currentTarget.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];
    const index = tabs.indexOf(event.currentTarget);
    const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length
      : event.key === 'ArrowLeft' ? (index - 1 + tabs.length) % tabs.length
      : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
    if (next !== null) { event.preventDefault(); tabs[next].focus(); }
  }
  return <button type="button" role="tab" id={`${prefix}-tab-${value}`}
    aria-controls={`${prefix}-panel-${value}`} aria-selected={active === value}
    tabIndex={active === value ? 0 : -1} onKeyDown={move}
    onFocus={() => setActive(value)} onClick={() => setActive(value)}>{children}</button>;
}
function TabPanel({ value, children }) {
  const { active, prefix } = useTabs();
  return <div role="tabpanel" id={`${prefix}-panel-${value}`}
    aria-labelledby={`${prefix}-tab-${value}`} hidden={active !== value} tabIndex={0}>{children}</div>;
}
<Tabs defaultValue="one">
  <TabList label="Account sections"><Tab value="one">Profile</Tab><Tab value="two">Settings</Tab></TabList>
  <TabPanel value="one">Profile details</TabPanel>
  <TabPanel value="two">Settings details</TabPanel>
</Tabs>;
```

---

### **Controlled vs. Uncontrolled Components** {#_5-controlled-vs-uncontrolled-components}

https://www.youtube.com/watch?v=8IGlJqy6cFQ&ab_channel=CodeRyan



---

### **Controlled Components** {#_1-controlled-components}

* **Definition:** Components where **React state drives the input value**.
* **Example:**

  ```jsx
  const [value, setValue] = useState('');
  return <input value={value} onChange={e => setValue(e.target.value)} />;
  ```
* **Pros:**

  * Full control over input value.
  * Easy to validate, format, or manipulate input dynamically.
  * State can be shared between components or saved on submit.
* **Cons:**

  * More boilerplate code.
  * Each keystroke triggers a state update (can be costly for very large forms if not optimized).

---

### **Uncontrolled Components** {#_2-uncontrolled-components}

* **Definition:** Components where **the DOM maintains the value**, and you read it via refs when needed.
* **Example:**

  ```jsx
  const inputRef = useRef();
  const handleSubmit = () => console.log(inputRef.current.value);
  return <input ref={inputRef} />;
  ```
* **Pros:**

  * Less code, easier for simple forms.
  * Good for **third-party libraries** that manage their own state.
* **Cons:**

  * Harder to do dynamic validation or formatting.
  * Harder to synchronize values across components.

---

### **Best Practice / Modern Approach** {#_3-best-practice-modern-approach}

* **Controlled components** are generally preferred in **React apps** because they make state predictable and easier to debug.
* **Uncontrolled components** can be used for:

  * Simple inputs that don’t require live validation.
  * Forms where performance is critical, and you want to avoid frequent re-renders.
* For **large forms**, libraries like **React Hook Form** or **Formik** are recommended:

  * React Hook Form commonly registers uncontrolled native inputs and offers controlled adapters. Formik stores/manages values through a controlled state model; do not classify both libraries as uncontrolled.
  * Provide a controlled API for validation, submission, and integration.
* Modern React emphasizes **predictable state flow**, so controlled components are usually the default choice, with uncontrolled components used selectively for performance.

---

**Interview Tip:**
You can summarize like this:

> “Controlled components are the default in React for predictable state management, validation, and dynamic behavior. Uncontrolled components can be used selectively for performance-critical forms or when integrating with third-party libraries. Modern best practice often combines controlled form state with libraries like React Hook Form, which internally optimizes performance using uncontrolled inputs.”

---

### **Context API for Dependency Injection** {#_6-context-api-for-dependency-injection}

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

### **Hooks for Custom Logic** {#_7-hooks-for-custom-logic}

https://www.youtube.com/watch?v=I2Bgi0Qcdvc&ab_channel=CosdenSolutions

- **Description**: Create reusable logic with custom hooks.

**Advantages**:

- Promotes reuse of non-visual logic.
- Cleaner and more modular than HOCs or render props.

**Example**:

```jsx
import { useEffect, useState } from 'react';
function parseUser(value) {
  if (!value || typeof value !== 'object' || typeof value.name !== 'string') throw new TypeError('Invalid user');
  return { name: value.name };
}
function parseMessage(value) {
  if (!value || typeof value !== 'object' || typeof value.message !== 'string') throw new TypeError('Invalid message');
  return { message: value.message };
}
function useFetch(url, parse) {
  const [result, setResult] = useState({ url: null, status: 'loading' });
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5_000);
    let current = true;
    setResult({ url, status: 'loading' });
    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          await response.body?.cancel();
          throw new Error(`HTTP ${response.status}`);
        }
        const data = parse(await response.json());
        if (current) setResult({ url, status: 'success', data });
      } catch (error) {
        if (current) setResult({ url, status: 'error' });
      } finally { clearTimeout(timer); }
    }
    void load();
    return () => { current = false; controller.abort(); clearTimeout(timer); };
  }, [url, parse]);
  return result.url === url ? result : { url, status: 'loading' };
}
const MessageView = () => {
  const result = useFetch('/api/data', parseMessage);
  if (result.status === 'loading') return <p role="status">Loading…</p>;
  if (result.status === 'error') return <p role="alert">Data unavailable</p>;
  return <p>{result.data.message}</p>;
};
```

---

### **Flux/Redux Architecture** {#_8-flux-redux-architecture}

https://www.youtube.com/watch?v=_shA5Xwe8_4&ab_channel=Fireship

https://www.youtube.com/watch?v=WFL6B_g1R3o&ab_channel=Gitcoder

https://www.youtube.com/watch?v=j5xXV8epngw&ab_channel=Codewithjimmy

- **Description**: Centralizes state management using a unidirectional data flow (state → view → actions → reducer → state).

**Advantages**:

- Simplifies debugging with tools like Redux DevTools.
- Scales well for large applications.

**Example**:

```jsx
// Legacy Redux construction example. For new applications use Redux Toolkit
// configureStore/createSlice, as covered in the state-management notes.
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

### **Portals for Rendering Outside DOM Hierarchy** {#_9-portals-for-rendering-outside-dom-hierarchy}

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

### **Functional Programming Concepts** {#_10-functional-programming-concepts}

- Functional patterns like immutability, pure functions, and higher-order functions are naturally encouraged in React.

**Advantages**:

- Promotes clean, testable, and predictable code.

---

### **Conclusion**

React supports diverse design patterns to solve various problems in UI development. **Composition**, **hooks**, and **context** are modern patterns recommended over older paradigms like HOCs or inheritance. Choosing the right pattern depends on the complexity and scalability requirements of your project.
## Contracts and failure cases for these patterns

The old compound-tabs example assigned button indices0/1 but panel indices2/3, so no panel could activate. The corrected example pairs explicit values, creates unique IDs per instance, and implements roving focus with automatic activation. This teaching API supports a static, non-disabled horizontal tab set; values must be unique and the default must exist. Dynamic removal, disabled tabs, RTL/vertical navigation and asynchronous panel loading require explicit policies.

Automatic activation is appropriate only when panels appear without noticeable latency; otherwise separate focus from activation and use Enter/Space to activate manually. Keep a focused tab visible and preserve panel content/state deliberately.

Context composition avoids clone-by-child-position coupling, but descendants require the provider and still share subscription updates. An item-data API can validate dynamic membership more easily than arbitrary compound children. HOCs should be created outside render, preserve intended prop/ref contracts and avoid consuming/colliding with child props; render props add flexibility at the cost of nesting. No pattern removes server authorization requirements.

The shared fetch hook checks status, parses a public shape, guards stale results and owns a total header/body deadline and cleanup. Parser functions are module-stable; a new inline parser each render changes an Effect dependency. It has no cache/deduplication, retry button or unbounded-body protection; use the query workflow for a full application and bound response sizes server-side/client-side where appropriate. Containers/render props/hooks share logic differently; a custom hook call creates its own local state, not a global shared cache.

Controlled inputs keep value/checked defined for their lifetime; use empty string/false rather than switching between undefined and a value. Uncontrolled inputs use defaultValue/defaultChecked for initialization; native FormData reads named successful controls on submit. Neither style automatically supplies validation/error accessibility, async races or server security.


Official references: [WAI tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), [React Effects](https://react.dev/reference/react/useEffect), [Formik controlled tutorial](https://formik.org/docs/tutorial), [React input contracts](https://react.dev/reference/react-dom/components/input), [Redux Toolkit](https://redux-toolkit.js.org/introduction/getting-started). React19 baseline; checked2026-10-20.

## Error boundaries, Suspense and lazy modules: different failure channels

An error boundary displays a recovery UI for descendant rendering/lifecycle errors. Suspense displays pending UI for supported suspension, such as a lazy module or framework-integrated data resource. Neither is a generic catch around every fetch. A normal fetch started in an Effect still needs loading/error/cancellation state; it does not automatically activate Suspense.

```tsx
import { Component, Suspense, lazy, type ErrorInfo, type ReactNode } from 'react';
const LazyReport = lazy(() => import('./Report')); // Module must default-export the component.
type BoundaryProps = { children: ReactNode; report?: (error: unknown, info: ErrorInfo) => void };
export class ReportBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { this.props.report?.(error, info); }
  render() {
    if (this.state.failed) return <section aria-label="Report unavailable">
      <h2>Report could not be displayed</h2>
      <p>Your other workspace sections remain available.</p>
      <a href="/reports">Return to reports</a>
      <button type="button" onClick={() => window.location.reload()}>Reload this page</button>
    </section>;
    return this.props.children;
  }
}
export function ReportRegion({ reportId }: { reportId: string }) {
  return <ReportBoundary key={reportId}>
    <Suspense fallback={<p role="status">Loading report module…</p>}>
      <LazyReport reportId={reportId} />
    </Suspense>
  </ReportBoundary>;
}
```

Report.tsx is a learner-supplied module for the exercise, not a missing file in this notes repository. Place lazy declarations outside render so component identity/cache is not recreated on each update. React caches the lazy loader's promise/result: resetting only boundary state is not a reliable retry for a rejected import. The example offers explicit navigation/full reload; preserve unrelated drafts before a full-document action and never auto-reload forever.

For stale deployments/chunk404, coordinate compatible asset retention, service-worker/CDN caches and recovery rather than repeatedly requesting a vanished chunk. A changed reportId remounts the boundary but does not erase lazy's module-level rejected promise cache.

The optional report port must scrub sensitive details and handle its own failure; a boundary cannot catch an exception thrown by its own fallback/reporting code. Choose the boundary at a useful recovery scope: one widget failure should not necessarily remove the whole app, while a route failure may need route-level controls. Keep safe fallback copy and test focus/announcement behavior. A library/framework boundary is an alternative to authoring the class; function components alone do not supply getDerivedStateFromError/componentDidCatch, and classes remain supported for this mechanism.

### Coverage limits and recovery policy

- Event handlers and ordinary async callbacks need explicit error handling; a try/catch around returning JSX cannot catch a descendant's later render. React19 transition Action errors have supported boundary integration, which is a specific exception to the generic async rule.
- Server rendering needs framework/server handling; this client class does not catch every server render failure. Next error.tsx/global-error and streaming recovery have their own documented scopes.
- A Suspense fallback is pending UI, not error UI; rejected lazy loading goes to the error boundary. Suspense does not supply retry, timeout, authorization, data validation or network cancellation by itself.
- Expected validation/conflict/no-results states should generally be rendered as data with recovery controls rather than thrown as programmer errors.

For already visible content, a transition can allow a supported Suspense-aware framework/router to retain useful UI instead of replacing it immediately; avoid inventing a router protocol around arbitrary promises. Server Component streaming is a framework data flow, not proof that every client Effect is suspended. Measure fallback geometry/CLS and choose meaningful labels without announcing many skeleton rows.


Official references checked2026-10-21: [React error-boundary scope](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary), [lazy promise caching](https://react.dev/reference/react/lazy), [Suspense](https://react.dev/reference/react/Suspense), [transitions](https://react.dev/reference/react/useTransition), [Next error scope](https://nextjs.org/docs/app/api-reference/file-conventions/error). Library/framework execution and learner practice remain required.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/react/Are_there_design_patterns_in_react.md). All learner practice remains outstanding; the worked examples above are explanatory material.
