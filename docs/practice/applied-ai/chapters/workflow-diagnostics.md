# Debugging Tool Workflows with Safe Traces — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/workflow-diagnostics.md)

## Practice and acceptance

Run strict typing and event tests: only declared fields/categories, finite bounded durations, integer/non-bool attempts, capacity eviction/dropped count, stable sequence, immutable snapshots, fixed error on invalid/sensitive values, no raw payload field, JSON round-trip. Feed a real fake-store dispatcher result through an application-owned category mapping and verify the event contains only the projection. These tests do not establish a production exporter or complete audit trail.

Rerun the actual state/SQLite/graph tests, then inject an unknown tool, a private source ID, a stale save, a blocked store and an interrupted write receipt. Retain the earliest failing stage and expected transition as an approved fixture; exclude raw private text/credentials from routine events. For a real provider adapter add malformed call items, mismatched call IDs, partial arguments, budget exhaustion and output validator failure. Acceptance: failures remain distinct, no silent success/retry reset, redaction/projection negative controls pass and transitions match their checked artifacts. Hosted traces/alerts, real incidents, provider loop debugging and learner operational practice remain required.
