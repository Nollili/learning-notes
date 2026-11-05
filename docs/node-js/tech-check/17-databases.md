---
outline: [2, 3]
---

# Database fundamentals and data access

The primary path is **PostgreSQL → parameterized SQL → MikroORM**, using Node.js 24, `pg` 8.16.3 and the application's pinned MikroORM 7.2.5 packages. SQL examples use PostgreSQL 16-compatible syntax; PostgreSQL 18 documentation is the reference for stated semantics, not a claim that the local server was upgraded.

The full [Relational Databases, PostgreSQL and MikroORM module](../module-08-postgresql-mikroorm.md) covers the requested relational curriculum: tables/types/keys, modeling and normalization, joins, indexes, ACID, PostgreSQL setup, ORM CRUD, relationships, population and migrations. Its [SQL workbench](../sql-query-workbench.md) adds executable reports. This page is the technical-examination companion, not a replacement or a second persistence stack.

## How do you choose a database from the data and workload? {#t17-q01}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Choose from invariants, access patterns, failure guarantees and operating constraints. **SQL versus NoSQL does not mean transactions versus no transactions.** For this Products API, related records, constraints and multi-row updates make PostgreSQL the primary store.

</div>

A relational schema declares tables, keys and constraints. Normalize repeated facts to reduce inconsistent updates, then denormalize only for an identified read workload with an explicit owner and refresh policy. A document aggregate embeds values usually read/changed together; cross-aggregate references still need consistency and lifecycle decisions.

| System | Useful fit | Decision to verify |
|---|---|---|
| PostgreSQL | Relations, constraints, transactions, reporting and JSONB | Isolation, query plans, extension/backup policy |
| MySQL | Existing relational applications and ecosystem | Storage engine, isolation, dialect and migration differences |
| SQL Server | Microsoft-integrated relational workloads | T-SQL, locking/row-versioning configuration, licensing |
| MongoDB | Nested document aggregates and controlled shape variation | Validation, document boundaries, indexes and transaction topology |
| Redis | Low-latency keys, expiring caches and specialized structures | Eviction, persistence, atomicity and failover guarantees |

Do not choose Redis as the authoritative inventory store merely because reads are fast. A lost/evicted cache entry must be reconstructible if the cache is not the source of truth. MongoDB supports transactions; PostgreSQL supports JSONB. Actual topology and workload determine guarantees. Redis multi-command workflows need transactions/scripts or an appropriate atomic command; a Node callback sequence is not atomic across clients.

<span class="notes-section-label">**Practice and acceptance**</span>

Compare catalogue descriptions, stock reservations and a login session store. State source of truth, schema/validation, expiry, required atomic operation and recovery behavior. Accept when the choice explains a concrete failure, not a generic “NoSQL scales” claim. References: [PostgreSQL constraints](https://www.postgresql.org/docs/18/ddl-constraints.html), [MongoDB data modeling](https://www.mongodb.com/docs/manual/data-modeling/), [Redis persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/).

---

## How should a Node application own connections and credentials? {#t17-q02}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Create a bounded pool per application role/process, reuse it and close it during owned shutdown. Configure deadlines, least-privilege credentials and verified TLS. **Every replica and separate ORM/session pool contributes to the database connection budget.**

</div>

A driver handles the database protocol. `pg` is the Node PostgreSQL driver; an ORM or query builder sits above such a driver. A native C binding is an optional implementation detail, not a requirement to call every SQL query “native.” Connection configuration includes host, port, database, role, pool maximum and TLS trust, not just a password string.

This deployment fragment assumes a trusted CA file and an injected connection URI that contains no conflicting `sslmode`, `sslrootcert`, `sslcert` or `sslkey` options. Validate deployment configuration before opening traffic:

```js [pool-configuration.mjs]
import { readFileSync } from 'node:fs';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    ca: readFileSync(process.env.DB_CA_FILE, 'utf8'),
    rejectUnauthorized: true,
  },
  max: 5,
  connectionTimeoutMillis: 2000,
  idleTimeoutMillis: 10000,
  statement_timeout: 3000,
  application_name: 'products-api',
});
pool.on('error', (error) => {
  console.error({ event: 'idle_database_error', code: error.code });
});
// Startup: await pool.query('SELECT 1'); then become ready.
// Shutdown: stop admission, drain requests, then await pool.end().
```

The environment/secret provider supplies real values; never print the URI. Fail startup on missing settings. Local disposable Unix-socket fixtures may deliberately omit TLS because no network is used; that is a fixture choice, not production guidance. Disabling certificate verification to fix a hostname/CA error removes server authentication. Separate migration privileges from ordinary request credentials.

Pool exhaustion can mean leaked clients, long transactions or too much admission. Measure `totalCount`, `idleCount`, `waitingCount`, acquisition delay and server sessions. `connectionTimeoutMillis` bounds acquiring/connecting; `statement_timeout` bounds server statement execution, not the entire HTTP lifecycle. Release checked-out clients in `finally`; a broken client should be evicted. Budget headroom for migrations/admin work and all replicas.

<span class="notes-section-label">**Practice and acceptance**</span>

Run two owned application processes with a small pool, observe the combined server count and inject a slow statement. Accept when acquisition/statement failures are bounded, logs contain no credentials and shutdown leaves no owned sessions. References: [pg pooling](https://node-postgres.com/features/pooling), [pool sizing](https://node-postgres.com/guides/pool-sizing), [TLS configuration precedence](https://node-postgres.com/features/ssl).

---

## How do constraints and parameterized CRUD work together? {#t17-q03}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Validate input for useful errors, bind values through the driver's parameter API and enforce shared invariants with database constraints. **Parameters bind values, not SQL identifiers or authorization policy.** Scope writes to the caller's tenant and inspect affected rows.

</div>

Use a disposable database with task-provided settings. The transaction-scoped temporary tables below disappear automatically; the fixture cannot replace an existing production table. Run SQL with `psql -X -v ON_ERROR_STOP=1`.

```sql [relational-fixture.sql]
BEGIN;
CREATE TEMP TABLE tenants (id text PRIMARY KEY) ON COMMIT DROP;
CREATE TEMP TABLE products (
  tenant_id text NOT NULL REFERENCES tenants(id),
  id integer NOT NULL,
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 80),
  stock integer NOT NULL CHECK (stock >= 0),
  PRIMARY KEY (tenant_id, id)
) ON COMMIT DROP;
CREATE TEMP TABLE lines (
  tenant_id text NOT NULL,
  product_id integer NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  FOREIGN KEY (tenant_id, product_id) REFERENCES products(tenant_id, id)
) ON COMMIT DROP;
INSERT INTO tenants VALUES ('a'), ('b');
INSERT INTO products VALUES ('a', 1, 'Pencil', 4), ('a', 2, 'Paper', 0);
INSERT INTO lines VALUES ('a', 1, 2), ('a', 1, 1);
PREPARE rename_owned(text, integer, text) AS
  UPDATE products SET name=$3 WHERE tenant_id=$1 AND id=$2 RETURNING id, name;
EXECUTE rename_owned('b', 1, 'Wrong tenant'); -- zero rows
EXECUTE rename_owned('a', 1, 'Name''); DROP TABLE tenants;--'); -- literal data
DO $$
BEGIN
  IF (SELECT count(*) FROM tenants) <> 2 THEN RAISE EXCEPTION 'lost tenants'; END IF;
  IF (SELECT name FROM products WHERE tenant_id='a' AND id=1)
      <> 'Name''); DROP TABLE tenants;--' THEN RAISE EXCEPTION 'binding failed'; END IF;
  BEGIN
    INSERT INTO products VALUES ('a', 3, 'Bad stock', -1);
    RAISE EXCEPTION 'constraint did not reject';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END $$;
SELECT p.id, COALESCE(sum(l.quantity), 0) AS sold
FROM products p LEFT JOIN lines l
  ON l.tenant_id=p.tenant_id AND l.product_id=p.id
GROUP BY p.id ORDER BY p.id;
DEALLOCATE rename_owned;
ROLLBACK;
```

In Node use `pool.query(text, values)` with `$1` placeholders. The malicious-looking name remains text. For dynamic sorting, map an allowlisted input such as `name` or `created` to fixed SQL fragments; `$1` cannot stand for a column name. Tenant identifiers must come from the trusted principal, not an unchecked request body.

CRUD means create/read/update/delete rows. Project explicit columns and map numeric/time types intentionally: PostgreSQL bigint/numeric may be returned as strings to avoid precision loss; JavaScript floating point is not a general money type. For pagination, use a bounded limit and a stable ordering with a unique tie-breaker. Soft deletion needs a retention/visibility/uniqueness policy, not only a `deleted_at` column.

<span class="notes-section-label">**Practice and acceptance**</span>

Implement all four operations through the real driver. Test injection-shaped values, duplicate keys, invalid stock, missing rows and another tenant's ID. Accept only when the schema survives, wrong-tenant writes affect zero rows and each returned field/type matches the API contract. References: [pg value parameters](https://node-postgres.com/features/queries), [PostgreSQL data types](https://www.postgresql.org/docs/18/datatype.html).

---

## How do joins, unions, upserts and migrations differ? {#t17-q04}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A JOIN combines related columns; UNION combines compatible result rows; an upsert or MERGE changes stored data. **“Merge tables” is ambiguous**, so name the intended operation and its key/conflict policy before writing SQL.

</div>

An INNER JOIN omits unmatched rows. A LEFT JOIN retains the left row with NULL right-side values; a right-side `WHERE` filter can accidentally remove those unmatched rows. Join on the complete relationship key, including tenant where applicable. One product with two lines produces two joined rows: sum line quantities at the correct grain rather than double-counting product stock.

`UNION` removes duplicate result rows; `UNION ALL` preserves them and avoids that deduplication work. Both require matching column counts and compatible types. Neither updates either input table.

```sql [merge-choices.sql]
BEGIN;
CREATE TEMP TABLE prices (id integer PRIMARY KEY, cents integer NOT NULL CHECK (cents>=0)) ON COMMIT DROP;
INSERT INTO prices VALUES (1, 100);
INSERT INTO prices VALUES (1, 120), (2, 200)
ON CONFLICT (id) DO UPDATE SET cents=EXCLUDED.cents;
MERGE INTO prices p USING (VALUES (1, 130), (3, 300)) AS incoming(id, cents)
ON p.id=incoming.id
WHEN MATCHED THEN UPDATE SET cents=incoming.cents
WHEN NOT MATCHED THEN INSERT (id, cents) VALUES (incoming.id, incoming.cents);
DO $$
BEGIN
  IF (SELECT sum(cents) FROM prices) <> 630 THEN RAISE EXCEPTION 'merge result'; END IF;
END $$;
SELECT id FROM prices WHERE cents >= 200
UNION ALL
SELECT id FROM prices WHERE id = 1;
DELETE FROM prices WHERE id=3; -- row mutation
DROP TABLE prices;             -- removes this temporary table's structure
ROLLBACK;
```

This MERGE syntax is available in PostgreSQL 15+; newer versions add clauses that should not be copied into the PostgreSQL 16 baseline blindly. Source keys must be unique for the intended match. MERGE and `ON CONFLICT` have different concurrency semantics; use `ON CONFLICT` for an insert/update key-conflict workflow and handle real transaction failures. Neither is a distributed reconciliation policy.

DDL (`CREATE/ALTER/DROP`) changes structure; `DELETE` changes rows; `TRUNCATE` has distinct locking/trigger behavior. Version schema changes in migrations. Prefer expand→backfill→switch→contract for rolling deployments; an old process can still need the previous column. Preview destructive changes, test a restore and separate seed data from schema. Do not auto-synchronize production schema on every startup.

<span class="notes-section-label">**Practice and acceptance**</span>

Use the [SQL report workbench](../sql-query-workbench.md) to explain report grain and NULL cases. Add a nullable column, backfill in bounded batches and deploy a compatible reader before making it required. Accept with old/new version compatibility, repeatable migration history and a tested failure/restore plan. References: [PostgreSQL table expressions](https://www.postgresql.org/docs/18/queries-table-expressions.html), [MERGE](https://www.postgresql.org/docs/18/sql-merge.html), [INSERT conflict handling](https://www.postgresql.org/docs/18/sql-insert.html).

---

## How do transactions prevent overselling, and when can they fail? {#t17-q05}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A transaction groups database changes atomically, but correctness also depends on isolation, constraints and the actual statement. **Use the same checked-out client for the whole transaction**, and retry the complete unit only for a classified safe transient failure.

</div>

ACID means atomic commit/rollback, preserved declared invariants, isolation from concurrent work and durability according to the database's configured guarantees. It does not include an email or payment API automatically. Keep transactions short; never hold a database lock while waiting for user input or a remote payment.

This integration function assumes `products(tenant_id,id,stock)` and `lines(tenant_id,product_id,quantity)` from the fixture are durable tables in your isolated application schema. It validates bounded input, conditionally reserves stock and records the line in one transaction:

```js [reserve-stock.mjs]
export async function reserveStock(pool, tenant, productId, quantity) {
  if (
    typeof tenant !== 'string' ||
    !tenant ||
    !Number.isSafeInteger(productId) ||
    productId <= 0 ||
    !Number.isSafeInteger(quantity) ||
    quantity <= 0 ||
    quantity > 1000
  ) {
    throw new TypeError('invalid reservation');
  }
  const client = await pool.connect();
  let evict = false;
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `UPDATE products SET stock=stock-$3
       WHERE tenant_id=$1 AND id=$2 AND stock >= $3 RETURNING stock`,
      [tenant, productId, quantity],
    );
    if (result.rowCount !== 1) throw new Error('unavailable');
    await client.query(
      'INSERT INTO lines(tenant_id,product_id,quantity) VALUES($1,$2,$3)',
      [tenant, productId, quantity],
    );
    await client.query('COMMIT');
    return result.rows[0].stock;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (cleanupError) {
      evict = true;
      throw new AggregateError(
        [error, cleanupError],
        'reservation and rollback failed',
      );
    }
    throw error;
  } finally {
    client.release(evict);
  }
}
```

Concurrent conditional UPDATEs on the same row are coordinated by PostgreSQL. A separate “read stock, then subtract my old value” can lose updates. For multi-row decisions, select appropriate row locks in consistent order or choose Serializable with full-transaction retry. Default Read Committed is not a guarantee against all business anomalies. Repeatable Read and Serializable have distinct guarantees; know which invariant you are protecting.

`40001` serialization failure and `40P01` deadlock can justify bounded full-transaction retries with jitter. A uniqueness error is usually a business conflict; a timeout or lost connection around COMMIT may leave the outcome unknown. **Blindly retrying an uncertain commit can duplicate work.** Add a durable idempotency key/receipt and reconciliation contract for retriable API mutations. The small function above deliberately has no retry/idempotency contract.

<span class="notes-section-label">**Practice and acceptance**</span>

Run two independent clients reserving the last unit: exactly one commits and stock never becomes negative. Inject line-insert failure and prove stock rolls back; force a deadlock and explain whole-unit retry. Reuse [the tested error/retry lesson](./10-error-handling.md#t10-q07). References: [pg transaction client ownership](https://node-postgres.com/features/transactions), [PostgreSQL isolation](https://www.postgresql.org/docs/18/transaction-iso.html).

---

## What does MikroORM add, and what does it not hide? {#t17-q06}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

An ORM maps entities/relations and tracks a unit of work; an ODM maps documents; a query builder composes SQL more directly. **MikroORM's identity map is request-scoped state**, not a shared cache, authorization boundary or substitute for SQL knowledge.

</div>

Use the [existing MikroORM 7.2.5 setup, entities and CRUD](../module-08-postgresql-mikroorm.md#_13-mikroorm-setup) rather than a second configuration. All `@mikro-orm/*` packages must use compatible versions. In the primary application, request context is established before route handlers; background jobs create a fresh context/fork too. A global EntityManager can leak state between requests and accumulate entities.

The following is an integration fragment with the existing `orm` and registered `Product` entity; its field names must match your actual model:

```ts [request-scoped-products.ts]
const em = orm.em.fork();
const product = await em.findOne(Product, { id: productId, ownerId: actor.id });
if (!product) throw new Error('not found');
product.name = validatedName;
await em.flush();
const response = { id: product.id, name: product.name };
```

An entity loaded twice in the same context can be the same object reference; that does not promise no second SQL query. `flush()` computes/persists tracked changes; creating an object does not necessarily persist it. `em.transactional(async tx => ...)` provides the transaction-scoped EntityManager: use `tx` throughout that callback rather than escaping to a global repository.

Relations need foreign keys and explicit population strategy. Iterating 100 products and lazily fetching each owner can create N+1 queries. Populate the required relation or project a deliberate join/batch, inspect generated SQL and avoid loading a huge graph merely to return two fields. ORMs can still issue unsafe raw SQL if you interpolate inputs.

Choose a driver for precise SQL/control, a query builder for composable queries and an ORM when entity/unit-of-work conventions help. Avoid using all three independently for the same use case without a clear transaction and pool owner. The driver pool, EntityManager context and transaction are related but different lifetimes.

<span class="notes-section-label">**Practice and acceptance**</span>

Implement create/read/update/delete and one relation in the existing workbench. Verify generated queries, request isolation, missing-row behavior, transaction rollback and migration output. Accept with bounded query count, explicit DTOs and no schema auto-update on startup. References: [MikroORM identity map](https://mikro-orm.io/docs/identity-map), [transactions](https://mikro-orm.io/docs/transactions), [migrations](https://mikro-orm.io/docs/migrations).

---

## How do you diagnose a slow database query? {#t17-q07}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Separate pool wait, lock wait, server execution, transfer and application mapping. Inspect the real query and plan with representative data. **An index is a workload-specific access path with write and storage cost**, not a universal speed switch.

</div>

For a tenant-scoped chronological list, consider a B-tree on `(tenant_id, created_at, id)` aligned with filter/order and a keyset cursor on `(created_at,id)`. It can support a bounded ordered range without scanning a huge OFFSET. Index column order, selectivity, collation, NULL policy and query expression matter; PostgreSQL can sometimes use non-leading columns, so “must use every leftmost column or never uses the index” is too absolute.

Use `EXPLAIN` first; `EXPLAIN (ANALYZE, BUFFERS)` actually runs the statement, including writes. Inspect rows estimated versus actual, loops, scan/join types, sorts/spills and buffers. A sequential scan is reasonable for a tiny table or a query returning much of it. Keep statistics current and compare repeated representative runs, including writes and warm/cold-cache conditions. Do not force an index just to get an attractive plan screenshot.

A unique/primary key creates its supporting unique index. PostgreSQL does not automatically add an index on every referencing foreign-key column; inspect whether your joins/deletes need one. Extra indexes slow mutations and consume storage. Building on a large live table needs an operational plan; `CREATE INDEX CONCURRENTLY` has special transaction/cleanup constraints.

<span class="notes-section-label">**Practice and acceptance**</span>

Load a disposable representative dataset, capture baseline plan/latency and add one justified index. Accept with correct results, improved target workload, measured write/storage trade-off and no claim that a two-row fixture establishes capacity. Reference: [PostgreSQL EXPLAIN](https://www.postgresql.org/docs/18/using-explain.html), [multicolumn indexes](https://www.postgresql.org/docs/18/indexes-multicolumn.html).

---

## How do APIs and jobs remain safe when the database is unhealthy? {#t17-q08}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Bound admission, connections, statement time and retries; classify failures and preserve recovery ownership. **More replicas can make a database outage worse** if every instance multiplies connections and retries at once.

</div>

Return controlled unavailable/conflict/not-found responses at the transport boundary. Log correlation ID, operation name, safe SQLSTATE, duration and retry attempt; omit passwords, URIs, token values and sensitive parameters. Distinguish a constraint violation from network failure, lock timeout, pool exhaustion and programming errors. A failed transaction cannot continue normally until rollback or an appropriate savepoint recovery.

For a job, claim a bounded batch using a transaction and an ownership/lease policy, release the connection before slow external work and persist completion/idempotency receipts. A lease expiry requires protection against a stale worker committing later; use version/fencing checks where the resource supports them. Do not hold all database clients while waiting for a remote API.

Back up authoritative data and test restoration into a separate environment. A successful dump command or managed “backup enabled” flag does not prove recovery time or acceptable data loss. See [recovery exercises](../database-recovery.md) and [architecture outbox/saga](./18-architecture.md#t18-q27). Cache fallbacks must respect freshness and tenant permissions; do not return stale financial success during an authoritative-store outage.

<span class="notes-section-label">**Practice and acceptance**</span>

Stop only your owned database fixture during a bounded API/job run, restore it and show controlled failures followed by recovery without duplicate effects or leaked clients. Record retry/admission limits and sanitized logs. Restore a backup separately and compare counts/invariants. References: [PostgreSQL error codes](https://www.postgresql.org/docs/18/errcodes-appendix.html), [backup and restore](https://www.postgresql.org/docs/18/backup.html).

---

## How do you prove an isolation level protects the actual invariant? {#t17-q09}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Write the business invariant, construct an interleaving that can violate it and test with independent transactions. **Snapshot stability alone does not prevent write skew across different rows.** Serializable can reject an unsafe interleaving; the application must own whole-transaction retry.

</div>

Suppose two doctors are on call and at least one must remain available. Each transaction reads that two are on call, then disables a different doctor. Both can commit under PostgreSQL Repeatable Read despite each seeing a stable snapshot. Row-level CHECK constraints cannot directly express this multi-row invariant. Lock a shared coordination row in a consistent protocol, redesign the invariant, or use Serializable with safe full-unit retry.

Run the following only against an explicitly disposable database with the task's supplied connection settings. `pg`8.16.3 reads standard PG environment variables. The opt-in is a guard, not proof of ownership; verify the target first. A random server-generated schema avoids collisions, and only that owned schema is removed.

```js [isolation-lab.mjs]
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { Pool } from 'pg';
if (process.env.NOTES_DB_FIXTURE !== 'owned')
  throw new Error('select owned fixture');
const schema = 'notes_isolation_' + randomBytes(6).toString('hex');
const pool = new Pool({
  max: 2,
  connectionTimeoutMillis: 2000,
  statement_timeout: 3000,
  options: `-c search_path=${schema}`,
});
let owned = false;
try {
  await pool.query(`CREATE SCHEMA ${schema}`);
  owned = true;
  await pool.query(
    'CREATE TABLE doctors(id integer PRIMARY KEY,on_call boolean NOT NULL)',
  );
  for (const level of ['REPEATABLE READ', 'SERIALIZABLE']) {
    await pool.query('TRUNCATE doctors');
    await pool.query('INSERT INTO doctors VALUES(1,true),(2,true)');
    const clients = [];
    try {
      clients.push(await pool.connect());
      clients.push(await pool.connect());
      // Isolation text comes only from the fixed allowlist above.
      await Promise.all(
        clients.map((c) => c.query(`BEGIN ISOLATION LEVEL ${level}`)),
      );
      const reads = await Promise.all(
        clients.map((c) =>
          c.query('SELECT count(*)::int AS n FROM doctors WHERE on_call'),
        ),
      );
      assert(reads.every((r) => r.rows[0].n === 2)); // barrier: both snapshots established
      const outcomes = await Promise.all(
        clients.map(async (c, index) => {
          try {
            await c.query('UPDATE doctors SET on_call=false WHERE id=$1', [
              index + 1,
            ]);
            await c.query('COMMIT');
            return 'committed';
          } catch (error) {
            await c.query('ROLLBACK');
            return error.code;
          }
        }),
      );
      const remaining = (
        await clients[0].query(
          'SELECT count(*)::int AS n FROM doctors WHERE on_call',
        )
      ).rows[0].n;
      if (level === 'REPEATABLE READ') {
        assert.deepEqual(outcomes, ['committed', 'committed']);
        assert.equal(remaining, 0);
      } else {
        assert.equal(outcomes.filter((x) => x === 'committed').length, 1);
        assert.equal(outcomes.filter((x) => x === '40001').length, 1);
        assert.equal(remaining, 1);
      }
      console.log({ level, outcomes, remaining });
    } finally {
      for (const client of clients) {
        try {
          await client.query('ROLLBACK');
        } finally {
          client.release();
        }
      }
    }
  }
} finally {
  try {
    if (owned) await pool.query(`DROP SCHEMA ${schema} CASCADE`);
  } finally {
    await pool.end();
  }
}
```

The fixture deliberately allows the Repeatable Read violation and asserts Serializable rejects one transaction. It does not implement a retry loop. A correct retry reruns the read and decision, now observes one remaining doctor and declines the second removal. Retrying only the UPDATE would repeat a stale decision. Set a retry/admission/deadline budget, back off transient failures and keep irreversible external effects outside that retryable transaction.

MikroORM's `transactional` callback must use its supplied EntityManager/repositories for every participating operation. After rollback, do not keep using stale mutated entities as authoritative state; retry with a fresh context/state according to the ORM's documented behavior. `flush()` does not automatically enforce an invariant that your transaction never checked.

<span class="notes-section-label">**Practice and acceptance**</span>

Extend the fixture with a bounded retry that re-evaluates the business decision, then compare a shared-row locking alternative. Accept with at least one doctor remaining, deterministic interleaving evidence, released clients and no unsafe external effect. Reference: [PostgreSQL isolation](https://www.postgresql.org/docs/18/transaction-iso.html), [MikroORM transaction behavior](https://mikro-orm.io/docs/transactions).

---

## How do you combine keyset pagination with an evidence-based index? {#t17-q10}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Choose a stable total ordering, scope it to the authorized tenant and align an index with the filter/range/order. Inspect actual plans and result semantics. **An index that looks plausible still needs representative execution evidence.**

</div>

This PostgreSQL16-compatible fixture creates only a temporary table inside a rollback transaction. The generated data is large enough to inspect a scan/sort versus an ordered index access, but is not a production capacity benchmark. Run with `psql -X -v ON_ERROR_STOP=1` against the owned database.

```sql [keyset-plan.sql]
BEGIN;
CREATE TEMP TABLE catalogue (
  tenant text NOT NULL,id integer NOT NULL,created_at timestamptz NOT NULL,
  name text NOT NULL,PRIMARY KEY(tenant,id)
) ON COMMIT DROP;
INSERT INTO catalogue
SELECT 't'||(i%5),i,timestamptz '2026-01-01T00:00:00Z'+i*interval '1 second','Product '||i
FROM generate_series(1,15000) AS i;
ANALYZE catalogue;
EXPLAIN (ANALYZE,BUFFERS)
SELECT id,name FROM catalogue
WHERE tenant='t1' AND (created_at,id) > (timestamptz '2026-01-01T00:00:11Z',11)
ORDER BY created_at,id LIMIT 3;
CREATE INDEX catalogue_page ON catalogue(tenant,created_at,id);
ANALYZE catalogue;
EXPLAIN (ANALYZE,BUFFERS)
SELECT id,name FROM catalogue
WHERE tenant='t1' AND (created_at,id) > (timestamptz '2026-01-01T00:00:11Z',11)
ORDER BY created_at,id LIMIT 3;
DO $$
DECLARE ids integer[];
BEGIN
  SELECT array_agg(id ORDER BY created_at,id) INTO ids FROM (
    SELECT id,created_at FROM catalogue
    WHERE tenant='t1' AND (created_at,id) > (timestamptz '2026-01-01T00:00:11Z',11)
    ORDER BY created_at,id LIMIT 3
  ) AS page;
  IF ids<>ARRAY[16,21,26] THEN RAISE EXCEPTION 'incorrect page'; END IF;
END $$;
ROLLBACK;
```

Compare estimated/actual rows, scan/filter work, sort, buffers and execution time before/after. The existing primary-key index may already help the tenant predicate; the second index targets ordering/range. Plans and timings vary with statistics/hardware. Do not disable sequential scans to manufacture a favorable result. `EXPLAIN ANALYZE` executes statements; use a disposable target for write-plan experiments.

A cursor encodes ordering values, not permission. Validate its shape/types/size and bind query values; derive tenant from the principal. If the client may alter cursor/filter combinations, sign or server-store the cursor and bind it to the query context. Authorization still applies. Use an immutable/defined ordering key; updates to sort keys can skip/repeat rows. NULL ordering, descending direction and ties need an explicit predicate. A keyset cursor does not freeze a database snapshot across requests.

Partial/expression/covering indexes can help selected workloads, but add write/space/maintenance costs and must match actual predicates. `CREATE INDEX CONCURRENTLY` avoids some blocking yet has special transaction restrictions and can leave an invalid index after failure. Inspect/recover it through a planned migration; it is not a free startup operation.

<span class="notes-section-label">**Practice and acceptance**</span>

Add equal timestamps, inserts between pages, another tenant and a changed filter. Accept with defined consistency semantics, no unauthorized rows, a stable tie-breaker, captured plans and measured write/index-size trade-offs. References: [PostgreSQL EXPLAIN](https://www.postgresql.org/docs/18/using-explain.html), [index build constraints](https://www.postgresql.org/docs/18/sql-createindex.html).

---

## How do you diagnose locks, pool exhaustion and risky migrations? {#t17-q11}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Separate client acquisition wait, server lock wait, query execution and transaction lifetime before changing pool size. Coordinate compatible migrations with bounded locks and an explicit recovery window. **Adding connections can increase contention rather than solve it.**

</div>

Use `pg` pool counters/acquisition timings and safe server diagnostics under an authorized monitoring role. Do not expose them through a public endpoint. Avoid dumping query text/parameters that can contain private information.

```sql [safe-session-diagnostics.sql]
SELECT pid,application_name,state,wait_event_type,wait_event,
       clock_timestamp()-xact_start AS transaction_age,
       pg_blocking_pids(pid) AS blocked_by
FROM pg_stat_activity
WHERE datname=current_database() AND pid<>pg_backend_pid();
```

A client held while awaiting a remote API creates pool pressure even when no SQL is running. A session “idle in transaction” can retain locks/snapshots. Set transaction-local lock/statement budgets for controlled work, and keep the HTTP/job's overall deadline/cleanup owner separate:

```sql [bounded-migration-settings.sql]
BEGIN;
SET LOCAL lock_timeout='500ms';
SET LOCAL statement_timeout='2s';
-- Apply one reviewed migration statement, or roll back if the lock budget expires.
ROLLBACK;
```

A lock timeout is an opportunity to abort/replan; retrying instantly in every replica can create a migration storm. Use one migration owner and test expand/bridge/backfill/contract compatibility through [the existing release lab](../release-artifact-compatibility.md). Batch backfills with progress, lock and replication-lag observation. A reversible DDL file does not guarantee reversible data transformation.

For N+1, capture query count per use case and compare the required projection/population. For stale ORM entities, inspect context boundaries before adding a global cache. For uncertain commits, use operation receipts and reconciliation, not a generic retry-everything wrapper. For recovery, restore into an isolated target and verify invariants before changing live routing.

<span class="notes-section-label">**Practice and acceptance**</span>

Hold an owned row lock on client A, attempt a bounded update on B, inspect the blocker and verify B rolls back/releases. Separately exhaust a two-client pool and prove a third acquisition times out until ownership is released. Accept with bounded failures, restored pool capacity, no held transaction and a migration rollback/forward-fix decision. References: [PostgreSQL activity statistics](https://www.postgresql.org/docs/18/monitoring-stats.html), [pg pooling](https://node-postgres.com/features/pooling), [release compatibility drill](../release-artifact-compatibility.md).

## Revision and practical checkpoint

Explain the schema invariant, bound query, transaction client, tenant predicate, plan and failure policy for one real use case. The worked SQL and driver checks support the teaching material. The ORM integration, load tuning and recovery exercises still need your own execution and evidence.

### Mixed practice

1. Two buyers read stock=1 and each writes stock=0. Is a transaction around each sequence sufficient?
2. A LEFT JOIN report suddenly omits products without sales after adding WHERE lines.quantity > 0. Why?

<span class="notes-section-label">**Answer guide — read after attempting both cases**</span>

1. Not at default Read Committed with that stale read/absolute update. Use a conditional atomic decrement, appropriate row locking or a stronger isolation design with full-unit retry, then test with separate clients.
2. The WHERE predicate excludes NULL unmatched rows. Move the intended right-side filter into the ON condition and aggregate at the correct product grain; verify the zero-sales row explicitly.
