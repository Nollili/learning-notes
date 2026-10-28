# Tenant-Scoped Sources and Safe Output Sinks

Continue [task-scoped injection containment](./prompt-injection-boundaries.md), [evidence verification](./retrieval-context.md) and [approved writes](./approved-writes.md). This intermediate Python3.13/SQLite lab narrows the actual source-read and display boundaries. It does not execute model code, submit a provider request or claim that an approved document is factually correct.

## Isolation is a property of every artifact

A source ID such as `shared_id` can exist in two tenants. Resolve it using the current authenticated tenant and subject in the database predicate, not by reading an unscoped record and hoping later code remembers to filter it. Task scope is an additional restriction; it never overrides tenant/ACL checks. Tenant identity comes from the server-owned session/token mapping, not a generated tool argument or request body. Missing and inaccessible resources have the same safe unavailable response.

Apply the same scope to source bytes, chunks/vectors, job state/checkpoints, approvals/receipts, caches, histories, batch manifests, traces and citation-open routes. The existing vector lifecycle, scoped graph memory, approval executor and cache identity lessons implement different parts of this contract; a source query alone cannot secure the whole application. A shared privileged connection also needs narrow query APIs, current authorization and credential isolation. Database row-level policy or separate stores can add defense in depth, but have their own provisioning/connection-pool/context tests; this SQLite fixture does not implement them.

## Separate publication authority from model reads

The scratch source catalog uses the following schema. Run setup/seeding only on an owned disposable database through a trusted administrative connection. The runtime reader opens that existing database read-only; it has no publish/review/ACL tool. Schema initialization and publication are deliberately absent from its public API.

```sql
CREATE TABLE reviewed_sources(
  tenant TEXT NOT NULL, source TEXT NOT NULL, revision TEXT NOT NULL,
  text TEXT NOT NULL,
  state TEXT NOT NULL CHECK(state IN('pending','published','quarantined')),
  submitted_by TEXT NOT NULL, reviewed_by TEXT, approved_digest TEXT,
  PRIMARY KEY(tenant,source)
);
CREATE TABLE source_acl(
  tenant TEXT NOT NULL, source TEXT NOT NULL, subject TEXT NOT NULL,
  PRIMARY KEY(tenant,source,subject)
);
```

The catalog's reviewed identity/digest/state fields must be written by an authenticated authorized governance workflow. A client or model setting `reviewed_by="reviewer"` is not a real review. The two-identity check below is a small policy invariant, not an authentication system. In a deployed service enforce separate submit/review permissions, exact-revision approval, audit and publication/revocation transactions in the trusted write service. The fixture tests seed these records; no person is credited with approving them.

<<< ../workbench/applied-ai/python/study_ai/secure_note_reader.py


Construct one reader from the authenticated principal and server-reviewed source-selection set, and call only `run(name, arguments)` from the model dispatcher. Close it in `finally`. Its synchronous SQLite access needs an owned serialized execution context; do not share the connection across arbitrary FastAPI threads or block an async event loop with large scans. The0.2-second SQLite timeout is not a complete request deadline. The store path and parent directory are deployment-owned, never model-selected; failure to open an existing database must not create a new empty one.

The `mode=ro` connection refuses writes even if a caller turns off query_only. This is narrower than handing the model a generic database executor. It is not an OS sandbox: a compromised Python process with filesystem authority could reopen the file differently. Deploy separate read credentials/process/file permissions where needed and minimize what the process can access. Do not make arbitrary SQL, shell, file paths or network tools available as a “fallback.” `get` and `db` are adapter internals/test seams, not public model capabilities.

## Treat a model result according to its destination

The renderer consumes the checked answer DTO, enforces a display budget and escapes text into fixed HTML text nodes. Code fences, Markdown links, script/image tags and proposed commands stay literal text. The renderer does not auto-link URLs, execute Python/JavaScript/SQL or interpret Markdown. Serve the result with a correct HTML content type and the application's CSP; this function is only the body fragment, not a complete HTTP/security-header implementation. In React, render strings as ordinary JSX text; do not insert raw model output with dangerouslySetInnerHTML. The existing streaming UI accepts a validated terminal result rather than treating partial tokens as successful output.

If a product needs rich Markdown, define a constrained renderer, sanitize generated HTML with a maintained sanitizer, disable raw HTML where possible, control URL protocols/remote images, and test the actual browser sink. HTML escaping is context-specific: it cannot make a string safe inside JavaScript, CSS, SQL or a shell. For database changes use fixed parameterized commands and current resource checks; for writes retain the exact human approval/version/idempotency contract. A fenced code block is a proposal to review, not authorization to run it. A schema-valid tool call still needs capability and business-policy checks.

Citation text here has no clickable link. A real citation route constructs an application-owned target from a checked source identity and reauthorizes on open. Never use a generated URL as trusted navigation or load a model-suggested remote image to display an answer. Escaping blocks active HTML in this sink; it does not detect false claims, phishing in plain language or secrets already allowed into the answer.

## Poisoning and integrity are different questions

Training-data poisoning changes what a model learns; RAG corpus poisoning changes the evidence a retrieval system supplies without retraining weights. An injected false “official policy” can produce a well-cited but wrong answer even when the model follows its instructions. Attackers may target source ownership, ingestion, ranking, duplicate crowding or review artifacts. A content hash detects a change relative to an approved snapshot; it does not establish that the snapshot is true, safe or current.

Use pending→reviewed publication→quarantine/replacement with accountable source owners, exact version/provenance, change review and regression labels. A new revision must not inherit approval from the old one just because the source ID stayed the same. The reader requires the published text's hash to match its approved digest/revision; tampering becomes an operational failure, not a cached-text fallback. Quarantine or ACL revocation removes current access. Derived vectors/caches and in-flight publication need the source-version checks described in the lifecycle/evidence lessons.

Worked case: a submitted note says “disable authentication to fix the login issue.” A reviewer must assess source authority and the claim; valid UTF-8, a stable hash and a plausible title are insufficient. Leave it pending or quarantine it with a fixed reason category; preserve the last accepted **current and authorized** version only under an explicit version policy, never silently resurrect revoked content. Investigate affected queries/citations, compare the reviewed corpus snapshot, repair the ingestion/review boundary and add a minimized regression. Do not automatically train on model feedback or retrieved text that has not passed its own data-governance process.

This lab tests state/integrity enforcement, not automatic truth/poisoning detection.

## Real-file and parser checks

<<< ../workbench/applied-ai/python/lab_tests/test_secure_note_reader.py

[Separate learner criteria](../practice/applied-ai/chapters/source-and-output-security.md).

**Validation performed:** exact reader/renderer passed strict mypy. Eleven offline tests passed:8 real-file/parser cases plus3 existing task-scope cases. They cover same source ID in two tenants, current ACL/revocation, forbidden owner override, read-only mutation denial, missing-file behavior, publication/review/digest gates and fixed-tag HTML parsing for hostile output. The initial fixture had an incorrect INSERT placeholder count; it was corrected before the final successful run and before embedding. No browser, real authentication/governance UI, OS sandbox, deployed multi-tenant service or semantic poisoning detector was tested.

Authoritative references checked2026-10-25: [OWASP improper output handling](https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/), [data/model poisoning](https://genai.owasp.org/llmrisk/llm042025-data-and-model-poisoning/), [excessive agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/), [Python SQLite URI/connection documentation](https://docs.python.org/3.13/library/sqlite3.html). The implemented fixture supplies the local measurements above.
