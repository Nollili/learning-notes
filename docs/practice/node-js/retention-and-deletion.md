# Retention, Expiry and Enforced Deletion — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/retention-and-deletion.md) · [Node.js practice map](./index.md)

## Practice and acceptance

Use actual PostgreSQL16 in a new private temporary cluster and a disposable owned directory. Seed expired/at-boundary/future/held rows for all four classes, including token hashes/synthetic logs and upload bytes. Execute the exact sweep: only eligible rows/files disappear, future/held content remains, and an expired held session still fails the read-time expiry predicate. Test batch limit, two workers with a locked row/SKIP LOCKED, later retry, already-missing file, rejected path metadata, storage permission/type failure, DB rollback and pool release. Delete only scratch fixtures; stop the cluster and close all clients afterward.

Run a second sweep after simulated unlink-before-commit failure and require idempotent completion without touching an unrelated file. Retain evidence of actual physical deletion and metadata state; a fake delete callback alone is insufficient. For a real app also test authenticated retrieval after expiry, authorized hold/deletion workflows, derivative invalidation, scheduling/shutdown, backup restoration and object-store/provider failure. **Learner practice and production retention compliance are not established by this local fixture.**

References checked2026-10-25: [PostgreSQL16 row locking/SKIP LOCKED](https://www.postgresql.org/docs/16/sql-select.html), [Node24 unlink](https://nodejs.org/download/release/v24.18.0/docs/api/fs.html#fspromisesunlinkpath), [OWASP log disposal/access](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#disposal-of-logs), [owned jobs/shutdown](../../node-js/module-10-production-ready-applications.md#_9-graceful-shutdown). Durations and schema above are declared teaching choices; verify the real product's policy separately.
