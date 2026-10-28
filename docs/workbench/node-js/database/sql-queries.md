# SQL Query Workbench: From Rows to Reports

This companion to [PostgreSQL and MikroORM](../../../node-js/module-08-postgresql-mikroorm.md) targets independent intermediate SQL work. Use PostgreSQL16 as the executable baseline; the primary application remains Node24/TypeScript/Express/MikroORM7. SQL is still necessary for inspecting data, debugging ORM queries and writing reports. This lesson uses integer minor units for one currency. Production money needs an explicit currency, rounding and range policy.

## One disposable fixture

Run with psql against an explicitly disposable database, using task-provided connection settings. Use `psql -X -v ON_ERROR_STOP=1` so startup settings and ignored statement errors do not hide failures. The schema name is intentionally fixed: creation fails if it already exists; inspect ownership before deciding whether to remove it. Do not run the cleanup against an unrelated schema.

```sql
CREATE SCHEMA notes_sql_workbench;
SET search_path TO notes_sql_workbench;
CREATE TABLE customers (
  id integer PRIMARY KEY,
  name text NOT NULL
);
CREATE TABLE orders (
  id integer PRIMARY KEY,
  customer_id integer NOT NULL REFERENCES customers(id),
  status text NOT NULL CHECK (status IN ('draft', 'paid', 'cancelled')),
  total_cents integer NOT NULL CHECK (total_cents >= 0),
  created_at timestamptz NOT NULL
);
CREATE TABLE order_items (
  order_id integer NOT NULL REFERENCES orders(id),
  line_no integer NOT NULL,
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  PRIMARY KEY (order_id, line_no)
);
INSERT INTO customers VALUES (1, 'Ada'), (2, 'Bela'), (3, 'Csilla');
INSERT INTO orders VALUES
  (101, 1, 'paid', 1000, '2026-01-01T10:00:00Z'),
  (102, 1, 'paid', 1000, '2026-01-02T10:00:00Z'),
  (103, 2, 'draft', 500, '2026-01-02T11:00:00Z'),
  (104, 2, 'paid', 2000, '2026-01-02T10:00:00Z'),
  (105, 1, 'cancelled', 3000, '2026-01-03T10:00:00Z');
INSERT INTO order_items VALUES
  (101, 1, 400), (101, 2, 600), (102, 1, 1000),
  (104, 1, 1000), (104, 2, 1000);
```

The report's grain is the unit represented by one row: customer, order or item. State it before joining. One order joined to two items becomes two rows; blindly summing the order total then double-counts it. Constraints here do not enforce that item sums equal the order total across multiple rows; that needs an explicit transactional domain rule or reconciliation policy.

## Parameterized CRUD without an ORM

psql PREPARE/EXECUTE demonstrates typed value binding. Application adapters should use their driver's parameter API; SQL placeholders are not string interpolation. In raw PostgreSQL prepared statements they are `$1`, `$2`; MikroORM's SQL helper uses its documented `?` binding syntax. Do not mix those APIs.

```sql
PREPARE create_customer(integer, text) AS
  INSERT INTO customers(id, name) VALUES ($1, $2) RETURNING id, name;
PREPARE read_customer(integer) AS
  SELECT id, name FROM customers WHERE id = $1;
PREPARE rename_customer(integer, text) AS
  UPDATE customers SET name = $2 WHERE id = $1 RETURNING id, name;
PREPARE delete_customer(integer) AS
  DELETE FROM customers WHERE id = $1 RETURNING id;
BEGIN;
EXECUTE create_customer(4, 'Dora');
EXECUTE read_customer(4);
EXECUTE rename_customer(4, 'Name''); DROP TABLE customers;--');
EXECUTE read_customer(4);
EXECUTE delete_customer(4);
ROLLBACK;
DEALLOCATE create_customer;
DEALLOCATE read_customer;
DEALLOCATE rename_customer;
DEALLOCATE delete_customer;
```

The hostile-looking name is stored as data; it cannot turn into another statement. The rollback restores the initial fixture. UPDATE/DELETE with no matching row returns no row, not a database error. A foreign-key-protected customer with orders cannot simply be deleted under this model. Decide whether to retain, anonymize or remove dependent data through the authorized workflow.

Binding protects values. It cannot bind a table name, column name, operator or ORDER BY direction. Choose these from a fixed developer-owned allowlist. Also apply tenant/owner predicates in the write itself; see [conditional ownership](../../../node-js/module-09-authentication-authorization.md#ownership-and-attribute-based-access-control). Parameterization does not grant authorization or validate a business rule.

## Grouping, HAVING and NULL

WHERE selects input rows. GROUP BY produces one row per key. Aggregates operate on those groups. HAVING filters groups after aggregation. Think in that order even though PostgreSQL can optimize physical execution differently.

```sql
SELECT customer_id, COUNT(*) AS paid_orders, SUM(total_cents) AS paid_cents
FROM orders
WHERE status = 'paid'
GROUP BY customer_id
HAVING SUM(total_cents) >= 2000
ORDER BY customer_id;
```

Expected: customer1 has2 paid orders and2000 cents; customer2 has1 and2000. The draft and cancelled orders do not count. Putting an aggregate condition in WHERE is invalid because individual input rows do not yet represent groups.

Preserve customers with no paid orders by putting the right-side status filter in the LEFT JOIN condition:

```sql
SELECT c.id, COUNT(o.id) AS paid_orders,
       COALESCE(SUM(o.total_cents), 0) AS paid_cents
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.id AND o.status = 'paid'
GROUP BY c.id
ORDER BY c.id;
```

Expected rows: `(1,2,2000)`, `(2,1,2000)`, `(3,0,0)`. COUNT(*) would count the null-extended row for customer3 as1. COUNT(expression) ignores NULL. SUM/AVG ignore NULL inputs and return NULL on no non-null input; COUNT returns0 on no input. COALESCE is a reporting policy: zero revenue is appropriate here, but replacing unknown measurements with zero can falsify an average. Moving `o.status = 'paid'` into WHERE would remove customer3.

```sql
SELECT COUNT(*) AS input_rows, COUNT(v) AS known_values,
       SUM(v) AS total, AVG(v) AS average
FROM (VALUES (10), (NULL), (20)) AS sample(v);
```

Expected:3 rows,2 known values,30 total,15 average. SQL NULL represents missing/unknown, and comparisons with NULL generally yield unknown. Use IS NULL, not `= NULL`.

## Subqueries: scalar, sets and existence

A subquery is a SELECT inside another statement. Use it to express a dependency rather than fetch a large list into application memory. PostgreSQL can turn equivalent forms into similar plans; choose understandable semantics and inspect EXPLAIN on realistic data.

```sql
SELECT c.id, c.name
FROM customers AS c
WHERE EXISTS (
  SELECT 1 FROM orders AS o
  WHERE o.customer_id = c.id AND o.status = 'paid'
)
ORDER BY c.id;
```

This correlated EXISTS refers to the current outer customer and asks whether at least one paid order exists. It returns customers1 and2 once each, even when a customer has several matches. An ordinary join would duplicate the customer unless explicitly grouped/deduplicated. SELECT1 is conventional; EXISTS tests row existence, not that projected value.

```sql
SELECT c.id
FROM customers AS c
WHERE NOT EXISTS (
  SELECT 1 FROM orders AS o
  WHERE o.customer_id = c.id AND o.status = 'paid'
)
ORDER BY c.id;
```

Expected:3. NOT IN has a NULL trap when its input can contain NULL:

```sql
SELECT 2 NOT IN (SELECT v FROM (VALUES (1), (NULL)) AS blocked(v)) AS unsafe_answer;
```

Expected:NULL, so it would not pass WHERE. Do not “fix” a query by assuming nullable data never contains NULL; either enforce the invariant or use the intended NOT EXISTS relationship.

A scalar subquery must produce at most one row. An aggregate without GROUP BY is one way to ensure this:

```sql
SELECT id, total_cents
FROM orders
WHERE status = 'paid'
  AND total_cents > (SELECT AVG(total_cents) FROM orders WHERE status = 'paid')
ORDER BY id;
```

Expected:order104 only. A scalar subquery returning multiple rows is an error, not an arbitrary first row. LIMIT1 without a deterministic ORDER BY conceals the problem rather than define which row is intended. A correlated subquery is not inherently slow; missing indexes, repeated work and unsuitable data distributions are reasons to measure.

## CTEs: named stages and explicit grain

A Common Table Expression names a query stage within one statement. It improves readability and can be reused; it is not a persistent table or an automatic performance optimization.

```sql
WITH item_totals AS (
  SELECT order_id, SUM(amount_cents) AS item_cents
  FROM order_items GROUP BY order_id
), paid AS (
  SELECT o.id, o.customer_id, o.total_cents, i.item_cents
  FROM orders AS o
  JOIN item_totals AS i ON i.order_id = o.id
  WHERE o.status = 'paid'
)
SELECT customer_id, COUNT(*) AS paid_orders, SUM(item_cents) AS item_cents
FROM paid GROUP BY customer_id ORDER BY customer_id;
```

Expected:customer1 `(2,2000)`, customer2 `(1,2000)`. Aggregating items first restores one row per order before the reporting join. This INNER JOIN excludes paid orders without items; use LEFT JOIN plus an explicit missing-items policy when reconciliation must include them. Compare item_cents with total_cents to detect domain inconsistencies; do not silently substitute one for the other.

In PostgreSQL16, a nonrecursive, side-effect-free SELECT CTE used once can normally be folded into its parent. Multiple references commonly lead to materialization; MATERIALIZED/NOT MATERIALIZED can influence this, with restrictions. Materialization can avoid repeated expensive work but also block useful predicate pushdown; forcing inlining can duplicate work. Inspect the actual plan. A CTE is a statement-level abstraction; a temporary table has session/transaction storage and separate indexing/lifecycle trade-offs. Recursive CTEs suit hierarchies and graph walks, but require termination/cycle and depth policies; they are an optional extension after this lab.

## Window functions: retain rows while comparing them

GROUP BY collapses rows. A window function calculates over a partition while retaining individual rows. The OVER clause defines partition, ordering and frame. Window ORDER BY does not guarantee final result order: use an outer ORDER BY too.

```sql
SELECT id, customer_id, total_cents,
       ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at, id) AS customer_order,
       SUM(total_cents) OVER (
         ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS running_paid_cents
FROM orders WHERE status = 'paid'
ORDER BY created_at, id;
```

Expected IDs101/102/104, customer_order1/2/1, running totals1000/2000/4000. The explicit ROWS frame and unique ID tie-breaker make row-by-row accumulation deterministic. An ordered window's default frame includes peers through the current peer group. With ORDER BY created_at alone, orders102 and104 tie, so both can see the accumulated4000 rather than an arbitrary row-by-row intermediate value. Specify the business ordering/frame deliberately.

```sql
WITH totals AS (
  SELECT customer_id, SUM(total_cents) AS paid_cents
  FROM orders WHERE status = 'paid' GROUP BY customer_id
)
SELECT customer_id, paid_cents,
       RANK() OVER (ORDER BY paid_cents DESC) AS rank_with_gaps,
       DENSE_RANK() OVER (ORDER BY paid_cents DESC) AS rank_without_gaps,
       ROW_NUMBER() OVER (ORDER BY paid_cents DESC, customer_id) AS stable_position
FROM totals ORDER BY customer_id;
```

Both customers tie at rank1; stable positions are1 and2. RANK leaves gaps after ties; DENSE_RANK does not. Do not add the customer ID to the ranking expression if equal revenue should remain a business tie. ROW_NUMBER needs a total ordering when which row wins matters.

Filter a window result in another query stage, not the same WHERE that defines its input:

```sql
WITH ranked AS (
  SELECT id, customer_id, created_at,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC, id DESC) AS rn
  FROM orders WHERE status = 'paid'
)
SELECT id, customer_id FROM ranked WHERE rn = 1 ORDER BY customer_id;
```

Expected:latest paid orders102 and104. PostgreSQL DISTINCT ON can be a concise alternative for first-per-group queries; it also needs a matching deterministic ORDER BY and is less portable. LAG/LEAD compare preceding/following ordered rows; their default missing neighbor is NULL. FIRST_VALUE/LAST_VALUE depend on the frame, so LAST_VALUE with the default current-peer frame is often not the last row of the entire partition.

## Practice and verification

[Exercises and learner checklist](../../../practice/node-js/sql-query-workbench.md).
