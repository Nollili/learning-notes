# Large-data UI: a bounded, testable workflow

This worked client-side slice complements [the architecture comparison](./Could_you_suggest_architectural_approaches_for_showing_thousands_of_data_sets_on_UI.md). It uses React 19.3, TypeScript 5.9 and Zod 4.6; the primary choice is a native table with server pagination. Virtualization remains an alternative for measured scrolling needs, not a substitute for bounded transfer or database queries.

## Decision record: one page and explicit view persistence

**Context:** a course catalogue may contain millions of rows. Users filter, select records on visited pages and return to a saved filter. Requests can finish out of order, identities change, and the underlying catalogue changes during browsing.

**Decision:** retain at most one page of 50 rows and 100 selected IDs. Apply filters explicitly; keep draft filters separate from the accepted result. Use stable row IDs, server-issued cursor/snapshot tokens and an epoch guard as well as cancellation. Persist one versioned filter/sort view per account/tenant scope only after an explicit action. Do not persist rows, cursors or selected IDs. A scope change remounts the owner and discards in-memory state.

**Alternatives:** infinite scroll needs a retention/eviction and focus policy; virtualization reduces DOM cost but not server work, transfer size or client filtering. Offset pagination can support page numbers but large offsets cost work and concurrent writes can move boundaries. Keyset pagination needs a unique ordering and has no cheap arbitrary-page jump. A cache library can provide request deduplication and cache lifetime; this small example makes ownership visible instead of adding a second application architecture.

**Consequences:** forward navigation is deliberately simple; Previous/history, editing drafts and bulk mutation are outside this slice. Selection means explicit IDs from visited pages, not “all matching results.” A backend must reauthorize selected IDs at action time. On a new query, scope or expired snapshot, selection is cleared; a user-requested accepted page moves focus to the result heading, while initial mount does not steal focus.

## API and security contract

`Api` receives a typed view, an opaque cursor, an optional snapshot and an AbortSignal; it returns unknown JSON. Its real HTTP adapter must bound bytes before parsing, enforce a deadline, reject non-success status and map a documented snapshot-expired response to `SnapshotExpired`. The 50-row schema limits accepted data, not bytes already downloaded. Keep the `api` function identity stable; replacing it intentionally restarts the initial query.

The server validates filters and sort, authorizes the current tenant, caps page size and binds cursors to tenant, filters, sort and snapshot. Use parameterized SQL and an allowlisted sort mapping, with an ID tie-breaker. A signed cursor prevents tampering; it does not grant permission. A snapshot token only gives consistency if the server implements that promise (for example a bounded materialized ID list with TTL). Merely echoing a token or filtering by creation time does not freeze edits/deletes. Never hold a database transaction open indefinitely for a browser session. On expiry, reject the cursor and offer a fresh first page. Cross-page duplicate IDs or inconsistent ordering remain server-contract failures; this component rejects duplicates within a page and mismatched snapshots.

Storage partitioning is organization, not access control: all same-origin scripts can read localStorage. Filters can contain sensitive search terms. Use this device-persistence option only for non-sensitive views permitted by product policy, explain shared-device risks, clear scoped data on logout/account removal and offer deletion in the integrated app. A memory-only store is an appropriate alternative. No credentials belong in the view. Invalid versions, oversized stored text, blocked storage and malformed responses produce fixed recovery messages.

## Complete component

Put this in `course-screen.tsx` in an owned React/TypeScript project with `react`, `react-dom`, `zod` and their TypeScript types. Inject the HTTP adapter and a scoped storage policy from the application boundary. The worked tests below use controlled deferred responses, not a live backend.

<<< ../../workbench/frontend/architecture/course-screen.tsx{tsx}

## Behavior checks

Local verification on 2026-10-25: strict compilation with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`; Vitest 5.0.5, Testing Library 16.3.3 and JSDOM 30.1.3: six tests passed. These cover cancellation ownership despite a non-cooperative adapter, first-page restoration, scope replacement, safe failures and pagination focus. DOM focus in JSDOM is not evidence of native screen-reader announcements, browser layout or actual paint time.

<<< ../../workbench/frontend/architecture/behavior.test.tsx{tsx}

Use a Vitest config with `test: { environment: 'jsdom', include: ['behavior.test.tsx'] }`, then run `vitest run`. Compile the component with strict TypeScript and React JSX enabled. These are standalone learning fixtures; preserve any submission template's required test configuration and never put helpers into restricted `src/tests`.

## Debugging and practice acceptance

Apply [the separate UI architecture practice](../../practice/frontend/ui-architecture.md). The worked component and tests remain explanatory references.

## Official references

- [React useEffect: cleanup, dependencies, race protection and Strict Mode](https://react.dev/reference/react/useEffect).
- [WAI tables: captions and explicit row/column header relationships](https://www.w3.org/WAI/tutorials/tables/).
- [PostgreSQL 16 LIMIT/OFFSET: unique ordering and skipped-row cost](https://www.postgresql.org/docs/16/queries-limit.html).
