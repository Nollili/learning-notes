# Could you suggest architectural approaches for showing thousands of data sets on UI? {#could-you-suggest-architectural-approaches-for-showing-thousands-of-data-sets-on-ui}

When displaying **thousands of data sets** in a user interface (UI), performance, usability, and responsiveness are crucial factors to consider. You need to ensure that the UI remains fast, user-friendly, and accessible, even as the amount of data grows. 

---

### **Virtualization (Virtual Scrolling)** {#_1-virtualization-virtual-scrolling}

### **Concept**:

Virtualization, also known as **virtual scrolling**, involves rendering only the visible items in a list or grid, while the rest are not rendered in the DOM. This significantly reduces the number of elements the browser needs to manage at any given time.

### **How It Works**:

- Only the items that are currently visible on the screen (plus a small buffer) are rendered.
- As the user scrolls, new items are dynamically loaded into the viewport and old items are removed.
- Virtualization bounds mounted DOM/work; it does not automatically evict fetched records, query pages, selection state or measurement caches.

### **Tools**:

- **React**: `react-window`, `react-virtualized`
- **Vue**: `vue-virtual-scroller`
- **Angular**: `@angular/cdk/scrolling`

### **Pros**:

- Extremely fast and efficient for large datasets.
- Reduces DOM node count, improving rendering performance.
- Ideal for lists, tables, grids, and other types of large collections.

### **Cons**:

- Limited flexibility in managing complex interactions with off-screen items.
- Requires careful implementation to handle scrolling events and item re-rendering.

---

### **Infinite Scrolling** {#_2-infinite-scrolling}

### **Concept**:

Infinite scrolling loads data in chunks as the user scrolls, fetching additional data when they reach the bottom of the page or container. This reduces the initial load time and improves user experience.

### **How It Works**:

- Initially load a small portion of data.
- As the user scrolls to the bottom, trigger a request to load the next chunk of data.
- The newly loaded data is appended to the existing content.

### **Tools**:

- **React**: TanStack Query5 useInfiniteQuery for page fetching; scrolling/observer behavior is a separate UI owner
- **Vue**: `vue-infinite-loading`
- **Angular**: Custom implementations using observables and scroll events.

### **Pros**:

- Users only load what they need, improving initial performance.
- Smooth browsing experience, no page reloads.
- Reduces initial load time (critical for mobile users).

### **Cons**:

- Can lead to poor performance or a delayed loading experience if too many items are being requested at once.
- Not suitable for all types of UI—might confuse users if there's no clear way to navigate or “load more” data.
- May not be ideal for search engines (SEO) if content is not pre-rendered.

---

### **Pagination** {#_3-pagination}

### **Concept**:

Pagination breaks up the dataset into smaller chunks, displaying a fixed number of items per page. Users can navigate between pages to see different parts of the dataset.

### **How It Works**:

- Divide the data into pages (e.g., 20 items per page).
- Render the current page of data, and provide controls (e.g., page numbers, next/previous buttons) for the user to navigate to other pages.
- Often paired with **server-side pagination**, where only a subset of data is fetched per request.

### **Tools**:

- **React**: `react-paginate`, `react-table` (with pagination)
- **Vue**: `vue-pagination-2`, `vue-paginate`
- **Angular**: Angular Material pagination components

### **Pros**:

- Simple and easy to implement.
- Ideal for datasets that can be divided logically (e.g., articles, product lists).
- Predictable performance as the page size is controlled.
- Better SEO support compared to infinite scrolling.

### **Cons**:

- Requires extra user interaction (clicking through pages).
- Not ideal for datasets where users expect to “scroll” endlessly.
- May result in slower perceived performance due to additional requests for each page.

---

### **Data Chunking & Lazy Loading** {#_4-data-chunking-lazy-loading}

### **Concept**:

Data chunking involves loading large datasets in smaller, more manageable parts. Combined with **lazy loading**, only the data required by the user at any moment is loaded.

### **How It Works**:

- The initial data is loaded, but as the user scrolls or interacts, additional chunks of data are fetched in the background.
- Can be combined with **infinite scrolling** or **pagination**.
- **Lazy loading** refers to delaying the loading of non-essential content until it is needed.

### **Tools**:

- Lazy loading is often implemented via `IntersectionObserver` API, which is supported natively in modern browsers.
- **React**: `React.lazy()` for components, lazy loading data via API calls.
- **Vue**: `vue-lazyload` for images or data.
- **Angular**: Use `NgModule` lazy loading or the `IntersectionObserver` API.

### **Pros**:

- Reduces initial load time by loading content only when needed.
- Can be combined with other approaches (e.g., infinite scrolling, pagination).
- Ideal for large lists and media-heavy applications.

### **Cons**:

- Can complicate UI/UX if not handled smoothly (e.g., loading indicators).
- Users may experience a delay as content is fetched dynamically.
- Requires additional error handling if some data fails to load.

---

### **Virtual Grids and Tables** {#_5-virtual-grids-and-tables}

### **Concept**:

Virtual grids or tables use the concept of **virtualization** but extend it to more complex layouts like grids and tables, where each cell has its own unique data.

### **How It Works**:

- Similar to virtualization, but this approach works for both rows and columns in a grid or table format.
- Only the rows and columns visible on the screen are rendered, reducing the DOM size and improving performance.

### **Tools**:

- **React**: `react-table`, `react-virtualized`
- **Vue**: `vue-virtual-scroller` (with grid support)
- **Angular**: `ag-Grid`, `ngx-datatable`

### **Pros**:

- Ideal for complex layouts, such as large grids or data tables.
- Reduces memory consumption and speeds up rendering.
- Sorting/filtering still cost CPU/network/server work; choose client versus server operations deliberately.

### **Cons**:

- Complex to implement (especially for handling dynamic layouts).
- May require more careful testing for edge cases, such as scrolling or sorting behavior.

---

### **Server-Side Rendering (SSR) with API Integration** {#_6-server-side-rendering-ssr-with-api-integration}

### **Concept**:

Server-side rendering (SSR) can be used with pagination or infinite scrolling to offload the rendering process to the server. The server generates the HTML for the page and sends it to the browser, potentially showing useful bounded content earlier; server/data delay, payload and hydration can offset the benefit.

### **How It Works**:

- The server handles data fetching and rendering the page, then returns the full content to the client.
- When the client interacts (e.g., scrolling, clicking next), the server sends the necessary data for the next section of the UI.

### **Pros**:

- Can improve early useful HTML in suitable measured scenarios; do not server-render thousands of unnecessary rows.
- SEO-friendly, as the content is pre-rendered.
- Reduces client-side computation.

### **Cons**:

- Increased server load, especially with a large number of users.
- Requires more complex server-side logic and API integration.
- User experience may be less fluid compared to client-side rendering.

---

### **Conclusion: Choosing the Right Approach**

- **Virtualization** is ideal for static lists or grids where you have a large number of items but don't need all of them visible at once.
- **Infinite Scrolling** works best for continuous data streams or when you want to keep the user engaged with smooth content loading.
- **Pagination** is the most traditional approach and works well when users need to easily navigate through large datasets.
- **Chunking and Lazy Loading** help to reduce the initial payload by loading data in parts, improving perceived performance.
- **Virtual Grids and Tables** are useful when dealing with complex data structures like tables or grids.
- **Server-Side Rendering** is beneficial when you want fast load times and SEO-friendly content.

Combine strategies against measured budgets and correctness/accessibility requirements; no architectural label guarantees smoothness.
## Worked primary design: bounded server data and native paginated tables

Target: senior frontend. Baseline React19, TanStack Query5, optional TanStack Virtual3; official docs checked2026-10-21. Prefer a50-row server-paginated native table for the first implementation. Infinite scrolling and virtualization are alternatives to justify, not mandatory layers on every table. Count network bytes, retained data, mounted DOM and CPU separately.

### Server query contract: offset versus keyset

Offset pagination supports page-number jumps but later offsets may scan many rows and inserts/deletes can shift boundaries. Keyset pagination continues after a stable ordered tuple, efficiently using a suitable index; arbitrary page jumps and exact totals need separate design. Both require deterministic tie-breakers and authorization. Sort/filter on the complete server dataset, not only the currently loaded50rows while calling it a global sort.

```sql
-- Example forward keyset query, values supplied by a validated server endpoint.
-- $1 is the authenticated tenant, $2/$3 the decoded cursor tuple, $4 an escaped literal search pattern.
SELECT id, title, created_at
FROM course
WHERE tenant_id = $1
  AND ($2::timestamptz IS NULL OR (created_at, id) < ($2::timestamptz, $3::uuid))
  AND title ILIKE $4 ESCAPE '\'
ORDER BY created_at DESC, id DESC
LIMIT 51;
-- Matching index starts with tenant_id, created_at DESC, id DESC; search indexing is a separate workload decision.
```

Send at most50rows and derive has-more/cursor from the extra row; never return an arbitrary unbounded limit. The endpoint validates cursor shape/length and binds it to sort/filter/version policy; encoded does not mean trusted. Parameterization protects values, while dynamic column/direction names require an allowlist. Escape percent/underscore/backslash when the search contract means literal substring matching. Define previous-cursor semantics, null handling, concurrent insertion/deletion and snapshot/freshness behavior.

A keyset cursor is a location, not a snapshot or authorization token. Do not compute all matching counts on every keystroke without measuring query cost.

### Bounded infinite-query alternative

```js
// Pure response parser used by the client query function.
export function parseCoursePage(value) {
  if (!value || typeof value !== 'object' || !Array.isArray(value.items) || value.items.length > 50) {
    throw new Error('Invalid page');
  }
  for (const key of ['nextCursor', 'previousCursor']) {
    if (value[key] !== null && (typeof value[key] !== 'string' || !value[key] || value[key].length > 256)) throw new Error('Invalid cursor');
  }
  const seen = new Set();
  const items = value.items.map(row => {
    if (!row || typeof row.id !== 'string' || !row.id || row.id.length > 80 ||
      typeof row.title !== 'string' || row.title.length > 200 || seen.has(row.id)) throw new Error('Invalid row');
    seen.add(row.id);
    return { id: row.id, title: row.title };
  });
  return { items, nextCursor: value.nextCursor, previousCursor: value.previousCursor };
}
```

```tsx
// Client-only SPA example under QueryClientProvider; import parser from a pure module.
import { useInfiniteQuery } from '@tanstack/react-query';
// import { parseCoursePage } from './course-page';
export function useCoursePages(scope: string, q: string) {
  const normalized = q.trim().slice(0, 100); // UI policy; server validates independently.
  return useInfiniteQuery({
    queryKey: ['courses', scope, { q: normalized, sort: 'created-desc', pageSize: 50 }],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) => {
      const params = new URLSearchParams({ q: normalized, limit: '50' });
      if (pageParam !== null) params.set('cursor', pageParam);
      const response = await fetch(`/api/courses?${params}`, {
        signal: AbortSignal.any([signal, AbortSignal.timeout(5000)])
      });
      if (!response.ok) { await response.body?.cancel(); throw new Error('Courses unavailable'); }
      return parseCoursePage(await response.json());
    },
    getNextPageParam: last => last.nextCursor ?? undefined,
    getPreviousPageParam: first => first.previousCursor ?? undefined,
    maxPages: 3, staleTime: 30_000, retry: false
  });
}
```

The scope partitions a client cache; the server derives its own session/tenant. maxPages limits these query pages to three, not the entire application heap. Eviction needs previous/next cursor support and a scroll-anchor/back-scroll refetch policy; the visible list must not jump merely because a front page was dropped.

Deduplicate by stable ID if the chosen live-data consistency model permits overlapping pages, and investigate duplicate boundary causes instead of silently hiding server errors. Bound response bytes at the service/reader too; a parsed JSON row limit does not prevent a huge transfer allocation.

A Load more button should call fetchNextPage only when hasNextPage and no fetch is already running; show a status/error/retry while retaining prior pages. An IntersectionObserver may enhance the same controller, but must disconnect and not repeatedly fetch an already failing/end page. Keep explicit keyboard controls, previous-page recovery and access to footer content.

Cancelling old filter queries and separate query keys prevent an old response from becoming the new filter's data. Pagination uses page/cursor in its query key; placeholderData/keepPreviousData can retain prior rows during a transition, but label that temporary old data and prevent actions based on the wrong page.


## Stable table identity, selection and sorting

Use persistent IDs for row keys, selection and mutation targets; sorting an array index must not move a checkbox/edit draft to a different record. Keep selection scope explicit: selected IDs on loaded pages versus all records matching a server filter. “Select all” across a million results requires a server-side filter/snapshot/exclusion contract, not downloading every ID. Authorization is rechecked when bulk work executes; displayed counts/permissions may become stale.

```tsx
import { useState } from 'react';
type CourseRow = { id: string; title: string };
export function CourseTable({ rows, direction, sortTitle }: { rows: CourseRow[]; direction: 'ascending' | 'descending'; sortTitle: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  return <>
    <p role="status">{selected.size} selected on visited pages</p>
    <table><caption>Courses on the current page; server order: title {direction}</caption>
      <thead><tr><th scope="col">Select</th><th scope="col" aria-sort={direction}>
        <button type="button" onClick={sortTitle}>Title: {direction}; change sort</button>
      </th></tr></thead>
      <tbody>{rows.map(row => <tr key={row.id}>
        <td><input type="checkbox" aria-label={`Select ${row.title}`} checked={selected.has(row.id)}
          onChange={event => { const checked = event.target.checked;
            setSelected(old => { const next = new Set(old); checked ? next.add(row.id) : next.delete(row.id); return next; });
          }} /></td>
        <th scope="row">{row.title}</th>
      </tr>)}</tbody>
    </table>
  </>;
}
```

This minimal table takes the confirmed title-sort direction alongside its server-sorted rows; update both together when a new sort response is accepted, and label pending/stale rows while waiting. Selection inside this example persists while the component remains mounted; lift it to the deliberate workflow owner if pagination remounts the table. Clear/reconcile on user/filter/resource-scope changes, cap explicit selected IDs and surface deleted/unavailable rows. A master checkbox needs true/false/indeterminate state plus a clear “this page” label; never imply all matching records are selected.

A native table is not an ARIA grid. Add grid roles/roving cell focus only when spreadsheet-style interaction is required and fully implemented. Sticky headers, column hiding/resizing, sort controls and row menus need keyboard/focus/zoom/reading-order tests. A paginated semantic table can be more reliable than a partially implemented virtual grid. Announce page/sort result status without stealing focus on every background refresh; define meaningful empty/loading/error states and bulk confirmation.

## Virtualization: a separate measured optimization

```tsx
// Optional loaded-window list, TanStack Virtual3; rows are already bounded/validated.
import { useCallback, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
export function VirtualCourses({ rows }: { rows: { id: string; title: string }[] }) {
  const parent = useRef<HTMLDivElement>(null);
  const keyFor = useCallback((index: number) => rows[index]!.id, [rows]); // count guarantees valid index.
  const virtual = useVirtualizer({ count: rows.length, getScrollElement: () => parent.current,
    estimateSize: () => 48, getItemKey: keyFor, overscan: 5 });
  return <div ref={parent} tabIndex={0} aria-label="Scrollable loaded courses" style={{ height: 320, overflow: 'auto' }}>
    <div role="list" aria-label="Loaded course window" style={{ height: virtual.getTotalSize(), position: 'relative' }}>
      {virtual.getVirtualItems().map(item => {
        const row = rows[item.index];
        if (!row) return null;
        return <div key={item.key} data-index={item.index} ref={virtual.measureElement}
          role="listitem" aria-posinset={item.index + 1} aria-setsize={rows.length}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${item.start}px)` }}>
          {row.title}
        </div>;
      })}
    </div>
  </div>;
}
```

These positions/counts describe the loaded window, not the total database result set; don't advertise them as global indexes after page eviction. Variable-height rows require measurement/anchor handling; fonts, width changes, images and expanded content can invalidate estimates. Do not use fixed row assumptions on wrapping translations without testing.

Interactive virtualization must keep the active/focused row available or intentionally move focus before unmount, and preserve edit state by ID outside recycled DOM. Browser find/print/screen-reader access only sees mounted content; offer an appropriate paginated/export alternative. Virtual DOM is not list virtualization, and neither data pagination nor CSS content-visibility automatically implements the whole focus/retention contract.


## Saved views: versioned intent, not cached server results

```js
// A safe public-view schema/URL projection; private filter content needs a privacy policy.
export function normalizeCourseView(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid view');
  if (value.version !== 1) throw new Error('Unsupported view version');
  const sort = ['title-asc', 'title-desc', 'created-desc'].includes(value.sort) ? value.sort : 'created-desc';
  const q = typeof value.q === 'string' ? value.q.trim().slice(0, 100) : '';
  const allowed = ['title', 'created'];
  if (Array.isArray(value.columns) && value.columns.length > 20) throw new Error('Too many view columns');
  const columns = Array.isArray(value.columns) ? [...new Set(value.columns.filter(column => allowed.includes(column)))] : allowed;
  return { version: 1, q, sort, columns: columns.length ? columns : ['title'] };
}
export function courseViewUrl(value) {
  const view = normalizeCourseView(value);
  const params = new URLSearchParams({ q: view.q, sort: view.sort, columns: view.columns.join(',') });
  return `/courses?${params}`;
}
```

Save filter/sort/visible-column intent with schema version, owner/name and migration/rejection policy; not row data, authorization, selected private IDs or in-flight cursors. On restore normalize against current allowed fields/permissions, reset pagination/cursor, run a new authorized query and announce the active view. Unknown sorts fall back explicitly; incompatible schema versions require migration or an understandable rejection. For a server-saved view validate/authorize create/read/update/delete and handle stale view versions just like any resource.

Define whether URL or selected saved view wins after the user edits filters; a useful policy is URL=current view, saved view=template, and edits mark an unsaved custom view until explicitly saved. Do not leak sensitive search terms into shareable URLs/logs/referrers. Local-only views can reuse the bounded/versioned storage principles from the preferences/draft notes. Deep-link restoration and query keys must agree; do not keep an unrelated hidden store with different filters.


## Charts: provide values and meaning, not only colored pixels

Choose a chart that answers the question: bars compare categories, lines show ordered time with defined sampling, and tables provide exact lookup. Label units/time window/source; distinguish zero, missing and suppressed values; show aggregation/sample limitations. Do not distort bar baselines or use a truncated axis without a clear reason. Downsample large time series with an explained method; dropping every nth point can hide spikes. Load bounded aggregates from the server rather than rendering every raw event.

```html
<!-- Fictional training data, not project performance measurements. -->
<figure>
  <figcaption><strong>Course completions, sample quarter</strong></figcaption>
  <p>February has the most completions (20); the quarter total is45. Exact values follow.</p>
  <ul aria-hidden="true" style="list-style:none; padding:0">
    <li>January <span style="display:inline-block; width:5rem; border:1px solid; background:currentColor">&nbsp;</span>10</li>
    <li>February <span style="display:inline-block; width:10rem; border:1px solid; background:currentColor">&nbsp;</span>20</li>
    <li>March <span style="display:inline-block; width:7.5rem; border:1px solid; background:currentColor">&nbsp;</span>15</li>
  </ul>
  <table><caption>Sample course completions; zero-based bar scale0–20</caption>
    <thead><tr><th scope="col">Month</th><th scope="col">Completions</th></tr></thead>
    <tbody><tr><th scope="row">January</th><td>10</td></tr>
      <tr><th scope="row">February</th><td>20</td></tr>
      <tr><th scope="row">March</th><td>15</td></tr></tbody>
  </table>
</figure>
```

The decorative duplicate bars are hidden from assistive technology; the visible summary/table carry meaning and values. For SVG/canvas libraries, provide an appropriate accessible name/summary and structured data alternative rather than stuffing an entire table into aria-describedby (which flattens structure). Interactive tooltips need keyboard/touch access and equivalent values; color alone must not distinguish series. Filter/legend controls are named native controls with status updates. Test forced colors, contrast, zoom and reduced motion; choose a chart library by its actual accessibility/runtime contract, not visual polish alone.


## Official references

Checked2026-10-21: [TanStack Query5 infinite queries/maxPages](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries), [pagination](https://tanstack.com/query/latest/docs/framework/react/guides/paginated-queries), [TanStack Virtual3 API](https://tanstack.com/virtual/latest/docs/api/virtualizer), [WAI tables](https://www.w3.org/WAI/tutorials/tables/), [WAI complex charts/images](https://www.w3.org/WAI/tutorials/images/complex/). Complete implementation, performance and accessibility exercises remain learner practice.


## Executed pagination workflow

Continue with [the bounded React workflow and decision record](./Large_Data_Workflow.md): saved filters, scope changes, ID selection, result focus, stale response protection and cursor/snapshot failure handling. Its six local behavior tests are distinguished from native-browser accessibility and performance work still required.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/design/Could_you_suggest_architectural_approaches_for_showing_thousands_of_data_sets_on_UI.md). All learner practice remains outstanding.
