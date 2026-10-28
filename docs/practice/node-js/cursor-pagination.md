# Deterministic Cursor Pagination — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/cursor-pagination.md) · [Node.js practice map](./index.md)

## Practice and acceptance

Use a disposable database with two tenants and at least six rows. Include equal timestamps with different UUIDs, two timestamps differing only in microseconds, each status and zero total. Run the actual Express route with a real request-scoped ORM adapter. Keep keys/test fixtures outside Autocode-owned src/tests.

**Acceptance:** page through limit2 until nextCursor=null and get each initial eligible row exactly once in the specified order. Preserve the exact microseconds. Insert a newer row after page1, then prove the continuation does not repeat page1 or silently switch to OFFSET semantics; refresh reveals the new row. Repeat a tie-boundary test and delete a later row. Record the live-feed behavior for status changes explicitly. Demonstrate the OFFSET duplicate under a concurrent newer insert as a comparison, not a desired contract.

Reject malformed/oversized/noncanonical/tampered cursors, unknown versions, wrong tenant/status scope, invalid timestamps/IDs, unknown query keys, repeated query values, limit0/101/1e2 and unsupported sorts. Cursor/query errors return400, missing permission returns401/403 according to auth state, database failure reaches the central safe500/503 handler, and another tenant's row never appears. A broken database row projection must reach the internal-error path. Verify nextCursor points to the last delivered row and never the lookahead row. Test no-row and exactly-limit boundaries.

Do not infer performance from six rows: inspect EXPLAIN (ANALYZE, BUFFERS) with realistic cardinality and the declared composite index. Learner implementation and retained practice evidence remain required.

References checked2026-10-21: [PostgreSQL16 row comparisons](https://www.postgresql.org/docs/16/functions-comparisons.html#ROW-WISE-COMPARISON), [LIMIT/OFFSET and unique ordering](https://www.postgresql.org/docs/16/queries-limit.html), [timestamp precision](https://www.postgresql.org/docs/16/datatype-datetime.html), [Node24 HMAC/timingSafeEqual](https://nodejs.org/download/release/v24.18.0/docs/api/crypto.html), [Zod4 basics](https://zod.dev/basics), [Express5 routing](https://expressjs.com/en/guide/routing.html).
