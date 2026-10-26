# Debouncing and throttling: timing, ownership and request freshness

Debouncing groups a burst of calls; trailing execution uses the latest arguments after a quiet interval. Leading execution responds immediately at the start of a burst. With both enabled, one isolated call executes only once; a second call provides trailing work. Without a maximum wait, continuous calls can postpone trailing work indefinitely. Throttling limits execution rate during sustained activity, usually with a stated leading/trailing policy. Event frequencies vary by device/browser; neither technique makes a heavy callback cheap or guarantees exact timer timing.

Use trailing debounce for search suggestions or a resize-end calculation; throttle a noncritical periodic sample. Coalesce visual writes with rAF when one update per rendering opportunity is appropriate. A leading-only throttle can drop the final position; a trailing update matters when the final value must be shown. Avoid throttling the controlled input's own state update: typing should remain immediate.

Client timing is not server rate limiting, idempotency or duplicate-payment prevention. Disable/track pending submits for feedback and use server-side idempotency/concurrency rules for mutations. Debounce does not cancel a request already started, and abort alone does not prove an old response cannot commit. Repeating async polling on an interval can overlap; schedule the next poll after the previous attempt completes with explicit backoff/budget instead.

## A bounded timer contract

This original teaching implementation returns `void`, rather than caching the callback's result like Lodash. It supports latest tuple arguments, leading/trailing, cancel and flush. `maxWait` is measured from the start of the current burst and requires trailing execution here. Maximum wait is a scheduling target: a blocked/background event loop can execute later. Callback exceptions propagate; async callbacks must consume their own rejections. There is no receiver binding: pass a bound method or closure.

```ts
// debounce.ts
export type Options = { leading?: boolean; trailing?: boolean; maxWait?: number };
export function debounce<A extends unknown[]>(fn: (...args: A) => void, wait: number, options: Options = {}) {
  const leading = options.leading ?? false;
  const trailing = options.trailing ?? true;
  const maximum = options.maxWait;
  if (!Number.isFinite(wait) || wait <= 0 || wait > 60_000 || (!leading && !trailing)
    || (maximum !== undefined && (!Number.isFinite(maximum) || maximum < wait || maximum > 60_000 || !trailing))) {
    throw new Error('Invalid debounce options');
  }
  let quiet: ReturnType<typeof setTimeout> | undefined;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  let pending: A | undefined;
  const cancel = () => {
    clearTimeout(quiet); clearTimeout(deadline);
    quiet = undefined; deadline = undefined; pending = undefined;
  };
  const flush = () => {
    const args = pending;
    cancel(); // Clear before callback, so a reentrant call creates an independent burst.
    if (args !== undefined && trailing) fn(...args);
  };
  return {
    run(...args: A) {
      const first = quiet === undefined;
      pending = args;
      clearTimeout(quiet);
      quiet = setTimeout(flush, wait);
      if (first && maximum !== undefined) deadline = setTimeout(flush, maximum);
      if (first && leading) { pending = undefined; fn(...args); }
    },
    cancel,
    flush
  };
}
```

For a mature shared utility, prefer a well-tested existing implementation such as Lodash debounce/throttle and check its exact contract instead of assuming this teaching API is drop-in compatible. A trailing throttle can be expressed by an established throttle utility; configuring this debounce with `leading:true, trailing:true, maxWait:wait` produces a burst-based rate window. It does not promise a strict minimum interval between *all* actual executions: an isolated leading call following a trailing window can be close to it. Define what “throttle” means before replacing a library implementation.

`cancel()` drops queued arguments and timers but does not undo previous effects. `flush()` immediately executes queued trailing work once; decide whether blur/save/navigation should flush or discard. Never flush a search during unmount just to avoid “losing” a timer. Holding a DOM event object retains unnecessary data; extract the string/number synchronously. Only one quiet timer and one optional deadline timer are retained, although argument objects can themselves be large.

## Search ownership: invalidate immediately, debounce the next start

The API below returns already validated domain results and observes AbortSignal when possible. Its fetch adapter must also bound response reading and validate unknown JSON; a string-array return type alone cannot establish that. The current request is invalidated on **every input**, including before the next debounced request starts. This prevents an old request from updating the UI during the waiting interval. The epoch guard also handles an API ignoring abort.

```ts
// search-owner.ts
import { debounce } from './debounce.js';
export type SearchApi = (query: string, signal: AbortSignal) => Promise<readonly string[]>;
export type SearchState =
  | { status: 'idle' }
  | { status: 'waiting'; query: string }
  | { status: 'ready'; query: string; items: readonly string[] }
  | { status: 'error'; query: string; code: 'SEARCH_FAILED' };
export function createSearchOwner(api: SearchApi, publish: (state: SearchState) => void) {
  let epoch = 0;
  let stopped = false;
  let active: AbortController | undefined;
  const work = debounce((query: string, version: number) => {
    const controller = new AbortController();
    active = controller;
    void (async () => {
      try {
        const items = await api(query, controller.signal);
        if (!stopped && epoch === version) publish({ status: 'ready', query, items });
      } catch {
        if (!stopped && epoch === version && !controller.signal.aborted) publish({ status: 'error', query, code: 'SEARCH_FAILED' });
      } finally {
        if (active === controller) active = undefined;
      }
    })();
  }, 300, { maxWait: 1000 });
  return {
    change(query: string) {
      if (stopped) return;
      const version = ++epoch;
      active?.abort(); active = undefined;
      if (!query.trim()) { work.cancel(); publish({ status: 'idle' }); return; }
      publish({ status: 'waiting', query });
      work.run(query, version);
    },
    dispose() {
      if (stopped) return;
      stopped = true; ++epoch; work.cancel(); active?.abort(); active = undefined;
    }
  };
}
```

This is read-only search. Cancellation cannot undo an accepted server mutation. Publish callbacks are application-owned synchronous state updates and must not throw. The result array is domain-owned immutable data; its display should escape strings normally. Add per-request deadlines and bounded transport behavior at the API boundary; this owner does not promise to terminate an uncooperative API promise. It holds at most one active controller, but replacing a request cannot force uncooperative work to stop consuming resources.

## React lifecycle: one owner per mounted API configuration

```tsx
// use-debounced-search.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { createSearchOwner, type SearchApi, type SearchState } from './search-owner.js';
export function useDebouncedSearch(api: SearchApi) {
  const owner = useRef<ReturnType<typeof createSearchOwner> | null>(null);
  const [state, setState] = useState<SearchState>({ status: 'idle' });
  useEffect(() => {
    const current = createSearchOwner(api, setState);
    owner.current = current;
    setState({ status: 'idle' });
    return () => {
      current.dispose();
      if (owner.current === current) owner.current = null;
    };
  }, [api]);
  const change = useCallback((query: string) => owner.current?.change(query), []);
  return { state, change };
}
```

Keep the injected API identity stable, or a changed API intentionally resets the search owner. Tenant/account changes should reset this boundary and transport credentials together. The component updates its controlled input immediately and passes `event.currentTarget.value` to `change`; it renders the returned status and result query explicitly. It must invoke `change` only after the effect has installed the owner. Do not construct `debounce(fetchResults,300)` in JSX on every render. Render creates no timers here; effect cleanup cancels queued work and invalidates active results, including development StrictMode's setup/cleanup cycle. A component that needs to retain a query across API replacement must explicitly replay that query under the new owner; this example intentionally resets.

## Worked timeline and acceptance

With trailing wait300, calls at0/100/200 execute the latest argument at500 if the event loop is free. With leading+trailing, an isolated call at0 executes at0 only; another call at100 queues a trailing call at400. With wait300/maxWait1000 and calls every100ms, latest work is eligible at1000 instead of waiting forever. Timers are not real-time guarantees.

**Exercise:** execute deterministic fake-clock tests for trailing replacement, leading-only suppression, both-edge isolated/burst calls, maxWait under sustained input, cancel, flush, callback reentrancy and invalid configuration. Test search A starts, B input invalidates A immediately, A resolves during B's300ms wait, and B wins even if A ignores abort or rejects later. Verify empty input, safe failure code, unmount before timer/after request, repeated cleanup and StrictMode remount. Mount a controlled React input and prove ordinary rerenders do not recreate a timer owner; retain actual browser typing/focus evidence separately. For throttle, specify whether the invariant is a burst window, average frequency or a minimum gap and test boundary calls. Writing these acceptance criteria does not establish learner practice completion.

Applicable validation versions: TypeScript5.9.3, React19.3 and Node24.18.0 in an isolated environment. References checked2026-10-22: [React effect ownership and cleanup](https://react.dev/reference/react/useEffect), [StrictMode lifecycle](https://react.dev/reference/react/StrictMode), [Lodash debounce/throttle contracts](https://lodash.com/docs/). Event loop blocking, background throttling, native browser focus and actual network behavior require separate observation.

## Mutations need a different boundary

Continue with the [React-to-PostgreSQL submission lab](../React/Submission_Idempotency.md): pending/disabled feedback and a synchronous guard handle local interaction, while a scoped command key and atomic database receipt handle retries and competing requests. Its worked lost-response test connects the component to an actual database. Debounce remains a scheduling choice, not a substitute for either boundary.
