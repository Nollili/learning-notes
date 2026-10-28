# Relational Databases, PostgreSQL, and MikroORM

## Contents

1. [Relational database mental model](#_1-relational-database-mental-model)
2. [Relational versus document databases](#_2-relational-versus-document-databases)
3. [PostgreSQL hierarchy and tools](#_3-postgresql-hierarchy-and-tools)
4. [Tables, columns, rows, and data types](#_4-tables-columns-rows-and-data-types)
5. [Keys, constraints, and relationships](#_5-keys-constraints-and-relationships)
6. [Normalization: 1NF, 2NF, and 3NF](#_6-normalization-1nf-2nf-and-3nf)
7. [SQL joins](#_7-sql-joins)
8. [Denormalization](#_8-denormalization)
9. [Indexes and query plans](#_9-indexes-and-query-plans)
   - [Multi-Column Indexes (Composite Indexes)](#multi-column-indexes-composite-indexes)
10. [Transactions and ACID](#_10-transactions-and-acid)
11. [Isolation and concurrency](#_11-isolation-and-concurrency)
12. [ORM concepts and patterns](#_12-orm-concepts-and-patterns)
13. [MikroORM setup](#_13-mikroorm-setup)
14. [Entities, EntityManager, and Unit of Work](#_14-entities-entitymanager-and-unit-of-work)
15. [CRUD with MikroORM](#_15-crud-with-mikroorm)
16. [Request context and identity map](#_16-request-context-and-identity-map)
17. [MikroORM relationships](#_17-mikroorm-relationships)
18. [Population and the N+1 problem](#_18-population-and-the-n-1-problem)
19. [Migrations and seeds](#_19-migrations-and-seeds)
20. [Transactions in MikroORM](#_20-transactions-in-mikroorm)
21. [Architecture, testing, and production readiness](#_21-architecture-testing-and-production-readiness)
22. [Locking, deadlocks, and safe retries](#_22-locking-deadlocks-and-safe-retries)
23. [Connection pools and database diagnostics](#_23-connection-pools-and-database-diagnostics)
- [Required SQL foundations](#required-sql-foundations-before-modeling-and-joins)
- [Graduated practice: persistence and migrations](#graduated-practice-persistence-and-migrations)
24. [Final review checklist](#_24-final-review-checklist)

---

## 1. Relational database mental model

A relational database stores structured data in tables. Rows represent individual records, columns represent attributes, and keys connect records across tables.

```mermaid
flowchart LR
    U["users\nid, name, email"] -->|"1 : many"| O["orders\nid, user_id, status"]
    O -->|"1 : many"| I["order_items\norder_id, product_id, quantity"]
    P["products\nid, name, price"] -->|"1 : many"| I
```

The relational model provides:

- a declared schema and typed columns;
- primary keys that identify rows;
- foreign keys that enforce relationships;
- constraints that protect invariants;
- SQL for defining, reading, and changing data;
- transactions for atomic multi-step work;
- indexes and query planning for efficient access.

The database is an active guardian of integrity, not merely a place to store objects. Application validation improves errors and user experience; database constraints protect the final shared state even when several applications or concurrent requests write to it.

### SQL command families

| Family | Purpose | Common statements |
| --- | --- | --- |
| DDL | Define structure | `CREATE`, `ALTER`, `DROP` |
| DML | Change data | `INSERT`, `UPDATE`, `DELETE` |
| DQL | Query data | `SELECT` |
| DCL | Manage privileges | `GRANT`, `REVOKE` |
| TCL | Manage transactions | `BEGIN`, `COMMIT`, `ROLLBACK`, `SAVEPOINT` |

SQL is standardized, but databases have different types, functions, syntax extensions, optimizers, and operational features.

---

## 2. Relational versus document databases

PostgreSQL and MongoDB solve overlapping problems with different primary models.

| Concern | PostgreSQL/relational | MongoDB/document |
| --- | --- | --- |
| Storage unit | Row in a typed table | BSON document in a collection |
| Schema | Declared and database-enforced | Flexible, optionally validated |
| Relationships | Foreign keys and joins | Embedding, references, `$lookup` |
| Normalization | Common default | Aggregate embedding/denormalization is common |
| Transactions | Foundational and mature | Single-document atomicity plus multi-document transactions |
| Query style | SQL | MongoDB query/aggregation APIs |
| Strong fit | Integrity- and relationship-heavy workloads | Document-shaped aggregates and varied records |

Choose a relational database when:

- strong constraints and referential integrity matter;
- multi-row or multi-table transactions protect business invariants;
- relationships and joins are central;
- ad hoc querying and reporting are important;
- the schema is structured and shared across workflows.

Choose a document database when data is naturally aggregate-shaped, nested values are usually read together, and controlled shape variation is useful.

This is not a strict either/or. PostgreSQL supports `JSONB`; MongoDB supports transactions and validation. Choose from actual access patterns and guarantees, not slogans.

### Common relational systems

- **PostgreSQL:** open source, standards-oriented, extensible, and used throughout this module.
- **MySQL/MariaDB:** widely deployed relational systems with large ecosystems.
- **SQLite:** embedded, serverless database stored in a local file; excellent for local tools and smaller workloads.
- **SQL Server:** Microsoft's commercial database with strong .NET/Azure tooling.
- **Oracle Database:** enterprise commercial platform for demanding large-scale systems.

---

## 3. PostgreSQL hierarchy and tools

PostgreSQL organizes data into four main levels:

```text
PostgreSQL server/cluster
└── ecommerce database
    └── public schema
        ├── users table
        ├── orders table
        └── products table
```

- A **server/cluster** is a running PostgreSQL instance containing databases.
- A **database** is the connection and isolation boundary for application data.
- A **schema** is a namespace inside a database; `public` is the common default.
- A **table** defines typed columns and contains rows.

PostgreSQL does not normally allow a single SQL statement to join across separate databases. Use schemas when related data needs namespacing inside one database.

### Connection strings

Applications and database tools usually connect through a URI:

```text
postgresql://app_user:secret@localhost:5432/shop
```

The parts are `scheme://user:password@host:port/database`. Put real credentials in environment configuration or a secrets system, never directly in source code.

**When to use it:** pass the URI to a PostgreSQL driver, an ORM, or a command-line client. Use separate databases or credentials for development, testing, and production.

### `psql`

```bash
psql "$DATABASE_URL"
```

**What it does:** opens an interactive PostgreSQL session using the connection URI stored in `DATABASE_URL`.

**When to use it:** explore a schema, inspect a query plan, or diagnose data. Put repeatable schema changes in migrations rather than relying on manual shell commands.

Useful commands:

| Command | Purpose |
| --- | --- |
| `\l` | List databases |
| `\c database_name` | Connect to a database |
| `\dn` | List schemas |
| `\dt` | List tables in the active search path |
| `\d table_name` | Describe columns, indexes, and constraints |
| `\di` | List indexes |
| `\x` | Toggle expanded output |
| `\timing` | Toggle statement timing |
| `\q` | Quit |

SQL smoke test:

```sql
CREATE TABLE scratch_users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL
);

INSERT INTO scratch_users (name) VALUES ('Alice');
SELECT * FROM scratch_users;
DROP TABLE scratch_users;
```

**What it does:** creates a temporary learning table, inserts one row, reads it back, and removes the table.

**When to use it:** use a disposable table to verify a connection and practise SQL in a development database. Never run destructive practice statements against production data.

GUI clients such as DBeaver, pgAdmin, and TablePlus complement `psql` for browsing schemas and query plans. Repeatable changes still belong in migrations.

---

## 4. Tables, columns, rows, and data types

A table represents one kind of entity or relationship. A row is one record. A column has a name, type, and optional constraints.

### Naming

A consistent convention helps:

- plural, lowercase table names: `users`, `order_items`;
- lowercase snake_case columns: `created_at`, `user_id`;
- descriptive constraint and index names;
- avoid reserved words and unexplained abbreviations.

### Common PostgreSQL types

| Type | Use |
| --- | --- |
| `TEXT` | Variable-length text |
| `VARCHAR(n)` | Text with a meaningful maximum length |
| `SMALLINT`, `INTEGER`, `BIGINT` | Whole numbers |
| `NUMERIC(p, s)` | Exact decimals, such as money amounts |
| `REAL`, `DOUBLE PRECISION` | Approximate floating-point values |
| `BOOLEAN` | `true` or `false` |
| `DATE` | Calendar date |
| `TIMESTAMPTZ` | Absolute timestamp interpreted with time-zone awareness |
| `UUID` | 128-bit identifier |
| `JSONB` | Binary JSON document with indexing/query support |
| `BYTEA` | Binary data |

Prefer `NUMERIC` or integer minor units for money; JavaScript `number` cannot exactly represent every decimal value. Prefer `TIMESTAMPTZ` for real-world instants and convert to the user's local zone at the boundary.

### Example table

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

DEFAULT NOW() fills updated_at on insertion only; PostgreSQL does not automatically refresh it on later UPDATE. Choose one owner: every application writer sets updated_at, or a database trigger does it consistently across writers. For example:

```sql
CREATE FUNCTION set_product_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := statement_timestamp();
  RETURN NEW;
END;
$$;
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION set_product_updated_at();
```

statement_timestamp uses the statement start, while NOW()/CURRENT_TIMESTAMP uses transaction start. A no-op UPDATE still invokes this trigger. MikroORM onUpdate callbacks operate through the ORM path, not arbitrary external SQL; do not mistake them for a database trigger. Pick and test the actual timestamp policy. Choose types from domain meaning, range, precision, query needs, and portability—not only current sample data.

---

## 5. Keys, constraints, and relationships

### Primary keys

A primary key uniquely and non-nullably identifies each row. It should be stable.

UUID:

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

Identity integer:

```sql
id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
```

UUIDs can be generated independently and do not expose simple row counts, but are larger and less index-local than sequential integers. Sequential IDs are compact and efficient, but predictable. Predictability is not an authorization flaw by itself—every endpoint must authorize access regardless of identifier type.

### Constraints

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  age INTEGER,
  CONSTRAINT users_email_unique UNIQUE (email),
  CONSTRAINT users_role_check CHECK (role IN ('user', 'admin')),
  CONSTRAINT users_age_check CHECK (age IS NULL OR age >= 0)
);
```

| Constraint | Protects |
| --- | --- |
| `PRIMARY KEY` | Unique row identity |
| `NOT NULL` | Required values |
| `UNIQUE` | Candidate-key uniqueness |
| `CHECK` | Row-level predicates |
| `DEFAULT` | Value when omitted; not itself validation |
| `FOREIGN KEY` | Referential integrity |

Constraints handle state rules the database can express. Workflows spanning time or external services still need application logic and sometimes transactions.

### Foreign keys

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending',
  total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX orders_user_id_idx ON orders (user_id);
```

PostgreSQL automatically indexes the referenced primary/unique key, but does **not** automatically index the referencing foreign-key column. Index foreign keys used for joins, parent deletion checks, or filters when the workload warrants it.

### Delete actions

| Action | Behavior |
| --- | --- |
| `NO ACTION` | Reject violation, usually checked at statement end; default |
| `RESTRICT` | Reject immediately when referenced rows exist |
| `CASCADE` | Delete dependent rows automatically |
| `SET NULL` | Clear the foreign key; column must allow null |
| `SET DEFAULT` | Set the foreign key to its default if valid |

Use `CASCADE` only when a child has no meaning outside its parent. Orders and audit records commonly need retention rather than cascade deletion.

### Relationship shapes

One-to-one: place a unique foreign key on the owning table.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT
);
```

One-to-many: place the foreign key on the many side (`orders.user_id`).

Many-to-many: create a join table.

```sql
CREATE TABLE order_items (
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  PRIMARY KEY (order_id, product_id)
);

CREATE INDEX order_items_product_id_idx ON order_items (product_id);
```

The join table can carry relationship attributes such as quantity and price at purchase time.

---

### Required SQL foundations before modeling and joins

A query describes the result you want. `SELECT` chooses columns; `FROM` chooses the source; `WHERE` filters rows; `ORDER BY` orders them; `LIMIT` bounds the result. SQL does not promise row order without `ORDER BY`.

Run this whole example in a disposable development database. A temporary table disappears when the connection closes and does not conflict with the chapter's main tables.

```sql
CREATE TEMP TABLE learning_tasks (
  id integer PRIMARY KEY,
  title text NOT NULL,
  done boolean NOT NULL DEFAULT false,
  due_date date
);
INSERT INTO learning_tasks(id, title, due_date) VALUES
  (1, 'Read SQL', NULL), (2, 'Practise SQL', '2026-11-01');
SELECT id, title FROM learning_tasks
WHERE done = false ORDER BY id LIMIT 10;
-- Expected: (1, Read SQL), (2, Practise SQL).
UPDATE learning_tasks SET done = true WHERE id = 1 RETURNING id, done;
-- Expected: (1, true).
SELECT id FROM learning_tasks WHERE due_date IS NULL;
-- Expected: 1. "due_date = NULL" does not mean "is absent".
SELECT done, COUNT(*) AS task_count FROM learning_tasks
GROUP BY done HAVING COUNT(*) >= 1 ORDER BY done;
-- Expected: (false, 1), (true, 1).
DELETE FROM learning_tasks WHERE id = 2 RETURNING id;
-- Expected: 2. A second identical DELETE returns zero rows.
DROP TABLE learning_tasks;
```

`NULL` means an absent/unknown value. Comparisons with it usually produce unknown, and `WHERE` retains only true predicates. Use `IS NULL`/`IS NOT NULL`. `COUNT(*)` counts rows; `COUNT(column)` ignores null values. `GROUP BY` makes one result per group; `WHERE` filters input rows and `HAVING` filters groups after aggregation.

In application code bind values through the driver's parameter API. With `pg`, `pool.query('SELECT id FROM learning_tasks WHERE title=$1', [title])` keeps hostile title text a value. The temporary table must exist on that same connection; this line illustrates binding rather than a separate runnable command. Parameters cannot stand for a table name or sort direction: select those from a developer-defined allowlist. Missing `WHERE` on `UPDATE`/`DELETE` affects every qualifying table row, so practise with disposable data.

[Related practice](../practice/node-js/module-08-postgresql-mikroorm.md).

Before proceeding, complete the [Workbench fixture and parameterized CRUD](../workbench/node-js/database/sql-queries.md#parameterized-crud-without-an-orm). Later Workbench sections on CTEs and window functions are intermediate extensions, not prerequisites for your first endpoint.

---

## 6. Normalization: 1NF, 2NF, and 3NF

Normalization organizes data to reduce redundancy and prevent anomalies.

- **Update anomaly:** the same fact must be changed in several places.
- **Insertion anomaly:** one fact cannot be stored without an unrelated fact.
- **Deletion anomaly:** deleting one fact accidentally removes another.

### First Normal Form (1NF)

In the practical course model, 1NF means:

- each row is identifiable;
- each column contains one value from its declared domain;
- repeating groups are moved into rows/a related table.

Avoid comma-separated product IDs:

```text
orders(id, products = 'keyboard,mouse')  ✗
```

Use a relationship table:

```text
orders(id)
order_items(order_id, product_id, quantity)
```

PostgreSQL arrays and `JSONB` can still be valid values when the entire collection is the intended attribute and is queried accordingly. “Atomic” is a modeling decision, not merely “never store arrays.”

### Second Normal Form (2NF)

2NF requires 1NF and no partial dependency on part of a composite candidate key.

For `order_items(order_id, product_id, quantity, product_name)`:

- `quantity` depends on the full `(order_id, product_id)` pair;
- `product_name` depends only on `product_id` and belongs in `products`.

Tables with only single-column candidate keys cannot have a partial dependency and therefore satisfy this aspect of 2NF.

`unit_price` may intentionally remain in `order_items` because it records the historical price for that product in that order.

### Third Normal Form (3NF)

3NF requires 2NF and removes transitive dependencies of non-key attributes on other non-key attributes.

```text
products.id → products.category_id → category_name
```

Store `category_name` in `categories`, then reference `category_id` from products.

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

ALTER TABLE products
ADD COLUMN category_id UUID REFERENCES categories(id);
```

### Quick reference

| Form | Removes | Guiding question |
| --- | --- | --- |
| 1NF | Repeating groups/multi-valued cells in the chosen model | Is each field one value and each row identifiable? |
| 2NF | Partial dependency on a composite key | Does every non-key fact depend on the whole key? |
| 3NF | Transitive dependency | Does each non-key fact depend on the key rather than another non-key fact? |

Normalize around real functional dependencies, not mechanical table splitting.

---

## 7. SQL joins

Joins reconstruct related views from normalized tables.

### Inner join

Returns only matching rows.

```sql
SELECT
  u.name AS customer,
  o.id AS order_id,
  o.total,
  o.status
FROM orders AS o
INNER JOIN users AS u ON u.id = o.user_id;
```

### Left join

Returns every row from the left side and matching right-side rows; missing matches become `NULL`.

```sql
SELECT u.id, u.name, COUNT(o.id) AS order_count
FROM users AS u
LEFT JOIN orders AS o ON o.user_id = u.id
GROUP BY u.id, u.name;
```

`COUNT(o.id)` returns zero for users without orders; `COUNT(*)` would count the outer row and produce one.

### Right join

Returns all right-side rows plus matches from the left. It can always be rewritten as a left join by swapping sides, which many teams prefer for consistency.

```sql
SELECT *
FROM users AS u
RIGHT JOIN orders AS o ON o.user_id = u.id;
```

### Full outer join

Returns all rows from both sides, with `NULL` for either missing match. It is useful for reconciliation and integrity investigation.

```sql
SELECT u.id AS user_id, o.id AS order_id
FROM users AS u
FULL OUTER JOIN orders AS o ON o.user_id = u.id;
```

Valid foreign keys normally prevent orphan orders, so deliberately orphaned examples require disabled/missing constraints.

### Multiple joins

```sql
SELECT
  u.name AS customer,
  o.id AS order_id,
  p.name AS product,
  oi.quantity,
  oi.unit_price
FROM orders AS o
JOIN users AS u ON u.id = o.user_id
JOIN order_items AS oi ON oi.order_id = o.id
JOIN products AS p ON p.id = oi.product_id
WHERE o.status = 'completed'
ORDER BY o.created_at DESC, o.id;
```

### Self-join

```sql
SELECT employee.name, manager.name AS manager_name
FROM employees AS employee
LEFT JOIN employees AS manager ON manager.id = employee.manager_id;
```

Join correctness comes before performance. Verify cardinality: joining two one-to-many branches can multiply rows unexpectedly.

---

## 8. Denormalization

Denormalization intentionally duplicates or precomputes data for a measured requirement.

Useful cases include:

- a historical snapshot such as `order_items.unit_price`;
- a materialized summary used by a high-volume read path;
- cached counts/totals whose recomputation is demonstrably expensive;
- a read model built from normalized source-of-truth tables.

Costs include:

- extra writes and storage;
- synchronization logic;
- stale data windows;
- more complex recovery and repair.

### Safe workflow

1. Normalize to a clear source of truth.
2. Measure the real query and inspect its plan.
3. Improve SQL and indexes first.
4. Denormalize only when evidence supports it.
5. Define ownership, update, reconciliation, and backfill behavior.
6. Monitor freshness and correctness.

Views, materialized views, caches, and read-model tables are alternatives to duplicating fields in every transactional row.

---

## 9. Indexes and query plans

An index is an auxiliary data structure that helps PostgreSQL locate or order rows without scanning and sorting the whole table. B-tree is the default and supports equality, ranges, and ordered access.

```sql
CREATE INDEX products_category_id_idx ON products (category_id);
CREATE INDEX orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX orders_user_status_idx ON orders (user_id, status);
```

### Strong candidates

- primary and unique keys (indexes are created automatically);
- foreign-key columns involved in joins/deletes;
- frequent selective `WHERE` predicates;
- frequent `ORDER BY` patterns, especially with `LIMIT`;
- columns used together in stable filter/sort patterns.

### Multi-Column Indexes (Composite Indexes)

A **multi-column index**, also called a **composite index**, contains two or more columns in one index. A B-tree composite index orders entries by the first column, then by the next column within equal first-column values, and so on. Think of a directory ordered by surname, then first name: knowing the surname narrows your search; knowing only the first name usually does not.

```sql
CREATE INDEX orders_user_status_created_id_idx
ON orders (user_id, status, created_at DESC, id DESC);
```

This creates one ordered structure, not four independent indexes. It matches a common operation: “show this user's latest pending orders.” Here is a complete query using a sample UUID; a driver-backed application binds the UUID/status as parameters.

```sql
SELECT id, status, total, created_at
FROM orders
WHERE user_id = '00000000-0000-0000-0000-000000000001'
  AND status = 'pending'
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

The equality predicates select a user/status group. Within that group, entries already have the requested timestamp/ID order, allowing an ordered index scan to stop early. The ID breaks timestamp ties. An index makes this plan possible; PostgreSQL still chooses a plan from estimated cost.

#### Leading columns: the leftmost-prefix rule

For the B-tree index above:

| Query pattern | Expected fit |
| --- | --- |
| `WHERE user_id = ...` | Uses the leading column |
| `WHERE user_id = ... AND status = ...` | Uses the first two columns |
| Both equalities, then `ORDER BY created_at DESC, id DESC LIMIT 20` | Matches filtering and ordering |
| `WHERE status = ...` alone | Omits the leading user column; generally a poor fit |
| User equality, then `ORDER BY created_at DESC` without status equality | Rows are grouped by status first; the index does not directly provide one chronological stream across statuses |

“Poor fit” does not mean PostgreSQL can never use the index. The rule describes efficient narrowing for this B-tree design, not a prohibition on every other scan. These examples use PostgreSQL 16; optimizer capabilities differ between versions. This rule also must not be generalized to every index type. See the [PostgreSQL multicolumn-index documentation](https://www.postgresql.org/docs/16/indexes-multicolumn.html).

#### Equality, range and sort order

For `(user_id, status, created_at DESC, id DESC)`, fixing user and status allows a time range such as `created_at >= ...` to bound the next part of the scan. Further conditions can filter candidate entries without necessarily narrowing that scan as much.

Start with equality filters that define the useful prefix, then consider range and ordering requirements together. “Put the most selective column first” is not a universal rule: compare the whole workload, including queries that omit some predicates. Swapping equality columns may preserve one fully constrained query while changing which prefix-only queries are efficient.

A backward B-tree scan reverses all its key directions. Mixed ordering, such as `created_at DESC, id ASC`, needs a matching design or a sort; it is not the same as reversing `DESC, DESC`. See [indexes and ordering](https://www.postgresql.org/docs/16/indexes-ordering.html).

#### Composite versus separate indexes

Separate indexes on `user_id` and `status` can suit independent searches. PostgreSQL may combine them through a bitmap scan for a query using both, but this does not preserve their ordering. A composite index can serve a recurring combined filter/sort more directly; maintaining both designs without a workload reason adds write and storage cost. Compare alternatives rather than keeping every index in this chapter. See [combining indexes](https://www.postgresql.org/docs/16/indexes-bitmap-scans.html).

A composite index is not automatically unique. `UNIQUE (user_id, status)` would forbid a user from having two orders in the same status—usually an incorrect business rule. A unique pair protects the combination, not each column individually.

#### Guided practice

[Exercises and learner checklist](../practice/node-js/module-08-postgresql-mikroorm.md).

### Partial index

```sql
CREATE INDEX orders_pending_created_at_idx
ON orders (created_at DESC)
WHERE status = 'pending';
```

This is compact and effective when pending rows are a small fraction and queries use a compatible predicate.

### Other useful PostgreSQL index types

| Type | Typical use |
| --- | --- |
| B-tree | Equality, range, ordering |
| GIN | `JSONB`, arrays, full-text search |
| GiST | Geometric/range/specialized operator classes |
| BRIN | Very large physically ordered tables, such as append-only time data |

### `EXPLAIN ANALYZE`

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM orders
WHERE user_id = '00000000-0000-0000-0000-000000000001'
  AND status = 'pending'
ORDER BY created_at DESC
LIMIT 20;
```

Look for:

- `Seq Scan`, `Index Scan`, `Index Only Scan`, or `Bitmap Heap Scan`;
- estimated versus actual rows;
- loops and rows removed by filters;
- sort method and memory/disk spill;
- planning and execution time;
- buffer hits and reads.

`EXPLAIN ANALYZE` actually executes the query. Use caution with writes; wrap them in a transaction and roll back when appropriate.

A sequential scan is not inherently bad. It may be optimal for small tables or queries returning a large fraction of rows. Trust evidence and the planner rather than demanding an index scan.

### Index costs

Every index consumes storage, cache, and write work. Add indexes for real access patterns, monitor unused/duplicate indexes, and remember that statistics must be current for good plans.

---

## 10. Transactions and ACID

A transaction groups statements into one unit of work.

```sql
BEGIN;

UPDATE accounts
SET balance = balance - 100
WHERE id = 1 AND balance >= 100;

UPDATE accounts
SET balance = balance + 100
WHERE id = 2;

COMMIT;
```

Application code must verify affected-row counts. An `UPDATE` matching zero rows is normally successful SQL, not an automatic exception.

If any checked precondition fails, issue `ROLLBACK`. After a PostgreSQL statement error, the transaction remains aborted until rolled back.

Single statements outside an explicit block run in implicit transactions (auto-commit).

### ACID

| Property | Meaning |
| --- | --- |
| Atomicity | All transaction effects commit, or none do |
| Consistency | Declared invariants are valid before and after commit |
| Isolation | Concurrent transactions interact according to an isolation level |
| Durability | A successful commit survives the failures covered by the durability configuration |

**Atomicity:** errors or explicit rollback prevent partial changes.

**Consistency:** types, `NOT NULL`, unique/check/foreign-key constraints, triggers, and correct transaction logic preserve invariants. ACID does not invent missing business constraints.

**Isolation:** visibility and concurrency anomalies depend on the isolation level and locks, not merely the existence of a transaction.

**Durability:** PostgreSQL uses write-ahead logging (WAL) and recovery. Exact guarantees still depend on configuration, storage, replication, and acknowledgement policy.

### Savepoints

```sql
BEGIN;
INSERT INTO orders (...) VALUES (...);
SAVEPOINT before_optional_item;
INSERT INTO order_items (...) VALUES (...);
ROLLBACK TO SAVEPOINT before_optional_item;
COMMIT;
```

Savepoints allow partial rollback inside a larger transaction, but use them only when partial success is an intentional business rule.

---

## 11. Isolation and concurrency

PostgreSQL exposes SQL isolation levels:

| Level requested | PostgreSQL behavior |
| --- | --- |
| Read Uncommitted | Behaves as Read Committed |
| Read Committed | Each statement sees a committed snapshot at statement start; default |
| Repeatable Read | Transaction uses a stable snapshot and prevents several anomalies |
| Serializable | Behaves as if successful transactions ran serially; may abort for retry |

Read Committed prevents dirty reads, but repeated queries in one transaction can observe newly committed changes.

### Lost decision example

Two transactions read one remaining seat, both decide it is available, then both try to reserve it. A transaction alone at Read Committed does not make the read-then-write decision safe.

Options include:

**Atomic conditional update:**

```sql
UPDATE flights
SET seats_available = seats_available - 1
WHERE id = $1 AND seats_available > 0
RETURNING seats_available;
```

Success is determined by whether a row was returned.

**Row lock:**

```sql
BEGIN;
SELECT seats_available
FROM flights
WHERE id = $1
FOR UPDATE;
-- validate, update, insert booking
COMMIT;
```

**Serializable transaction:** run with serializable isolation and retry serialization failures.

Prefer constraints and atomic SQL when they express the invariant. Keep transactions short, access resources in a consistent order, handle deadlocks/serialization failures with bounded retries, and never perform slow network calls while holding database locks unless the workflow is deliberately designed for it.

---

## 12. ORM concepts and patterns

An **Object-Relational Mapper (ORM)** maps tables/rows to application types and generates SQL for common operations.

Benefits:

- typed entities and query APIs;
- less repetitive CRUD mapping;
- declared relationships;
- change tracking and Unit of Work;
- migration tooling;
- parameter binding by default.

Costs:

- generated SQL can be inefficient or surprising;
- developers must learn both SQL and ORM behavior;
- advanced/reporting queries may be clearer in SQL/query builders;
- portability is limited by database-specific types and semantics;
- careless relation loading causes N+1 queries or huge object graphs.

Use raw parameterized SQL or a query builder when it expresses a complex or performance-critical query more clearly. An ORM is a tool, not a ban on SQL.

### Active Record

Entities contain persistence methods:

```ts
const user = new User();
user.name = 'Alice';
await user.save();
```

This is concise but couples domain objects to persistence.

### Data Mapper

Entities hold data; a separate EntityManager/repository performs persistence:

```ts
const user = em.create(User, { name: 'Alice', email: 'alice@example.test' });
await em.persist(user).flush();
```

MikroORM uses Data Mapper plus Identity Map and Unit of Work.

### ORM versus ODM

- ORM: relational tables, keys, joins, database-enforced schema.
- ODM: document collections, nested documents, document-oriented APIs.

MikroORM is an ORM; Mongoose is an ODM.

---

## 13. MikroORM setup

### One complete primary baseline

Use **MikroORM 7.2.5**, Node 24.18.0 and TypeScript 5.9.3 in an ESM practice project with legacy decorators and explicit reflection. MikroORM 7 requires Node22.17+ and TypeScript5.8+; NodeNext/Bundler-aware module resolution is needed for its exports. All @mikro-orm packages below share an exact version. Install these dependencies in a separate practice project; the documentation site's dependencies serve a different purpose.

```bash
npm install --save-exact @mikro-orm/core@7.2.5 @mikro-orm/postgresql@7.2.5 @mikro-orm/decorators@7.2.5 @mikro-orm/migrations@7.2.5 reflect-metadata
npm install --save-dev --save-exact @mikro-orm/cli@7.2.5 typescript@5.9.3 @types/node@24
```

Commit the resolved lockfile and use npm ci; pin the chosen Node patch/container in CI. The command's @types/node major resolves a matching declaration patch that the lockfile records. Upgrading the ORM requires reviewing the migration guide and rerunning metadata/query/migration tests, not changing one package alone.

```json
{
  "type": "module",
  "mikro-orm": { "configPaths": ["./dist/mikro-orm.config.js"], "preferTs": false },
  "scripts": {
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "build": "tsc -p tsconfig.json",
    "orm": "mikro-orm",
    "seed:reference": "node dist/seed.js"
  }
}
```

```json
{
  "compilerOptions": {
    "target": "ES2022", "module": "NodeNext", "moduleResolution": "NodeNext",
    "rootDir": "src", "outDir": "dist", "strict": true,
    "noUncheckedIndexedAccess": true, "exactOptionalPropertyTypes": true,
    "experimentalDecorators": true, "emitDecoratorMetadata": true,
    "esModuleInterop": true, "skipLibCheck": true, "types": ["node"]
  },
  "include": ["src/**/*.ts"]
}
```

The primary path compiles with tsc so design metadata is emitted. A fast TS transpiler that omits that metadata is not an equivalent reflection setup. Standard decorators from @mikro-orm/decorators/es and defineEntity are alternatives with different metadata contracts; they are not additional mastery requirements. MikroORM 6 imported decorators from core; keep that only as explicitly versioned migration context.

### Configuration

```ts
// src/mikro-orm.config.ts — compiles to dist/mikro-orm.config.js
import 'reflect-metadata'; // Before decorated entity evaluation.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@mikro-orm/postgresql';
import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { Migrator } from '@mikro-orm/migrations';
import { User } from './entities/user.entity.js';
function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}
const rawPort = process.env.DB_PORT ?? '5432';
if (!/^[0-9]{1,5}$/.test(rawPort)) throw new Error('Invalid DB_PORT');
const port = Number(rawPort);
if (port < 1 || port > 65535) throw new Error('DB_PORT out of range');
// Both src/config.ts and dist/config.js are exactly one directory below project root.
const projectRoot = fileURLToPath(new URL('../', import.meta.url));
export default defineConfig({
  entities: [User],
  metadataProvider: ReflectMetadataProvider,
  dbName: required('DB_NAME'), host: required('DB_HOST'), port,
  user: required('DB_USER'), password: required('DB_PASSWORD'),
  extensions: [Migrator], pool: { min: 0, max: 10 },
  migrations: {
    path: path.join(projectRoot, 'dist/migrations'),
    pathTs: path.join(projectRoot, 'src/migrations'),
    emit: 'ts', transactional: true,
  },
  debug: false,
});
```

Configure supplied task database credentials exactly in the real assignment; do not copy a tutorial credential into it. For a disposable private local fixture a separate explicit test configuration can override values. Production must add the supported TLS/trust/timeouts/pool policy for its deployment; this minimal localhost setup is not a remote secure connection recipe. Debug SQL can expose sensitive parameters, so it is deliberately off here.

The config explicitly registers Migrator and the legacy ReflectMetadataProvider, now located in the decorators package. Entity discovery uses actual compiled class imports; the one complete User entity below is sufficient for this bootstrap. Relationship fragments later extend it and require adding the corresponding entity classes to discovery. Source and output paths remain distinct; do not scan both TS and compiled JS entities at runtime and create duplicate metadata.

### Initialize and close

```ts
// src/database.ts — in the standalone User modeling exercise
import { MikroORM } from '@mikro-orm/postgresql';
import config from './mikro-orm.config.js';

export async function openDatabase() {
  const orm = await MikroORM.init(config);
  try {
    await orm.connect();
    await orm.em.getConnection().execute('select 1');
    return orm;
  } catch (startupError) {
    try { await orm.close(true); }
    catch (cleanupError) {
      throw new AggregateError([startupError, cleanupError], 'Database startup failed');
    }
    throw startupError;
  }
}

// The composition root calls openDatabase before listen, then owns orm.close(true).
```

MikroORM 7 initializes metadata before it opens a connection. Successful `init()` alone does not prove that the server is reachable. Connect and execute a bounded lightweight query before accepting traffic; configure driver acquisition/statement timeouts as explained in Module 10. Close after success in the owning script/server and close on startup failure here. Never print the raw connection error: it may contain connection details.

[Related practice](../practice/node-js/module-08-postgresql-mikroorm.md).

---

## 14. Entities, EntityManager, and Unit of Work

### Entity

```ts
import { randomUUID } from 'node:crypto';
import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @Property({ length: 100 })
  name!: string;

  @Property({ unique: true, length: 255 })
  email!: string;

  @Property({ nullable: true })
  age?: number;

  @Property({ default: 'user' })
  role: string = 'user';

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
```

This is src/entities/user.entity.ts in the primary7.2.5 project. Reflection requires the explicit provider/bootstrap/compiler setup above. Use ordinary scalar Date annotations; for circular entity relationships use the version-appropriate Rel wrapper/metadata strategy rather than triggering an ESM temporal-dead-zone error.

### EntityManager

The EntityManager loads, creates, tracks, persists, and removes entities. It owns an Identity Map and Unit of Work.

### Identity Map

Within one EntityManager context, the same database row maps to the same object identity:

```ts
const a = await em.findOneOrFail(User, id);
const b = await em.findOneOrFail(User, id);
console.log(a === b); // true in the same context
```

### Unit of Work

The Unit of Work tracks entity snapshots and calculates changes at `flush()`.

```ts
const user = await em.findOneOrFail(User, id);
user.name = 'Updated name';
await em.persist(user).flush();
```

No explicit SQL UPDATE method is needed. This example explicitly marks the managed entity for persistence before flushing. MikroORM 7 changed automatic flush-mode scalar change detection; do not assume every subsequent query auto-flushes an unmarked scalar assignment. Explicit persist+flush makes the intended write boundary visible. flush synchronizes scheduled changes and groups them transactionally by default.

### Repository

An `EntityRepository<User>` is a typed facade around an EntityManager for one entity. Keep repositories focused on persistence; put business workflows in services.

---

## 15. CRUD with MikroORM

Assume `em` is a request-scoped or explicitly forked EntityManager.

### Create

```ts
export async function createUser(
  em: EntityManager,
  input: { name: string; email: string; age?: number },
): Promise<User> {
  const user = em.create(User, input);
  await em.persist(user).flush();
  return user;
}
```

Stage several related entities, then flush once when they form one unit of work.

### Read

```ts
const all = await em.findAll(User, {
  orderBy: { createdAt: 'DESC' },
  limit: 20,
});

const one = await em.findOne(User, { id });       // User | null
const required = await em.findOneOrFail(User, { id });
const byEmail = await em.findOne(User, { email });
```

Apply limits and deterministic ordering to collection endpoints.

### Update managed entity

```ts
export async function updateUser(
  em: EntityManager,
  id: string,
  patch: Partial<Pick<User, 'name' | 'email' | 'age'>>,
): Promise<User | null> {
  const user = await em.findOne(User, { id });
  if (!user) return null;

  em.assign(user, patch);
  await em.persist(user).flush();
  return user;
}
```

Allowlist patch fields before reaching the repository. `Object.assign` is only safe when input has already been restricted.

### Delete

```ts
const user = await em.findOne(User, { id });
if (!user) return false;

await em.remove(user).flush();
return true;
```

For bulk deletion without loading entities:

```ts
const deletedCount = await em.nativeDelete(User, { role: 'inactive' });
```

Native operations bypass normal managed-entity lifecycle behavior; understand hooks and Unit-of-Work implications.

### Database exceptions

```ts
import {
  ForeignKeyConstraintViolationException,
  NotNullConstraintViolationException,
  UniqueConstraintViolationException,
} from '@mikro-orm/core';
```

Translate known constraint violations into domain/application errors. Keep unexpected database details out of HTTP responses.

---

## 16. Request context and identity map

Never share one mutable Identity Map across concurrent HTTP requests. Each request needs an isolated EntityManager fork.

### Manual fork

```ts
const em = orm.em.fork();
const users = await em.find(User, {});
```

This works for scripts and explicit service/repository injection.

### Express `RequestContext`

```ts
import { RequestContext } from '@mikro-orm/core';

app.use(express.json());

app.use((_req, _res, next) => {
  RequestContext.create(orm.em, next);
});

app.use('/api/users', usersRouter);
```

Register the context after middleware that must run outside it and before routes that use the ORM. MikroORM resolves the global EntityManager through the request's async context, giving each request its own fork and Identity Map.

For queue consumers, scheduled jobs, and standalone scripts, create an explicit fork or use the version-appropriate request-context helper at the top-level job boundary.

### Dependency flow

```text
Express request
  → request-scoped EntityManager
  → service
  → repository
  → PostgreSQL
```

Pass the scoped EntityManager through a unit-of-work boundary when several repository calls must share one transaction. Forking separately inside every repository call prevents them from naturally participating in the same transaction unless carefully coordinated.

---

## 17. MikroORM relationships

Every bidirectional relationship has an **owning side**, which stores the foreign key or owns the join table, and an **inverse side**, which provides navigation.

To-many relations use MikroORM `Collection<T>`, not plain arrays, so changes can be tracked. In the primary7.2.5 setup import Collection and type Rel from @mikro-orm/core, and all relationship decorators from @mikro-orm/decorators/legacy. These are model-extension fragments: declare both ends on their actual entity classes, register those entities and use `Rel<T>` on circular to-one property types when reflection would eagerly evaluate the other class. Do not paste standalone property decorators at module scope. The complete scalar User bootstrap is independent of these optional relation extensions.

### One-to-one

```ts
@Entity({ tableName: 'profiles' })
export class Profile {
  @PrimaryKey({ type: 'uuid' })
  id = randomUUID();

  @Property({ nullable: true })
  bio?: string;

  @OneToOne(() => User, (user) => user.profile)
  user!: Rel<User>;
}

// Merge this field into User; this skeleton is not a second entity.
class UserRelationFields {
  @OneToOne(() => Profile, (profile) => profile.user, { owner: true })
  profile!: Rel<Profile>;
}
```

Choose ownership based on which table should contain the unique foreign key and whether the relation is optional. Verify the generated migration rather than assuming the physical layout.

### One-to-many / many-to-one

```ts
@Entity({ tableName: 'posts' })
export class Post {
  @PrimaryKey({ type: 'uuid' })
  id = randomUUID();

  @Property()
  title!: string;

  @Property({ columnType: 'text' })
  body!: string;
  @Property()
  createdAt: Date = new Date();

  @ManyToOne(() => User)
  author!: Rel<User>; // owning side; FK is on posts
}

// Merge this field into User, rather than registering a second entity.
class UserCollectionFields {
  @OneToMany(() => Post, (post) => post.author)
  posts = new Collection<Post>(this);
}
```

The many-to-one side owns the foreign key. `OneToMany` is the inverse navigation.

### Many-to-many

```ts
@Entity({ tableName: 'tags' })
export class Tag {
  @PrimaryKey({ type: 'uuid' })
  id = randomUUID();

  @Property({ unique: true })
  name!: string;

  @ManyToMany(() => Post, (post) => post.tags)
  posts = new Collection<Post>(this);
}

// Merge this field into Post, rather than registering a second entity.
class PostCollectionFields {
  @ManyToMany(() => Tag, (tag) => tag.posts, { owner: true })
  tags = new Collection<Tag>(this);
}
```

MikroORM manages the join table. If the relationship has domain attributes—`addedAt`, `assignedBy`, `position`—model the join table as an explicit entity instead of a hidden many-to-many.

### Collection changes

```ts
const post = await em.findOneOrFail(
  Post,
  { id: postId },
  { populate: ['tags'] },
);
const tag = await em.findOneOrFail(Tag, { name: tagName });

post.tags.add(tag);
await em.flush();
```

Use cascade and `orphanRemoval` carefully. Removing an item from a collection can become a permanent row deletion when orphan removal is enabled.

---

## 18. Population and the N+1 problem

Relations are not all loaded automatically. Request the graph needed for a use case.

```ts
const user = await em.findOne(
  User,
  { id },
  { populate: ['profile', 'posts.tags'] },
);
```

### N+1

The N+1 pattern performs one parent query plus one relation query per parent:

```ts
const posts = await em.find(Post, {}); // 1 query

for (const post of posts) {
  await post.tags.init();              // N more queries
}
```

Populate in a batch:

```ts
const posts = await em.find(
  Post,
  {},
  { populate: ['tags'] },
);
```

MikroORM 7.2.5 defaults to balanced loading. Earlier majors had other defaults; choose/test explicitly rather than infer from a different major:

- **select-in:** separate batched query per relationship level; avoids Cartesian explosion for to-many relations;
- **joined:** retrieves relations with joins; often useful for to-one graphs;
- **balanced:** combines joined loading for to-one and select-in for to-many in the selected MikroORM 7.2 baseline.

The goal is not always one SQL statement. Two bounded queries can outperform one enormous join. Measure query count, transferred rows, memory, and latency.

### Do not populate unbounded collections

```ts
const posts = await em.find(
  Post,
  { author: userId },
  {
    limit: 20,
    offset: 0,
    orderBy: { createdAt: 'DESC' },
    populate: ['tags'],
  },
);
```

Query large child collections directly so they can be filtered and paginated. Populate only fields required by the response.

---

## 19. Migrations and seeds

Migrations evolve a schema incrementally and reproducibly. Entity changes alone do not safely update production databases.

### Workflow

1. Change entity metadata.
2. Generate a migration.
3. Read the generated SQL carefully.
4. Test applying and, where supported, reverting it on realistic data.
5. Commit the entity and migration together.
6. Run migrations as a controlled deployment step.

Compiled-first workflow for the primary7.2.5 project:

```bash
npm run build
npm run orm -- migration:create --path src/migrations
# Review generated source/SQL, then compile that reviewed migration:
npm run build
npm run orm -- migration:up
npm run orm -- migration:pending
npm run orm -- migration:list
```

The CLI uses dist/mikro-orm.config.js. The create command explicitly writes TS source into src/migrations (verified against7.2.5 CLI), then tsc emits the JS that migration:up discovers under dist/migrations. Do not generate an unreviewed file only in dist and lose it on a clean build. In a disposable fixture, test migration:down only when its data-loss implications are understood; do not make rollback a universal production command. Running an ORM schema generator/drop/create command is for an explicitly disposable test database, not production migration policy.

Migrations are transactional by default where PostgreSQL operations permit it. A `down()` method is not automatically safe; destructive schema changes can lose data even if the DDL itself is reversible.

### Production migration design

Avoid a breaking one-step rename/removal while old code is running. Prefer expand-contract:

1. add a nullable/new structure;
2. deploy code that writes both or tolerates both;
3. backfill in controlled batches;
4. switch reads;
5. enforce constraints;
6. remove the old structure in a later deployment.

Run production migrations once in a dedicated deployment job, not concurrently from every application replica.

### Seeds: purpose, uniqueness and guaranteed closure

Reference data, development fixtures and production business data have different ownership. Reference values may use versioned idempotent seeds/migrations with review. Synthetic development data belongs only in a known disposable environment and must not reset a production dataset. Production user/customer/financial records need the real authorized workflow rather than an opportunistic setup script.

```ts
// src/seed.ts — bounded reference fixture in the primary project
import { randomUUID } from 'node:crypto';
import { MikroORM } from '@mikro-orm/postgresql';
import config from './mikro-orm.config.js';
import { User } from './entities/user.entity.js';
export async function seedReferenceUser(): Promise<void> {
  const orm = await MikroORM.init(config);
  try {
    await orm.connect();
    const em = orm.em.fork();
    const now = new Date();
    await em.upsert(User, {
      id: randomUUID(), name: 'Reference reader', email: 'reference-reader@example.test',
      role: 'user', createdAt: now, updatedAt: now,
    }, {
      onConflictFields: ['email'], onConflictAction: 'ignore',
    });
  } finally {
    await orm.close(true);
  }
}
seedReferenceUser().catch(error => {
  console.error('Reference seed failed', error);
  process.exitCode = 1;
});
```

The plain upsert payload supplies UUID and timestamps explicitly: class field initializers are not database defaults and cannot be assumed to run for a plain object upsert. The unique email constraint is required. The database upsert coordinates concurrent seed executions, whereas findOne-then-create alone races. Ignore-on-conflict preserves an existing record instead of overwriting a user's name/role; a real reference table should have a stable domain key and an explicit change policy.

This User row is a small setup fixture, not an administrator provisioning recipe. If the actual domain forbids sample users, use a dedicated reference entity/table and register it in metadata.

In MikroORM 7, init discovers metadata without opening the database connection; the removed connect:false option is unnecessary. Explicit connect runs inside try so finally closes the ORM if connection or upsert fails. The entrypoint observes rejection and records a failing exit code; never put the close only after a successful flush. Closing can also fail; production tooling should retain primary and cleanup errors deliberately if both occur, as in the shared cleanup lesson.

Run the real build/seed twice and concurrently, verify one row, existing-value preservation and natural process termination. An offline mock cannot establish database conflict behavior.

---

## 20. Transactions in MikroORM

### Implicit transaction on flush

Unit-of-Work changes flushed together are wrapped atomically by default.

```ts
const profile = em.create(Profile, { bio });
const user = em.create(User, { name, email, profile });

em.persist([profile, user]);
await em.flush();
```

If one generated statement fails, the flush transaction rolls back.

### Explicit transaction

```ts
if (!Number.isSafeInteger(quantity) || quantity < 1) {
  throw new TypeError('Quantity must be a positive safe integer');
}
const order = await orm.em.transactional(async (em) => {
  const product = await em.findOneOrFail(
    Product,
    { id: productId },
    { lockMode: LockMode.PESSIMISTIC_WRITE },
  );

  if (product.stock < quantity) {
    throw new Error('Insufficient stock');
  }

  product.stock -= quantity;
  const order = em.create(Order, { user, status: 'pending' });
  em.create(OrderItem, { order, product, quantity, unitPrice: product.price });

  return order;
});
```

`transactional()` commits when the callback completes and rolls back when it throws. Current MikroORM versions flush pending changes when the transaction callback succeeds; follow the installed version's contract.

Use explicit transactions when:

- logic reads state and then writes based on it;
- several repository operations form one invariant;
- locks or an explicit isolation level are needed;
- failure must undo all related writes.

Repositories participating in one transaction must use the EntityManager passed into the callback. Calling a repository that creates an unrelated fork breaks the intended transaction boundary.

Prefer callback-based transactions over manual `begin`/`commit`/`rollback`. Retry deadlocks or serialization failures only when the complete operation is safe to retry and attempts are bounded.

---

## 21. Architecture, testing, and production readiness

### Layering

```mermaid
flowchart TD
    H["HTTP controller\nvalidation and status"] --> S["Service\nbusiness transaction/use case"]
    S --> R["Repository\npersistence queries"]
    R --> O["MikroORM\nEntityManager + entities"]
    O --> P[("PostgreSQL")]
```

The service should own business transaction boundaries. Repositories accept the appropriate scoped EntityManager and do focused persistence work. Controllers should not know join tables, lock modes, or constraint names.

### Test layers

| Target | Test style |
| --- | --- |
| Pure business rule | Unit test |
| Service orchestration | Unit test with repository fakes where useful |
| Repository mappings/queries | Integration test with real PostgreSQL |
| Constraints and transactions | Integration test with real PostgreSQL |
| Express API | Supertest with isolated database state |
| Migrations | Apply to empty and representative prior schemas |

Database behavior—constraints, isolation, joins, SQL generation—cannot be fully verified with mocks. Use a disposable PostgreSQL instance matching production's major version.

Clean up reliably, avoid shared mutable fixtures, isolate parallel tests, close the ORM, and ensure test commands terminate.

### Production checklist

- Keep credentials in environment/secret management and require TLS remotely.
- Apply least-privilege database roles.
- Set pool size across all application replicas within server capacity.
- Configure connection, statement, transaction, and lock timeouts deliberately.
- Validate and parameterize every dynamic input; allowlist sort columns/directions.
- Enforce critical invariants with database constraints.
- Index measured queries and inspect `EXPLAIN (ANALYZE, BUFFERS)`.
- Detect N+1 patterns through SQL logging/APM in non-sensitive environments.
- Paginate collections and avoid unbounded population.
- Keep transactions short and external calls outside lock-holding sections.
- Review every migration and plan zero-downtime compatibility.
- Back up data and test restoration.
- Monitor slow queries, locks, deadlocks, connection saturation, replication, and storage.
- Gracefully close HTTP and ORM resources.

### Common mistakes

| Mistake | Consequence | Better approach |
| --- | --- | --- |
| Application-only validation | Other writers/races violate invariants | Add database constraints |
| String interpolation in SQL | SQL injection | Parameter binding/query builder |
| No index on busy foreign keys | Slow joins/deletes | Measure and add suitable indexes |
| Indexing every column | Slow writes and wasted cache | Index real query patterns |
| Treating every sequential scan as bad | Unnecessary/worse indexes | Read actual query plans |
| Assuming a transaction prevents all races | Double booking/lost decisions | Atomic SQL, locks, or correct isolation |
| Ignoring affected-row counts | Missing row treated as success | Check returned rows/counts |
| Shared global EntityManager context | Cross-request identity state | RequestContext or explicit fork |
| Forking inside each repository during a workflow | Broken transaction boundary | Share the transactional EntityManager |
| Loading relations in a loop | N+1 queries | Populate/batch explicitly |
| Populating huge collections | Memory and latency spikes | Direct filtered, paginated query |
| Auto-syncing production schema | Unreviewed destructive changes | Versioned migrations |
| Mixing MikroORM major-version examples | Compile/runtime failures | Follow the installed version docs |

---

## 22. Locking, deadlocks, and safe retries

Transactions isolate work, but concurrent transactions can still compete for the same rows.

### Pessimistic row lock

```sql
BEGIN;

SELECT stock
FROM products
WHERE id = $1
FOR UPDATE;

UPDATE products
SET stock = stock - $2
WHERE id = $1
  AND stock >= $2;

COMMIT;
```

**What it does:** locks the selected row against conflicting updates until the transaction ends. The conditional update still protects the invariant.

**When to use it:** use pessimistic locking when conflicts are expected and a workflow must make several decisions using locked state.

Locks reduce concurrency. Never wait for user input or call a slow remote service while holding them.

### Optimistic locking

```sql
UPDATE products
SET name = $1,
    version = version + 1
WHERE id = $2
  AND version = $3;
```

If zero rows change, the record was removed or its version changed.

**When to use it:** optimistic locking works well when conflicts are rare and the caller can reload, merge, or report a conflict.

### Deadlocks

A deadlock occurs when transactions wait on each other in a cycle:

```text
transaction A holds row 1 and waits for row 2
transaction B holds row 2 and waits for row 1
```

PostgreSQL detects the cycle and aborts one transaction. Your application must be ready for that failure.

Reduce deadlocks by:

- updating shared resources in a consistent order;
- keeping transactions short;
- indexing predicates so updates find rows quickly;
- avoiding unnecessary locks;
- splitting oversized batches;
- monitoring blocked queries and lock wait time.

### Safe transaction retry

```ts
async function retryTransaction<T>(work: () => Promise<T>): Promise<T> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await work();
    } catch (error) {
      if (!isRetryableTransactionError(error) || attempt === 3) throw error;
      await delayWithJitter(attempt);
    }
  }

  throw new Error('Unreachable');
}
```

**What it does:** retries only classified transient transaction failures and limits attempts.

**When to use it:** retry deadlock victims or serialization failures when the complete transaction callback is safe to repeat.

Do not send email, charge a card, or publish an irreversible event directly inside a retryable callback. Use an outbox or idempotent external operation.

---

## 23. Connection pools and database diagnostics

### Pool mental model

```text
application requests → wait queue → finite connections → PostgreSQL
```

A pool limits concurrent database work. When every connection is busy, new operations wait.

Increasing the pool can reduce waiting until the database becomes saturated. Beyond that point, more connections often increase contention and memory use.

Across replicas:

```text
maximum possible connections
≈ application replica count × pool maximum
+ migrations, admin tools, and background workers
```

Leave capacity for failover, maintenance, and operational access.

### Bound pool waiting and query time

Use finite limits for:

- acquiring a connection;
- establishing a connection;
- executing a statement;
- idle transactions;
- the caller's total request deadline.

A request should fail predictably instead of waiting forever in a pool queue.

### Diagnose a slow database operation

1. Separate pool-wait time from execution time.
2. Capture the normalized query and safe parameters.
3. Use `EXPLAIN (ANALYZE, BUFFERS)` in a safe representative environment.
4. Compare estimated and actual row counts.
5. Look for sequential scans, large sorts, nested-loop explosions, and disk reads.
6. Check blocking locks and long-running transactions.
7. Measure after changing the query or index.

Do not run `EXPLAIN ANALYZE` casually on destructive or very expensive production statements. It executes the query.

### Common symptoms

| Symptom | Likely cause |
| --- | --- |
| Pool wait rises, query time stable | Too much application concurrency or pool too small |
| Query time rises across system | Database saturation, lock contention, I/O, or plan change |
| Idle-in-transaction sessions | Missing commit/rollback or work performed inside transaction |
| Deadlock errors | Inconsistent lock order or oversized transaction |
| Duplicate value errors | Expected race correctly stopped by unique constraint, or missing conflict handling |
| N+1 latency | Relationship loaded once per parent rather than batched/joined |
| Sequential scan after growth | Missing index, low selectivity, stale statistics, or mismatched predicate |
| Connection storm during deploy | Pool size multiplied by new and old replicas |

### Safe migration sequence

For a new required field:

1. Add it as nullable or with a safe compatible default.
2. Deploy code that can read both states and writes the new state.
3. Backfill old rows in bounded batches.
4. Verify no old state remains.
5. Add the final constraint.
6. Remove compatibility code in a later deployment.

This expand-and-contract sequence supports rolling deployments where old and new application versions overlap.

### Diagnostic exercise

[Exercises and learner checklist](../practice/node-js/module-08-postgresql-mikroorm.md).

## Graduated practice: persistence and migrations

[Exercises and learner checklist](../practice/node-js/module-08-postgresql-mikroorm.md).

## 24. Final review checklist

[Exercises and learner checklist](../practice/node-js/module-08-postgresql-mikroorm.md).

### One-minute recap

Relational databases protect structured data through typed tables, keys, constraints, joins, and transactions. Normalize to remove anomalies, then denormalize only for proven needs. Index actual filter, join, and sort patterns and verify plans rather than guessing. PostgreSQL provides strong transactional tools, but concurrency correctness still requires atomic statements, locks, or the right isolation level. MikroORM maps TypeScript entities to PostgreSQL using Data Mapper, Identity Map, and Unit of Work; each request needs an isolated EntityManager, relations should be populated intentionally, schema evolution belongs in reviewed migrations, and multi-step invariants belong inside one shared transaction scope.
