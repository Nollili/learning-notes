---
outline: [2, 2]
---

# Hardening and Optimizing Node.js Services at a glance

One short reminder for each of the **26 questions** in this section. Use the topic links to return to the full answers and diagrams.

## Security

- [Threat models](./14-security.md#t14-q01): **For each realistic threat, name the asset, trust boundary, control and test.** Enforce controls at protected operations reached through HTTP, jobs or internal callers.
- [Different input defenses](./14-security.md#t14-q02): **Validation checks data; SQL binding separates values; output encoding matches the destination; CSRF defenses protect cookie-authenticated actions.** One generic sanitizing function cannot replace these boundaries.
- [SSRF](./14-security.md#t14-q03): **Prefer server-controlled destinations instead of arbitrary caller URLs.** Enforce policy at actual connection and redirect boundaries; a parsed HTTPS URL alone proves no permission.
- [TLS, secrets and encryption](./14-security.md#t14-q04): **TLS protects verified connections; secret management controls key access; authenticated encryption protects stored data and detects changes.** Encryption does not authorize use or repair leaked keys.
- [Passwords and abuse](./14-security.md#t14-q05): **Use maintained, salted, deliberately expensive password hashing and bound verification work.** Protect attempts and recovery; fast hashes and reversible encryption are unsuitable password storage.
- [Scanner findings](./14-security.md#t14-q06): **Different scanners provide partial evidence about different risks.** Review reachability and fix impact, make focused corrections and test compatibility instead of blindly forcing upgrades.
- [Framework hardening](./14-security.md#t14-q07): **Helmet configures browser-facing headers, not record permissions or credential verification.** Test effective responses alongside parsing, proxy, cookie, safe-error and resource-limit policies.
- [Hostile code](./14-security.md#t14-q08): **A VM context, worker, child process or container name alone does not establish a safe sandbox.** Prefer constrained data languages; hostile execution needs reviewed isolation and external limits.

## Advanced authentication

- [OIDC login binding](./13-authentication-and-authorization.md#t13-q06): **Bind a short-lived, one-use login attempt to its browser, provider and callback.** Verify through a maintained client before local account checks and session creation.
- [Token profiles and key rotation](./13-authentication-and-authorization.md#t13-q07): **A token's kid selects among trusted keys, not arbitrary downloads.** Verify purpose, issuer, audience and time; bounded rotation must deny unverifiable authenticity.
- [Refresh and revocation races](./13-authentication-and-authorization.md#t13-q08): **Consume refresh credentials atomically using durable family state.** Valid signatures can outlive current permissions; sensitive writes may need coordinated current-version checks.

## Performance and V8

- [V8 diagnostics](./12-performance-and-v8.md#t12-q01): **V8 adapts execution using workload observations; engine internals can change.** Use supported diagnostics and measured profiles before relying on engine-specific optimization tricks.
- [Load tests and CPU profiles](./12-performance-and-v8.md#t12-q02): **Load tests measure service outcomes; profiles attribute sampled CPU work.** Slow requests with little CPU may instead be waiting on pools, locks or dependencies.
- [Performance signals](./12-performance-and-v8.md#t12-q03): **Request latency, loop delay, loop utilization and CPU usage measure different things.** Compare them over the same interval with dependency and memory evidence.
- [Memory retention](./12-performance-and-v8.md#t12-q04): **Garbage collection cannot reclaim reachable data.** A small Buffer view can retain a large allocation; copying changes ownership but costs allocation and execution work.
- [CPU and overload](./12-performance-and-v8.md#t12-q05): **Promises do not move CPU work to another core.** Reduce the measured work, choose bounded chunks or workers where appropriate, and limit admission before queues grow.
- [Cache correctness](./12-performance-and-v8.md#t12-q06): **Define source of truth, key scope, freshness, invalidation and failure behavior first.** Bound entries and simultaneous source loads; a fast cross-tenant or stale answer is still wrong.
- [Framework optimization](./12-performance-and-v8.md#t12-q07): **Measure the full request path before replacing the framework.** Reduce demonstrated query, conversion, payload or logging costs while preserving permissions, validation and cleanup.

## Deeper data access

- [Isolation invariants](./17-databases.md#t17-q09): **Test overlapping independent transactions against the business rule.** Stable snapshots can allow write skew; serializable aborts need bounded whole-transaction retries with fresh decisions.
- [Keyset pagination](./17-databases.md#t17-q10): **Use a stable ordering key with a unique tie-breaker and tenant restriction on every page.** Verify actual plans and results; cursors are not access permission.
- [Locks and migrations](./17-databases.md#t17-q11): **Distinguish pool wait, lock wait and execution before increasing connections.** Give migrations one owner, bounded lock waits and a defined application-compatibility and rollback window.

## Advanced APIs and frameworks

- [Process supervision](./16-advanced-api-frameworks.md#t16-q14): **Readiness, task result, IPC disconnect and closure are different protocol facts.** Stop admission before bounded shutdown and budget resources across all processes.
- [File publication](./16-advanced-api-frameworks.md#t16-q15): **Complete visibility, overwrite prevention and crash durability are separate guarantees.** Finish private output before the chosen publication operation, and retain the known outcome even if cleanup fails.
- [Bounded streaming](./16-advanced-api-frameworks.md#t16-q16): **Await a pipeline with backpressure and limits for each relevant representation.** Cancellation must reach real adapters; sent HTTP headers and completed external effects cannot simply be retracted.
- [Authenticated decryption](./16-advanced-api-frameworks.md#t16-q17): **GCM update output is tentative until the final tag check succeeds.** Keep plaintext private until verification; a later failure cannot undo effects triggered too early.
- [Equivalent optimization](./16-advanced-api-frameworks.md#t16-q18): **Change one measured cost while preserving results and failure behavior.** Repeat realistic comparisons; avoiding repeated work does not prove one framework is universally faster.

## Put it into practice

[Harden and optimize your service](./progressive-projects.md#project-4-hardened-service): start from passing behavior, demonstrate a risk or bottleneck, apply one focused change and retain correctness plus measured evidence.
