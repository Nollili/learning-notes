# A Typed Model SDK Boundary — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/model-sdk.md)

## Practice and acceptance

Run the locked strict check/tests; add malformed JSON, long/invented quotes, missing/extra fields, empty review result, multiple output messages, unexpected tool output, timeout, caller cancellation and no-I/O invalid-input cases. Confirm every client closes and failures never expose source/provider exception bodies. Classify deliberately misleading notes and record why schema validation does not establish semantic correctness.

**Acceptance:** the real installed SDK emits the expected schema/roles/settings through the offline transport; typed/local semantic validation rejects invalid outputs; refusal/incomplete/error outcomes stay distinct; no live request or real credential is needed for the tests. Before a separately authorized live integration, select an account-accessible model/snapshot, confirm schema/features/data policy, enforce a spend/request budget and retain representative quality/latency evidence. Live provider/TLS/account/rate-limit behavior, semantic quality, UI recovery and learner practice remain unperformed. A later lesson expands streaming, cancellation/retries and bounded admission.

**Additional practice acceptance:** trace each recovery row to an executable success/failure fixture; prove invalid input has zero transport calls, refusal/incomplete never parse as success, and error messages reveal no note/provider body. Design credential rotation/revocation steps with a fake credential and explain which steps need real account authority. Review an alternative adapter's documentation against the capability table without sending private data or claiming compatibility. Learner implementation, real account rotation and live provider differences remain unperformed.
