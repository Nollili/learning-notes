# What are middlewares, how to handle asynchronous actions?

## 🛠 Middleware & Handling Asynchronous Actions in Redux

In Redux, **middleware** is a mechanism to **intercept actions before they reach the reducer**. Middleware is commonly used to handle **side effects**, such as asynchronous API calls, logging, analytics, and more.

---

## 1️⃣ What is Middleware?

- Middleware sits **between dispatching an action and the moment it reaches the reducer**.
- It can:
  - Modify actions
  - Dispatch new actions
  - Delay actions
  - Perform side effects (like async calls or logging)

**Redux flow with middleware:**

Dispatch Action → Middleware → Reducer → Store Updates → View

---

## 2️⃣ Why Middleware is Needed

- Redux reducers must be **pure functions** (no side effects, no async calls).
- Any async operation (e.g., API request) cannot go directly in the reducer.
- Middleware allows handling async logic **without violating Redux principles**.

---

## 3️⃣ Popular Redux Middleware for Async

| Middleware | Description |
|------------|------------|
| **Redux Thunk** | Allows dispatching **functions** instead of plain objects. Inside the function, you can perform async operations and dispatch multiple actions. |
| **Redux Saga** | Uses **generator functions** to handle complex async flows, side effects, retries, and more in a more declarative way. |
| **Redux Observable** | Uses **RxJS observables** to handle async actions as streams. |

---

## 4️⃣ Example: Redux Thunk

**Setup:**
```ts
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

const store = createStore(rootReducer, applyMiddleware(thunk));
````

**Async Action Creator using Thunk:**

```ts
// Action types
const FETCH_USER_REQUEST = 'FETCH_USER_REQUEST';
const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS';
const FETCH_USER_FAILURE = 'FETCH_USER_FAILURE';

// Thunk action
const fetchUser = (userId) => async (dispatch) => {
  dispatch({ type: FETCH_USER_REQUEST });
  try {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    dispatch({ type: FETCH_USER_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: FETCH_USER_FAILURE, payload: error });
  }
};
```

**Reducer:**

```ts
function userReducer(state = { loading: false, user: null, error: null }, action) {
  switch(action.type) {
    case FETCH_USER_REQUEST: return { ...state, loading: true };
    case FETCH_USER_SUCCESS: return { ...state, loading: false, user: action.payload };
    case FETCH_USER_FAILURE: return { ...state, loading: false, error: action.payload };
    default: return state;
  }
}
```

---

## 5️⃣ Example: Redux Saga (Simplified)

```ts
import { call, put, takeEvery } from 'redux-saga/effects';

function* fetchUserSaga(action) {
  try {
    const data = yield call(fetch, `/api/users/${action.payload}`);
    const json = yield data.json();
    yield put({ type: 'FETCH_USER_SUCCESS', payload: json });
  } catch (error) {
    yield put({ type: 'FETCH_USER_FAILURE', payload: error });
  }
}

function* watchFetchUser() {
  yield takeEvery('FETCH_USER_REQUEST', fetchUserSaga);
}
```

---

## 6️⃣ Key Takeaways

* **Middleware** intercepts actions and allows performing side effects **outside reducers**.
* Async actions **cannot go inside reducers** — use middleware like Thunk, Saga, or Observables.
* Middleware enables **logging, analytics, error handling, and more** in a clean, centralized way.
* Choosing middleware:

  * **Thunk:** Simple async calls, small projects
  * **Saga:** Complex async workflows, retries, dependent requests
  * **Observable:** Stream-based async, reactive programming

> 💡 Senior Tip:
> Keep reducers **pure**; all async, side-effect, or impure operations belong in **middleware**. This maintains predictability and testability of your Redux state.

