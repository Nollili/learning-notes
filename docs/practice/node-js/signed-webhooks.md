# Verify signed webhooks before applying effects — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/signed-webhooks.md) · [Node.js practice map](./index.md)

**Practice acceptance:** add exact300second boundaries, duplicate raw headers, oversize/compressed/wrong-media requests, provider-time skew alerting and current-scope denial. Kill the receiver after commit/before response and retain one effect after retry/restart. Fail the database and require safe503 with no receipt-only commit. Wire an outbox worker and show external-operation unknown/retry reconciliation. Document the actual provider's signature canonicalization, key overlap and retry/retention policy; retain redacted IDs/results, never credentials. Learner execution is still required.
