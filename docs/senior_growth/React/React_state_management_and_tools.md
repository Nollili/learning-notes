# React state management and tools
## Alternative State Management Solutions in React

While Redux is a powerful and widely-used state management library, it's not the only option available. Depending on your project's needs, you might find that another solution fits better.

### MobX {#_1-mobx}

**What is MobX?**  
MobX is a simple and scalable state management library that makes state management transparent by applying functional reactive programming (FRP). It uses observable data structures to automatically track and update state changes in your application.

**Key Features**
- **Simplicity:** Less boilerplate code compared to Redux.
- **Reactivity:** Automatically updates the UI when the state changes.
- **Flexibility:** Works well with object-oriented programming patterns.
- **Performance:** Efficient updates with fine-grained observability.

**When to Use MobX**  
If you prefer an object-oriented approach and want to minimize boilerplate code, MobX could be a great fit. It's particularly useful in applications where state changes are frequent and need to be reflected in the UI automatically.

---

### Recoil — archived legacy context {#_2-recoil-—-archived-legacy-context}

**What is Recoil?**  
Developed by Facebook, Recoil is a state management library designed specifically for React. It provides a way to share state across components with minimal friction, using atoms and selectors to manage state and derived data.

**Key Features**
- **Minimal Boilerplate:** Easy to set up and integrate into existing projects.
- **Concurrent Mode Compatibility:** Built to work seamlessly with React's Concurrent Mode.
- **Flexible State Sharing:** Atoms can be shared across components without prop drilling.

**When to Use Recoil**  
The official repository was archived on2025-01-01. Preserve concepts when maintaining an existing app, but select an actively maintained alternative for new work; do not assume current React compatibility or future fixes.

---

### Effector {#_3-effector}

**What is Effector?**  
Effector is a reactive state manager designed for predictable and efficient state management. It focuses on high performance and scalability by using reactive principles and avoiding unnecessary re-renders.

**Key Features**
- **Reactive Core:** Uses reactive programming concepts to manage state changes.
- **High Performance:** Minimizes re-renders and optimizes updates.
- **TypeScript Support:** Strongly typed API for better developer experience.
- **Scalability:** Suitable for both small and large applications.

**When to Use Effector**  
Effector is ideal for applications that require high performance and efficient state updates. If you prefer a functional approach to state management and want fine-grained control over reactivity, Effector could be a great choice.

---

### Reatom {#_4-reatom}

**What is Reatom?**  
Reatom is a tiny and powerful state manager inspired by Redux but designed to be more efficient and developer-friendly. It emphasizes modularity and reusability, allowing you to compose your application state using small, independent units.

**Key Features**
- **Modularity:** Build state using small, reusable units called atoms.
- **Immutability:** Encourages immutable state updates.
- **Type Safety:** Excellent TypeScript support for safer code.
- **Performance:** Optimized for performance with minimal overhead.

**When to Use Reatom**  
If you're looking for a state management solution that combines the predictability of Redux with improved developer ergonomics, Reatom might be the right fit. It's suitable for projects that require a balance between structure and flexibility.

---

### Apollo Client {#_5-apollo-client}

**What is Apollo Client?**  
Apollo Client is a comprehensive state management library that enables you to manage both local and remote data with GraphQL. It's designed to work seamlessly with React and simplifies data fetching and caching.

**Key Features**
- **GraphQL Integration:** Fetch and manage data using GraphQL queries.
- **State Management:** Manage local state alongside remote data.
- **Caching:** Efficiently cache data to minimize network requests.

**When to Use Apollo Client**  
If your application relies heavily on GraphQL APIs, Apollo Client is a strong choice. It allows you to manage your remote data and local state in a unified way, reducing the need for additional state management libraries.

---

### XState {#_6-xstate}

**What is XState?**  
XState is a library for creating, interpreting, and executing finite state machines and statecharts. It brings the formalism and power of state machines to React applications, allowing for more predictable state management.

**Key Features**
- **State Machines:** Model complex state logic explicitly.
- **Predictability:** Clear and deterministic state transitions.
- **Visualization:** Tools to visualize and inspect state machines.

**When to Use XState**  
XState is ideal for applications with complex state logic, such as multi-step workflows or intricate user interfaces. It helps manage state in a predictable and maintainable way, especially when dealing with numerous states and transitions.

---

### Jotai {#_7-jotai}

**What is Jotai?**  
Jotai is a primitive and flexible state management library for React that focuses on atomic state pieces. It's inspired by Recoil and offers a minimalistic API for managing state with atoms.

**Key Features**
- **Simplicity:** Minimal and straightforward API.
- **Atomic State:** Manage state in small, isolated units.
- **TypeScript Support:** Excellent TypeScript integration.

**When to Use Jotai**  
If you're looking for a simple and flexible state management solution with minimal boilerplate, Jotai could be a good fit. It's suitable for applications that require a lightweight approach to state management.

---

### Comparing the Alternatives

| Library        | Boilerplate | Learning Curve | Ideal For                                 |
| -------------- | ----------- | -------------- | ------------------------------------------ |
| Redux Toolkit | Less manual boilerplate than legacy Redux | Moderate | Explicit shared transitions/tooling |
| MobX           | Low         | Easy           | Apps needing reactive state management     |
| Recoil | Historical | Existing-project migration | Archived; not a new-project recommendation |
| Zustand        | Very Low    | Easy           | Simple state management                    |
| Effector       | Moderate    | Moderate       | High-performance applications              |
| Reatom         | Moderate    | Moderate       | Modular and predictable state              |
| Apollo Client  | High        | Moderate       | Apps using GraphQL                         |
| XState         | High        | High           | Complex state logic and workflows          |
| Jotai          | Very Low    | Easy           | Lightweight state management               |

---

### When to Choose an Alternative

- **Simplicity Over Complexity:** If Redux feels too heavy or complex for your project, consider local/reducer/context first, then maintained alternatives such as Zustand or Jotai where justified.
- **Reactive State:** If you need automatic UI updates without manual subscriptions, MobX or Effector might be suitable.
- **Functional Programming:** For a functional approach with reactive principles, Effector offers fine-grained control.
- **Modular State:** If you prefer building state from small, reusable units, Reatom provides modularity and predictability.
- **GraphQL Applications:** If your app is built around GraphQL, Apollo Client can handle both data fetching and state management.
- **Complex Workflows:** When dealing with intricate state transitions, XState's finite state machines can provide clarity and predictability.

---

### Conclusion

State management is a crucial aspect of building React applications, and there's no one-size-fits-all solution. While Redux is a powerful and popular choice, it's essential to evaluate your project's specific needs and choose the tool that best fits those requirements.

## Choose ownership before choosing another library

Primary study policy: local state for a local interaction, reducer for related transitions, context for distributing a scoped value, TanStack Query5 for remote/cache state, and **Zustand5 only when a small shared client store is justified**. Redux Toolkit is the alternative for a larger explicit action/reducer/tooling contract. The comparison table is qualitative, not a benchmark or a requirement to master every listed library. Do not claim that Redux always has high boilerplate or that MobX is inherently impossible to debug.

| Data | Owner/lifetime | Why |
|---|---|---|
| Open menu or input draft | Nearest component/workflow | No reason for application-wide persistence |
| Shareable sort/filter/page | Validated URL | Deep links and back/forward reproduce the view |
| Theme/density | Scoped preference owner | Shared client preference; persist a small safe subset if useful |
| Course records and request state | Query cache/server | Keys, freshness, invalidation, cancellation and authorization differ from UI state |
| Signed-in identity/permissions | Verified server session; client safe projection | A writable client boolean is never authorization |

Context transports values; it is not itself a reducer/cache. A changed provider value can update consumers; split independent contexts/ownership where measured needs justify it. A module singleton is shared across all uses in that runtime, which is inappropriate for per-request SSR private state. Create scoped stores/providers per request/tree where necessary and ensure consistent initial hydration snapshots.

### Worked named-export store: client preferences only

```tsx
// prefs-store.ts — client-only SPA example; server rendering needs a scoped factory/provider.
import { create } from 'zustand'; // Zustand5: default exports were removed.
type Prefs = { theme: 'light' | 'dark'; density: 'comfortable' | 'compact' };
type State = {
  prefs: Prefs;
  hydration: 'pending' | 'ready' | 'memory-only';
  setTheme: (theme: Prefs['theme']) => void;
};
export const usePrefs = create<State>()(set => ({
  prefs: { theme: 'light', density: 'comfortable' }, hydration: 'pending',
  setTheme: theme => set(state => ({ prefs: { ...state.prefs, theme } }))
}));
export function ThemeChoice() {
  const theme = usePrefs(state => state.prefs.theme);
  const setTheme = usePrefs(state => state.setTheme);
  return <fieldset><legend>Theme</legend>
    {(['light', 'dark'] as const).map(value => <label key={value}>
      <input type="radio" name="theme" value={value} checked={theme === value}
        onChange={() => setTheme(value)} />{value}
    </label>)}
  </fieldset>;
}
```

Use a unique radio-group name if rendering multiple independent instances; the example assumes one theme chooser. Zustand set shallow-merges the root, so nested prefs need explicit copying. Select a primitive/stable action rather than returning a new object/array every snapshot; Zustand5 selector stability/equality differs from older examples. useShallow or the traditional equality API are deliberate alternatives, not an extra comparator argument to every create hook. TypeScript is not runtime validation of persisted/user data.

### Versioned persistence is a boundary, not a dump of the store

```js
// prefs-codec.js — pure, shared with a persistence adapter.
export const defaultPrefs = () => ({ theme: 'light', density: 'comfortable' });
export function decodePrefs(raw) {
  if (raw === null) return defaultPrefs();
  if (typeof raw !== 'string' || raw.length > 2048) throw new Error('Invalid preference payload');
  const value = JSON.parse(raw);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid preferences');
  if (value.version === 1 && typeof value.darkMode === 'boolean') {
    return { theme: value.darkMode ? 'dark' : 'light', density: 'comfortable' };
  }
  if (value.version !== 2 || !value.prefs || typeof value.prefs !== 'object') throw new Error('Unsupported preferences');
  const { theme, density } = value.prefs;
  if (!['light', 'dark'].includes(theme) || !['comfortable', 'compact'].includes(density)) throw new Error('Invalid preference values');
  return { theme, density }; // Explicit projection: never merge arbitrary stored keys/actions.
}
export function encodePrefs(prefs) {
  const raw = JSON.stringify({ version: 2, prefs: { theme: prefs.theme, density: prefs.density } });
  decodePrefs(raw); // Reject invalid values at the write boundary too.
  return raw;
}
```

Version1 darkMode is migrated explicitly; unknown/future versions and malformed data fail instead of merging arbitrary values or silently overwriting a newer schema. Only theme/density persist: no access tokens, permissions, private records, functions or transient loading/error state. The2048character guard bounds parsing of the stored string; the storage API has already returned that string. Schema validation does not make localStorage secret or trusted.

```js
// prefs-persistence.js — imported beside codec and store in the exercise application.
// import { decodePrefs, encodePrefs } from './prefs-codec';
export function connectPrefs(store, storage, target) {
  const key = 'study-prefs';
  let writable = true;
  let applyingRemote = false;
  let disposed = false;
  try { store.setState({ prefs: decodePrefs(storage.getItem(key)), hydration: 'ready' }); }
  catch { writable = false; store.setState({ hydration: 'memory-only' }); }
  const unsubscribe = store.subscribe(state => {
    if (!writable || applyingRemote || disposed) return;
    try {
      const raw = encodePrefs(state.prefs);
      if (storage.getItem(key) !== raw) storage.setItem(key, raw);
    } catch { writable = false; store.setState({ hydration: 'memory-only' }); }
  });
  const onStorage = event => {
    if (disposed || (event.key !== key && event.key !== null) || (event.storageArea && event.storageArea !== storage)) return;
    try {
      // Event payload may lag another tab's newer write; reread the current snapshot.
      const prefs = decodePrefs(storage.getItem(key));
      applyingRemote = true;
      try { store.setState({ prefs, hydration: writable ? 'ready' : 'memory-only' }); }
      finally { applyingRemote = false; }
    } catch { writable = false; store.setState({ hydration: 'memory-only' }); }
  };
  target.addEventListener('storage', onStorage);
  return () => {
    if (disposed) return;
    disposed = true;
    unsubscribe(); target.removeEventListener('storage', onStorage);
  };
}
```

Connect once in an application-owner Effect after mount, obtaining window.localStorage inside a try/catch because even access can throw; pass window as target. Return the disposer from the Effect. Do not invoke storage while rendering or overwrite storage with server defaults before the initial read. Render a consistent server/client baseline; reserve preference-sensitive layout and expose hydration failure if it affects a decision. In a real SSR app use a scoped store and a compatible server preference policy; this module singleton is a SPA example.

The adapter compares serialized values on local writes and suppresses persistence during remote application, avoiding cross-tab echo writes. It rereads current storage rather than replaying a stale event.newValue; an old queued clear/update event must not overwrite a newer snapshot. storage events arrive in other same-origin documents, not the source tab; the store subscription handles the source. Clear/remove events reset safe defaults. Concurrent edits remain last-write-wins; there is no atomic cross-tab transaction.

Once data/storage fails, this adapter stays memory-only to avoid destroying corrupt/future data; provide an explicit user reset/recovery flow before reconnecting. Zustand persist middleware is an alternative with partialize/version/migrate/hydration hooks; understand those contracts rather than adding a second persistence owner on top of this adapter.


Official references checked2026-10-21: [Zustand create](https://zustand.docs.pmnd.rs/reference/apis/create), [v5 migration](https://zustand.docs.pmnd.rs/reference/migrations/migrating-to-v5), [official repository](https://github.com/pmndrs/zustand), [React context](https://react.dev/learn/passing-data-deeply-with-context), [Web Storage](https://html.spec.whatwg.org/multipage/webstorage.html), [Recoil archive](https://github.com/facebookexperimental/Recoil). Runtime store/SSR/browser practice remains required; no package install is performed here.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/react/React_state_management_and_tools.md). All learner practice remains outstanding; the worked examples above are explanatory material.
