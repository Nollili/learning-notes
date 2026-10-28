# SQL Query Workbench: From Rows to Reports — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../workbench/node-js/database/sql-queries.md) · [Node.js practice map](./index.md)

## Practice and verification

Run every normal SQL block in order in the same disposable session. Before running a report, state its grain, eligible statuses, null policy and expected rows. Retain actual result tables and explain differences; an EXPLAIN estimate alone does not verify result correctness.

**Acceptance:** prepared CRUD stores hostile text as one value, returns no rows for absent IDs and leaves the fixture unchanged after rollback. All expected reports above match. Add a fourth customer without orders, an order with zero total, two orders with equal timestamps and an intentionally mismatched item total. Preserve zero-order customers, report the mismatch, and keep latest-per-customer selection deterministic. Show the wrong COUNT(*)/post-join WHERE/NOT IN NULL/window-frame variants and explain their incorrect results.

Compare subquery/CTE/join versions with the same expected result before discussing performance. Use EXPLAIN (ANALYZE, BUFFERS) only on controlled read queries; ANALYZE executes statements and is unsafe as a casual preview of writes.

Add an index from a measured filter/order pattern and compare plans on enough generated data to matter; a five-row fixture cannot establish production speed. Keep insert/update/delete authorization separate from this reporting exercise. Learner practice remains required even when the teaching fixture has been verified.

After reviewing results, explicitly remove only this owned disposable schema:

```sql
DROP SCHEMA notes_sql_workbench CASCADE;
```

References checked2026-10-21: [PostgreSQL16 aggregates](https://www.postgresql.org/docs/16/tutorial-agg.html), [subquery expressions](https://www.postgresql.org/docs/16/functions-subquery.html), [WITH/materialization](https://www.postgresql.org/docs/16/queries-with.html), [window functions and frames](https://www.postgresql.org/docs/16/functions-window.html), [prepared statements](https://www.postgresql.org/docs/16/sql-prepare.html), [EXPLAIN](https://www.postgresql.org/docs/16/using-explain.html).
