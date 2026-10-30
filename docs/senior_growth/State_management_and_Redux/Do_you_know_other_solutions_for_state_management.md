# Do you know other solutions for state management?

## State Management Solutions in Frontend Development {#%F0%9F%8C%90-state-management-solutions-in-frontend-development}

While **Redux** and **Flux** are popular, there are many other ways to manage state in modern JavaScript/TypeScript applications, especially React. The right choice depends on **app complexity, size, and team preferences**.

---

## React Built-in Solutions {#_1%EF%B8%8F%E2%83%A3-react-built-in-solutions}

| Solution | Description | Pros | Cons |
|----------|------------|------|------|
| **useState** | Local state for functional components | Simple, minimal boilerplate | Not shared across components easily |
| **useReducer** | State + reducer pattern locally | Predictable updates, good for complex local state | Still local, not global |
| **Context API** | Scoped value distribution across a provider subtree | No external library needed, works well for simple global state | Can cause unnecessary re-renders, not ideal for high-frequency updates |

---

## External State Management Libraries {#_2%EF%B8%8F%E2%83%A3-external-state-management-libraries}

| Library | Description | Pros | Cons |
|---------|------------|------|------|
| **Redux / Redux Toolkit** | Centralized, predictable state with reducers & actions | Mature ecosystem, DevTools, predictable | Can be verbose without Toolkit |
| **MobX** | Observable-based state management | Less boilerplate, reactive, simple syntax | Harder to debug in large apps, magic behind observables |
| **Recoil** | Archived legacy React state library | Atom/selector concepts useful in existing apps | Repository archived2025-01-01; not a new-project recommendation |
| **Zustand** | Lightweight global state with hooks | Minimal boilerplate, simple API, performant | Less tooling, not as structured as Redux |
| **Jotai** | Atom-based, React-friendly | Tiny, simple, composable atoms | Small ecosystem, can become complex for large apps |
| **XState** | State machines & statecharts | Very predictable, explicit transitions, ideal for complex workflows | More learning curve, can be overkill for simple apps |

---

## Server State Management {#_3%EF%B8%8F%E2%83%A3-server-state-management}

| Library | Description | Pros | Cons |
|---------|------------|------|------|
| **React Query / TanStack Query** | Handles server data fetching, caching, and synchronization | Automatic caching, background refetch, optimistic updates | Not for client-only state, adds dependency |
| **Apollo Client** | GraphQL client with caching & state management | Unified GraphQL + local cache, reactive queries | Only works with GraphQL APIs |

---

## Comparison: Local vs Global vs Server State {#_4%EF%B8%8F%E2%83%A3-comparison-local-vs-global-vs-server-state}

| State Type | Typical Tools | Notes |
|------------|--------------|------|
| Local Component State | `useState`, `useReducer` | Small, self-contained state |
| Global App State | Local/reducer/context, Redux Toolkit or Zustand when justified | Shared state, cross-component communication |
| Server / Async Data | React Query, Apollo Client | Focused on server data, caching, and syncing |

---

## Senior-Level Considerations {#_5%EF%B8%8F%E2%83%A3-senior-level-considerations}

1. **Use built-in hooks for small/local state** — avoid over-engineering.  
2. **Choose Redux / MobX / Zustand for complex, shared state**.  
3. **Use server-state tools (React Query, Apollo)** to separate concerns and reduce global state boilerplate.  
4. **Hybrid approach** is often best:
   - Local state for transient UI state (forms, modals)
   - Global state for cross-cutting concerns (auth, theme)
   - Server-state libraries for async API data  

---

### Key Takeaways {#%E2%9C%85-key-takeaways}

- **No one-size-fits-all solution**; choice depends on app complexity, team size, and patterns.  
- **React built-in state** + **Context** is often sufficient for small apps.  
- For large apps, **Redux Toolkit, MobX, or Zustand** are common choices.  
- For server data, a dedicated query/cache owner can avoid manually duplicating freshness/invalidation logic in a generic store.  

> Senior Tip:
> Always separate **UI state, global client state, and server state**. It improves maintainability and reduces unnecessary re-renders.

## Apply the distinction to an actual workflow

Use the [worked preference store and versioned persistence boundary](../React/React_state_management_and_tools.md) for the primary ownership exercise. The archived Recoil comparison is historical; no requirement to implement MobX, Effector, Jotai, XState and Apollo alongside the selected stack. A smaller dependency surface is useful only if the remaining code still owns cancellation, errors and cleanup correctly.

For a product list, put shareable filter/sort/page in the validated URL, open-dialog state beside its owner, unsaved form input in a workflow draft, and fetched products under a query key containing all filters/user scope. Do not copy every query result into Zustand merely to make it “global.” Decide who invalidates after a successful write and which consumer displays stale data while refetching. Normalized entity caches and document/query caches have different update/identity policies; a table's stable row ID does not automatically normalize every response.

Optimistic updates are a speculative UI technique: cancel/coordinate conflicting reads, snapshot or record a patch, apply an expected result, rollback only the failed operation's contribution and reconcile with server truth. A single old snapshot rollback can erase a later successful edit. Serialization/version checks or an operation log may be needed for overlapping mutations; invalidation alone does not define conflict policy. The subsequent mutation/form lesson supplies the worked implementation; this overview does not claim it is already executed.


References checked2026-10-21: [TanStack Query server-state model](https://tanstack.com/query/latest/docs/framework/react/overview), [optimistic updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates), [Zustand](https://github.com/pmndrs/zustand), [Recoil status](https://github.com/facebookexperimental/Recoil).


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/state/Do_you_know_other_solutions_for_state_management.md). All learner practice remains outstanding.
