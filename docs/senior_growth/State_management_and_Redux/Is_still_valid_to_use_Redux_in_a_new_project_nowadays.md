# Is still valid to use Redux in a new project nowadays? Pros/cons?

# ⚖️ Choosing Redux Toolkit (reviewed2026-10-22)

Yes, Redux is still **valid and widely used**, but whether to use it in a **new project** depends on the **project size, complexity, and team preferences**. Modern tools and alternatives have also changed the landscape.

---

## 1️⃣ Pros of Using Redux Today

| Pros | Explanation |
|------|------------|
| **Predictable State Management** | Single source of truth + pure reducers make state predictable and easy to debug. |
| **Strong Tooling** | Redux DevTools allow **time-travel debugging**, state inspection, and action replay. |
| **Large Ecosystem** | Tons of middleware, community support, and libraries like Redux Toolkit simplify boilerplate. |
| **Testability** | Reducers and plain action creators are deterministic under their contracts; async thunks/side effects need separate controlled integration checks. |
| **Scalability** | Handles complex apps with **many shared state slices** reliably. |
| **Async Handling** | Middleware (Thunk, Saga) allows clean management of async operations and side effects. |

---

## 2️⃣ Cons / Drawbacks

| Cons | Explanation |
|------|------------|
| **Boilerplate** | Without Redux Toolkit, it can be verbose to set up actions, reducers, and store. |
| **Learning Curve** | New developers need to understand **actions, reducers, immutability, and middleware**. |
| **Overkill for Small Apps** | Simple apps may not need a centralized store; `useState` + `Context` might suffice. |
| **Potential Performance Issues** | Large state updates or poor selector usage can trigger unnecessary re-renders. |
| **Async Complexity** | Requires extra setup for async workflows (Thunk/Saga). |

---

## 3️⃣ When Redux is Recommended

- Large applications with **complex global state**.
- Apps with **frequent state sharing** across multiple components.
- Applications that require **advanced debugging, logging, or time-travel**.
- Teams that benefit from **strict structure and conventions** for state management.

---

## 4️⃣ Modern Alternatives

- **Zustand**: lightweight, simple, minimal boilerplate. Good for medium apps.  
- **Jotai**: atom-oriented alternative where that ownership model fits. Recoil is historical: its repository was archived2025-01-01.  
- **React Query / TanStack Query**: for server-side data and caching.  
- **Context + useReducer**: simple, built-in solution for smaller apps.  

> 💡 Tip:  
> **Redux Toolkit** solves most traditional cons of Redux (boilerplate, immutability, async setup), making Redux still very viable for modern projects.

---

### ✅ Summary

- **Redux is still valid**, especially with Redux Toolkit.  
- Ideal for **large, complex, shared, and async-heavy applications**.  
- **For small or simple apps**, React's built-in state + Context or lighter libraries (Zustand, Jotai) may be preferable.  
- Choose based on **app size, complexity, and team experience**, not just trendiness.


## Normalize identity; persist only a reviewed subset

Normalization keeps one record per ID plus ordered ID lists, reducing accidental duplicate edits across nested UI copies. It does not validate a server response or make a mutable object safe to share. This small Toolkit adapter example makes immutable update/no-op behavior observable:

```ts
// normalized-records.ts
import { createEntityAdapter } from '@reduxjs/toolkit';
export type RecordItem = { id: string; title: string };
export const records = createEntityAdapter<RecordItem>();
export const emptyRecords = records.getInitialState();
export const initialRecords = records.setAll(emptyRecords, [
  { id: 'a', title: 'First' }, { id: 'b', title: 'Second' },
]);
export const revisedRecords = records.updateOne(initialRecords,
  { id: 'a', changes: { title: 'Revised' } });
```

The old a snapshot remains First, changed a gets a new reference, unchanged b retains its reference, and IDs remain stable. An unknown-ID update is a no-op in this adapter. Parse/authorize incoming records before insertion, define deletion/cross-reference policy and keep selection as an ID rather than another full copy. Shallow entity updates do not implement nested PATCH merging or concurrent-version conflict resolution.

Persistence is a separate boundary. Prefer storing small nonsensitive preferences/drafts with schema version, validation, migrations, storage-failure/hydration/cross-tab/disposal policy. Do not dump credentials, permissions, remote private cache or transient loading/error promises into localStorage. The [worked safe preference codec/adapter](../React/React_state_management_and_tools.md#versioned-persistence-is-a-boundary-not-a-dump-of-the-store) supplies those failure paths; one persistence owner is enough. Logout/session changes may require clearing user-scoped data beyond a local view reset.

**Acceptance:** execute the adapter and assert exact IDs, changed/unchanged references, previous-state preservation and unknown-ID no-op; compare a selected record after a normalized update. Run the linked versioned codec/adapter exercises with corrupt/future data and storage failure before persisting a real feature. Explain why normalization, mutation control, async race handling and persistence each need different checks. These notes improve implementation guidance without establishing completed learner practice. [Official entity adapter contract](https://redux.js.org/toolkit/api/createEntityAdapter), [Recoil archive](https://github.com/facebookexperimental/Recoil), checked2026-10-22.

For actual server-state mutation depth, follow the [versioned pending-overlay example](../React/complex-forms-and-data.md#worked-optimistic-policy-pending-overlay-instead-of-stale-snapshot-rollback), including monotonic confirmed versions, query/list invalidation and concurrent failure schedules. A normalized client entity table is not a transaction or a complete server cache.
