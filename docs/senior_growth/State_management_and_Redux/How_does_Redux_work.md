# How Redux Works {#%E2%9A%A1-how-redux-works}

**Redux** is a predictable state management library commonly used with React (or other frameworks) to manage **application state** in a centralized and consistent way. Its core idea is **one authoritative owner for the state assigned to Redux**, and **state changes are predictable** because they are handled via pure functions.

---

## Core Concepts {#_1%EF%B8%8F%E2%83%A3-core-concepts}

| Concept | Description |
|---------|------------|
| **Store** | Central object that holds the application state managed by Redux; local UI/server-cache state may have another owner. |
| **State** | Immutable object representing the current application data. |
| **Action** | Plain JavaScript object describing **what happened**. Must have a `type` property. |
| **Reducer** | Pure function that takes **previous state** and an **action** and returns **new state**. |
| **Dispatch** | Method used to **send an action to the reducer**. |
| **Selector** | Function used to **read or derive specific parts of state**. |

---

## How Redux Flow Works {#_2%EF%B8%8F%E2%83%A3-how-redux-flow-works}

1. **User triggers an event** (e.g., clicks a button).
2. **Action is created** describing the event:
```js
{ type: 'ADD_TODO', payload: { id: 1, text: 'Learn Redux' } }
```

3. **Action is dispatched** to the Redux store:

```js
store.dispatch(action);
```
4. **Reducer receives current state + action** and returns new state:

```js
function todoReducer(state = [], action) {
    switch(action.type) {
    case 'ADD_TODO':
        return [...state, action.payload];
    default:
        return state;
    }
}
```
5. **Store updates state** immutably and notifies subscribers.
6. **React Redux selectors compare selected results**; affected subscriptions can request a component render. This is separate from browser DOM mutation/paint.

---

## Key Principles {#_3%EF%B8%8F%E2%83%A3-key-principles}

1. **Single Source of Truth**

   * Keep one authoritative Redux store per intended application/request owner for the state assigned to Redux; local UI and server-cache data can have other owners.
   * Makes debugging and testing easier.

2. **State is Read-Only**

   * You cannot mutate state directly.
   * Must **dispatch actions** to change state.

3. **Changes are Made with Pure Functions**

   * Reducers are **pure functions**:

     * No side effects
     * Deterministic: same input → same output
   * Improves predictability and testability.

---

## Example with React {#_4%EF%B8%8F%E2%83%A3-example-with-react}

```js
import { createStore } from 'redux';
import { Provider, useSelector, useDispatch } from 'react-redux';

// Reducer
const counterReducer = (state = 0, action) => {
  switch(action.type) {
    case 'INCREMENT': return state + 1;
    case 'DECREMENT': return state - 1;
    default: return state;
  }
};

// Store
const store = createStore(counterReducer);

// Component
function Counter() {
  const count = useSelector(state => state);
  const dispatch = useDispatch();

  return (
    <>
      <h1>{count}</h1>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
    </>
  );
}

// App
function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  );
}
```

---

## Advantages of Redux {#_5%EF%B8%8F%E2%83%A3-advantages-of-redux}

* Predictable state updates (debuggable and testable)
* Centralized state (easy to share across components)
* Works well with middleware (Redux Thunk, Redux Saga) for async logic
* Time-travel debugging (Redux DevTools)
* Encourages **immutable, pure-function design**

---

## Considerations / Trade-offs {#_6%EF%B8%8F%E2%83%A3-considerations-trade-offs}

* Can be **boilerplate-heavy** for small projects
* Requires understanding **actions, reducers, and immutability**
* Async handling needs middleware (Thunk/Saga)
* Overhead if the app is very simple (React's `useState` + `useReducer` may suffice)

---

### Key Takeaways {#%E2%9C%85-key-takeaways}

* Redux **centralizes state** and makes changes **predictable via actions and reducers**.
* Core ideas: **single source of truth, immutable state, pure reducers**.
* Evaluate shared update/debugging/consistency requirements; application size alone does not determine whether Redux is useful.

> Senior Tip:
> Learn to **combine Redux with modern patterns** like Redux Toolkit + slices to reduce boilerplate while keeping state predictable.


## Selector result equality: choose the actual contract

React Redux9.3.0 useSelector uses strict === comparison of its selected result by default. It does not automatically shallow-compare each field of every returned object. A selector returning ({ count, theme }) allocates a fresh result on each call; an unrelated dispatch can therefore produce a changed reference. Select primitives/stable references separately, memoize a derived result, or pass shallowEqual deliberately when its field-wise behavior matches the contract.

Use the store types from counter-store.ts in the middleware lesson. A selector should be pure, tolerate the state's actual lifecycle and avoid mutating/sorting the store's arrays in place. Store subscriptions do not mean all application state belongs in Redux.

<<< ../../workbench/engineering/state/counter-selectors.tsx{tsx}

This component reads state only. The exported useAppDispatch hook supplies thunk-aware typing to an event owner; that owner must await/catch the dispatch promise and expose pending/error/retry state for asynchronous actions. Declare the memoized selector outside the component so rerenders use one selector instance.

Memoization observes input-selector results: after telemetry.ticks changes, count/theme are unchanged and selectMemoSummary can return the same object; after count/theme changes it produces a new result. shallowEqual ignores object identity only when own field values compare equal; it does not deeply compare arbitrary nested data or make mutation safe.


Official references: [useSelector default equality and shallowEqual](https://redux.js.org/react-redux/api/hooks), [derived selectors](https://redux.js.org/usage/deriving-data-selectors), [typed hooks/dispatch](https://redux.js.org/usage/usage-with-TypeScript). Checked2026-10-21 with Toolkit2.13.0/React Redux9.3.0.

## Primary implementation and shared relationships

The createStore counter above explains the underlying flow using a legacy core API. Use Redux Toolkit2.13 configureStore/createSlice for new examples in this path; do not infer that a reducer must deep-clone unchanged data or that every dispatch changes its result. The [normalized project/user fixture](./How_would_you_introduce_centralized_store_management_%28f.e._REDUX%29_on_a_project_which_does_not_use_it.md#normalize-shared-relationships-before-migrating-consumers) gives the substantive atomic snapshot, rename, cascade and selector walkthrough beyond a counter. Its store factory also avoids sharing one mutable server-side store across requests.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/state/How_does_Redux_work.md). All learner practice remains outstanding.
