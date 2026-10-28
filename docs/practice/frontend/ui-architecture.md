# UI architecture practice

**Learner status: outstanding.** Prerequisites: F01–F05 and [the large-data lesson](../../senior_growth/EngX_Quality/Large_Data_Workflow.md). This refines P-328, not a separate full application.

## Scope, acceptance and failure cases


1. Connect an authorized, byte-bounded HTTP adapter and a real database endpoint. Seed at least 10,000 records including equal sort values. Prove stable ordering, cursor filter/tenant binding and snapshot expiry using integration tests. Record your chosen consistency policy instead of assuming keyset pagination freezes data.
2. Return query A after query B, including an adapter that ignores abort; B must remain visible. Unmount during a read and verify cancellation plus no later state commit. Return duplicate IDs, 51 rows, invalid JSON and an expired snapshot; reject safely and provide a restart route. Test the 100-ID cap across at least three pages and a selected ID that disappears server-side before action.
3. Save a Unicode query, restore after reload, change account/tenant and deny storage access. Restore must fetch a fresh authorized first page; no stale cursor or row may be restored. Implement “delete saved view” and logout cleanup before enabling device persistence for users.
4. Use keyboard and a screen reader in a native browser: labels, caption/header associations, selected state, status and heading focus must remain understandable across load/error/restart. Test zoom/reflow and return focus behavior. Record observations; fix failures rather than inferring accessibility from semantic markup alone.
5. Define a device/network/workload and measure input responsiveness, transferred bytes, page rendering and heap after repeated navigation. Proposed budgets: at most 50 rendered data rows, 100 selected IDs, and no accumulation of old page arrays; choose a measured p95 interaction target and payload byte limit with product stakeholders. Automated fixture tests establish behavior, not those runtime performance results.

Learner implementation and evidence are still required. The local fixture neither deploys the application nor establishes professional readiness.


## Evidence

Retain adapter/DB integration results, failure→fix→retest, source/runtime versions, browser/keyboard observations and explicit unperformed screen-reader/zoom/device checks.
