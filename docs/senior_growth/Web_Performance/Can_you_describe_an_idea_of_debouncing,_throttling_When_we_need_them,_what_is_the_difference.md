# Debouncing and throttling: timing, ownership and request freshness

Debouncing groups a burst of calls; trailing execution uses the latest arguments after a quiet interval. Leading execution responds immediately at the start of a burst. With both enabled, one isolated call executes only once; a second call provides trailing work. Without a maximum wait, continuous calls can postpone trailing work indefinitely. Throttling limits execution rate during sustained activity, usually with a stated leading/trailing policy. Event frequencies vary by device/browser; neither technique makes a heavy callback cheap or guarantees exact timer timing.

Use trailing debounce for search suggestions or a resize-end calculation; throttle a noncritical periodic sample. Coalesce visual writes with rAF when one update per rendering opportunity is appropriate. A leading-only throttle can drop the final position; a trailing update matters when the final value must be shown. Avoid throttling the controlled input's own state update: typing should remain immediate.

Client timing is not server rate limiting, idempotency or duplicate-payment prevention. Disable/track pending submits for feedback and use server-side idempotency/concurrency rules for mutations. Debounce does not cancel a request already started, and abort alone does not prove an old response cannot commit. Repeating async polling on an interval can overlap; schedule the next poll after the previous attempt completes with explicit backoff/budget instead.

## A bounded timer contract

This original teaching implementation returns `void`, rather than caching the callback's result like Lodash. It supports latest tuple arguments, leading/trailing, cancel and flush. `maxWait` is measured from the start of the current burst and requires trailing execution here. Maximum wait is a scheduling target: a blocked/background event loop can execute later. Callback exceptions propagate; async callbacks must consume their own rejections. There is no receiver binding: pass a bound method or closure.

<<< ../../workbench/engineering/performance/debounce.ts{ts}

For a mature shared utility, prefer a well-tested existing implementation such as Lodash debounce/throttle and check its exact contract instead of assuming this teaching API is drop-in compatible. A trailing throttle can be expressed by an established throttle utility; configuring this debounce with `leading:true, trailing:true, maxWait:wait` produces a burst-based rate window. It does not promise a strict minimum interval between *all* actual executions: an isolated leading call following a trailing window can be close to it. Define what “throttle” means before replacing a library implementation.

`cancel()` drops queued arguments and timers but does not undo previous effects. `flush()` immediately executes queued trailing work once; decide whether blur/save/navigation should flush or discard. Never flush a search during unmount just to avoid “losing” a timer. Holding a DOM event object retains unnecessary data; extract the string/number synchronously. Only one quiet timer and one optional deadline timer are retained, although argument objects can themselves be large.

## Search ownership: invalidate immediately, debounce the next start

The API below returns already validated domain results and observes AbortSignal when possible. Its fetch adapter must also bound response reading and validate unknown JSON; a string-array return type alone cannot establish that. The current request is invalidated on **every input**, including before the next debounced request starts. This prevents an old request from updating the UI during the waiting interval. The epoch guard also handles an API ignoring abort.

<<< ../../workbench/engineering/performance/search-owner.ts{ts}

This is read-only search. Cancellation cannot undo an accepted server mutation. Publish callbacks are application-owned synchronous state updates and must not throw. The result array is domain-owned immutable data; its display should escape strings normally. Add per-request deadlines and bounded transport behavior at the API boundary; this owner does not promise to terminate an uncooperative API promise. It holds at most one active controller, but replacing a request cannot force uncooperative work to stop consuming resources.

## React lifecycle: one owner per mounted API configuration

<<< ../../workbench/engineering/performance/use-debounced-search.tsx{tsx}

Keep the injected API identity stable, or a changed API intentionally resets the search owner. Tenant/account changes should reset this boundary and transport credentials together. The component updates its controlled input immediately and passes `event.currentTarget.value` to `change`; it renders the returned status and result query explicitly. It must invoke `change` only after the effect has installed the owner. Do not construct `debounce(fetchResults,300)` in JSX on every render.

Render creates no timers here; effect cleanup cancels queued work and invalidates active results, including development StrictMode's setup/cleanup cycle. A component that needs to retain a query across API replacement must explicitly replay that query under the new owner; this example intentionally resets.

## Worked timeline and acceptance

With trailing wait300, calls at0/100/200 execute the latest argument at500 if the event loop is free. With leading+trailing, an isolated call at0 executes at0 only; another call at100 queues a trailing call at400. With wait300/maxWait1000 and calls every100ms, latest work is eligible at1000 instead of waiting forever. Timers are not real-time guarantees.


Applicable validation versions: TypeScript5.9.3, React19.3 and Node24.18.0 in an isolated environment. References checked2026-10-22: [React effect ownership and cleanup](https://react.dev/reference/react/useEffect), [StrictMode lifecycle](https://react.dev/reference/react/StrictMode), [Lodash debounce/throttle contracts](https://lodash.com/docs/). Event loop blocking, background throttling, native browser focus and actual network behavior require separate observation.

## Mutations need a different boundary

Continue with the [React-to-PostgreSQL submission lab](../React/Submission_Idempotency.md): pending/disabled feedback and a synchronous guard handle local interaction, while a scoped command key and atomic database receipt handle retries and competing requests. Its worked lost-response test connects the component to an actual database. Debounce remains a scheduling choice, not a substitute for either boundary.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/performance/Can_you_describe_an_idea_of_debouncing%2C_throttling_When_we_need_them%2C_what_is_the_difference.md). All learner practice remains outstanding.
