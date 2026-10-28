# Persistent Vectors, Current Access and Index Lifecycles — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/vector-storage-lifecycle.md)

**Practice acceptance:** reproduce the tests, then extend the store to the existing multi-chunk provenance DTO. Index/update/delete two versions of a source and demonstrate that every retrieved citation resolves to the current authorized exact span. Add a source during g2 build, revoke a user after retrieval, delete a source before answer assembly and inject a storage failure: no stale/private fallback may become evidence. Record active/pending source coverage and failure categories without content-bearing logs. Measure an exact-scan baseline on a labeled corpus before selecting an ANN adapter; retain recall/latency/ACL comparisons and explain the query-at-cutover policy.

Exercise backup restore with deletion tombstones as a separate operational task. Learner practice remains required.
