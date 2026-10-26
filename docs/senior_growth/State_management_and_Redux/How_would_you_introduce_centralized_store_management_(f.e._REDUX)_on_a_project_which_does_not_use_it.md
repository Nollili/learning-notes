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

- Start with one low-risk shared slice such as theme/preferences; model display identity separately from server-owned authentication.
- Define **actions, reducers, and selectors** for that slice.
- Decide on **middleware** if async handling is required (Thunk/Saga).
- Keep existing local state in components for non-shared, transient UI data.

---

## 3️⃣ Install Dependencies

```bash
npm install @reduxjs/toolkit react-redux
```

* **Redux Toolkit** simplifies boilerplate:

  * `createSlice` for reducers + actions
  * `configureStore` for store setup
  * Built-in support for Thunk middleware

---

## 4️⃣ Create the Store and Slices

**Example: authSlice.ts**

```ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Display identity only; server-owned HttpOnly session credentials stay outside Redux.
interface AuthState { user: string | null; }

const initialState: AuthState = { user: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: string }> ) => {
      state.user = action.payload.user;
    },
    logout: (state) => { state.user = null; },
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



## Normalize shared relationships before migrating consumers

Use Redux Toolkit2.13 as the primary client-owned state implementation. Keep one authoritative copy per entity, with IDs representing relationships; selectors derive views. A copied user inside each project becomes stale after renaming. Normalization avoids that duplication but adds joins, integrity policy and cleanup work. Small isolated forms can remain local. If RTK Query owns server data, prefer its cache/invalidation rather than maintaining an independently writable duplicate entity table. Logout/tenant changes must dispose/reset the owner; entity IDs alone are not authorization.

The standalone example below models projects with one owner. All payloads are already validated application-domain values; TypeScript is not a JSON validator. A full snapshot replaces both tables atomically and rejects duplicate IDs or dangling owners. Renaming changes the user once; removing a user follows an explicit cascade policy. A real product might instead restrict deletion or transfer ownership.

```ts
// relational-state.ts
import { configureStore, createEntityAdapter, createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
type User = { id: string; name: string };
type Project = { id: string; title: string; ownerId: string };
type Snapshot = { users: User[]; projects: Project[] };
const users = createEntityAdapter<User>();
const projects = createEntityAdapter<Project>();
const initialState = { users: users.getInitialState(), projects: projects.getInitialState() };
const slice = createSlice({
  name: 'catalogue', initialState,
  reducers: {
    replaced(state, { payload }: PayloadAction<Snapshot>) {
      const userIds = new Set(payload.users.map(user => user.id));
      const projectIds = new Set(payload.projects.map(project => project.id));
      if (userIds.size !== payload.users.length || projectIds.size !== payload.projects.length
        || payload.projects.some(project => !userIds.has(project.ownerId))) throw new Error('Invalid relationships');
      users.setAll(state.users, payload.users);
      projects.setAll(state.projects, payload.projects);
    },
    userRenamed(state, { payload }: PayloadAction<{ id: string; name: string }>) {
      const current = state.users.entities[payload.id];
      if (current && current.name !== payload.name) users.updateOne(state.users, { id: payload.id, changes: { name: payload.name } });
    },
    userRemoved(state, { payload: id }: PayloadAction<string>) {
      users.removeOne(state.users, id);
      const owned = state.projects.ids.filter(projectId => state.projects.entities[projectId]?.ownerId === id);
      projects.removeMany(state.projects, owned);
    }
  }
});
export const { replaced, userRenamed, userRemoved } = slice.actions;
export const makeStore = () => configureStore({ reducer: { catalogue: slice.reducer }, devTools: false });
export type RootState = ReturnType<ReturnType<typeof makeStore>['getState']>;
export const userSelectors = users.getSelectors((state: RootState) => state.catalogue.users);
export const projectSelectors = projects.getSelectors((state: RootState) => state.catalogue.projects);
// A selector factory avoids sharing one parameterized view owner across unrelated lists.
export const makeSelectOwnerProjects = () => createSelector(
  [projectSelectors.selectAll, (_state: RootState, ownerId: string) => ownerId],
  (all, ownerId) => all.filter(project => project.ownerId === ownerId)
);
```

`createEntityAdapter` manages IDs/entities, not relational constraints, network loading, authorization or deep merging. Its update/upsert helpers merge shallowly; replacing a nested object replaces that whole property. Keep nested fields deliberate or normalize them too. The cascade scans all projects, O(P); a maintained owner index can reduce repeated queries at the cost of another invariant to update. Do not keep a second writable `ownerName` field in projects. Read a project's owner through `userSelectors.selectById` and handle missing results during loading/deletion. A row component selecting only its entity can keep unrelated references stable; a selector producing a new un-memoized array on every call defeats that benefit.

Migrate one read path and one write path together. Route legacy writes through the same actions, compare output during transition, then remove the old writable copy. Do not leave both stores synchronizing each other through effects. Server writes still need validation, concurrency/version rules and cache invalidation; an atomic Redux dispatch is not a database transaction.

**Exercise acceptance:** load two users and three projects, rename one user, and prove all owner labels derive the new name without copying project records. Check unchanged project and unrelated user references, previous snapshots, duplicate/dangling snapshot rejection without partial updates, unknown rename/removal, cascade cleanup and independent store instances. Verify selector output identity on identical inputs. Measure row renders with a representative UI and decide whether a reverse index is justified; no measured render improvement follows from normalization alone. Learner implementation remains required.

Validation target: TypeScript5.9.3/Node24.18.0/Redux Toolkit2.13.0. The existing scratch environment requires `skipLibCheck` for upstream RTK declaration errors under exactOptionalPropertyTypes; own example checks remain strict. References checked2026-10-22: [Redux normalization](https://redux.js.org/usage/structuring-reducers/normalizing-state-shape), [updating relationships](https://redux.js.org/usage/structuring-reducers/updating-normalized-data), [entity adapter and shallow updates](https://redux-toolkit.js.org/api/createEntityAdapter).

## Display identity is not authentication evidence

The early authSlice is a client display-state sketch. Dispatching login does not authenticate a session or authorize an API call, and logout only clears that sketch. The server must enforce its session/authorization policy; a real logout/tenant switch also invalidates the appropriate server session and resets/disposes scoped client data owners. Keep credentials and unnecessary personal data out of actions, persisted stores and debug/log histories. Do not treat a production DevTools toggle alone as a redaction policy.

For the actual migration exercise, use the complete makeStore relational fixture above rather than combine its factory with the browser-only singleton sketch. Move one legacy read/write path to a single owner, compare behavior, then remove the old writable copy. The supplied tests check snapshot/integrity/reference contracts; no application migration, production authorization flow or measured render gain has been executed here. Learner acceptance remains the documented migration and UI evidence, not merely a passing reducer test.
