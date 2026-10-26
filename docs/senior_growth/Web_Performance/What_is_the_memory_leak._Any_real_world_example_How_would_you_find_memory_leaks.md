## What is a Memory Leak? Real-World Examples & Detection

## What is a Memory Leak?

A **memory leak** occurs when a program fails to release memory that is no longer needed, causing its memory usage to grow over time. In JavaScript applications, this typically happens when objects are unintentionally kept alive by lingering references, preventing the garbage collector from reclaiming that memory.

Common causes in frontend development include forgotten **event listeners**, **DOM references**, and **closures** that retain large objects.

---

## How Garbage Collection Works

JavaScript relies on automatic garbage collection: memory is reclaimed when objects become unreachable.  
A strong path from a live root retains an object. Unreachable cycles can be collected; collection timing is not a program guarantee.

**Example:**
```js
let cache = {};
function storeData(key, value) {
  cache[key] = value;
}
storeData("user", { name: "Lili" });
// "user" remains in memory until removed from cache
```

---

## Real-World Memory Leak Examples

1. **Forgotten Event Listeners**
   - A removed element with its own listener can be collectible. This fixture is not a proven leak unless another live root retains it.
   ```js
   function addHandler() {
     const button = document.createElement("button");
     button.addEventListener("click", () => console.log("Clicked!"));
     document.body.appendChild(button);
     document.body.removeChild(button); // Not necessarily a leak: no retained root shown.
   }
   // Explicit teardown is useful ownership, but a node/listener cycle alone is collectible.
   ```

2. **Closures Holding References**
   - Closures can capture large objects and prevent them from being garbage collected.
   ```js
   function setup() {
     const bigData = new Array(1000000).fill("x");
     return function logSomething() {
       console.log(bigData[0]);
     };
   }
   const leaky = setup();
   // Retained while the returned function is reachable and still needs bigData.
   ```

3. **Detached DOM Nodes**
   - Removing a DOM node but keeping a JS reference prevents garbage collection.
   ```js
   let cachedElement;
   function createElement() {
     const el = document.createElement("div");
     document.body.appendChild(el);
     cachedElement = el;
     document.body.removeChild(el); // ❌ Leak
   }
   // ✅ Fix: cachedElement = null;
   ```

4. **Timers and Intervals**
   - Unstopped intervals keep references alive.
   ```js
   const id = setInterval(() => {
     console.log("Leaky interval");
   }, 1000);
   // ✅ Fix: clearInterval(id);
   ```

5. **Global Variables**
   - Accidentally leaking variables into global scope.
   ```js
   function leak() {
     leaked = "I’m global now"; // Sloppy scripts create a global; modules/strict mode throw ReferenceError.
   }
   // ✅ Fix: use let/const/var
   ```

---

## How to Find Memory Leaks

- **Chrome DevTools**
  - *Performance Tab*: Record and watch for memory usage that never drops.
  - *Memory Tab*: Take heap snapshots before/after actions, compare retained objects.
  - *Allocation Timeline*: Shows allocations over time; persistent growth signals leaks.

- **Chrome Task Manager**
  - (Shift + Esc) → Watch Memory Footprint for tabs.

- **Performance APIs & Tools**
  - Heap tooling is browser-specific; legacy performance.memory is nonportable and not a complete process-memory measure
  - WebPageTest, Lighthouse, React DevTools Profiler

---

## React-Specific Leaks

- Not cleaning up effects in `useEffect`
- Stale references in closures
- Unbounded or obsolete work without cancellation/ownership; a finite request completing after unmount is not by itself proof of a permanent leak

**Example:**
```js
useEffect(() => {
  const controller = new AbortController();
  let current = true;
  async function load() {
    try {
      const response = await fetch('/api/data', {
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(5000)])
      });
      if (!response.ok) { await response.body?.cancel(); throw new Error('Request failed'); }
      const value = await response.json(); // Validate the expected domain shape before committing.
      if (current) setData(value);
    } catch (error) {
      if (current) setError(error instanceof Error ? error.message : 'Request failed');
    }
  }
  void load();
  return () => { current = false; controller.abort(); };
}, []); // Include all reactive inputs if adapted; setters are assumed in scope.
```

---

## Prevention Checklist

| Practice                                 | Why                                 |
|-------------------------------------------|-------------------------------------|
| Clean up event listeners                  | Avoid dangling references           |
| Clear timers/intervals on unmount         | Prevent orphaned callbacks          |
| Use AbortController for fetch calls       | Stop async operations               |
| Nullify references when not needed        | Help GC                             |
| Use React cleanup functions (`useEffect`) | Manage lifecycle properly           |
| Monitor heap size during development      | Early detection                     |

---

## Summary

| Concept      | Description                                   | Impact                        |
|--------------|-----------------------------------------------|-------------------------------|
| Memory Leak  | Unreleased memory due to lingering references | Gradual slowdown, possible crash |
| Causes       | Event listeners, closures, global vars, timers, DOM refs | Persistent memory growth      |
| Detection    | Chrome DevTools, React Profiler               | Identify retained objects     |
| Prevention   | Cleanups, scoping, lifecycle awareness        | Keeps performance stable      |

**Key Takeaway:**  
A memory leak is like leaving the tap running—over time, it floods your app.  
Detect early, clean up listeners/timers, and validate with DevTools.


## Reproducing a real retaining root and disposing ownership

```js
function mountInspector(node, target = window) {
  let ownedNode = node;
  const onResize = () => { if (ownedNode) ownedNode.textContent = 'Viewport changed'; };
  target.addEventListener('resize', onResize);
  return function dispose() {
    target.removeEventListener('resize', onResize);
    ownedNode = null;
  };
}
// const dispose = mountInspector(panel);
// panel.remove(); // window -> listener -> closure -> panel remains until disposal.
// dispose();      // Removes this retaining path; inspect any other owners too.
```

Here the live global target holds the callback and its node reference. Keep the returned disposer with the component/route owner and invoke it on teardown; dropping the disposer without invoking it leaves the global registration. Repeated disposal is harmless. Native event listeners can also use an AbortSignal-owned lifetime; third-party widgets often require destroy/dispose, not only node removal.

Use a warmed baseline, repeat the same mount/use/unmount cycle, allow pending work to settle and compare snapshots at equivalent points. Inspect retained size and paths to roots, not just shallow size or a detached-node label. DevTools console variables/selected nodes can themselves retain objects; clear diagnostic references. A rising allocation graph may reflect legitimate cache growth or collection scheduling; distinguish leak, intentional memory bloat and frequent-GC churn. JS heap does not include every image/GPU/native resource. React Profiler diagnoses rendering, not a heap retaining path.

**Exercise:** run the fixture with and without disposal for repeated cycles, plus the collectible isolated node/listener case. Acceptance: identify a real root path, show registration count returns to baseline after disposal, compare retained objects after equivalent settling/collection observations, and document remaining owners. Also test aborted/failed/slow requests for handled errors and stale-state suppression. No forced-GC timing or browser snapshot result is claimed by the notes.

References checked2026-10-20: [Chrome memory diagnosis](https://developer.chrome.com/docs/devtools/memory-problems), [DOM listener ownership](https://dom.spec.whatwg.org/#interface-eventtarget), [React Effects](https://react.dev/reference/react/useEffect). AbortSignal.any/timeout require the supported browser matrix or an equivalent owned deadline implementation.


## React route ownership: abort and ignore stale results

Cancellation and stale-result protection solve related but different problems. Passing a signal asks a cooperative transport to stop; cleanup also invalidates the owner's right to commit a result. Some adapters/caches ignore the signal or resolve after cancellation. Keep both protections. For dependent queries, do not start request2 until request1 is validated and this owner is still current.

The worked component below loads an account, then its projects. Route identity contains tenant, account and session revision; changing any remounts the request owner and immediately removes the old UI state. A session revision is an opaque nonsecret identity value changed by the authentication owner on login/logout/permission-context changes; never put an access token in a React key. This key is not authorization: the server must scope each read to the authenticated principal and tenant independently.

```tsx
// route-projects.tsx
import { useEffect, useState } from 'react';
export type Route = { tenantId: string; accountId: string; sessionRevision: string };
export type Project = { id: string; title: string };
export type ProjectApi = {
  account: (route: Route, signal: AbortSignal) => Promise<unknown>;
  projects: (route: Route, accountId: string, signal: AbortSignal) => Promise<unknown>;
};
type State = { kind: 'loading' } | { kind: 'ready'; items: Project[] }
  | { kind: 'failed'; reason: 'timeout' | 'unavailable' };
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function accountId(value: unknown, expected: string): string {
  if (!record(value) || value.id !== expected) throw new Error('Invalid account');
  return expected;
}
function projectList(value: unknown): Project[] {
  if (!Array.isArray(value) || value.length > 100) throw new Error('Invalid projects');
  const seen = new Set<string>();
  return value.map((item: unknown) => {
    if (!record(item) || typeof item.id !== 'string' || item.id.length < 1 || item.id.length > 80
      || typeof item.title !== 'string' || item.title.trim().length < 1 || item.title.length > 160
      || seen.has(item.id)) throw new Error('Invalid project');
    seen.add(item.id);
    return { id: item.id, title: item.title };
  });
}
export function RouteProjects({ route, api }: { route: Route; api: ProjectApi }) {
  return <RequestOwner key={JSON.stringify([route.tenantId, route.accountId, route.sessionRevision])}
    tenantId={route.tenantId} accountId={route.accountId} sessionRevision={route.sessionRevision} api={api} />;
}
function RequestOwner({ tenantId, accountId: requestedId, sessionRevision, api }: Route & { api: ProjectApi }) {
  const [state, setState] = useState<State>({ kind: 'loading' });
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(() => {
      active = false;
      controller.abort();
      setState({ kind: 'failed', reason: 'timeout' });
    }, 5000);
    setState({ kind: 'loading' });
    async function load() {
      const requestRoute = { tenantId, accountId: requestedId, sessionRevision };
      try {
        const rawAccount = await api.account(requestRoute, controller.signal);
        if (!active) return;
        const id = accountId(rawAccount, requestedId);
        const rawProjects = await api.projects(requestRoute, id, controller.signal);
        if (!active) return;
        setState({ kind: 'ready', items: projectList(rawProjects) });
      } catch {
        if (active) setState({ kind: 'failed', reason: 'unavailable' });
      } finally { clearTimeout(timer); }
    }
    void load();
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [tenantId, requestedId, sessionRevision, api]);
  if (state.kind === 'loading') return <p role="status">Loading projects…</p>;
  if (state.kind === 'failed') return <p role="alert">{state.reason === 'timeout'
    ? 'Loading timed out.' : 'Unable to load projects.'}</p>;
  return state.items.length === 0 ? <p>No projects.</p>
    : <ul aria-label="Projects">{state.items.map(item => <li key={item.id}>{item.title}</li>)}</ul>;
}
```

Use a stable API adapter instance (module/service owner or appropriately memoized) rather than creating a new object on every parent render. The adapter must forward the signal to fetch and body reading, check response.ok, validate media type, enforce response-size limits and apply the application's credentials/error policy. For real routes validate/bound identifiers and URL-encode individual path components; do not accept arbitrary URL targets from this component. This example injects the port so ownership can be tested without a network server. It validates projected domain fields after the port resolves; it is not a bounded HTTP parser or proof of server permissions.

The five-second timer bounds how long this UI accepts results, including both dependent calls. It aborts and publishes a safe timeout even if the port ignores the signal and never settles. It cannot force an arbitrary promise/third-party library to release resources; the adapter must cooperate or be isolated behind its own enforceable boundary. A result arriving after deadline cannot overwrite the error or launch another dependent call. Cleanup clears the owned timer and catches rejected awaited operations without exposing raw server messages. Unmount cancellation is silent because that UI owner is gone; timeout while mounted is visible.

Keyed remounting deliberately discards local state when route/session identity changes, including A→B→A. This also discards unsaved child UI state and focus; keep unrelated drafts outside this owner when that is undesirable. It avoids displaying an old account's successful data for one paint before an effect clears it. An alternative shared query cache needs complete identity/authorization partitioning, stale-time/invalidation rules and subscriber cancellation ownership. Do not cancel a shared request just because one subscriber disappears. Router loaders/query libraries often provide parallel loading, deduplication and race handling; prefer their supported lifecycle when the application already uses one.

A dependent waterfall is necessary only when call2 genuinely needs call1. If projects can be authorized/fetched directly by the full route key, prefer a server aggregate/parallel loader where appropriate. Never use a cached account's success as proof that the next request is permitted. Abort does not undo a server mutation: this read example must not be copied as an automatic write retry policy.

**Acceptance drill:** use deferred promises to resolve routeA after routeB and verify A cannot replace B. Make an adapter ignore its signal; after cleanup resolve its account and assert its projects call never starts. Repeat with old projects already pending; reject after unmount and confirm no unhandled rejection. Test current failure, malformed/mismatched account, duplicate/invalid projects, empty success, deadline and late success after deadline. Under StrictMode expect setup→cleanup→setup in development and show the discarded setup cannot commit. Change tenant and session revision as well as account, and verify ready data disappears immediately. Finally use a real browser/network adapter for navigation, focus policy, actual abort/response-body limits and heap observations. Typechecking/RTL simulated-DOM ownership tests do not establish those results or learner practice.

Validated baseline React19.3.0/TypeScript5.9.3, RTL16.3.3/user-event14.6.8/Vitest5.0.5/jsdom30.1.3. Official references checked2026-10-22: [effect dependencies/cleanup and fetching races](https://react.dev/reference/react/useEffect), [keyed state reset](https://react.dev/learn/preserving-and-resetting-state), [DOM abort contract](https://dom.spec.whatwg.org/#abortcontroller).
