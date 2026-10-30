# Optional additions: gaps beyond the supplied homework

These tasks are **new proposals**, not hidden course requirements. They remain optional. All originally supplied optional/bonus exercises are already mandatory in [P01–P08](./practitioner.md) and [A01–A12](./associate.md).

Use the same store, synthetic data and an owned learning environment. Each extension has an observable result and a failure case; do not create unrelated applications merely to expand the tool list.

## X01 — Duplicate-safe imports and message handling

**After P06.** Choose a stable import/row operation ID and persist idempotency state atomically with the business write where possible. Repeat the same message and upload-event identity, including a simulated crash after the write but before acknowledgement.

**Evidence:** retries produce one intended product/stock effect; a genuinely new operation remains possible; concurrent duplicate claims cannot both succeed. Explain retention of deduplication records and the chosen identity boundary.

## X02 — Recover database-write/notification gaps

**After P06/P08.** Introduce a failure after committing business data but before publishing SNS. Implement an outbox or another explicit recovery protocol and a replayable publisher.

**Evidence:** committed changes eventually produce the required notification after recovery; no claim of exactly-once email delivery; duplicate publication/consumption has a documented outcome. Show the failed publisher recovering without rewriting the business record incorrectly.

## X03 — Record ownership and trusted pricing

**After P07/P08.** Derive the acting user from verified identity. Prevent caller A from creating an order for B or reading/changing B's order. Obtain authoritative prices under a documented rule rather than trusting arbitrary customer-supplied prices.

**Evidence:** allowed own-order actions and denied cross-user actions; forged `userId`/price does not bypass controls; authorization failures do not mutate data. Preserve the original assignment contract in its evaluated baseline and demonstrate the stronger policy in an explicit extension boundary.

## X04 — DynamoDB access patterns, pagination and contention

**After P04/A08.** Add an access-pattern-driven index for a concrete query. Implement complete pagination and a stable client cursor. Replace a read-then-write stock update with a conditional/transactional operation.

**Evidence:** a dataset spanning multiple pages returns complete intended results; malformed cursors fail predictably; concurrent decrements cannot create negative stock; document consistency and index costs rather than assume the index is always immediately current.

## X05 — Database backup and restore

**After P08/A08.** Back up synthetic orders, change/delete data deliberately and restore into an isolated target. Verify schema, constraints and representative records, and point an isolated application at the restored database.

**Evidence:** measured recovery time and stated recovery point; the restored API works; no source database is overwritten; retained snapshots and restored targets have a cleanup record. Distinguish replication, backup and tested recovery.

## X06 — Load, connection pressure and bounded concurrency

**After P06/P08/A03.** Run a bounded load test with a fixed duration, request ceiling and stop conditions. Observe API latency/errors, Lambda concurrency, queue age and DB connections. Compare direct/proxied database access where available.

**Evidence:** baseline and changed measurements, one demonstrated bottleneck and a justified improvement. Increasing Lambda concurrency must not be called an improvement if it merely overloads the database. No unbounded traffic generator or uncontrolled retry loop.

## X07 — Incident diagnosis and safe DLQ redrive

**After P06/A09.** Add useful alarms, correlation IDs and a short runbook. Inject a reversible permission/configuration fault, observe alarm delivery, identify the boundary, correct it and redrive only the intended messages.

**Evidence:** actual alarm/notification and diagnostic timeline; recovery avoids repeated business effects; a log identifies the operation without exposing credentials; an empty DLQ alone is not claimed as successful processing.

## X08 — Safe release and rollback with schema compatibility

**After P08/A11.** Publish identifiable artifacts and introduce a backward-compatible schema change. Release a new version gradually, detect a controlled regression and roll application traffic back while preserving data compatibility.

**Evidence:** known artifact/revision before and after; health criteria trigger the rollback; old/new versions work during the migration window; infrastructure rollback is distinguished from reversing database mutations.

## X09 — Temporary credentials, least privilege and secret rotation

**After A02/P07/P08.** Demonstrate federated developer access, role-based workload credentials and scoped deployment roles. Rotate a learning secret using a documented refresh strategy; verify old and new credentials behave as intended.

**Evidence:** allowed and denied actions, no committed keys, workload recovery after rotation and documented cache/connection refresh. Keep the source's graded account/role setup identifiable rather than silently changing its required exercise.

## X10 — Adversarial file and API inputs

**After P05/P07.** Exercise oversized files/rows, quoted CSV delimiters/newlines, malformed JSON, unexpected content, invalid object keys and forged/expired tokens. Define limits and enforce them before uncontrolled processing.

**Evidence:** valid files still work, failures are bounded and visible, no cross-user object overwrite occurs, and rejected inputs leave no unintended records or runaway retries.

## X11 — Cost and resource ownership audit

**After A11.** Estimate a small workload, record actual resource settings and compare reported costs after billing has settled sufficiently. Inventory dependencies and retained resources across Regions, then remove only the owned disposable resources.

**Evidence:** expected versus observed cost drivers, explicit remaining resources, versions/snapshots/NAT/address/log cleanup and a documented billing-reporting delay. A budget email is not evidence of a hard cap.

## X12 — AI quality and failure evaluation

**After A12.** Create a small labeled sentiment/document dataset, include multilingual and boundary-size inputs, and compare output correctness with latency and usage. Test a denied service call, throttling/timeout response and malicious instructions embedded in a document.

**Evidence:** measured quality with known limitations; bounded retries; documents cannot grant tool permissions; model output is validated before downstream effects; error responses and logs protect sensitive content. A successful SDK call alone does not establish useful AI output.
