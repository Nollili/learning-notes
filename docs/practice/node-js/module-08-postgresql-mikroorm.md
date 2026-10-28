# Relational Databases, PostgreSQL, and MikroORM — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/module-08-postgresql-mikroorm.md) · [Node.js practice map](./index.md)

#### Guided practice

In a disposable database with representative orders, run `EXPLAIN (ANALYZE, BUFFERS)` for the latest-pending-orders query before and after adding the index. Run `ANALYZE orders` after loading fixture data. Compare the scan, any separate sort, buffers and execution time. Small fixtures may correctly use a sequential scan.

Then remove the status equality and predict why sorting may reappear. **Success:** explain the observed plan and propose an index for the changed query, including its write/storage trade-off. Do not force index usage just to make the exercise appear successful.

### Diagnostic exercise

Implement a money-transfer use case.

Requirements:

- total balance remains constant;
- accounts are locked in a consistent order;
- deadlock/serialization retry is bounded;
- an idempotency key prevents duplicate transfers;
- an outbox record is committed with the transfer;
- pool and query time are measured separately;
- a schema change remains compatible during rolling deployment.

---

## Graduated practice: persistence and migrations

### 1. Worked example

Run the temporary-table lesson and the Workbench fixture. Compare the returned rows with their expected output before introducing an ORM.

### 2. Guided build

In the retained source under `examples/node-textbook`, inspect `Account`/`Task`, the migration, and the authenticated task routes' database operations. Authentication becomes your learning objective in Module 9; the completed project already contains those routes so it remains runnable throughout.

### 3. Independent task

Add an optional due date to tasks using a new numbered migration and update the input/output schema. Hint: choose a calendar `date` if the user means a day, and distinguish omitted from explicit null. **Success:** a fresh database and an upgraded database both work; another user's tasks remain inaccessible; restarting the process preserves dates.

### 4. Optional depth: metadata, timestamp and seed failures

In the separate User modeling exercise, create the exact primary project files shown above: package/tsconfig, src/mikro-orm.config.ts, src/entities/user.entity.ts and src/seed.ts. Supply the authorized database configuration, run a locked install/typecheck/build, and verify metadata discovery/Migrator registration on the compiled path. Generate/review/compile/apply a migration against a disposable database. Run source and compiled entity discovery intentionally; do not require both source and built entities in one process. Relationship snippets are extensions needing their complete reciprocal fields/entities, not a second already-complete program.

**Acceptance:** the compiled User boots with reflection and the explicit legacy provider; migration CLI loads its compiled config and emits source to the requested path; missing configuration fails before database work; two sequential and two concurrent reference seeds yield one unique row and preserve an existing value; a failed seed still closes; the process terminates without a forced success exit. Pin/retest the exact ORM version rather than extrapolate from v6-style imports. Standard decorators/defineEntity remain alternative paths.

For the products SQL, insert a row, update it in a later statement and prove DEFAULT NOW() alone did not maintain updated_at. Apply the trigger and repeat; confirm statement-time behavior and explain ORM onUpdate versus external SQL. Use a disposable schema and clean it up. This demonstrates one selected timestamp policy, not every timezone/DST behavior (covered in a separate date lesson).

References checked 2026-10-21: [MikroORM 7 migration](https://mikro-orm.io/docs/upgrading-v6-to-v7), [legacy reflection provider](https://mikro-orm.io/docs/metadata-providers#reflectmetadataprovider), [migration configuration](https://mikro-orm.io/docs/migrations), [PostgreSQL date/time functions](https://www.postgresql.org/docs/current/functions-datetime.html), [triggers](https://www.postgresql.org/docs/current/plpgsql-trigger.html). Keep a short record of the commands, observed timestamps and seed row counts. Hosted migration and recovery drills are separate exercises.

For the executable SQL-only companion, use the [SQL Query Workbench](../../workbench/node-js/database/sql-queries.md). It covers parameterized CRUD, grouping/NULL/HAVING, subqueries, CTEs and window frames with one disposable fixture and explicit expected results.

---

## 24. Final review checklist

### Concurrency and operations

- [ ] Choose optimistic or pessimistic locking from expected conflict behavior.
- [ ] Explain how deadlocks occur and why PostgreSQL aborts one participant.
- [ ] Retry only a complete, repeatable transaction with bounded backoff.
- [ ] Keep irreversible external effects outside retryable callbacks.
- [ ] Size pools across all replicas and reserve operational capacity.
- [ ] Separate pool waiting, query execution, and lock waiting during diagnosis.
- [ ] Use expand-and-contract migrations for rolling deployment compatibility.

### Relational foundations

- [ ] Explain tables, rows, columns, types, keys, and constraints.
- [ ] Describe PostgreSQL server → database → schema → table hierarchy.
- [ ] Choose UUID or identity keys from real trade-offs.
- [ ] Model one-to-one, one-to-many, and many-to-many relationships.
- [ ] Select deliberate foreign-key delete behavior.

### Modeling and SQL

- [ ] Identify insertion, update, and deletion anomalies.
- [ ] Apply 1NF, 2NF, and 3NF from functional dependencies.
- [ ] Use inner, left, right, full outer, multi-table, and self-joins.
- [ ] Explain when `NULL` appears in outer-join results.
- [ ] Denormalize only for measured performance or historical semantics.

### Performance and transactions

- [ ] Design single-column, composite, and partial indexes from queries.
- [ ] Explain composite-index column order.
- [ ] Read essential `EXPLAIN ANALYZE` output.
- [ ] Define Atomicity, Consistency, Isolation, and Durability.
- [ ] Use atomic conditional updates, locks, or Serializable isolation for races.
- [ ] Keep transactions short and handle retryable failures safely.

### MikroORM

- [ ] Match decorator imports/configuration to the installed major version.
- [ ] Configure PostgreSQL, entities, migrations, and lifecycle cleanup.
- [ ] Explain EntityManager, repository, Identity Map, and Unit of Work.
- [ ] Implement CRUD with a request-scoped EntityManager.
- [ ] Model owning/inverse sides and `Collection<T>` relations.
- [ ] Use population deliberately and avoid N+1 queries.
- [ ] Generate, review, apply, and test migrations.
- [ ] Use implicit flush transactions and explicit `transactional()` scopes.

**Guided practice:** recreate the table, add a third unfinished task, and return only unfinished titles in ID order. Then count unfinished tasks. Hint: filter before grouping/counting. **Success:** your list contains exactly the unfinished rows and the count agrees with the list length.

**Worked failure:** use an unreachable port in your disposable database configuration. Startup must reject before HTTP begins listening and the process must terminate with a nonzero status. Restore the correct port and verify `SELECT 1` succeeds. The retained runnable application implements this ownership contract in `src/database.ts`.
