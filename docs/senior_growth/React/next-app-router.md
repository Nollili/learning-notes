# Next.js App Router: Boundaries, Data and Route States

Target: senior frontend implementation/reasoning, intermediate full stack. Primary full-stack React framework here is **Next.js16.4.2 App Router with React19**, official documentation checked2026-10-20. Pin compatible patched dependencies and Node requirements in the exercise application; this notes repository does not install Next/React. Pages Router is an alternative migration context, not a second required framework. The examples use the previous fetch-cache model with **cacheComponents:false** explicitly; Cache Components is explained as an alternative below. Do not mix cache models without a migration decision.

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

```tsx
// next.config.ts
import type { NextConfig } from 'next';
const config: NextConfig = { cacheComponents: false };
export default config;
```

```tsx
// app/layout.tsx
import type { ReactNode } from 'react';
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><a href="#main">Skip to content</a>{children}</body></html>;
}
```

```tsx
// app/courses/layout.tsx
import Link from 'next/link';
import type { ReactNode } from 'react';
export default function CoursesLayout({ children }: { children: ReactNode }) {
  return <><nav aria-label="Courses"><Link href="/courses">All courses</Link></nav>{children}</>;
}
```

One main landmark belongs to the rendered page; layouts should not blindly nest another main. Choose which state should persist on navigation and test direct deep links as well as client links. Link can prefetch; prefetch cost and cache state can make a lab route appear faster than a cold document request.

## Server/client boundary and serializable data flow

Pages/layouts default to Server Components. They can await server data and keep implementation/dependencies off the client module graph. Client Components provide state, handlers, Effects and browser APIs. A use-client file marks a module boundary and its imports as client-side dependencies; it does not mean that its initial HTML never renders on the server. Use narrow boundaries. Importing a server data module into a client file is a boundary error; importing a Client Component into a server page and passing a safe DTO is expected.

```tsx
// lib/courses.ts — read-only public fixture; replace behind the same boundary in the lab.
import 'server-only';
export type Course = { id: string; title: string };
const rows: readonly Course[] = [
  { id: 'layout', title: 'Layout debugging' },
  { id: 'network', title: 'Network waterfalls' }
];
export async function listCourses(): Promise<Course[]> {
  return rows.map(row => ({ ...row }));
}
export async function findCourse(id: string): Promise<Course | null> {
  const row = rows.find(course => course.id === id);
  return row ? { ...row } : null;
}
```

```tsx
// app/courses/page.tsx
import { listCourses } from '../../lib/courses';
import CourseFilter from './course-filter';
export default async function CoursesPage() {
  const courses = await listCourses();
  return <main id="main"><h1>Courses</h1><CourseFilter courses={courses} /></main>;
}
```

```tsx
// app/courses/course-filter.tsx
'use client';
import { useId, useState } from 'react';
import Link from 'next/link';
import type { Course } from '../../lib/courses';
export default function CourseFilter({ courses }: { courses: Course[] }) {
  const id = useId();
  const [query, setQuery] = useState('');
  const visible = courses.filter(course => course.title.toLowerCase().includes(query.toLowerCase()));
  return <section aria-label="Course search">
    <label htmlFor={id}>Filter courses</label>
    <input id={id} value={query} onChange={event => setQuery(event.target.value)} />
    <p role="status">{visible.length} courses</p>
    <ul>{visible.map(course => <li key={course.id}>
      <Link href={`/courses/${encodeURIComponent(course.id)}`}>{course.title}</Link>
    </li>)}</ul>
  </section>;
}
```

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

**Alternative: Cache Components.** Enabling cacheComponents changes the caching/prerender model; use-cache scopes plus cacheLife/cacheTag describe cached functions/UI, and Suspense marks runtime holes. Do not copy previous route config/fetch advice indiscriminately into that mode. Use a separate migration exercise to compare build output, runtime dependencies, freshness and deployment cache stores. Keep private per-user data out of shared public cache scopes; authorization remains a server operation even when a result is cached.

## Loading, expected absence and unexpected failure

```tsx
// app/courses/loading.tsx
export default function Loading() {
  return <main id="main" aria-busy="true"><h1>Courses</h1><p role="status">Loading courses…</p></main>;
}
```

The loading file supplies a Suspense fallback around page/descendants under the layout. Use stable geometry/readable progress and avoid announcing many animated skeletons. A fast/local fixture may never visibly show fallback; deliberately delay the data function in the exercise. A layout waiting on unrelated data can still delay its children. Navigation can be interrupted; stale requests must not commit to a different route's state. Suspense handles supported suspension, not arbitrary async work hidden in an Effect.

```tsx
// app/courses/[id]/page.tsx
import { notFound } from 'next/navigation';
import { findCourse } from '../../../lib/courses';
export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-z0-9-]{1,80}$/.test(id)) notFound();
  const course = await findCourse(id);
  if (!course) notFound();
  return <main id="main"><h1>{course.title}</h1></main>;
}
```

```tsx
// app/courses/not-found.tsx
import Link from 'next/link';
export default function CourseNotFound() {
  return <main id="main"><h1>Course unavailable</h1><Link href="/courses">Browse courses</Link></main>;
}
```

notFound is framework control flow; avoid swallowing it in a broad catch. A missing entity differs from a failed database/upstream connection: do not turn every outage into404. Streamed responses may already have committed200 before not-found UI; check actual status/noindex behavior and avoid promising that every streamed absence changes an already-sent status. Validate route input and resource access; a plausible ID alone is not authorization.

```tsx
// app/courses/error.tsx — Next16.4.2 API; see installed-version migration notes.
'use client';
export default function CoursesError({ retry }: { error: unknown; retry: () => void }) {
  return <main id="main"><h1>Courses could not load</h1>
    <p>Please try again. If this continues, return later.</p>
    <button type="button" onClick={() => retry()}>Retry loading</button>
  </main>;
}
```

Current16.4.2 docs provide retry to re-fetch/re-render the segment; older16 releases/examples often expose reset, which clears boundary error state without the same refetch contract. Pin and typecheck against the installed version. A segment error boundary does not catch its own enclosing layout's errors; root-layout failures require global-error with its own html/body. Event handler/async callback failures require explicit handling and safe UI state. Expected validation errors should be modeled as data rather than thrown into a generic outage boundary.

Do not display raw server exception messages/stacks or log credentials in a client Effect. Record safe server diagnostics with a correlation identifier and return generic recovery UI. A retry button is not unlimited automatic retry and cannot cure deterministic malformed data. Focus/announcement behavior on fallback/recovery needs keyboard/screen-reader testing.

## Practical implementation and debugging acceptance

Build this read-only fixture in a separate pinned Next application. Check every file import/relative path, then run that app's typecheck, tests and production build/start. This repository's VitePress build validates the learning document, not Next route semantics.

- **Boundary lab:** inspect emitted client assets and initial HTML/RSC data; only the filter needs client behavior, no server credentials/data module code is serialized; compare no-JS and hydrated navigation.
- **State lab:** test valid/malformed/missing IDs, slow read, transient failure, deterministic failure and retry; record direct/client navigation, focus, live announcements and status codes before/after streaming.
- **Cache lab:** replace fixture reads with an instrumented upstream; compare two requests before/after the freshness interval, explicit invalidation and clean deployment; retain actual counters/build output, not assumptions from dev HMR.
- **Mismatch lab:** intentionally introduce a time/storage-dependent initial render, reproduce the warning, fix deterministic data ownership and show it disappears without global suppression.

Acceptance requires correct content/states, bounded operations, safe projected data, documented cache consistency and real retained artifacts. These exercises are **still required**; no Next runtime/application, browser behavior or learner capability is claimed by completed material. Continue with [server security and mutations](./next-server-security.md); deployment is a separate exercise.

## Official references

Checked2026-10-20; docs displayed Next16.4.2. Recheck when upgrading.

- [Server/Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components), [layouts](https://nextjs.org/docs/app/api-reference/file-conventions/layout).
- [Fetch cache options](https://nextjs.org/docs/app/api-reference/functions/fetch), [Cache Components](https://nextjs.org/docs/app/getting-started/caching), [revalidation](https://nextjs.org/docs/app/getting-started/revalidating).
- [Loading](https://nextjs.org/docs/app/api-reference/file-conventions/loading), [error boundary APIs](https://nextjs.org/docs/app/api-reference/file-conventions/error), [notFound](https://nextjs.org/docs/app/api-reference/functions/not-found).
- [React hydration](https://react.dev/reference/react-dom/client/hydrateRoot).
