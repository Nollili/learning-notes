# How would you introduce centralized store management (f.e. REDUX) on a project which does not use it?

## 🚀 Introducing Redux (Centralized State Management) to an Existing Project

Introducing a centralized store like **Redux** to a project that doesn’t already use it requires a **gradual, strategic approach** to avoid breaking the existing functionality.

---

## 1️⃣ Assess the Current State

- Identify **global/shared state** in the app:
  - Authentication
  - User settings/preferences
  - Theme, language, layout
  - API data used in multiple components
- Check **existing local state** managed via `useState` or `useReducer`.
- Determine **pain points**:
  - Prop drilling
  - Inconsistent state updates
  - Difficult-to-test components

---

## 2️⃣ Plan the Migration

- Start with **one slice of state** (e.g., authentication or theme).
- Define **actions, reducers, and selectors** for that slice.
- Decide on **middleware** if async handling is required (Thunk/Saga).
- Keep existing local state in components for non-shared, transient UI data.

---

## 3️⃣ Install Dependencies

```bash
npm install @reduxjs/toolkit react-redux
````

* **Redux Toolkit** simplifies boilerplate:

  * `createSlice` for reducers + actions
  * `configureStore` for store setup
  * Built-in support for Thunk middleware

---

## 4️⃣ Create the Store and Slices

**Example: authSlice.ts**

```ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState { user: string | null; token: string | null; }

const initialState: AuthState = { user: null, token: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: string; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => { state.user = null; state.token = null; },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
```

**Configure Store:**

```ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

export const store = configureStore({ reducer: { auth: authReducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**Wrap App with Provider:**

```tsx
import { Provider } from 'react-redux';
import { store } from './store';

<Provider store={store}>
  <App />
</Provider>
```

---

## 5️⃣ Gradual Migration

1. Start **replacing prop-drilled state** with Redux slices.
2. Use **selectors** (`useSelector`) to read state and `dispatch` to update it.
3. Keep local component state for **ephemeral data** (inputs, modals, hover states, etc.).
4. Test each migration step to ensure **existing functionality is preserved**.

---

## 6️⃣ Tips for a Smooth Transition

* **Do not migrate everything at once** — pick slices with clear benefits.
* **Combine Redux with Context API** if some parts remain small or isolated.
* **Write unit tests for reducers** before connecting to UI.
* **Use Redux DevTools** for debugging state changes.
* Document new **state conventions** to keep the team aligned.

---

## ✅ Senior-Level Approach

* **Step 1:** Identify pain points and shared state.
* **Step 2:** Introduce Redux in one slice, keep the rest local.
* **Step 3:** Gradually migrate other slices while testing thoroughly.
* **Step 4:** Enforce immutability, pure reducers, and proper middleware usage.

> 💡 Tip: The **goal is incremental adoption**, not a full rewrite. This reduces risk and helps the team adapt to centralized state management naturally.

