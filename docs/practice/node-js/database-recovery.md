# PostgreSQL Backup, Restore and Recovery — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/database-recovery.md) · [Node.js practice map](./index.md)

**Acceptance:** perform both logical restore into a fresh database and physical PITR into a separate clone. Verify marker values, not only counts; keep a safe command/version/target/timing record. Prove manifest verification rejects a deliberately corrupted copied artifact, and a missing required WAL file makes the intended recovery fail rather than count as success. Use fresh disposable copies for negative tests; preserve the original good artifact.

Restore with intended app permissions and verify constraints, sequence-backed inserts and a representative API read/write. Keep production external effects disabled. Stop both owned clusters in finally/trap cleanup even on failure; never use broad path deletion or stop an existing server by guessed port.
