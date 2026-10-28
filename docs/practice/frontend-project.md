# Frontend integration project

Implement one course/notes management screen in React19/TypeScript5.9 with a real server boundary. Keep the existing primary form/query/router choices where already adopted; do not add a second state architecture. Use [the bounded table implementation](../senior_growth/EngX_Quality/Large_Data_Workflow.md) and [the form/wizard/navigation examples](../senior_growth/React/complex-forms-and-data.md) as reference components. They do not already form the complete project.

Use an owned compatible React application with its lockfile and strict TypeScript configuration. The checked helper subset below uses Node24.18, TypeScript5.9.3 and Zod4.6.7; its runtime assertions use Node's standard assert. UI checks use the app's existing React Testing Library/Vitest and browser tooling. If starting a new application, first establish an entry HTML, React root and working build/test scripts in a disposable directory; do not replace a submission template's configuration. The project requires an authenticated paginated server, not a client-only static array disguised as remote data. Synthetic deferred adapters are appropriate for deterministic race tests only.

Use the [F01–F06 increments](./frontend/) for a smaller prerequisite-led start. The existing project requirements below remain the final integrated scope. [Reference examples](../workbench/frontend/) are author material, not completed practice.

## P-328

**Deliverable:** a management screen with shareable filters, server sort/pagination, explicit cross-page selection, a multistep editable draft, accessible confirmation, localization and recoverable errors. The reason for combining them is ownership: URL intent, accepted server results, dirty draft and pending command must not overwrite each other.

Choose a catalogue schema `{id,title,startDate,endDate,version}` and two tenants/users. Seed at least10,000 synthetic rows, including equal sort values and Unicode/long labels. The API caps page size50, validates filters/sort, uses deterministic ordering with an ID tie-breaker, and reauthorizes every read/write. Choose a documented cursor/snapshot consistency policy rather than promising an immutable browser snapshot without backend support. Explicit selection is capped at100 visited-page IDs; “all matching records” would require a different server selection token and confirmation contract.

**Implementation increments:** first make a labeled native table and empty/loading/failure states; next connect typed URL intent and server pages; then add selection by stable IDs; finally integrate details→schedule→review draft, complete server validation, confirmation and navigation recovery. Keep the existing shared wizard/date rules rather than create inconsistent client/server date parsing. A background record update must not reset a dirty draft; return a conflict and offer compare/rebase/refetch. Clear only the matching draft after confirmed save/discard. Scope any persisted draft, expire it and explain shared-device privacy; sensitive drafts may require server storage.

| State/action | Required observable behavior |
|---|---|
| URL Back/Forward or reload | Restore validated query/sort intent; fetch a fresh authorized page, not serialized old rows |
| Page change | Preserve only allowed explicit IDs; show selected count and clear action; no “select all” ambiguity |
| Scope/filter change or expired snapshot | Clear incompatible selection/cursors and show a restart path |
| Next/Back in wizard | Validate intended step, retain values; final save validates all fields server-side |
| Server field error/conflict/outage | Preserve draft, associate allowlisted errors, distinguish unknown save outcome from confirmed failure |
| Destructive action | Open a real modal confirmation with exact target/count, safe default choice and no effect before confirmation |
| Save acknowledged | Show confirmed result, clear dirty baseline and reconcile server/list versions |

Use native `dialog.showModal()` or the app's reviewed accessible dialog component. Associate title/description, keep focus within the modal, support Escape/cancel, restore focus to the invoking control when it still exists, and define fallback focus if a deleted row disappears. A portal alone is not a modal/focus implementation. While a command is dispatching, do not promise cancel rolls back a server commit; show explicit pending/unknown recovery and query its receipt/status. Do not trap navigation without explaining a recovery path. `beforeunload` is limited and cannot guarantee saved data after process termination.

**Localization:** keep message keys separate from raw server text, use Intl for numbers/dates with an explicit locale/time-zone contract, and preserve canonical identifiers/calendar dates. Test a second locale with longer labels, plural selected-count messages, Unicode search and a right-to-left layout if the product supports one. Do not concatenate translated sentence fragments or treat English text length as a layout constraint. Displaying a localized date is separate from validating an ISO calendar date.

**Automated acceptance:** URL duplicate/unknown/invalid parameters fail safely; sort/page inputs reach the server; ownership/field/version negative cases are tested at the real API; selections behave across3pages; stale requests cannot commit; wizard Back preserves input; error paths keep drafts; confirm/cancel/duplicate click obey the command policy. Use role/name assertions and real keyboard events where supported, plus an accessibility scanner as one signal. Scan success does not prove WCAG conformance.

**Manual acceptance:** retain browser/version/OS/VoiceOver or selected screen-reader versions and exact observed results. Navigate by keyboard, open/cancel/confirm the modal, verify focus entry/trap/return and status/error announcements. At200% text zoom and400% page zoom, inspect readability, controls, overlays and reflow. Use a320CSS-pixel viewport for the WCAG reflow condition; genuine two-dimensional data tables may need a deliberate contained scroll solution, while labels/actions surrounding them must remain usable. Test reduced-motion preference, visible focus and no color-only state. Record failures and corrections; no screenshots or assistive observations are fabricated here.

**Trade-off decision:** prefer native pagination/table semantics first. Add virtualization only after measuring DOM/render cost and implementing keyboard/assistive ownership for recycled rows. Measure retained pages/selection/drafts and interaction latency under a declared device/workload; merely rendering50rows proves neither network nor database efficiency. Retain the final UI, real API test evidence and manual observation ledger before marking your practice reviewed.

## P-329

**Deliverable:** deterministic React failure demonstrations and corrected behavior in the same screen. Timers alone are a poor scheduler for race tests: use controlled deferred promises so the order is explicit. A slow searchA must not replace later searchB; abort saves work when supported, and a request epoch/identity prevents commits even when an adapter ignores abort. Unmount/account change invalidates the owner and clears private state.

A controlled adapter can retain `resolveA`/`resolveB`: requestA, requestB, resolveB withB, then resolveA withA. AssertB remains visible and A's signal is aborted. Repeat with an adapter that ignores the signal, rejectA afterB and unmount before either settles. Observe rejections so they do not become unhandled promises. The existing bounded table tests show this exact ownership pattern; retain a failing variant with the epoch guard removed to prove the test catches the regression.

**Identity case:** edit rowB's title, then sort/filter/insert rowA before it. Keying by array index can attach B's draft/input state to another row. Use immutable entity IDs and one draft owner per entity. Test server reordering, deletion and ID recreation policy; random keys on every render instead remount inputs and lose drafts. A record's changing version should not automatically become its React key if that destroys unsaved edits.

**Batching case:** from initial0, three `setCount(count+1)` calls in one event use the same captured0 and yield1; three `setCount(c=>c+1)` updater calls yield3. Assert both intentionally, explain the queue and avoid side effects inside updater functions. Functional updates solve stale reads of that state, not every stale closure or incorrect dependency.

**Closure case:** create a delayed handler that captures the selected ID, change selection, then fire it. Decide whether it should act on the event-time ID or the current ID; both can be valid contracts. For current-value behavior use correct effect dependencies/cleanup or a deliberately owned latest-value reference, not an empty-dependency escape hatch. A ref does not create server authority. For an interval/subscription, require exactly one live owner after StrictMode setup/cleanup and zero after unmount.

**Acceptance evidence:** keep failing/corrected versions for race, key identity, batching and stale closure; list the exact schedule and expected DOM/state; explain what cancellation, identity, closure and server version each guarantee. Run under StrictMode and production build. Actual browser responsiveness, current API permissions and independent learner explanation remain required; the supplied helper tests below do not execute these full React cases.

## P-330

**Deliverable:** a network boundary that accepts `unknown`, validates runtime shape/identity/bounds and exposes loading/ready/failed as an exhaustive discriminated union. A successful HTTP status is not a valid DTO, and a TypeScript cast does not validate hostile JSON. Keep safe fixed error codes separate from raw exceptions and server credentials. Sharing a schema can reduce duplication; the server still validates and authorizes independently.

The checked starting contract is in `docs/practice/frontend-lab/contracts.ts`:

<<< ./frontend-lab/contracts.ts

URL state is untrusted as well: reject duplicate and unknown keys, bound query/cursor and allowlist sort. Do not encode credentials, private drafts, unrestricted owner IDs or whole selected records in a shareable URL. Changing filters resets the cursor by an explicit transition. On parsing failure show a recoverable invalid-view message or an explicitly documented canonical reset; do not silently accept one of two contradictory values.

The real HTTP adapter must bound bytes **before** JSON parsing, keep its deadline through body consumption, handle non-success status/cancel the body, validate the DTO and require requested identity/scope. Schema `.max(50)` limits accepted records after download; it is not a transfer-byte limit. Use the existing Node/browser deadline lessons and the same server contract. Model timeout/network, malformed data and authorization failures distinctly where the product can act on them; never display raw SQL/provider errors.

`frontend-lab/check.ts` tests malformed/duplicate/oversize/foreign-field JSON and URL parameters and contains an expected negative compile-time case. Copy the two files into an isolated ESM directory with the pinned Zod/TypeScript/Node types, compile under strict/noUncheckedIndexedAccess/exactOptionalPropertyTypes, then run the emitted check. Both strict compilation and runtime assertions passed2026-10-26. Removing the `@ts-expect-error` should fail compilation; if the directive becomes unused, the compiler flags that too. Keep these exercise files outside restricted src/tests.

**Acceptance:** malformed DTOs never become ready; loading/success/empty/failure are intentional; all union branches are handled. Add a new state temporarily and prove the exhaustive switch fails until handled. Add negative compile cases for nullable/optional data and incompatible IDs without suppressing application errors. At the API boundary test invalid JSON, duplicate IDs,51rows, extra private properties, mismatched requested resource, wrong tenant and aborted body; at the UI verify recovery without stale data leakage. Retain actual compile diagnostics and runtime results, not only a screenshot of a green editor.

The checked helper subset is learning material, not the implemented P-328/P-329/P-330 application. All three independent projects remain learner practice.

Official references checked2026-10-26: [React state queues](https://react.dev/learn/queueing-a-series-of-state-updates), [React list identity](https://react.dev/learn/rendering-lists), [TypeScript narrowing/exhaustiveness](https://www.typescriptlang.org/docs/handbook/2/narrowing.html), [WAI modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [WCAG2.2 reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [Zod schemas](https://zod.dev/api).
