# How would you debug an application using Redux?

# 🐞 Debugging Redux Applications

Debugging Redux applications involves **understanding the flow of actions, state updates, and component re-renders**. There are multiple strategies and tools to make this process efficient.

---

## 1️⃣ Use Redux DevTools

**Redux DevTools** is the most common and powerful debugging tool.

### Features:
- **Action Logging:** See all dispatched actions in order.
- **State Snapshots:** Inspect state **before and after** each action.
- **Time-Travel Debugging:** Rewind and replay actions to find the exact moment a bug occurs.
- **Dispatch Actions Manually:** Test reducers by dispatching actions directly.

**Setup Example:**
```ts
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';

export const store = configureStore({
  reducer: rootReducer,
  devTools: false, // Explicit opt-in only after reviewing state/action privacy.
});
```

---

## 2️⃣ Log Actions and State

* Even without DevTools, logging can help:

```ts
const unsubscribe = store.subscribe(() => {
  const state = store.getState();
  // Project only known-safe fields from the worked profile store below.
  console.info({ event: 'profile_state_changed', status: state.profile.status,
    hasProfile: state.profile.profile !== null });
});
// The owning feature invokes unsubscribe() on disposal; no raw state/payload/ID logging.
```

* Useful for small apps or when troubleshooting **specific actions**.

---

## 3️⃣ Check Reducers and Actions

* **Reducers should be pure functions**.

  * No side effects or direct state mutation.
* Confirm that **action payloads** are correct.
* Use unit tests for reducers:

```ts
expect(counterReducer({ count: 0 }, { type: 'INCREMENT' })).toEqual({ count: 1 });
```

---

## 4️⃣ Inspect Components with `useSelector` and `connect`

* Verify that components receive the **correct slice of state**:

```ts
const count = useSelector(state => state.counter.count);
```

* Misuse of selectors or mapping state incorrectly can cause UI bugs.

---

## 5️⃣ Check Middleware / Async Flows

* Async actions are common sources of bugs.
* For **Redux Thunk**:

  * Make sure async function resolves or rejects correctly.
  * Ensure `dispatch` is called with correct actions.
* For **Redux Saga**:

  * Use `redux-saga-test-plan` or log generator effects.
  * Verify watchers are correctly set up.

---

## 6️⃣ Common Debugging Steps

1. Identify the **symptom** in the UI.
2. Check the **component state via `useSelector`**.
3. Inspect **recent actions dispatched**.
4. Verify **reducers produce correct state**.
5. Check **middleware/async logic** if action results are unexpected.
6. Use **DevTools time-travel** to replay actions and isolate the bug.

---

## 7️⃣ Best Practices for Debugging Redux

* Keep **reducers pure** and predictable.
* Use **DevTools** in development.
* Write **unit tests for reducers and action creators**.
* Use **selectors** to encapsulate state access.
* Use **logging middleware** for extra insight in development.
* Avoid deeply nested or overly large state; it makes debugging harder.

---

### ✅ Key Takeaways

* Redux DevTools is **essential** for inspecting state and actions.
* Pure reducers + immutable state = easier debugging.
* Middleware/async actions are often the source of subtle bugs.
* Logging, unit tests, and selectors help pinpoint issues quickly.

> 💡 Senior Tip:
> Always **debug state first, then UI**. Redux separates state logic from presentation, so most bugs can be found by inspecting actions and state flow.


## Reproduce a race before changing the UI

A deterministic reducer can still receive async results in the wrong order. Capture a synthetic minimal action timeline: pendingA, pendingB, fulfilledB, fulfilledA. The bug is an older response replacing the current selection. The fixed reducer records the current request ID, clears old display data at pending, and accepts only the matching completion. Abort is cooperative; the request-ID guard protects the commit even when an adapter ignores it.

<<< ../../workbench/engineering/state/profile-race.ts{ts}

The injected adapter owns fixed endpoint selection, HTTP status/media/size policy and deadlines, forwarding the signal into network/body work. This read-only demo ID is not an authorization context; a real multi-tenant key must include the verified tenant/principal/session policy and clear/isolate private state at logout. A store factory prevents tests/SSR requests sharing one singleton.

RTK dispatch promises resolve to a lifecycle action; use unwrap() with handled rejection when the caller needs success/failure as a promise. A reducer replay does not replay or undo network effects, server writes, time or external state.

Keep DevTools disabled for private data until an explicit local policy is chosen. Optional actionSanitizer/stateSanitizer projections must remove secrets from both actions and state; hiding a UI field or disabling production DevTools alone is not redaction. A sanitized trace can lose the payload needed to replay a real incident: construct a minimal synthetic fixture instead of exporting users' state.

The logger above projects fixed status/boolean fields and returns a disposer; validate that errors/meta/query values are not accidentally included. If a safe log adapter fails, handle that at its ownership boundary rather than allowing telemetry to crash a reducer.


Official references checked2026-10-22: [configureStore and DevTools](https://redux.js.org/toolkit/api/configureStore), [async-thunk request IDs/cancellation/unwrap](https://redux.js.org/toolkit/api/createAsyncThunk). Primary path uses Toolkit; Saga is an alternative rather than an additional required implementation.

Validation limitation: the isolated TypeScript5.9.3 + Toolkit2.13.0 check found errors inside Toolkit declaration files with exactOptionalPropertyTypes. The worked source passes strict/noUncheckedIndexedAccess/exactOptionalPropertyTypes with skipLibCheck enabled for those external declarations. That flag does not validate library declaration bodies and must not be described as a fully clean dependency typecheck. Consumer source usage remains checked. Track a compatible dependency/compiler resolution for a real application; this lab does not change any Autocode template configuration. Runtime race/replay checks are independent evidence.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/state/How_would_you_debug_an_application_using_Redux.md). All learner practice remains outstanding.
