### What are hooks good for? What are the rules of hooks?

# Rules of Hooks

React hooks are functions introduced in React 16.8 that allow developers to use state, synchronization and other React features in functional components. They simplify component development, enhance code reusability, and align well with React's declarative programming paradigm.

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
    - useEffect synchronizes with an external system; its setup/cleanup is not a one-to-one translation of class lifecycle methods. Derive values during render and perform user-event writes in event handlers.
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
          const [width, setWidth] = useState(null); // Same server and initial client snapshot.
          useEffect(() => {
            const handleResize = () => setWidth(window.innerWidth);
            window.addEventListener('resize', handleResize);
            handleResize(); // Effects run on the client, after initial hydration.
            return () => window.removeEventListener('resize', handleResize);
          }, []);
          return width;
        };
        ```
        
4. **Cleaner Code**:
    - Hooks compose state/synchronization logic; class components remain supported, and a large Effect can be harder to maintain than a well-scoped class.
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
| `useCallback` | Returns a cached function identity; does not prevent argument-function creation. | [https://www.youtube.com/watch?v=tLvG7AGVO2c&ab_channel=AtomicCode](https://www.youtube.com/watch?v=tLvG7AGVO2c&ab_channel=AtomicCode) |
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
    - Cache measured expensive calculations or identities at useful boundaries; the containing component can still render.
5. **Avoid Overusing Hooks**:
    - Use hooks judiciously to keep components manageable and avoid "callback hell."

---

### **Key Benefits of Hooks**

1. Simplifies functional components with state and side effects.
2. Encourages reusable and composable code via custom hooks.
3. Reduces boilerplate compared to class components.
4. Aligns with React's declarative and functional programming principles.
## Lifecycle ownership, stale closures and SSR

The width hook returns null until the client Effect measures. Render a stable fallback for that state; checking typeof window during render and choosing different initial HTML can cause hydration mismatch. Prefer CSS media/container queries for layout-only decisions. A shared external browser store may use useSyncExternalStore with a stable server snapshot when multiple consumers need consistent subscriptions.

```jsx
import { useEffect, useState } from 'react';
export function useTickCount(enabled) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled) return; // Condition inside the Effect, not around the Hook call.
    const timer = setInterval(() => setCount(previous => previous + 1), 1_000);
    return () => clearInterval(timer);
  }, [enabled]);
  return count;
}
```

`setCount(count + 1)` in an empty-dependency interval would repeatedly use the initial snapshot. A pure updater fixes this case because the callback no longer reads count. If the callback also reads a prop such as step, include step or refactor its ownership; do not suppress the dependency rule. For a subscription, unsubscribe the exact installed listener before changing the source.

Development Strict Mode probes setup/cleanup/setup. A well-owned interval/subscription leaves one active instance after setup and zero after unmount. Effects do not run during server rendering. A useLayoutEffect can measure/mutate before browser paint on the client but blocks paint and cannot measure a server DOM; reserve it for necessary layout work.

React19's special use API can read supported resources in conditions/loops, unlike ordinary state/effect hooks; it still has React-context restrictions and cannot be wrapped in try/catch. This is not permission to conditionally call useState or useEffect. Check the installed React version and official use rules rather than generalizing the exception.


Official references: [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks), [removing Effect dependencies](https://react.dev/learn/removing-effect-dependencies), [useEffect](https://react.dev/reference/react/useEffect), [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore), [special use rules](https://react.dev/reference/react/use). React19 baseline; checked2026-10-20.

## Refs, pure reducers, scoped context and custom hooks

A ref owns an imperative handle/value between commits without scheduling a render. Use state for a value that must appear on screen. DOM refs become available at commit and can return to null on removal; do not read/write arbitrary mutable refs during render to make output depend on hidden state. Focus/selection/scroll requests belong to user events or deliberate synchronization. React19 accepts ref as a function-component prop; useImperativeHandle exposes a limited API rather than the entire internal widget. The typed focus-handle example is in the React/TypeScript note.

```tsx
import { useRef } from 'react';
export function FocusSearch() {
  const input = useRef<HTMLInputElement>(null);
  return <><label>Search<input ref={input} /></label>
    <button type="button" onClick={() => input.current?.focus()}>Focus search</button></>;
}
```

A reducer expresses related state transitions as a pure function; it does not send requests, subscribe or mutate previous snapshots. Model impossible combinations out of a state machine, as in the worked wizard, rather than adding independent booleans for saving/saved/failed. Dispatch identity is stable; a context's value identity and provider scope still determine consumer updates.

```tsx
import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
type CounterState = { count: number };
type CounterAction = { type: 'increment' | 'decrement' | 'reset' };
export function counterReducer(state: CounterState, action: CounterAction): CounterState {
  const count = action.type === 'reset' ? 0 : Math.max(0, Math.min(10,
    state.count + (action.type === 'increment' ? 1 : -1)));
  return count === state.count ? state : { count };
}
const CountContext = createContext<number | null>(null);
const CounterDispatchContext = createContext<Dispatch<CounterAction> | null>(null);
export function CounterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });
  return <CounterDispatchContext value={dispatch}><CountContext value={state.count}>
    {children}
  </CountContext></CounterDispatchContext>;
}
export function useCounter() {
  const count = useContext(CountContext);
  const dispatch = useContext(CounterDispatchContext);
  if (count === null || dispatch === null) throw new Error('CounterProvider required');
  return { count, dispatch };
}
```

React19 provider shorthand is used here; .Provider is the older compatible form. Separate contexts can let a dispatch-only consumer avoid subscribing to count; the combined useCounter subscribes to both by design. A null sentinel must be checked explicitly: zero is valid. Nested providers isolate state. A custom hook shares logic, not one shared instance across all calls—context/store ownership makes sharing explicit. For external mutable stores use useSyncExternalStore's subscribe/getSnapshot/server-snapshot contract rather than an ad hoc Effect that can tear; snapshot references must remain stable while data is unchanged.


## Transitions and deferred values: scheduling, not a worker or debounce

```tsx
import { memo, useState, useTransition } from 'react';
const SearchResults = memo(function SearchResults({ rows, query }: {
  rows: { id: string; title: string }[]; query: string
}) {
  const matches = rows.filter(row => row.title.toLowerCase().includes(query.toLowerCase()));
  return <><p>{matches.length} matches; showing at most50</p>
    <ul>{matches.slice(0, 50).map(row => <li key={row.id}>{row.title}</li>)}</ul></>;
});
export function ScheduledSearch({ rows }: { rows: { id: string; title: string }[] }) {
  const [input, setInput] = useState('');
  const [resultsQuery, setResultsQuery] = useState('');
  const [pending, startTransition] = useTransition();
  return <section><label>Search courses<input value={input} onChange={event => {
    const next = event.target.value;
    setInput(next); // Urgent: controlled typing must update immediately.
    startTransition(() => setResultsQuery(next));
  }} /></label>
    <p role="status">{pending ? 'Updating results…' : ''}</p>
    <div aria-busy={pending}><SearchResults rows={rows} query={resultsQuery} /></div>
  </section>;
}
```

Rows must retain identity when unchanged for the memo boundary to help; otherwise urgent parent updates still recalculate the child. React can prioritize/interleave rendering work, but cannot interrupt an arbitrary long synchronous filter halfway through its JavaScript call or run it on another thread. Bound data, virtualize measured DOM work or move expensive computation/server filtering appropriately. startTransition calls its action immediately; it doesn't delay every line inside. Do not wrap the controlled input's own value update in a transition.

useDeferredValue is an alternative when receiving a value whose producer you do not control: pass the deferred value to a memoized expensive subtree and label stale content when it differs from current input. It has no fixed debounce interval, does not reduce network request count by itself and does not fix response races. Choose one scheduling ownership strategy instead of piling both onto the same state without a reason. In React19 async Actions, state updates after await still require an additional startTransition to mark them; ordering/cancellation and mutation integrity need their own policy.


Official references checked2026-10-21: [useRef](https://react.dev/reference/react/useRef), [useReducer](https://react.dev/reference/react/useReducer), [context](https://react.dev/reference/react/useContext), [external store](https://react.dev/reference/react/useSyncExternalStore), [useTransition](https://react.dev/reference/react/useTransition), [useDeferredValue](https://react.dev/reference/react/useDeferredValue).


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/react/What_Are_React_Hooks_Good_For_Rules_of_Hooks.md). All learner practice remains outstanding; the worked examples above are explanatory material.
