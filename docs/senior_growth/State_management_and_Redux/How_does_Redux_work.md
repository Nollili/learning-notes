# ⚡ How Redux Works

**Redux** is a predictable state management library commonly used with React (or other frameworks) to manage **application state** in a centralized and consistent way. Its core idea is **a single source of truth for your app’s state**, and **state changes are predictable** because they are handled via pure functions.

---

## 1️⃣ Core Concepts

| Concept | Description |
|---------|------------|
| **Store** | Central object that holds the **entire application state**. |
| **State** | Immutable object representing the current application data. |
| **Action** | Plain JavaScript object describing **what happened**. Must have a `type` property. |
| **Reducer** | Pure function that takes **previous state** and an **action** and returns **new state**. |
| **Dispatch** | Method used to **send an action to the reducer**. |
| **Selector** | Function used to **read or derive specific parts of state**. |

---

## 2️⃣ How Redux Flow Works

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
6. **UI re-renders** based on the updated state.

---

## 3️⃣ Key Principles

1. **Single Source of Truth**

   * Entire state of the app is stored in **one store**.
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

## 4️⃣ Example with React

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

## 5️⃣ Advantages of Redux

* Predictable state updates (debuggable and testable)
* Centralized state (easy to share across components)
* Works well with middleware (Redux Thunk, Redux Saga) for async logic
* Time-travel debugging (Redux DevTools)
* Encourages **immutable, pure-function design**

---

## 6️⃣ Considerations / Trade-offs

* Can be **boilerplate-heavy** for small projects
* Requires understanding **actions, reducers, and immutability**
* Async handling needs middleware (Thunk/Saga)
* Overhead if the app is very simple (React's `useState` + `useReducer` may suffice)

---

### ✅ Key Takeaways

* Redux **centralizes state** and makes changes **predictable via actions and reducers**.
* Core ideas: **single source of truth, immutable state, pure reducers**.
* Works best for **medium to large applications** where many components share state.

> 💡 Senior Tip:
> Learn to **combine Redux with modern patterns** like Redux Toolkit + slices to reduce boilerplate while keeping state predictable.

