# Next.js App Router: Boundaries, Data and Route States

Target: senior frontend implementation/reasoning, intermediate full stack. Primary full-stack React framework here is **Next.js16.4.3 App Router with React19**, official documentation checked2026-10-27. Pin compatible patched dependencies and Node requirements in the exercise application; this notes repository does not install Next/React. Pages Router is an alternative migration context, not a second required framework. The examples use the previous fetch-cache model with **cacheComponents:false** explicitly; Cache Components is explained as an alternative below. Do not mix cache models without a migration decision.

## Route tree and ownership

```text
app/
  layout.tsx
  courses/
    layout.tsx
    page.tsx
    loading.tsx
    error.tsx
    not-found.tsx
    [id]/page.tsx
    course-filter.tsx
lib/
  courses.ts
```

Folders define segments; page defines a public UI route, layout wraps descendants, and a dynamic segment supplies params. A folder alone does not expose every file inside it as an endpoint. A root layout defines html/body and language; nested layouts preserve shared UI/state across supported client navigation. A template is useful when remount/reset is intended. Do not put a child page's changing search state into a layout that does not receive current searchParams. Parallel/intercepted routes are advanced alternatives after this foundation, not prerequisites for the course example.

<<< ../../workbench/frontend/next/read-only/next.config.ts{tsx}

<<< ../../workbench/frontend/next/read-only/app/layout.tsx{tsx}

<<< ../../workbench/frontend/next/read-only/app/courses/layout.tsx{tsx}

One main landmark belongs to the rendered page; layouts should not blindly nest another main. Choose which state should persist on navigation and test direct deep links as well as client links. Link can prefetch; prefetch cost and cache state can make a lab route appear faster than a cold document request.

## Server/client boundary and serializable data flow

Pages/layouts default to Server Components. They can await server data and keep implementation/dependencies off the client module graph. Client Components provide state, handlers, Effects and browser APIs. A use-client file marks a module boundary and its imports as client-side dependencies; it does not mean that its initial HTML never renders on the server. Use narrow boundaries. Importing a server data module into a client file is a boundary error; importing a Client Component into a server page and passing a safe DTO is expected.

<<< ../../workbench/frontend/next/read-only/lib/courses.ts{tsx}

<<< ../../workbench/frontend/next/read-only/app/courses/page.tsx{tsx}

<<< ../../workbench/frontend/next/read-only/app/courses/course-filter.tsx{tsx}

The type-only import is erased; it does not ship the server module implementation. Props cross a serialization boundary: project the safe fields explicitly, never pass a database entity with secrets or assume that fields hidden by CSS are private. This public fixture performs local filtering; large/private datasets need server filtering, pagination and authorization instead of shipping the whole table. Server-rendered controls require hydration for their JavaScript filter; initial native course links already have hrefs.

Avoid new Date/random/browser storage in the initial render unless consistent data is supplied. A client Effect can enhance browser-only behavior after the initial matching render. Do not suppress all hydration warnings as a substitute for fixing mismatched state or invalid nesting. Do not mutate the read-only fixture to simulate persistence: process memory is neither durable nor shared across deployment instances.

## Fetching and cache models: choose the contract explicitly

The fixture is intentionally local. To connect an upstream service, validate its status, JSON shape, byte/item limits and deadline as demonstrated in the SSR note. Fetch in the server boundary directly; calling your own Route Handler from a Server Component usually adds an unnecessary HTTP hop. Independent reads can begin together with Promise.all; dependent reads must wait and failures/deadlines must be owned.

```tsx
// Option A, within a server data function: fresh/private data, previous cache model.
const fresh = await fetch('https://api.example.com/courses', {
  cache: 'no-store', signal: AbortSignal.timeout(5000)
});
// Option B, instead of A: intentionally cache public catalog data.
const cached = await fetch('https://api.example.com/courses', {
  cache: 'force-cache', next: { revalidate: 60, tags: ['public-courses'] },
  signal: AbortSignal.timeout(5000)
});
// Both are response objects: check status and validate/read bounded bodies before returning DTOs.
```

These are alternatives, not two requests to issue for one screen. no-store and a positive revalidation lifetime conflict; do not set both. Browser HTTP cache, per-render request memoization, persistent server data/route caches and client navigation cache are distinct. An AbortSignal can affect per-render memoization; do not assume the two illustrative requests deduplicate. Dev HMR can retain fetch results differently from a clean production request, so prove freshness with build/start plus upstream counters and timestamps.

Time-based revalidation is a freshness policy, not a promise that every viewer sees a write immediately. For public content, an authorized mutation/webhook can call revalidateTag('public-courses','max') for stale-while-revalidate behavior. Immediate read-your-own-writes is a different requirement; current updateTag is limited to Server Actions. router.refresh asks for refreshed route output but does not automatically invalidate every server cache. Tags/paths must be controlled by the application, not arbitrary unauthenticated input.

**Alternative: Cache Components.** Current create-next-app recommended defaults enable Cache Components; this manually assembled reference explicitly opts out. Enabling cacheComponents changes the caching/prerender model; `use cache` scopes plus cacheLife/cacheTag describe cached functions/UI, and Suspense marks runtime holes. Do not copy previous route config/fetch advice indiscriminately into that mode. Current guidance also requires an explicit partialPrefetching decision when adopting Cache Components. Use a separate migration exercise to compare build output, runtime dependencies, freshness and deployment cache stores. Keep private per-user data out of shared public cache scopes; authorization remains a server operation even when a result is cached.

## Loading, expected absence and unexpected failure

<<< ../../workbench/frontend/next/read-only/app/courses/loading.tsx{tsx}

The loading file supplies a Suspense fallback around page/descendants under the layout. Use stable geometry/readable progress and avoid announcing many animated skeletons. A fast/local fixture may never visibly show fallback; deliberately delay the data function in the exercise. A layout waiting on unrelated data can still delay its children. Navigation can be interrupted; stale requests must not commit to a different route's state. Suspense handles supported suspension, not arbitrary async work hidden in an Effect.

<<< ../../workbench/frontend/next/read-only/app/courses/[id]/page.tsx{tsx}

<<< ../../workbench/frontend/next/read-only/app/courses/not-found.tsx{tsx}

notFound is framework control flow; avoid swallowing it in a broad catch. A missing entity differs from a failed database/upstream connection: do not turn every outage into404. Streamed responses may already have committed200 before not-found UI; check actual status/noindex behavior and avoid promising that every streamed absence changes an already-sent status. Validate route input and resource access; a plausible ID alone is not authorization.

<<< ../../workbench/frontend/next/read-only/app/courses/error.tsx{tsx}

Current16.4.3 docs provide retry (stable since16.3.0) to re-fetch/re-render the segment; older16 releases/examples often expose reset, which clears boundary error state without the same refetch contract. Pin and typecheck against the installed version. A segment error boundary does not catch its own enclosing layout's errors; root-layout failures require global-error with its own html/body. Event handler/async callback failures require explicit handling and safe UI state. Expected validation errors should be modeled as data rather than thrown into a generic outage boundary.

Do not display raw server exception messages/stacks or log credentials in a client Effect. Record safe server diagnostics with a correlation identifier and return generic recovery UI. A retry button is not unlimited automatic retry and cannot cure deterministic malformed data. Focus/announcement behavior on fallback/recovery needs keyboard/screen-reader testing.

## Practical implementation and debugging acceptance

Use the [separate practice requirements and observation ledger](../../practice/frontend/react/next-app-router.md). All learner work remains outstanding.

## Official references

Checked2026-10-27; docs displayed Next16.4.3. Recheck when upgrading.

- [Server/Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components), [layouts](https://nextjs.org/docs/app/api-reference/file-conventions/layout).
- [Fetch cache options](https://nextjs.org/docs/app/api-reference/functions/fetch), [Cache Components](https://nextjs.org/docs/app/getting-started/caching), [revalidation](https://nextjs.org/docs/app/getting-started/revalidating).
- [Loading](https://nextjs.org/docs/app/api-reference/file-conventions/loading), [error boundary APIs](https://nextjs.org/docs/app/api-reference/file-conventions/error), [notFound](https://nextjs.org/docs/app/api-reference/functions/not-found).
- [React hydration](https://react.dev/reference/react-dom/client/hydrateRoot).
