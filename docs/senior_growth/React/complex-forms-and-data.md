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

```ts
// note-contract.ts — safe to share types/schema; contains no database or credentials.
import { z } from 'zod';
export const titleFormSchema = z.object({ title: z.string().trim().min(1, 'Enter a title').max(100, 'Use at most100characters') });
export const renameSchema = z.strictObject({
  id: z.uuid(), title: titleFormSchema.shape.title,
  version: z.number().int().min(1).max(2147483646)
});
export const noteSchema = z.object({ id: z.uuid(), title: z.string(), version: z.number().int().positive() });
export type Note = z.infer<typeof noteSchema>;
export type Rename = z.infer<typeof renameSchema>;
```

The mutation requires explicit fields, rejects unknown input keys and supplies no create-time defaults. PATCH omission must not reset unrelated fields or turn an absent optional field into a default write. The response schema projects known fields; a TypeScript assertion alone would not validate JSON. Client validation improves feedback, while the server independently parses the request, checks the session/owner, enforces database constraints/version and returns safe errors. A shared schema does not replace those business/authorization rules. Coercion is a design choice: an empty string should not silently become numeric zero. Distinguish absent, null, empty and zero deliberately.

```ts
// note-api.ts — same-origin browser API contract from the server-security lesson.
import { noteSchema, renameSchema, type Note, type Rename } from './note-contract';
export class SaveError extends Error {
  constructor(public status: number) { super('Note could not be saved'); }
}
export async function saveNote(input: Rename): Promise<Note> {
  const body = renameSchema.parse(input);
  const response = await fetch('/api/notes', {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body), signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) { await response.body?.cancel(); throw new SaveError(response.status); }
  return noteSchema.parse(await response.json());
}
```

The server example replies400 for malformed edit and409 for unavailable/changed; a richer business-validation endpoint may deliberately reply422 with an allowlisted field-code shape. Do not expose arbitrary server messages/stacks or apply untrusted field paths to a form. A timeout, connection loss or invalid response can happen after commit: refetch/reconcile, preserve input and avoid asserting that the write never occurred. Use ingress/body limits and server deadlines in addition to this browser timeout; aborting the browser request does not roll back a server transaction.

## Worked optimistic policy: pending overlay instead of stale snapshot rollback

A naive sequence is: snapshot S0, apply A, apply B, then A fails and restores S0—erasing B. Snapshot rollback is safe only under a deliberately serialized/otherwise coordinated mutation contract. Here the confirmed query data stays canonical; pending title edits are a separate overlay. Failure removes only that operation from the pending set. The server version predicate still decides which writes succeed.

```ts
// note-projection.ts — pure helpers, no React/Query dependency.
export type NoteRecord = { id: string; title: string; version: number };
export type PendingRename = { title: string; version: number; sequence: number };
export function acceptConfirmed(current: NoteRecord | undefined, incoming: NoteRecord): NoteRecord {
  if (current && current.id !== incoming.id) throw new Error('Mismatched note identity');
  return !current || incoming.version >= current.version ? incoming : current;
}
export function projectPending(base: NoteRecord, pending: readonly PendingRename[]): NoteRecord {
  const applicable = pending.filter(edit => edit.version === base.version);
  const newest = applicable.reduce<PendingRename | undefined>((last, edit) =>
    !last || edit.sequence > last.sequence ? edit : last, undefined);
  return newest ? { ...base, title: newest.title } : base;
}
```

A pending edit based on an older version is not reapplied over a newer confirmed record. Equal server versions are assumed to identify the same committed record; inconsistent equal-version payloads are a server-contract failure to investigate. Sequences are monotonic within **one editor owner per note**, not a global multi-device clock. Other tabs/devices require server conflict policy; never pretend local timestamps order distributed writes.

```tsx
// use-note-edit.ts — mount one owner per note, under a stable QueryClientProvider.
import { useRef } from 'react';
import { useMutation, useMutationState, useQueryClient } from '@tanstack/react-query';
import { saveNote } from './note-api';
import { acceptConfirmed, projectPending, type PendingRename } from './note-projection';
import type { Note } from './note-contract';
export const noteKey = (userId: string, noteId: string) => ['note', userId, noteId] as const;
export function useNoteEdit(userId: string, noteId: string) {
  const client = useQueryClient();
  const sequence = useRef(0);
  const mutationKey = ['note.rename', userId, noteId] as const;
  const mutation = useMutation<Note, Error, PendingRename>({
    mutationKey,
    mutationFn: edit => saveNote({ id: noteId, title: edit.title, version: edit.version }),
    retry: false,
    onMutate: async () => { await client.cancelQueries({ queryKey: noteKey(userId, noteId), exact: true }); },
    onSuccess: confirmed => {
      client.setQueryData<Note>(noteKey(userId, noteId), old => acceptConfirmed(old, confirmed));
    },
    onSettled: async () => {
      await client.invalidateQueries({ queryKey: noteKey(userId, noteId), exact: true });
      await client.invalidateQueries({ queryKey: ['notes', userId] }); // All affected filtered lists.
    }
  });
  const pending = useMutationState<PendingRename>({
    filters: { mutationKey, exact: true, status: 'pending' },
    select: item => item.state.variables as PendingRename // This owned key carries only the typed edits above.
  });
  return {
    mutation,
    rename: (title: string, version: number) => mutation.mutateAsync({ title, version, sequence: ++sequence.current }),
    project: (confirmed: Note) => projectPending(confirmed, pending)
  };
}
```

The detail query must also merge versions monotonically: even an authoritative server can answer a read that began before a later write, with its response arriving afterward. Cancellation reduces this race, but is not a replacement for the merge rule. Add the following query owner beside the mutation hook; the exercise must implement its authenticated GET endpoint with the same owner predicate as PATCH.

```tsx
// use-note-query.ts — use the same pure noteKey module as mutation/server code.
import { useQuery } from '@tanstack/react-query';
import { noteSchema, type Note } from './note-contract';
import { acceptConfirmed } from './note-projection';
import { noteKey } from './note-keys';
export function useNoteQuery(userId: string, noteId: string) {
  return useQuery<Note>({
    queryKey: noteKey(userId, noteId),
    queryFn: async ({ signal }) => {
      const response = await fetch(`/api/notes/${encodeURIComponent(noteId)}`, {
        signal: AbortSignal.any([signal, AbortSignal.timeout(5000)])
      });
      if (!response.ok) { await response.body?.cancel(); throw new Error('Note unavailable'); }
      const record = noteSchema.parse(await response.json());
      if (record.id !== noteId) throw new Error('Mismatched note identity');
      return record;
    },
    structuralSharing: (old, incoming) => acceptConfirmed(old as Note | undefined, noteSchema.parse(incoming)),
    staleTime: 30_000, retry: false
  });
}
```

This owned cache key contains only validated Note data; the cast on its old value records that invariant. Every writer to that key must preserve it. Awaited invalidation keeps the operation pending through reconciliation; it does not make a stale response authoritative. List queries need their own version/refetch policy; their pending detail projection does not automatically update arbitrary filtered pages. Choose detail/list consistency and navigation feedback explicitly. Monotonic versions must have a server-defined reset/deletion/recreation policy; they are not a substitute for authorization or domain conflict handling.

Rollback here means dropping a failed overlay, leaving confirmed data untouched; it does not undo a committed transaction. If A/B share base version1, at most one can commit under the server predicate; the loser receives a conflict and its draft can be reviewed/rebased by the user. A version3 response arriving before delayed version2 remains version3 in the cache. An operation log or serialization is an alternative for more complex/commutative edits, and pessimistic save is often preferable for high-risk operations. Do not optimistically move money or grant access merely because a title-edit pattern works.

**Failure exercise:** retain a deterministic A/B schedule with A failure after B success, B failure after A success, two successes with increasing versions and an ambiguous response-lost commit. Acceptance: a failed earlier operation cannot restore stale data over later confirmation; stale pending versions do not mask new truth; conflicts preserve the draft; cache invalidation scopes are correct; no automatic write retry. Explain which behavior is guaranteed by the pure projection, Query lifecycle and server transaction respectively. Actual library/API overlap testing remains required.

## Form ownership and accessible errors

```tsx
// NoteTitleForm.tsx — parent keys by record.id, not every background version change.
import { useId, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { titleFormSchema, type Note } from './note-contract';
import { SaveError } from './note-api';
export function NoteTitleForm({ record, save }: {
  record: Note; save: (title: string, version: number) => Promise<Note>
}) {
  const id = useId();
  const baseVersion = useRef(record.version);
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(titleFormSchema), defaultValues: { title: record.title }
  });
  async function submit(values: { title: string }) {
    try {
      const confirmed = await save(values.title, baseVersion.current);
      baseVersion.current = confirmed.version;
      reset({ title: confirmed.title }); // Intentional successful-save baseline; input is disabled while saving.
    } catch (error) {
      setError('root.save', { message: error instanceof SaveError && error.status === 409
        ? 'This note changed or is unavailable. Your draft is preserved; refresh and review before saving.'
        : 'Could not confirm save. Your draft is preserved; check the current note before retrying.' });
    }
  }
  return <form noValidate onSubmit={handleSubmit(submit)}>
    <fieldset disabled={isSubmitting}><legend>Edit note title</legend>
      <label htmlFor={id}>Title</label>
      <input id={id} {...register('title')} aria-invalid={!!errors.title}
        aria-describedby={errors.title ? `${id}-error` : undefined} />
      {errors.title && <p id={`${id}-error`} role="alert">{errors.title.message}</p>}
      <button type="submit">Save title</button>
    </fieldset>
    {errors.root?.save && <p role="alert">{errors.root.save.message}</p>}
    <p role="status">{isSubmitting ? 'Saving title…' : 'Ready to edit'}</p>
  </form>;
}
```

The save prop can be the owner's rename function. Default values establish one draft snapshot; background query changes must not silently reset dirty input. This simple form conservatively retains its base version until successful save; a background update leads to explicit conflict instead of unnoticed overwrite. Add a deliberate reload/compare/rebase control in the exercise. A successful save establishes a new baseline; changing entity ID remounts the form. Rendering a new version as its key would discard a user's dirty draft.

Formik is a controlled-state alternative; RHF registration usually uses native uncontrolled inputs, and Controller adapts controlled widgets. Neither choice proves fewer renders for every component or native accessibility. Labels, focus/error associations, validation timing, keyboard and announcement behavior are part of the form API. Client resolver transforms need correct input/output types; Zod defaults can make input optional but output required, so use the resolver's inferred or explicit z.input/z.output generic contract. Server validation still runs on direct API requests. Sensitive drafts should not automatically go to localStorage.

**Form exercise:** implement the endpoint and editor, simulate validation/conflict/operational failure and a background record update while dirty. Acceptance: whitespace/overlength input fails before request; bypassed client validation is rejected server-side; default/reset policy is explained; draft survives failure; saved version changes only after confirmation; first invalid input receives focus and its message is associated/announced; keyboard submit/pending/recovery work; no authorization from client user IDs. Add a safe status for confirmed save rather than treating “Ready” as proof of persistence. Continue with the dependent-validation, wizard and navigation sections below.

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

An outer client QueryClientProvider must supply a stable client instance; the server component above is a boundary illustration, not an authorization implementation. Obtain actor/record through the server DAL first. Split noteKey into a pure module used by both hook and server; never import a use-client module for a server function. For actual Next integration, follow the framework's Server Component/provider/hydration layout and test Suspense instance lifetime. Non-JSON values/errors require framework-supported serialization; do not concatenate unescaped JSON into script HTML. Avoid duplicate render/data ownership: Server Components alone may suffice for a mostly server-driven page; Query is useful when the hydrated client needs ongoing remote-data interaction.

**Hydration exercise acceptance:** two authenticated requests receive only their own authorized DTO/cache, matching server/client keys avoid accidental duplicate initial loading, refetch respects chosen freshness, logout removes prior private state, production hydration has no mismatch, and errors/secrets do not serialize into HTML/RSC. Retain actual Next/Query typecheck/build/browser evidence; this repository only builds the learning pages.

## Official references

Checked2026-10-21: [TanStack Query5 defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults), [optimistic UI/cache approaches](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates), [server rendering/hydration](https://tanstack.com/query/latest/docs/framework/react/guides/ssr), [Zod4 schemas](https://zod.dev/api), [RHF Zod resolver](https://github.com/react-hook-form/resolvers), [Next data security](https://nextjs.org/docs/app/guides/data-security). Material completion and all learner exercises remain separate; no readiness claim follows from these notes.

## Dependent fields and asynchronous validation

Cross-field rules concern a relationship, not two independent required fields. In this training course-publishing wizard, end date must be on/after start date; dates are calendar dates, not instants. This exercise accepts years2020–2100 explicitly. Do not parse date-only values through the user's timezone or accept Date's overflow normalization as validation.

```ts
// schedule.ts — pure validation; no external package needed.
export function dateNumber(value: string): number | null {
  const match = /^(20[2-9][0-9]|2100)-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? date.getTime() : null;
}
export function scheduleErrors(start: string, end: string): Record<string, string> {
  const first = dateNumber(start), last = dateNumber(end);
  const errors: Record<string, string> = {};
  if (first === null) errors.start = 'Enter a valid start date';
  if (last === null) errors.end = 'Enter a valid end date';
  if (first !== null && last !== null && last < first) errors.end = 'End date must be on or after start';
  return errors;
}
```

Use this relationship in a Zod object refinement with the issue path on end (or equivalent RHF validate/trigger ownership). When start changes, revalidate end deliberately; hiding an error until unrelated input changes is a dependency bug. Keep labels and messages linked to the exact field, and use an error summary with links for a long form. Do not duplicate the same rule with different timezone/normalization logic on client and server. Final server parsing enforces the complete relationship even when users skip steps or call the endpoint directly.

Slug availability is asynchronous and advisory: another user can claim the slug between validation and save, so the database unique constraint/transaction owns the final decision. Debounce limits calls, cancellation saves work when supported, and request identity suppresses stale results. None is a replacement for uniqueness at commit.

```js
// latest-validation.js — one owner for a dependent value (e.g. course scope + normalized slug).
export function createLatestValidation(check, budgetMs = 2000) {
  if (!Number.isFinite(budgetMs) || budgetMs <= 0) throw new RangeError('Finite positive budget required');
  let generation = 0;
  let active;
  return {
    async run(value) {
      const mine = ++generation;
      active?.abort();
      const controller = new AbortController();
      active = controller;
      let timer;
      const deadline = new Promise((_, reject) => {
        timer = setTimeout(() => { controller.abort(); reject(new Error('Validation deadline')); }, budgetMs);
      });
      try {
        const available = await Promise.race([Promise.resolve().then(() => check(value, controller.signal)), deadline]);
        if (mine !== generation || controller.signal.aborted) return { kind: 'stale' };
        if (typeof available !== 'boolean') throw new Error('Invalid validation response');
        return { kind: available ? 'available' : 'unavailable', value };
      } catch {
        return mine !== generation ? { kind: 'stale' } : { kind: 'error', value };
      } finally { clearTimeout(timer); if (mine === generation) active = undefined; }
    },
    cancel() { ++generation; active?.abort(); active = undefined; }
  };
}
```

The check port should forward its signal to fetch, check status, validate a boolean response and use a bounded endpoint. The deadline limits caller waiting even if an adapter ignores cancellation; it cannot kill arbitrary underlying noncooperative work. Port rejections remain observed by Promise.race. On input/dependency change or unmount, cancel the owner; ignore stale results. Show checking/unavailable/error for the exact current normalized value, and never treat an old available result as permission to submit a different value. A failed check is unknown, not “available.”

Integration pattern: keep one checker with a stable owner, subscribe to normalized slug plus all data-affecting scope fields, clear the previous validation status immediately, debounce the new check if desired and update status only for its current identity. Do not run async validation inside render or make a slow endpoint part of every keystroke without a completion policy. A final409 uniqueness conflict must map back to the slug field while preserving the rest of the draft; server-side errors take precedence over an earlier green availability indicator.

**Acceptance:** test leap years/invalid dates/end-before-start, changing start after a valid end, empty dependent fields, response A arriving after B, adapters ignoring abort, timeout/network/invalid JSON, scope changes and unmount. Only the current check may update state; unknown failures never become success; a concurrent slug claim still fails at the server boundary and returns an associated field error. Real resolver/UI/API/database tests remain required.

## Multistep transitions and resumable draft ownership

A wizard needs one canonical draft plus explicit transitions. Separate validation scope for Next from complete validation for final save. Back preserves entered data; editing invalidates derived availability; a restored draft is revalidated and is not an authenticated/approved submission.

```ts
// wizard.ts — UI-independent transition core; import scheduleErrors from './schedule'.
type Values = { title: string; slug: string; start: string; end: string };
type Wizard = {
  step: 'details' | 'schedule' | 'review'; values: Values; dirty: boolean;
  submission: 'idle' | 'saving' | 'done'; errors: Record<string, string>;
};
type Event = { type: 'edit'; field: keyof Values; value: string } |
  { type: 'next' | 'back' | 'save' | 'success' | 'failure' };
export function detailErrors(values: Values): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.title.trim() || values.title.trim().length > 100) errors.title = 'Enter a title of1–100characters';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug) || values.slug.length > 80) errors.slug = 'Use a short lowercase slug';
  return errors;
}
export function wizardTransition(state: Wizard, event: Event): Wizard {
  if (event.type === 'success') return state.submission === 'saving'
    ? { ...state, submission: 'done', dirty: false, errors: {} } : state;
  if (event.type === 'failure') return state.submission === 'saving'
    ? { ...state, submission: 'idle', errors: { root: 'Save not confirmed; draft retained' } } : state;
  if (state.submission !== 'idle') return state;
  if (event.type === 'edit') return { ...state, values: { ...state.values, [event.field]: event.value }, dirty: true, errors: {} };
  if (event.type === 'back') return { ...state, step: state.step === 'review' ? 'schedule' : 'details', errors: {} };
  const details = detailErrors(state.values);
  const schedule = scheduleErrors(state.values.start, state.values.end);
  if (event.type === 'save') {
    if (state.step !== 'review') return state;
    const errors = { ...details, ...schedule };
    return Object.keys(errors).length ? { ...state, step: Object.keys(details).length ? 'details' : 'schedule', errors }
      : { ...state, submission: 'saving', errors: {} };
  }
  if (event.type === 'next') {
    const errors = state.step === 'details' ? details : schedule;
    return Object.keys(errors).length ? { ...state, errors }
      : { ...state, step: state.step === 'details' ? 'schedule' : 'review', errors: {} };
  }
  return state;
}
```

```tsx
// CourseWizard.tsx — combine with the pure transition/validation module above.
import { useEffect, useId, useReducer, useRef, type FormEvent } from 'react';
// import { wizardTransition, detailErrors } from './wizard';
// import { scheduleErrors } from './schedule';
export function CourseWizard({ save }: { save: (values: Values) => Promise<void> }) {
  const initial: Wizard = { step: 'details', values: { title: '', slug: '', start: '', end: '' },
    dirty: false, submission: 'idle', errors: {} };
  const [state, dispatch] = useReducer(wizardTransition, initial);
  const busy = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const id = useId();
  useEffect(() => { heading.current?.focus(); }, [state.step]);
  useEffect(() => {
    if (Object.keys(state.errors).length) form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state.errors]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy.current || state.submission !== 'idle') return;
    if (state.step !== 'review') { dispatch({ type: 'next' }); return; }
    const errors = { ...detailErrors(state.values), ...scheduleErrors(state.values.start, state.values.end) };
    dispatch({ type: 'save' });
    if (Object.keys(errors).length) return;
    busy.current = true; // Immediate local duplicate-event guard; server still needs integrity rules.
    try { await save({ ...state.values }); dispatch({ type: 'success' }); }
    catch { dispatch({ type: 'failure' }); }
    finally { busy.current = false; }
  }
  if (state.submission === 'done') return <p role="status">Course save confirmed.</p>;
  const fields = state.step === 'details' ? ['title', 'slug'] as const : ['start', 'end'] as const;
  return <form ref={form} noValidate onSubmit={submit}>
    <h2 ref={heading} tabIndex={-1}>Course: {state.step}</h2>
    <p>Step {state.step === 'details' ? 1 : state.step === 'schedule' ? 2 : 3} of3</p>
    <fieldset disabled={state.submission === 'saving'}><legend>{state.step === 'review' ? 'Review all values' : 'Course fields'}</legend>
      {state.step === 'review' ? <dl>{Object.entries(state.values).map(([key, value]) =>
        <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl> : fields.map(field => <div key={field}>
        <label htmlFor={`${id}-${field}`}>{field}</label>
        <input id={`${id}-${field}`} type={field === 'start' || field === 'end' ? 'date' : 'text'}
          maxLength={field === 'slug' ? 80 : field === 'title' ? 100 : undefined}
          value={state.values[field]} aria-invalid={!!state.errors[field]}
          aria-describedby={state.errors[field] ? `${id}-${field}-error` : undefined}
          onChange={event => dispatch({ type: 'edit', field, value: event.target.value })} />
        {state.errors[field] && <p role="alert" id={`${id}-${field}-error`}>{state.errors[field]}</p>}
      </div>)}
      {state.step !== 'details' && <button type="button" onClick={() => dispatch({ type: 'back' })}>Back</button>}
      <button type="submit">{state.step === 'review' ? 'Save course' : 'Next'}</button>
    </fieldset>
    {state.errors.root && <p role="alert">{state.errors.root}</p>}
    <p role="status">{state.submission === 'saving' ? 'Saving course…' : state.dirty ? 'Unsaved draft' : ''}</p>
  </form>;
}
```

The component expects the shared types/helpers above (export/import them when splitting files); the save port must enforce the server contract and have a bounded completion policy. Availability is advisory status alongside the slug field, not a boolean that bypasses final save validation. Add the async checker and recovery owner from the surrounding sections to complete the full exercise. Final validation routes errors back to details or schedule before the focus Effect runs, including invalid recovered/external state.

The reducer models synchronous transition/validation, not network effects. The submit event owner must avoid issuing a second request when state did not transition idle→saving, and use a server idempotency/version contract for integrity. Dispatch success only after confirmed commit; an ambiguous failure retains dirty data. The final server request revalidates slug availability/relationships/authorization rather than trusting a review-step flag. Bound field inputs at the UI and server; a reducer type alone does not bound arbitrary strings from storage/network.

Build labeled details and schedule fieldsets plus a review view, with a visible step heading/progress list and actual Back/Next buttons. Focus the new heading or first invalid field intentionally; announce validation without reading every keystroke. Keep one form/draft owner when step fields unmount, choosing RHF unregister behavior deliberately. The reducer is the state mechanism; mounting screens and API effects is separate integration work. Do not hide an invalid required field then call the entire form valid.

For recovery, use the versioned, user-scoped, expiring draft example in the [storage note](../Communication_and_Security/Advantages_and_disadvantages_of_local_and_session_storage.md). Restore into the details step and revalidate rather than trusting saved completion/error/pending flags. Compare server record version before resuming an edit. Prefer server-owned drafts for sensitive/cross-device work; temporary local storage is an explicit usability/privacy decision.

**Wizard acceptance:** Next validates only intended fields, final save validates all fields, Back preserves values, reload offers rather than silently applies a valid scoped draft, corrupt/future/expired/other-user drafts never hydrate, restored data cannot bypass authorization, failing save preserves values, confirmed save clears the matching draft and dirty baseline. Test two tabs and record conflict policy. Pure reducer tests are not a completed interactive form; learner integration remains required.

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

**Navigation acceptance:** internal link/back navigation prompts; Stay/Escape keeps the current draft/focus; Leave goes to the originally blocked destination once; confirmed save/discard removes the blocker; external/reload paths have documented limitations and recovery; modal keyboard/focus/announcement behavior is recorded. Check StrictMode setup/cleanup and multiple instances. No browser blocker/dialog test is claimed by code syntax validation.

References checked2026-10-21: [Zod refinements](https://zod.dev/api#refinements), [ReactRouter7 blocker](https://reactrouter.com/7.18.4/api/hooks/useBlocker), [HTML dialog](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element), [unload events](https://html.spec.whatwg.org/multipage/nav-history-apis.html#the-beforeunloadevent-interface), [Web Storage](https://html.spec.whatwg.org/multipage/webstorage.html).
