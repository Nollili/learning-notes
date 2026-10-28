# Express and Layered Architecture — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/module-06-express-architecture.md) · [Node.js practice map](./index.md)

### Diagnostic exercise

Design an order endpoint that reserves stock, records an order, and requests payment.

Explain:

- the database transaction boundary;
- why the payment call is outside that transaction;
- how an outbox event is recorded;
- how duplicate requests are handled;
- where authorization is checked;
- what happens after a crash at every step;
- which failures return immediately and which become asynchronous states.

---

## 16. Final review checklist

### Use-case reliability

- [ ] Put a transaction around repository operations that share one invariant.
- [ ] Keep slow external calls outside database transactions.
- [ ] Explain the outbox pattern and idempotent consumers.
- [ ] Store an idempotency result atomically with the business change.
- [ ] Pass actor, tenant, deadline, and cancellation context deliberately.
- [ ] Enforce critical authorization outside route middleware as well.
- [ ] Analyze partial success and crash points in a multi-step workflow.

### Express fundamentals

- [ ] Explain what Express adds on top of `node:http`.
- [ ] Create an application and keep `app` separate from `listen()`.
- [ ] Read path parameters, queries, headers, and parsed request bodies.
- [ ] Use appropriate response helpers and status codes.
- [ ] Define resource-oriented routes and modular routers.

### Middleware and errors

- [ ] Explain why middleware order matters.
- [ ] Ensure every middleware path continues, responds, or errors.
- [ ] Distinguish application-, router-, and route-level middleware.
- [ ] Register 404 and error handlers after routes.
- [ ] Explain Express 5 and Express 4 async-error behavior.
- [ ] Return a consistent safe error representation.

### Architecture

- [ ] Keep HTTP logic in routes/controllers.
- [ ] Keep business rules and orchestration in services.
- [ ] Keep persistence details in repositories.
- [ ] Enforce downward dependency flow.
- [ ] Use interfaces or injected dependencies where substitution helps.
- [ ] Organize code by feature while preserving layer responsibilities.

### Validation and security

- [ ] Validate runtime input even when TypeScript types exist.
- [ ] Validate body, params, query, and relevant headers.
- [ ] Use parsed/validated output rather than the original input.
- [ ] Reject or strip unknown fields deliberately.
- [ ] Separate transport validation from business rules.
- [ ] Use parameterized queries, size limits, authorization, and safe output handling.

## Correction labs: contracts that the complete API must satisfy

Baselines checked2026-10-21: Express5.3.0, Zod4.6.7 (defaults inside optional fields), Node24.18.0; the complete extracted Products API also typechecked with TypeScript5.9.3 strict/exact-optional/indexed-access checks. Keep the actual installed package versions/lockfile with results. The scratch validation environment is separate from this notes repository and does not change Autocode templates or src/tests.

**PATCH acceptance:** creation without stock yields0; name-only PATCH output has no stock key and preserves existing stock; explicit stock0 updates correctly; empty/unknown/id/sku/undefined/null-field patches reject according to the stated schema. Normalized parsed output, not raw req.body, reaches the service. Validate returned object keys as well as values.

**Uniqueness acceptance:** launch two service.create calls with the same normalized SKU through one real in-memory repository; require one success, one ConflictError, one stored row. Delete then recreate works. Prove that mutating a returned Product does not mutate stored primitives. Repeat the contract against the real database adapter with its unique constraint; the in-memory no-await section is not a distributed lock.

**Transport acceptance:** malformed JSON→400, oversized entity→413, unsupported charset/encoding→415, schema error→the declared400 policy, and unexpected programmer TypeError→500. Do not expose parser body/stack in responses/logs. Assert headersSent forwards to next once. The fail-closed auth scaffold cannot pass private requests; install and test a real verifier separately. Check safe route logs with a sensitive query and unmatched route; no raw query may be recorded. Exercise startup invalid-port/error/partial-cleanup and bounded shutdown in the lifecycle lesson; this introductory server snippet does not implement all of those yet.

**Idempotency acceptance:** the same scoped key+same normalized input replays only a completed response; different input conflicts; an atomic concurrent claim allows at most one business insertion; rollback/crash-before-commit creates neither partial business state nor a visible completed response. Record actual persistence isolation/retention behavior and replay authorization. A port/fake test cannot establish durable atomicity. Learner implementation and real DB/Express deployment evidence remain required.

Official references: [Zod4 optional defaults](https://zod.dev/v4/changelog#defaults-applied-within-optional-fields), [Express5 errors](https://expressjs.com/en/guide/error-handling/), [body-parser error types](https://expressjs.com/en/resources/middleware/body-parser/#errors), [PostgreSQL INSERT conflict handling](https://www.postgresql.org/docs/current/sql-insert.html).

**Acceptance drill:** strict-typecheck draft/published/outcome narrowing and reject missing publication data or a draft passed to the published DTO mapper. At runtime reject invalid dates, mismatched state/date, unsafe/fractional/negative money and malformed identity. Feed a row/variable containing supplier cost, internal note, tenant and driver metadata; assert the exact public JSON keys contain none of them. Mutate the original Date after mapping and verify the domain ISO string stays unchanged.

Assert draft/wrong-tenant/absent all present as404, published as200 and no other status leaks into domain types. Add an outcome and observe a never diagnostic. Then repeat through the real repository/controller with tenant-scoped queries and a simulated database outage. The pure mapping checks do not establish server authorization, transactional storage or learner practice.

**Practice acceptance:** build a service using the primary composition owner, inject invalid configuration, occupied-port failure, dependency acquisition failure and a later partial-startup failure. Assert owned cleanup and a nonzero outcome without leaking configuration. Test parser statuses and headersSent delegation, then reproduce the shared shutdown failure/drain/deadline cases in disposable processes. Record exactly which dependencies are real. No `src/tests` changes or remote push are permitted; independent learner practice remains required.
