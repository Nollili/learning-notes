# ⚖️ When to Use (or Not Use) a Centralized Store

A **centralized store** (for example Redux Toolkit or Zustand) is not always necessary. Its usage should be guided by **app complexity, state-sharing needs, and team size**.

---

## 1️⃣ When to Use a Centralized Store

| Situation | Reason |
|-----------|--------|
| **Multiple components need the same state** | Avoids prop drilling and inconsistent updates. Example: auth info, user preferences, shopping cart. |
| **Complex state logic or dependencies** | When state updates involve calculations or multiple interactions, centralized reducers make it predictable. |
| **Async workflows** | Assign an explicit owner; middleware can coordinate work, but a generic store does not supply freshness, eviction or mutation policy automatically. |
| **Cross-cutting concerns** | Things like notifications, theme, language, and logging are easier to manage globally. |
| **Large applications or teams** | Helps maintain **consistency**, enforce **best practices**, and ease onboarding. |
| **Debugging & monitoring required** | DevTools like Redux DevTools allow **time-travel debugging**, replaying actions, and inspecting state. |

---

## 2️⃣ When Not to Use a Centralized Store

| Situation | Reason |
|-----------|--------|
| **Small or simple apps** | Overhead may outweigh benefits; `useState` or `useReducer` + Context is simpler. |
| **Transient/local UI state** | Ephemeral state (modals, inputs, hover states) is better kept **local** to the component. |
| **Performance-critical components** | Large or frequently updating state can cause unnecessary re-renders if not sliced/selectively accessed. |
| **Tightly coupled state is minimal** | If state does not need sharing across components, a global store adds complexity unnecessarily. |
| **Learning curve concern for new developers** | Teams unfamiliar with Redux/centralized patterns may slow down development for simple apps. |

---

## 3️⃣ Best Practices

- **Hybrid approach:**  
  - Use local state for **transient UI**.  
  - Use centralized store for **shared, global, or async state**.
- **Slice your state**: Avoid putting everything in one large store object; use slices/modules.
- **Use selectors**: Minimize re-renders by selecting only the necessary state.
- **Incremental adoption**: Introduce Redux (or equivalent) **gradually**, starting with the most needed slices.

---

### ✅ Key Takeaways

- **Use centralized stores** for shared, complex, or async state in medium-to-large apps.  
- **Avoid centralized stores** for small apps, transient UI state, or when simplicity is more important.  
- Always weigh **complexity vs benefit**—centralized state management is a tool, not a requirement.  

> 💡 Senior Tip:  
> The goal is **predictable, maintainable state**. Choose the simplest solution that meets this goal.


## One owner for client state; another for server cache

Use local React state/reducers for owned drafts, Redux Toolkit for client-owned shared transitions when justified, and the existing TanStack Query5 path for remote state. RTK Query is an alternative server-cache choice, not a second writable copy to install alongside it. Recoil is historical rather than a new primary dependency. Team/app size alone does not determine ownership.

The [versioned pending-overlay example](../React/complex-forms-and-data.md#worked-optimistic-policy-pending-overlay-instead-of-stale-snapshot-rollback) implements mutation/invalidation and avoids erasing a later edit with an earlier failed rollback. This smaller cache lab isolates confirmation and affected-key invalidation using the same pure version helper. Use one consistent key contract when integrating; this lab spells out both tenant and user scope.

```ts
// cache-confirmation.ts
import { QueryClient, queryOptions } from '@tanstack/react-query';
import { acceptConfirmed, type NoteRecord } from './note-projection.js';
export type CacheScope = Readonly<{ tenantId: string; userId: string }>;
export const detailKey = (scope: CacheScope, id: string) => ['note', scope.tenantId, scope.userId, id] as const;
export const listPrefix = (scope: CacheScope) => ['notes', scope.tenantId, scope.userId] as const;
export function detailOptions(scope: CacheScope, id: string, load: () => Promise<NoteRecord>) {
  return queryOptions({
    queryKey: detailKey(scope, id),
    queryFn: async () => { const result = await load(); if (result.id !== id) throw new Error('Wrong note'); return result; },
    retry: false, staleTime: 30_000,
    structuralSharing: (old, incoming) => acceptConfirmed(old as NoteRecord | undefined, incoming as NoteRecord),
  });
}
export async function confirmRename(client: QueryClient, scope: CacheScope, input: NoteRecord,
  persist: (note: NoteRecord) => Promise<NoteRecord>): Promise<void> {
  try {
    const confirmed = await persist(input); // Exactly one attempt; caller owns transport/schema/authentication.
    if (confirmed.id !== input.id) throw new Error('Wrong note');
    client.setQueryData<NoteRecord>(detailKey(scope, input.id), old => acceptConfirmed(old, confirmed));
  } finally {
    await client.invalidateQueries({ queryKey: detailKey(scope, input.id), exact: true });
    await client.invalidateQueries({ queryKey: listPrefix(scope) });
  }
}
```

The load/persist ports must return already parsed authorized domain records; the casts describe the exclusively owned cache key, not unknown JSON validation. Every writer must preserve that invariant. Invalidation marks matching entries stale and refetches eligible active queries under their configuration; it does not guarantee every inactive page has been fetched or that the server is correct. Detail merge is monotonic, including responses arriving after a newer confirmation. Namespace keys prevent accidental cache mixing but do not authorize a server operation.

A failed/ambiguous write still invalidates for reconciliation while preserving the form's draft; there is no automatic write retry. The helper returns no alternate UI copy of the response. Read from the canonical cache plus the documented pending projection. Model refetch failure and known-commit/unknown-outcome UI explicitly; an invalidation call is not a distributed transaction. Dispose subscriptions and clear scoped caches on the appropriate owner/account lifecycle.

**Acceptance:** with the actual QueryClient/QueryObserver, show one persist call, monotonic detail updates, active detail/list refetch, inactive-list staleness, unaffected other-user scope and failed-mutation reconciliation. Run the pure A/B pending-overlay cases from the shared lesson; never restore a stale whole-cache snapshot. API/database, browser and learner implementation remain required. Checked baseline: TanStack Query5.104.5, TypeScript5.9.3/Node24.18.0.

Official references checked 2026-10-22: [query invalidation](https://tanstack.com/query/v5/docs/framework/react/guides/query-invalidation), [mutation lifecycle](https://tanstack.com/query/v5/docs/framework/react/guides/mutations).
