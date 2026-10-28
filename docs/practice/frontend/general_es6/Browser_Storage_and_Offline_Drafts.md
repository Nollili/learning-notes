# Practice: IndexedDB Schema Upgrades and Offline Draft Ownership

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/General_ES6/Browser_Storage_and_Offline_Drafts.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise acceptance:** seed schema1/body records, open schema2 and verify migrated text/revision/index; abort an invalid/future legacy migration without deleting source data. Test fresh open, unsupported/denied factory, blocked upgrade, versionchange closure and late-open cleanup. Prove save waits for transactioncomplete, failed transaction does not publish success, read restores validated records, stale/local concurrent revision is rejected, input projection/limits hold and owner closes connections. Simulate quota/eviction by injected failures or controlled deletion only in disposable fixtures; do not clear real user data. Then implement the described offline/server conflict and recovery UI and run native two-tab/offline/private-mode tests. In-memory emulator checks cover API control flow, not actual disk durability, browser quota/eviction, partitions, native event timing or learner completion.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
