# Complex Forms and Remote Data: Ownership, Validation and Optimistic Edits

Target: senior frontend implementation/debugging. Primary stack: React19/TypeScript, TanStack Query5, React Hook Form7, Zod4 (docs currently4.6) with a compatible @hookform/resolvers version. Official APIs checked2026-10-21. Backend contract uses the owner/version-conditional note mutation from [server security](./next-server-security.md); API/session/database integration remains learner work. Do not install competing form/query frameworks merely to repeat the same lesson.

## Separate server truth, UI projection and draft

A query cache owns the last known remote record and request lifecycle; a form owns an unsaved edit based on a particular version; optimistic UI projects pending intent. None is the database. A search URL owns shareable filter/sort/page state; a global UI preference store should not copy all records into a second cache. Duplicated truth needs an explicit synchronization rule or eventually diverges.

| Concern | Contract |
|---|---|
| Detail key | Include authenticated user/tenant scope and resource ID |
| List key | Also include every normalized filter/sort/page input affecting results |
| Freshness | staleTime describes when a query becomes stale; it does not guarantee push updates |
| Retention | gcTime applies to inactive queries; bound pages/bytes independently |
| Mutation | Validate, authorize, conditionally write, return safe committed DTO |
| Invalidation | Mark affected keys stale; choose whether/when active queries refetch |
| Logout | Cancel/dispose private work and clear private cache scope; a user ID in a key is not authorization |

A failed refetch with previous data differs from no data, empty success or an offline-paused operation. Keep safe last data visible where appropriate and announce stale/failure status; don't replace the whole screen with a spinner on every background fetch. Retry reads only under an explicit bounded policy. Do not automatically retry an ambiguous non-idempotent write.

## One schema at the boundary, with server authority

<<< ../../workbench/frontend/react/forms/note-contract.ts{ts}

The mutation requires explicit fields, rejects unknown input keys and supplies no create-time defaults. PATCH omission must not reset unrelated fields or turn an absent optional field into a default write. The response schema projects known fields; a TypeScript assertion alone would not validate JSON. Client validation improves feedback, while the server independently parses the request, checks the session/owner, enforces database constraints/version and returns safe errors. A shared schema does not replace those business/authorization rules.

Coercion is a design choice: an empty string should not silently become numeric zero. Distinguish absent, null, empty and zero deliberately.

<<< ../../workbench/frontend/react/forms/note-api.ts{ts}

The server example replies400 for malformed edit and409 for unavailable/changed; a richer business-validation endpoint may deliberately reply422 with an allowlisted field-code shape. Do not expose arbitrary server messages/stacks or apply untrusted field paths to a form. A timeout, connection loss or invalid response can happen after commit: refetch/reconcile, preserve input and avoid asserting that the write never occurred. Use ingress/body limits and server deadlines in addition to this browser timeout; aborting the browser request does not roll back a server transaction.

## Worked optimistic policy: pending overlay instead of stale snapshot rollback

A naive sequence is: snapshot S0, apply A, apply B, then A fails and restores S0—erasing B. Snapshot rollback is safe only under a deliberately serialized/otherwise coordinated mutation contract. Here the confirmed query data stays canonical; pending title edits are a separate overlay. Failure removes only that operation from the pending set. The server version predicate still decides which writes succeed.

<<< ../../workbench/frontend/react/forms/note-projection.ts{ts}

A pending edit based on an older version is not reapplied over a newer confirmed record. Equal server versions are assumed to identify the same committed record; inconsistent equal-version payloads are a server-contract failure to investigate. Sequences are monotonic within **one editor owner per note**, not a global multi-device clock. Other tabs/devices require server conflict policy; never pretend local timestamps order distributed writes.

<<< ../../workbench/frontend/react/forms/use-note-edit.ts{tsx}

The detail query must also merge versions monotonically: even an authoritative server can answer a read that began before a later write, with its response arriving afterward. Cancellation reduces this race, but is not a replacement for the merge rule. Add the following query owner beside the mutation hook; the exercise must implement its authenticated GET endpoint with the same owner predicate as PATCH.

<<< ../../workbench/frontend/react/forms/use-note-query.ts{tsx}

This owned cache key contains only validated Note data; the cast on its old value records that invariant. Every writer to that key must preserve it. Awaited invalidation keeps the operation pending through reconciliation; it does not make a stale response authoritative. List queries need their own version/refetch policy; their pending detail projection does not automatically update arbitrary filtered pages. Choose detail/list consistency and navigation feedback explicitly. Monotonic versions must have a server-defined reset/deletion/recreation policy; they are not a substitute for authorization or domain conflict handling.

Rollback here means dropping a failed overlay, leaving confirmed data untouched; it does not undo a committed transaction. If A/B share base version1, at most one can commit under the server predicate; the loser receives a conflict and its draft can be reviewed/rebased by the user. A version3 response arriving before delayed version2 remains version3 in the cache. An operation log or serialization is an alternative for more complex/commutative edits, and pessimistic save is often preferable for high-risk operations. Do not optimistically move money or grant access merely because a title-edit pattern works.


## Form ownership and accessible errors

<<< ../../workbench/frontend/react/forms/NoteTitleForm.tsx{tsx}

The save prop can be the owner's rename function. Default values establish one draft snapshot; background query changes must not silently reset dirty input. This simple form conservatively retains its base version until successful save; a background update leads to explicit conflict instead of unnoticed overwrite. Add a deliberate reload/compare/rebase control in the exercise. A successful save establishes a new baseline; changing entity ID remounts the form. Rendering a new version as its key would discard a user's dirty draft.

Formik is a controlled-state alternative; RHF registration usually uses native uncontrolled inputs, and Controller adapts controlled widgets. Neither choice proves fewer renders for every component or native accessibility. Labels, focus/error associations, validation timing, keyboard and announcement behavior are part of the form API. Client resolver transforms need correct input/output types; Zod defaults can make input optional but output required, so use the resolver's inferred or explicit z.input/z.output generic contract. Server validation still runs on direct API requests. Sensitive drafts should not automatically go to localStorage.


## SSR and hydration: a cache scope is a privacy boundary

For a client-only SPA, a stable client QueryClient may live at the app boundary. For server rendering, create the server query client within the request/tree scope; never retain one private server cache in a module singleton across users. Authorize the server read, project a minimal safe DTO and serialize only intended data. Dehydrated cache is visible to the recipient; it is not a secret transport. Query keys must match on both sides, and a fresh client must not begin with another user's state.

```tsx
// Conceptual server boundary for an already authorized safe record.
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { noteKey } from './note-keys'; // Extract pure key function; do not import a client hook module on server.
import type { Note } from './note-contract';
export function HydratedNote({ actorId, record, children }: { actorId: string; record: Note; children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } });
  client.setQueryData(noteKey(actorId, record.id), record);
  return <HydrationBoundary state={dehydrate(client)}>{children}</HydrationBoundary>;
}
```

An outer client QueryClientProvider must supply a stable client instance; the server component above is a boundary illustration, not an authorization implementation. Obtain actor/record through the server DAL first. Split noteKey into a pure module used by both hook and server; never import a use-client module for a server function. For actual Next integration, follow the framework's Server Component/provider/hydration layout and test Suspense instance lifetime. Non-JSON values/errors require framework-supported serialization; do not concatenate unescaped JSON into script HTML.

Avoid duplicate render/data ownership: Server Components alone may suffice for a mostly server-driven page; Query is useful when the hydrated client needs ongoing remote-data interaction.


## Official references

Checked2026-10-21: [TanStack Query5 defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults), [optimistic UI/cache approaches](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates), [server rendering/hydration](https://tanstack.com/query/latest/docs/framework/react/guides/ssr), [Zod4 schemas](https://zod.dev/api), [RHF Zod resolver](https://github.com/react-hook-form/resolvers), [Next data security](https://nextjs.org/docs/app/guides/data-security). Material completion and all learner exercises remain separate; no readiness claim follows from these notes.

## Dependent fields and asynchronous validation

Cross-field rules concern a relationship, not two independent required fields. In this training course-publishing wizard, end date must be on/after start date; dates are calendar dates, not instants. This exercise accepts years2020–2100 explicitly. Do not parse date-only values through the user's timezone or accept Date's overflow normalization as validation.

<<< ../../workbench/frontend/react/forms/schedule.ts{ts}

Use this relationship in a Zod object refinement with the issue path on end (or equivalent RHF validate/trigger ownership). When start changes, revalidate end deliberately; hiding an error until unrelated input changes is a dependency bug. Keep labels and messages linked to the exact field, and use an error summary with links for a long form. Do not duplicate the same rule with different timezone/normalization logic on client and server. Final server parsing enforces the complete relationship even when users skip steps or call the endpoint directly.

Slug availability is asynchronous and advisory: another user can claim the slug between validation and save, so the database unique constraint/transaction owns the final decision. Debounce limits calls, cancellation saves work when supported, and request identity suppresses stale results. None is a replacement for uniqueness at commit.

<<< ../../workbench/frontend/react/forms/latest-validation.js{js}

The check port should forward its signal to fetch, check status, validate a boolean response and use a bounded endpoint. The deadline limits caller waiting even if an adapter ignores cancellation; it cannot kill arbitrary underlying noncooperative work. Port rejections remain observed by Promise.race. On input/dependency change or unmount, cancel the owner; ignore stale results. Show checking/unavailable/error for the exact current normalized value, and never treat an old available result as permission to submit a different value. A failed check is unknown, not “available.”

Integration pattern: keep one checker with a stable owner, subscribe to normalized slug plus all data-affecting scope fields, clear the previous validation status immediately, debounce the new check if desired and update status only for its current identity. Do not run async validation inside render or make a slow endpoint part of every keystroke without a completion policy. A final409 uniqueness conflict must map back to the slug field while preserving the rest of the draft; server-side errors take precedence over an earlier green availability indicator.


## Multistep transitions and resumable draft ownership

A wizard needs one canonical draft plus explicit transitions. Separate validation scope for Next from complete validation for final save. Back preserves entered data; editing invalidates derived availability; a restored draft is revalidated and is not an authenticated/approved submission.

<<< ../../workbench/frontend/react/forms/wizard.ts{ts}

<<< ../../workbench/frontend/react/forms/CourseWizard.tsx{tsx}

The component expects the shared types/helpers above (export/import them when splitting files); the save port must enforce the server contract and have a bounded completion policy. Availability is advisory status alongside the slug field, not a boolean that bypasses final save validation. Add the async checker and recovery owner from the surrounding sections to complete the full exercise. Final validation routes errors back to details or schedule before the focus Effect runs, including invalid recovered/external state.

The reducer models synchronous transition/validation, not network effects. The submit event owner must avoid issuing a second request when state did not transition idle→saving, and use a server idempotency/version contract for integrity. Dispatch success only after confirmed commit; an ambiguous failure retains dirty data. The final server request revalidates slug availability/relationships/authorization rather than trusting a review-step flag. Bound field inputs at the UI and server; a reducer type alone does not bound arbitrary strings from storage/network.

Build labeled details and schedule fieldsets plus a review view, with a visible step heading/progress list and actual Back/Next buttons. Focus the new heading or first invalid field intentionally; announce validation without reading every keystroke. Keep one form/draft owner when step fields unmount, choosing RHF unregister behavior deliberately. The reducer is the state mechanism; mounting screens and API effects is separate integration work. Do not hide an invalid required field then call the entire form valid.

For recovery, use the versioned, user-scoped, expiring draft example in the [storage note](../Communication_and_Security/Advantages_and_disadvantages_of_local_and_session_storage.md). Restore into the details step and revalidate rather than trusting saved completion/error/pending flags. Compare server record version before resuming an edit. Prefer server-owned drafts for sensitive/cross-device work; temporary local storage is an explicit usability/privacy decision.


## Unsaved changes: supported SPA blocker plus limited document warning

```tsx
// React Router7.18.4 data mode; mount outside the form so buttons cannot submit it.
import { useEffect, useId, useRef } from 'react';
import { useBlocker } from 'react-router-dom';
export function UnsavedChanges({ dirty }: { dirty: boolean }) {
  const blocker = useBlocker(dirty);
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (blocker.state === 'blocked' && !element.open) element.showModal();
    else if (blocker.state !== 'blocked' && element.open) element.close();
    return () => { if (element.open) element.close(); };
  }, [blocker.state]);
  useEffect(() => {
    // Policy: a save finishing while blocked cancels that attempted navigation.
    if (!dirty && blocker.state === 'blocked') blocker.reset();
  }, [dirty, blocker]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  return <dialog ref={dialog} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}
    onCancel={event => { event.preventDefault(); if (blocker.state === 'blocked') blocker.reset(); }}>
    <h2 id={`${id}-title`}>Leave this draft?</h2>
    <p id={`${id}-description`}>Unsaved edits will be lost unless a recoverable draft was saved.</p>
    <button type="button" onClick={() => { if (blocker.state === 'blocked') blocker.reset(); }}>Stay and edit</button>
    <button type="button" onClick={() => { if (blocker.state === 'blocked') blocker.proceed(); }}>Leave without saving</button>
  </dialog>;
}
```

The first dialog action is the safe stay choice. Native modal behavior supplies top-layer/inert interaction, but focus entry/return, Escape, labels and destination focus still require actual browser/assistive testing. A portal alone would not provide those semantics. Do not mount this blocker under the Next App Router and assume React Router integration: use the selected framework's supported navigation contracts or server/draft recovery strategy. Do not layer multiple competing router blockers for one draft.

useBlocker covers supported in-app navigation, not arbitrary browser shutdown/external document transitions. beforeunload is conditional, may require user activation, cannot supply arbitrary custom dialog text and is unreliable for some mobile/process exits. Attach only while dirty; do not attempt to perform an awaited save during unload. Save safe drafts during ordinary interaction/visibility lifecycle where appropriate, with disposal/expiry and explicit failure feedback; even that is not a guarantee against every crash. Dirty becomes false only after a confirmed save or intentional discard, not because a submit button was clicked.


References checked2026-10-21: [Zod refinements](https://zod.dev/api#refinements), [ReactRouter7 blocker](https://reactrouter.com/7.18.4/api/hooks/useBlocker), [HTML dialog](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element), [unload events](https://html.spec.whatwg.org/multipage/nav-history-apis.html#the-beforeunloadevent-interface), [Web Storage](https://html.spec.whatwg.org/multipage/webstorage.html).


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/react/complex-forms-and-data.md). All learner practice remains outstanding; the worked examples above are explanatory material.


The canonical workbench now supplies the real wizard imports/exports and a shared `note-keys.ts` module for client and server consumers. The network/form adapters still require the specified API/provider integration; the public demo does not implement a private notes service.
