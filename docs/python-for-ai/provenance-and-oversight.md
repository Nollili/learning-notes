# Provenance, Human Oversight and Audit Evidence

Use the existing [evidence resolver](./retrieval-context.md), [approved command executor](./approved-writes.md) and [projected workflow traces](./workflow-diagnostics.md). This intermediate lesson connects their meanings. A citation is not proof of truth; an approval is not a model message; a diagnostic event is not a durable business receipt.

## Follow identities across the workflow

| Boundary | Retained identity/version | What the record establishes and does not establish |
|---|---|---|
| Source acquisition | Authorized source ID, immutable bytes hash, origin/owner and acquisition policy | Which bytes were acquired, not their factual correctness |
| Extraction/chunking | Extractor/chunk policy, locator and exact code-point span | Reconstructable excerpt, not a semantic entailment judgment |
| Retrieval | Authenticated scope, index/embedding generation, query/policy version and retained candidate IDs | Which permitted candidates were selected; avoid content-bearing logs by default |
| Prompt/generation | Application prompt/schema/model/settings revision, accepted evidence snapshot and run ID | Reproducibility metadata; stochastic/provider drift can still change output |
| Validation/review | Checked schema/citations plus separately reviewed claim-support outcome | Mechanical validity and human judgment remain distinct |
| Proposed write | Canonical command hash, resource/expected version and local operation ID | Exact proposed change; the hash alone is not consent |
| User decision | Authenticated actor, exact command binding, decision/expiry and policy | The authorized approval workflow's recorded decision, not a text assertion from a model |
| Execution | Current authorization/version and authoritative receipt | What committed in that transaction domain, not guaranteed external side effects |
| Display/citation open | Current source permission and safe application-owned target | Safe/current access at the checked boundary, not perpetual authorization |

Retain enough provenance to explain a result and investigate failures without copying the whole private corpus into every system. References can themselves reveal private membership; scope access to audit/provenance stores. For reproducible restricted investigations, use approved immutable artifacts with explicit retention/access rather than assume raw source/prompt logging is mandatory. The source lifecycle and cache lessons cover update/deletion and current-version checks.

## Human oversight must happen at an actionable decision

For a rename, show the current resource/title, exact proposed title, expected version, scope and consequences. Explain that the model proposes and the authenticated user decides. Offer clear approve/reject/edit actions, do not bury a write inside a generic “continue” control. Editing changes the command and needs a fresh digest/approval. A reviewer needs relevant source evidence and a usable diff; dumping thousands of tokens or repeatedly asking for trivial approvals can encourage rubber-stamping.

The existing approval executor is the concrete local enforcement: it rechecks current tenant/subject/version and stored exact approval, commits mutation plus receipt atomically, and returns the original receipt on exact replay. Fixture-seeded rows do not represent a real human decision. Build the actual authenticated/CSRF-protected confirmation route separately; the model/tool allowlist must not contain an approve-my-own-proposal capability. A message saying “the user said yes” or a boolean in a model DTO has no approval authority.

Define which actions are read-only, proposal-only, explicitly approved or disallowed. Higher-impact publication, deletion, access changes and external writes require a reviewed policy; do not infer that one approval authorizes a chain of later actions. Use least privilege even after approval. Rejected/expired/stale/unknown outcomes need distinct recovery UI. If the authoritative service cannot determine whether a write happened, stop in unknown and reconcile; a human clicking retry must not silently create a different operation.

## Durable audit differs from a diagnostic buffer

The existing bounded SafeTrace drops old events and counts drops. That is appropriate for a small diagnostic fixture, not an audit history. An audit needs a defined event contract, owner, reliable persistence, controlled readers/writers, retention/integrity policy and operational failure handling. Record safe action/reference metadata and the actual decision/outcome; do not invent a committed event when all you have is a proposed action or a timed-out request.

The following Python3.13/Pydantic2/SQLite fixture stores projected events in a real file. Stable event IDs make replay idempotent; a changed payload under the same ID is a conflict. Recorded time comes from the server clock. The small event vocabulary requires references for source verification, approval and committed/unknown execution. No free-text prompt/result/error field exists.

<<< ../workbench/applied-ai/python/study_ai/audit_record.py


Use a disposable exclusively owned connection in its normal legacy transaction mode with a short lock timeout and no pending transaction. Initialize once as a migration step; the intentionally non-idempotent setup must not be run on an existing deployed catalog. Close/discard the owner on initialization/rollback failure. Appends acquire a writer lock, match an existing exact event or save one new event in a transaction. The table triggers reject ordinary UPDATE/DELETE, but an administrator could remove them or alter the file; this is not tamper-proof/WORM storage, a cryptographic audit chain or independent proof an event happened.

The service producing an event must verify its authoritative source/approval/receipt first. The audit store records a claim from that trusted service; it does not authenticate the actor or execute the business operation. Opaque actor references are pseudonymous, not anonymous. In a shared deployment include tenant/account ownership in the protected audit service and enforce reader authorization; do not serve this unscoped scratch table as a global audit API. Bound admission and storage growth; a safe schema does not prevent an event flood.

Appending separately after a business transaction can fail after the write committed. Choose a transactionally coupled outbox/audit record when durable event capture is required, or an explicit fail/reconcile policy appropriate to the action. Do not wrap the existing executor in another with-db block and assume nested commits compose: refactor one transaction owner or add the outbox inside its actual transaction. A log-write failure must never cause a blind repeat of an already committed operation. This fixture does not implement that coupling or an external audit export.

## Worked interruption and review record

A verified source revision supports a proposed rename. The user approves the exact command; the executor commits but its network response is lost. The workflow initially records execution_unknown with the command reference, not a fabricated receipt. After reauthentication/current authorization, the same operation ID resolves to the original receipt; record a new execution_committed event referring to that receipt. Keep the earlier unknown event—it describes what was known then. Do not overwrite history to make the run look successful throughout. If source/approval/permission changed, preserve denial/reconciliation rather than fabricate a fresh approval.

A protected investigation can join job ID→source version→command hash→approval record→operation receipt and compare actual outcomes with the visible UI state. It must not infer causation or user consent solely from the sequence number. Sequence is local append order; provider/clock/network events can arrive late. Record trusted event-time metadata separately when the product requires it, with a defined clock/order policy.

<<< ../workbench/applied-ai/python/lab_tests/test_audit_record.py

[Separate learner criteria](../practice/applied-ai/chapters/provenance-and-oversight.md).

**Validation performed:** exact audit module passed strict mypy. Nine offline tests passed real-file reopen/replay, append-only trigger policy, identity conflict, projected/reference schema failures, unknown-versus-committed events, UTC record time and rollback on injected append failure. Existing approval material was fully read and reused; no live person, business/audit transaction coupling, deployed tenant audit service, tamper-proof storage or external export was tested.

Authoritative references checked2026-10-25: [OWASP transaction authorization](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html), [logging design and sensitive-data exclusions](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html), [Python SQLite transactions](https://docs.python.org/3.13/library/sqlite3.html). These references guide the boundaries; the fixture's tests establish only its stated local behavior.
