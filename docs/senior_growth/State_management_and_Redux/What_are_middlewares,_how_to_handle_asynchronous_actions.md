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

**Legacy low-level setup (modern code normally uses configureStore):**
```ts
import { createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from './reducers';

const store = createStore(rootReducer, applyMiddleware(thunk));
```

### Primary HTTP flow: bounded adapter plus request owner

Use the actual createProfileStore/loadProfile request-ID example in the [Redux debugging lesson](./How_would_you_debug_an_application_using_Redux.md#reproduce-a-race-before-changing-the-ui). The adapter below completes its browser HTTP boundary. Store-side validation still protects other adapters/fakes; no raw Response/Error/Promise is placed in Redux state.

<<< ../../workbench/engineering/state/profile-http.ts{ts}

The fixed relative endpoint is for an eligible same-origin browser request; it is not an arbitrary user-chosen URL. Native fetch does not reject merely for404/500, so response.ok is checked before JSON handling. The media contract accepts application/json with parameters, not application/jsonjunk. The4096-byte cap counts bytes actually read even without Content-Length; fatal UTF-8 decoding rejects malformed sequences, and runtime projection requires the requested ID/name before returning.

JSON duplicate-member semantics follow JSON.parse in this small non-authority display DTO; use the application's stricter decoder if its contract forbids duplicate names. No client field grants identity/permissions.

The512-read cap bounds callback/empty-chunk work as well as total bytes; unusually fragmented otherwise-valid responses can hit it, so tune/test the documented policy with the actual transport rather than treat chunk boundaries as records. Native fetch/body reading must cooperate with the combined signal for the five-second deadline. An injected library ignoring cancellation is outside that guarantee and needs its own enforceable boundary.

Cleanup clears the timer, cancels remaining body work and releases the reader; cancel errors do not replace the safe original result/error. Abort never undoes a server write; this adapter is GET-only.

Wire createProfileStore(createProfileHttpApi()) once per client owner or per SSR request with the appropriate server adapter; the browser relative URL/credentials policy does not magically work in Node SSR. The owner dispatches loadProfile, handles unwrap rejection, calls the returned dispatch promise's abort method on supersession/unmount as appropriate, and retains the reducer request-ID guard from the debugging lesson. Network abort reduces waste; it does not replace stale-result protection. Use the existing route/session scope rules before extending this demonstration to private data.

---

## 5️⃣ Redux Saga as an alternative

Saga expresses orchestration with generator effects such as call/put and owns task cancellation. For one active selection, takeLatest can cancel the previous task; takeEvery deliberately permits concurrent tasks. Cancellation must be connected to a real AbortController/adapter teardown and result identity policy. It does not automatically cancel every arbitrary fetch or undo external writes. A takeLatest watcher over one action type also cancels unrelated resources if they share that watcher, so scope the workflow intentionally.

Primary learning implementation remains Toolkit's injected thunk/request owner above. If a project already uses Saga, adapt the same bounded transport/schema and safe error contracts; advance to a cancellation-tested Saga worker only when that orchestration is required. No unsafe fetch/yield/raw-error sketch is needed as a second competing implementation.

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


## Current exports and one primary Toolkit path

Verified2026-10-21 with Redux Toolkit2.13.0, Redux5.0.1, Redux Thunk3.1.0, React Redux9.3.0 and Immer11.2.7. Redux Thunk3 has named thunk and withExtraArgument exports; Immer10+ uses named produce. configureStore already includes thunk in its default middleware. Inject dependencies through its thunk.extraArgument option instead of adding a second thunk instance or hardcoding a service inside every action creator.

<<< ../../workbench/engineering/state/counter-store.ts{ts}

The dependency returns unknown at the boundary; TypeScript alone cannot validate a runtime service response. Only a safe integer delta reaches the plain Redux action. No Promise/Error/client object is stored in state. The dispatch promise exposes completion/failure to the owning UI; callers must await/catch it and show an explicit recovery state. This example performs one additive operation and does not pretend to implement a user-profile loading/race/cancellation protocol. Two concurrent additions use the current state after each awaited result rather than a captured stale count.

A reducer's draft mutation is supported because createReducer owns Immer; mutating an ordinary reducer's incoming state is still wrong. Keep nondeterministic work/network/time/randomness outside reducers. Choose RTK Query for server-cache ownership when that is the requirement, listener middleware for action-driven reactions, and Saga/Observable as alternatives when the application's actual orchestration needs justify them. Project size alone does not determine the correct side-effect owner.


Official references: [named export migration](https://redux.js.org/usage/migrations/migrating-rtk-2), [injected thunk dependencies](https://redux.js.org/usage/writing-logic-thunks), [Toolkit defaults](https://redux.js.org/toolkit/api/getDefaultMiddleware), [TypeScript thunk/dispatch contracts](https://redux.js.org/usage/usage-with-TypeScript).


### HTTP and async ownership acceptance

Run the exact adapter with the request-ID store. Cover204/no-body according to this GET contract (rejected), non2xx, missing/wrong/jsonjunk media, valid split UTF-8 JSON, malformed UTF-8/JSON/schema/mismatched ID,4096/4097-byte boundaries and missing Content-Length. Check pre-aborted and mid-request signals, empty-chunk/read budget, body cancellation/reader release and fixed error messages. Repeat B-before-A completion to prove stale data cannot commit, and observe abort/unwrap handling.

The injected test response is not a browser network proof; run a real authenticated endpoint/browser navigation exercise separately. Pin browser support for AbortSignal.any or provide an owned equivalent. Node24.18.0 supports the validation baseline; TypeScript5.9.3 source checking uses the documented Toolkit declaration limitation from the debugging note.

Authoritative references checked2026-10-22: [Fetch/body/status contract](https://fetch.spec.whatwg.org/), [ReadableStream reader/cancellation](https://streams.spec.whatwg.org/#default-reader-class), [Redux async-thunk cancellation](https://redux.js.org/toolkit/api/createAsyncThunk). Real endpoint/browser/timeout integration and learner practice remain required; no automatic write retry is introduced.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/state/What_are_middlewares%2C_how_to_handle_asynchronous_actions.md). All learner practice remains outstanding.


The canonical HTTP reference now races both transport and body reads against its abort/deadline owner, and consumes cancellation failures without awaiting indefinitely. This bounds caller waiting even when an injected adapter ignores abort; it cannot stop arbitrary remote work or preempt synchronous parsing. The fixed 4096-byte/read-count limits remain separate bounds.
