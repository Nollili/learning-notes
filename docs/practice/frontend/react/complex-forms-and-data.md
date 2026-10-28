# Practice: Complex Forms and Remote Data: Ownership, Validation and Optimistic Edits

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/React/complex-forms-and-data.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Failure exercise:** retain a deterministic A/B schedule with A failure after B success, B failure after A success, two successes with increasing versions and an ambiguous response-lost commit. Acceptance: a failed earlier operation cannot restore stale data over later confirmation; stale pending versions do not mask new truth; conflicts preserve the draft; cache invalidation scopes are correct; no automatic write retry. Explain which behavior is guaranteed by the pure projection, Query lifecycle and server transaction respectively. Actual library/API overlap testing remains required.

**Form exercise:** implement the endpoint and editor, simulate validation/conflict/operational failure and a background record update while dirty. Acceptance: whitespace/overlength input fails before request; bypassed client validation is rejected server-side; default/reset policy is explained; draft survives failure; saved version changes only after confirmation; first invalid input receives focus and its message is associated/announced; keyboard submit/pending/recovery work; no authorization from client user IDs. Add a safe status for confirmed save rather than treating “Ready” as proof of persistence. Continue with the dependent-validation, wizard and navigation sections below.

**Hydration exercise acceptance:** two authenticated requests receive only their own authorized DTO/cache, matching server/client keys avoid accidental duplicate initial loading, refetch respects chosen freshness, logout removes prior private state, production hydration has no mismatch, and errors/secrets do not serialize into HTML/RSC. Retain actual Next/Query typecheck/build/browser evidence; this repository only builds the learning pages.

**Acceptance:** test leap years/invalid dates/end-before-start, changing start after a valid end, empty dependent fields, response A arriving after B, adapters ignoring abort, timeout/network/invalid JSON, scope changes and unmount. Only the current check may update state; unknown failures never become success; a concurrent slug claim still fails at the server boundary and returns an associated field error. Real resolver/UI/API/database tests remain required.

**Wizard acceptance:** Next validates only intended fields, final save validates all fields, Back preserves values, reload offers rather than silently applies a valid scoped draft, corrupt/future/expired/other-user drafts never hydrate, restored data cannot bypass authorization, failing save preserves values, confirmed save clears the matching draft and dirty baseline. Test two tabs and record conflict policy. Pure reducer tests are not a completed interactive form; learner integration remains required.

**Navigation acceptance:** internal link/back navigation prompts; Stay/Escape keeps the current draft/focus; Leave goes to the originally blocked destination once; confirmed save/discard removes the blocker; external/reload paths have documented limitations and recovery; modal keyboard/focus/announcement behavior is recorded. Check StrictMode setup/cleanup and multiple instances. No browser blocker/dialog test is claimed by code syntax validation.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
