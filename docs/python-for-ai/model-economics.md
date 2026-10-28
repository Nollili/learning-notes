# Model Task Economics and Shared Reservations

Continue [usage/latency measurement](./evaluation-measurements.md) and [bounded workflows](./tool-workflow-state.md). This intermediate Python lesson compares complete task policies, not model token prices alone. All money examples use **hypothetical integer micro-USD**, not current provider rates, a real invoice or a purchasing recommendation. The existing Decimal usage calculator remains the accounting source; do not add cached/reasoning subsets twice.

## Count the whole user task

A task may include query rewriting, retrieval/embedding, generation, tool calls, retries, reranking, verification/judge calls and storage/network work. Attach each attempted operation to the job and policy version. Aggregate failed/cancelled/partial work and unknown usage; a missing final stream usage record is not a free call. Reconcile estimated spend against the actual selected provider contract and billing. Include background indexing/evaluation separately and decide how shared overhead is allocated before comparing products.

The earlier fixture costs2500 micro-USD per attempt. A three-stage planner→worker→judge workflow at that same fictional per-call cost is7500 before retries. If each stage allows up to three attempts, its **maximum** is9 calls/22500; the observed count may be lower. Branching to two workers and judging each branch changes the call tree again. A loop that repeatedly includes growing history can increase input cost per call, so call count alone is not a cost ceiling. Bound route/depth/attempts, payload/context/output, provider time and tool fees together; do not infer a safe maximum from average usage.

Define denominators explicitly: total known spend across all tasks, unknown-charge tasks, accepted/successful task count, cost per accepted task, failure cost and deferred work. Four scheduled tasks with three accepted outcomes and spend24000 have observed cost per accepted task8000, but one failed task remains a quality loss. Reporting only the three successful call costs would hide it. Small synthetic samples do not estimate a real workload's expected cost.

## Route only within a measured capability envelope

Keep one capable default configuration and a cheaper alternative for an explicitly bounded task slice. For example, a deterministic validated classification may use a smaller model, while a multi-source comparison uses the capable route or human review. Risk, required modality/context/tools, permissions, latency and expected task difficulty shape routing. Do not send private data to another provider just because its price is lower. Routing classification can itself be wrong and costly; include that stage and evaluate its mistakes.

A schema failure can trigger a bounded fallback; a plausible but false schema-valid answer often cannot. Model self-reported confidence is not a calibrated correctness detector. Use reviewed development labels, explicit uncertainty/coverage policy and a held-out confirmation set. Fallbacks consume additional cost and latency; a deadline may leave no budget for the second route. Apply the same current access and safety gates to every route. Never downgrade authorization or output validation to make a cheap route pass.

| Authored four-task policy | Hypothetical total micro-USD | Reviewed accepted tasks | Decision under all4-correct gate |
|---|---:|---:|---|
| Capable baseline:4×10000 |40000|4|Reference |
| Cheap-first:4×1000 plus2×10000 fallbacks |24000|3|Reject despite lower spend; one fluent error escaped fallback |
| Reviewed slice route:2×1000 plus2×10000 |22000|4|Eligible for further held-out testing, not established superiority |

These labels are hand-authored to teach the decision. No live model accuracy or real savings were measured. Use paired cases/slices, repeat policy, denial/leakage hard gates and rollback configuration from the evaluation lesson. Quality is a prerequisite; then compare cost/latency within an acceptable quality envelope rather than average them into a score that hides a security failure.

## Reserve before starting work

A post-hoc sum does not stop two concurrent jobs from spending the same local allocation. The following real-file SQLite fixture reserves an integer maximum atomically across connections. A fixed account/allocation owns the file; initialization is a privileged one-time operation. Job IDs are application-owned stable identities bound to immutable workflow/configuration, not arbitrary model text or a client-controlled way to reuse another job's reservation. It is local concurrency control, not a provider-side hard spend cap.

<<< ../workbench/applied-ai/python/study_ai/spend_ledger.py


Only `new` authorizes starting the associated job **once** through the durable workflow owner. `pending` means a reservation already exists and work may be in flight or its outcome unknown; reconcile the existing job, do not launch another provider call. `settled` means reuse the stored job result/state, not grant another execution. The ledger deliberately does not implement job result persistence, a lease, human identity or distributed provider idempotency. Combine it with the existing checkpoint/approved-write patterns through a tested service contract rather than treating a return value as a complete runner.

A crash after reserving but before calling leaves held capacity. Releasing it safely requires evidence no remote work started, or reconciliation under the provider's actual request/idempotency/status contract. A timeout, local abort, lease expiry or absent usage does not establish that. Unknown usage stays fully reserved. A known usage at or below the bound releases only the difference, exactly once. A reported overrun is rejected with capacity held for manual reconciliation; actual external spend can exceed an underestimated bound. Alert and stop new work under an overrun policy instead of silently refunding or rounding down.

The maximum must cover the complete bounded workflow and selected verified rate version/fees, conservatively rounding fractional micro-units upward at reservation. Token/output caps and local admission do not control every provider billing dimension. Cost caps must come from enforceable workload limits plus reconciled usage, not a prompt saying “be cheap.” A shared PostgreSQL/service adapter may replace this local file when several machines participate; two independent files cannot share a global budget.

One serialized owner uses each SQLite connection. Close it explicitly. Treat schema initialization or failed rollback as fatal to the owner and discard the connection; CREATE IF NOT EXISTS is not a migration strategy. Protect the database/parent directory and do not expose the fixture's `db` attribute through an API. The0.2-second lock timeout is not the overall job deadline. Production tenant/account/day allocation, rollover, currency/rate version, administration, audit/retention and overrun reconciliation are separate required design decisions; do not reset the allocation on every startup or midnight while uncertain old jobs still exist.

## Executable acceptance

<<< ../workbench/applied-ai/python/lab_tests/test_spend_ledger.py


Run strict mypy for the module and pytest for this file plus the existing `test_eval_measurements.py`. The two-connection test creates each connection in its own thread and shows one6000 reservation succeeds from a10000 allocation, leaving4000. File reopen preserves replay state. A trigger injects failure between settlement and refund: both changes roll back together. This tests local ledger atomicity; no provider calls are made.

[Related learner criteria](../practice/applied-ai/chapters/model-economics.md).

**Validation performed:** exact ledger passed strict mypy. Seventeen offline tests passed:9 ledger/routing cases and8 existing usage/latency cases. They cover reservation/settlement replay, two-thread independent connections, insufficient allocation, identity conflicts, unknown/zero usage, overrun, atomic refund rollback, bounds and the declared synthetic quality gate. No external spend cap, deployed shared ledger, live route/model/provider usage or invoice reconciliation was tested.

Official references checked2026-10-25: [cost optimization](https://developers.openai.com/api/docs/guides/cost-optimization), [latency optimization](https://developers.openai.com/api/docs/guides/latency-optimization), [Python SQLite transactions](https://docs.python.org/3.13/library/sqlite3.html). Use current official model/endpoint pricing for an actual rate schedule; this lesson intentionally supplies none.
