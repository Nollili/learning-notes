---
outline: [2, 3]
---

# Database fundamentals and data access

<span class="notes-section-label">**Section 3 reading path:**</span> Complete the [local database checkpoint](#local-database-checkpoint). Then study query parameters, constraints, transactions and the [first ORM lookup](#t17-q06). Add session loading and writes step by step until the shared repository tests pass. Questions t17-q09–q11 are the deeper Section 4 continuation. Project 3 still needs its own concurrent-transaction and basic query-plan checks, but not every advanced isolation/index exercise.

For unfamiliar technical terms, use the [Section 3 vocabulary guide](./index.md#section-3-vocabulary).

The primary path is **PostgreSQL → parameterized SQL → MikroORM**, using Node.js 24, `pg` 8.16.3 and the application's pinned MikroORM 7.2.5 packages. SQL examples use PostgreSQL 16-compatible syntax; PostgreSQL 18 documentation is the reference for stated semantics, not a claim that the local server was upgraded.

The full [Relational Databases, PostgreSQL and MikroORM module](../module-08-postgresql-mikroorm.md) covers the requested relational curriculum: tables/types/keys, modeling and normalization, joins, indexes, ACID, PostgreSQL setup, ORM CRUD, relationships, population and migrations. Its [SQL workbench](../sql-query-workbench.md) adds executable reports. This page is the technical-examination companion, not a replacement or a second persistence stack.

### Local database checkpoint {#local-database-checkpoint}

**Use your completed Project 2 application as the baseline.** This isolated scratch lab teaches the new database boundary before you change its repository. You need PostgreSQL 16 server/client tools (`initdb`, `pg_ctl`, `createdb`, `psql`) on PATH and Node 24. Check their versions first. Docker is not a prerequisite for this first database exercise; the later container lab packages the same kind of dependency.

If an assignment supplies a database, use its exact settings and skip cluster creation. Otherwise, create a private disposable cluster in a terminal you will keep open:

```sh
study_lab=$(mktemp -d "${TMPDIR:-/tmp}/study-db.XXXXXX")
mkdir "$study_lab/socket"
initdb -D "$study_lab/data" -U study_learner --auth-local=trust --auth-host=reject
pg_ctl -D "$study_lab/data" -l "$study_lab/postgres.log" -o "-k \"$study_lab/socket\" -h ''" -w start
export PGHOST="$study_lab/socket"
export PGPORT=5432
export PGUSER=study_learner
export PGDATABASE=study_learning
export PGOPTIONS='-c search_path=services_intro,public'
createdb
psql -X -v ON_ERROR_STOP=1 -c 'SELECT current_database(), current_user;'
```

Expected database/user: `study_learning` / `study_learner`. The temporary directory is private and the cluster listens only on its Unix socket, with no TCP listener. Local trust is limited to this disposable fixture; it is not a deployment authentication policy. Keep using this terminal so Node and `psql` inherit the same settings. Do not copy these fixture settings into Autocode or a remote database.

Create a separate JavaScript lab folder, run `npm init -y`, then `npm install --save-exact pg@8.16.3`. Save `study-schema.sql` there and execute it once with `psql -X -v ON_ERROR_STOP=1 -f study-schema.sql`:

```sql [study-schema.sql]
CREATE SCHEMA services_intro;
CREATE TABLE services_intro.study_items (
  id text PRIMARY KEY,
  owner_id text NOT NULL,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 120),
  estimate_minutes integer NOT NULL CHECK (estimate_minutes BETWEEN 1 AND 1440),
  status text NOT NULL CHECK (status IN ('active', 'done')),
  resource_url text,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);
INSERT INTO services_intro.study_items VALUES
 ('item-1', 'alice', 'File reads', 30, 'active', NULL,
  '2026-11-23T09:00:00Z', '2026-11-23T09:00:00Z'),
 ('item-2', 'bob', 'Worker threads', 45, 'active', NULL,
  '2026-11-23T09:01:00Z', '2026-11-23T09:01:00Z');
```

These rows deliberately have no sessions. They are a small read slice of the Learning Progress model, not the full Project 3 migration. The final schema adds users, sessions and processed events according to the [handoff](./progressive-projects.md#project-2-to-project-3-handoff). Re-running this setup should fail rather than silently replace existing data.

Save `first-query.mjs`:

```js [first-query.mjs]
import assert from 'node:assert/strict';
import { Pool } from 'pg';

const pool = new Pool({ max: 2, connectionTimeoutMillis: 2000, statement_timeout: 3000 });
try {
  const result = await pool.query(
    'SELECT id, title FROM services_intro.study_items WHERE owner_id=$1 AND id=$2',
    ['alice', 'item-1']
  );
  assert.deepEqual(result.rows, [{ id: 'item-1', title: 'File reads' }]);
  console.log(result.rows);
} finally {
  await pool.end();
}
```

Run `node first-query.mjs`: expect Alice's item. Change only the owner argument to `bob` and predict an empty result; adapt the assertion and verify it. Restore the original afterward. You have now crossed Node → driver → SQL → row data, while keeping ownership in the query. The deployment pool configuration in the next lesson adds TLS and deployment credentials to this already understood boundary.

When finished with all database exercises, stop only this cluster with `pg_ctl -D "$study_lab/data" -m fast -w stop`. Keep its directory until you have retained your observations; later removal of that disposable directory deletes its data. Close Node/ORM pools before stopping the server.


<!-- tech-check: t17-q01; level: 3 -->

## How do you choose a database from the data and workload?

*Study depth: Foundational*

Level Up: L1 — Junior\
Tech Check level: ⭐⭐⭐

Source mapping: [R132](./requirements.md#r132), [R135](./requirements.md#r135), [R179](./requirements.md#r179), [R180](./requirements.md#r180).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**Choose a database from the rules the data must obey and the operations you need.** Consider related records, common queries and updates, behavior during failures, and the work needed to run and recover it.

**SQL versus NoSQL does not mean “has transactions” versus “has none.”** Check the actual database's guarantees. This Products API uses PostgreSQL because its related records, database constraints and updates spanning several rows fit a relational store.

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

<!-- tech-check: t17-q02; level: 3 -->

## How should a Node application own connections and credentials?

*Study depth: Intermediate*

Level Up: L2 — Software Engineer\
Tech Check level: ⭐⭐⭐

Source mapping: [R133](./requirements.md#r133), [R137](./requirements.md#r137).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Create a connection pool with a maximum size, reuse it for the intended application role and process, and close it during shutdown. Use deadlines, verified TLS and database credentials with only the required permissions. Release connections you check out, including after errors.

**Count connections across every process, replica and separate pool.** An ORM pool and a session-store pool both contribute to the database's total. A safe-looking limit in one process can still exceed capacity when many copies of the application run.

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

The environment or secret provider supplies the real settings. Never print the connection URI. Fail startup if required settings are missing. This private Unix-socket test can omit TLS because it uses no network connection; remote deployments still need verified TLS. Disabling certificate checks hides a hostname/CA problem by removing server authentication. Keep migration privileges separate from normal request credentials.

A full pool may mean connections were not released, transactions are long, or too much work was accepted. Measure `totalCount`, `idleCount`, `waitingCount`, connection-acquisition delay and server sessions. `connectionTimeoutMillis` limits acquiring/connecting; `statement_timeout` limits a server statement. Neither limits the whole HTTP operation. Release checked-out clients in `finally` and remove broken clients from the pool. Leave capacity for administration, migrations and other application copies.

<span class="notes-section-label">**Practice and acceptance**</span>

Run two owned application processes with a small pool, observe the combined server count and inject a slow statement. Accept when acquisition/statement failures are bounded, logs contain no credentials and shutdown leaves no owned sessions. References: [pg pooling](https://node-postgres.com/features/pooling), [pool sizing](https://node-postgres.com/guides/pool-sizing), [TLS configuration precedence](https://node-postgres.com/features/ssl).

---

<!-- tech-check: t17-q03; level: 3 -->

## How do constraints and parameterized CRUD work together?

*Study depth: Intermediate*

Level Up: L2 — Software Engineer\
Tech Check level: ⭐⭐⭐

Source mapping: [R134](./requirements.md#r134), [R136](./requirements.md#r136).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Validate input to give callers useful errors, then pass values through the driver's query-parameter API instead of inserting them into SQL text. Use database constraints to enforce rules for all writers, such as unique IDs or nonnegative stock.

**Query parameters represent values, not table or column names.** Choose dynamic identifiers from an explicit allowed list. **Parameters also do not enforce permissions.** Restrict queries and writes to the caller's trusted tenant or ownership context, and check how many rows were affected.

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

CRUD means create, read, update and delete. Select only required columns and deliberately map number/time types to application values. PostgreSQL bigint/numeric can arrive as strings to avoid losing precision. JavaScript floating-point numbers are not a general money representation. Pagination needs a limit and stable ordering, with a unique field to break ties. Soft deletion also needs rules for visibility, retention and uniqueness; a `deleted_at` column alone is insufficient.

<span class="notes-section-label">**Practice and acceptance**</span>

Implement all four operations through the real driver. Test injection-shaped values, duplicate keys, invalid stock, missing rows and another tenant's ID. Accept only when the schema survives, wrong-tenant writes affect zero rows and each returned field/type matches the API contract. References: [pg value parameters](https://node-postgres.com/features/queries), [PostgreSQL data types](https://www.postgresql.org/docs/18/datatype.html).

---

<!-- tech-check: t17-q04; level: 3 -->

## How do joins, unions, upserts and migrations differ?

*Study depth: Intermediate*

Level Up: L2 — Software Engineer\
Tech Check level: ⭐⭐⭐

Source mapping: [R136](./requirements.md#r136).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A `JOIN` combines related rows so a result can include columns from both sides. `UNION` combines compatible result sets into one set of rows. Neither operation, by itself, changes stored data. An upsert inserts or updates according to a conflict rule; `MERGE` changes data according to its matching rules. A migration changes database structure through a recorded, versioned step.

**“Merge tables” is too ambiguous to choose SQL from it.** First say whether you want to combine query results, update existing data or change the schema. Define the matching keys and how conflicts should be handled.

</div>

An INNER JOIN leaves out rows without a match. A LEFT JOIN keeps each left row and fills missing right-side fields with NULL. A right-side condition in `WHERE` can accidentally remove those unmatched rows. Join on the complete key, including tenant ID where required. A product with two order lines produces two joined rows. Aggregate at the intended level so you do not count its stock twice.

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

This MERGE syntax works in PostgreSQL 15 and later. Newer versions add clauses that may not work in the PostgreSQL 16 baseline. Make source keys unique for the intended match. MERGE and `ON CONFLICT` behave differently under concurrency. Use `ON CONFLICT` for insertion/update based on a key conflict, and handle transaction failures. Neither automatically reconciles changes across distributed systems.

DDL commands such as `CREATE`, `ALTER` and `DROP` change the schema. `DELETE` changes rows; `TRUNCATE` has different lock and trigger behavior. Record schema changes in migrations. For rolling deployments, add compatible fields, fill existing data, switch code, then remove old fields. Old processes may still require the previous column. Review destructive changes, test a restore and keep seed data separate from schema. Do not automatically synchronize production schema at every startup.

<span class="notes-section-label">**Practice and acceptance**</span>

Use the [SQL report workbench](../sql-query-workbench.md) to explain report grain and NULL cases. Add a nullable column, backfill in bounded batches and deploy a compatible reader before making it required. Accept with old/new version compatibility, repeatable migration history and a tested failure/restore plan. References: [PostgreSQL table expressions](https://www.postgresql.org/docs/18/queries-table-expressions.html), [MERGE](https://www.postgresql.org/docs/18/sql-merge.html), [INSERT conflict handling](https://www.postgresql.org/docs/18/sql-insert.html).

---

<!-- tech-check: t17-q05; level: 3 -->

## How do transactions prevent overselling, and when can they fail?

*Study depth: Intermediate*

Level Up: L2 — Software Engineer\
Tech Check level: ⭐⭐⭐

Source mapping: [R138](./requirements.md#r138).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A transaction groups database changes so they commit together or roll back together. **A transaction alone does not guarantee that concurrent orders cannot oversell stock.** The statements, constraints and isolation rules must protect that business rule too, for example through a conditional stock update.

**Use the same checked-out database client for the entire transaction.** On a failure that is known to be temporary and safe to retry, repeat the complete transaction within a limit. Do not blindly repeat a write when a lost connection leaves you unsure whether it committed.

</div>

ACID describes atomic commit/rollback, preservation of declared rules, isolation between concurrent transactions and durability under the database’s configured guarantees. It does not automatically include an external email or payment API. Keep transactions short. Never hold a database lock while waiting for user input or a remote payment.

Create persistent tables before running the inventory example. Copy only the `tenants`, `products` and `lines` definitions and seed inserts from the earlier SQL example into `persistent-stock.sql`. Remove `TEMP` and `ON COMMIT DROP`. Leave out the demonstration `PREPARE`/checks and outer `BEGIN`/`ROLLBACK`. Run `psql -X -v ON_ERROR_STOP=1 -f persistent-stock.sql` once. The checkpoint’s `PGOPTIONS` selects `services_intro`. These tables remain available to later Node connections; the original temporary tables do not.

For Learning Progress, apply the same transaction reasoning to `finishSession` and `completeItem` separately. Lock/check the relevant item and persist each operation atomically; an open session must still make completion fail. Do not add an inventory-reservation rule to the homework.

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

PostgreSQL coordinates concurrent conditional UPDATEs to the same row. Reading stock first and later writing a value calculated from that old read can lose updates. For decisions across several rows, lock rows in a consistent order or use Serializable and retry the complete transaction when appropriate. Default Read Committed does not protect every business rule. Choose the isolation/locking rule for the invariant you need to preserve.

Serialization failure `40001` and deadlock `40P01` can justify retrying the whole transaction with limited attempts and random delays. A uniqueness failure usually represents a business conflict. A timeout or lost connection near COMMIT can leave the outcome unknown. **Retrying an uncertain commit can duplicate work.** Operations that allow retry need a persistent idempotency key/receipt and a way to check uncertain outcomes. This small function does not implement those features.

<span class="notes-section-label">**Practice and acceptance**</span>

Run two independent clients reserving the last unit: exactly one commits and stock never becomes negative. Inject line-insert failure and prove stock rolls back; force a deadlock and explain whole-unit retry. Reuse [the tested error/retry lesson](./10-error-handling.md#t10-q07). References: [pg transaction client ownership](https://node-postgres.com/features/transactions), [PostgreSQL isolation](https://www.postgresql.org/docs/18/transaction-iso.html).

---

<!-- tech-check: t17-q06; level: 3 -->

## What does MikroORM add, and what does it not hide?

*Study depth: Intermediate*

Level Up: L2 — Software Engineer\
Tech Check level: ⭐⭐⭐

Source mapping: [R136](./requirements.md#r136), [R139](./requirements.md#r139).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

An ORM maps application objects and relationships to database data and tracks changes as a unit of work. An ODM does similar mapping for documents. A query builder helps construct SQL more directly.

**MikroORM's identity map tracks entity objects within a request context.** It helps represent the same entity consistently in that context; it is not a shared application cache. Give separate requests and background jobs appropriate separate contexts. The ORM does not replace permission checks or the need to understand transactions, generated queries and SQL performance.

</div>

<span class="notes-section-label">**First replacement: the existing repository lookup**</span>

Keep the [local database checkpoint](#local-database-checkpoint) running and inherit its PG settings. In that JavaScript lab, install `@mikro-orm/core@7.2.5` and `@mikro-orm/postgresql@7.2.5` with `npm install --save-exact`. This small bridge uses an explicit `EntitySchema` so no TypeScript compiler or decorator configuration is needed. The full course's compiled decorator setup remains available for its larger model.

Save `item-reader.mjs`:

```js [item-reader.mjs]
import { EntitySchema } from '@mikro-orm/core';
import { MikroORM } from '@mikro-orm/postgresql';

const ItemRow = new EntitySchema({
  name: 'ItemRow', tableName: 'study_items', schema: 'services_intro',
  properties: {
    id: { type: 'string', primary: true },
    ownerId: { type: 'string', fieldName: 'owner_id' },
    title: { type: 'string' },
    estimateMinutes: { type: 'integer', fieldName: 'estimate_minutes' },
    status: { type: 'string' },
    resourceUrl: { type: 'string', fieldName: 'resource_url', nullable: true },
    createdAt: { type: 'Date', fieldName: 'created_at' },
    updatedAt: { type: 'Date', fieldName: 'updated_at' }
  }
});

export async function openItemReader(ownerId) {
  if (typeof ownerId !== 'string' || !ownerId) throw new TypeError('Owner required');
  const orm = await MikroORM.init({
    entities: [ItemRow], host: process.env.PGHOST,
    port: Number(process.env.PGPORT ?? '5432'),
    user: process.env.PGUSER, dbName: process.env.PGDATABASE,
    pool: { min: 0, max: 2 },
    driverOptions: { connectionTimeoutMillis: 2000, statement_timeout: 3000 },
    debug: false
  });
  try {
    await orm.connect();
    await orm.em.getConnection().execute('SELECT 1');
    return {
      async findById(id) {
        const row = await orm.em.fork().findOne(ItemRow, { id, ownerId });
        if (!row) return null;
        return {
          id: row.id, title: row.title, estimateMinutes: row.estimateMinutes,
          status: row.status, resourceUrl: row.resourceUrl ?? null,
          createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
          sessions: []
        };
      },
      close: () => orm.close(true)
    };
  } catch (error) {
    await orm.close(true);
    throw error;
  }
}
```

This example implements **lookup for items without sessions only**. It is not the complete application repository. Returning `sessions: []` is valid for these test rows, but would lose information for real items with sessions. Add session loading, writes and error mapping next. Run the full existing repository contract suite before replacing JSONL.

Save `check-item-reader.mjs` to exercise the same `findById` result/absence contract callers already use:

```js [check-item-reader.mjs]
import assert from 'node:assert/strict';
import { openItemReader } from './item-reader.mjs';

const repository = await openItemReader('alice');
try {
  const item = await repository.findById('item-1');
  assert.equal(item.title, 'File reads');
  assert.equal(item.createdAt, '2026-11-23T09:00:00.000Z');
  assert.deepEqual(item.sessions, []);
  assert.equal(await repository.findById('item-2'), null);
  assert.equal(await repository.findById('missing'), null);
  item.title = 'Changed by caller';
  assert.equal((await repository.findById('item-1')).title, 'File reads');
} finally {
  await repository.close();
}
```

Run `node check-item-reader.mjs`. It exits without output when all assertions pass. SQL and ORM lookups now agree about Alice’s item and the absence of Bob’s item from her results. `fork()` creates an EntityManager context for this operation. Returning a new plain object prevents callers from changing tracked entity state. The code does not create or update tables; the SQL setup is responsible for the schema.

Move these lookup assertions into the shared adapter tests and supply each repository factory in turn. The full suite must also cover sessions, event IDs, changes, close behavior and transactions. In NestJS, inject the initialized database through a provider and close it with the application. Create a fresh context for each request/job. Registering a provider does not create that context by itself.

References: [MikroORM JavaScript and EntitySchema support](https://mikro-orm.io/docs/usage-with-js), [identity map](https://mikro-orm.io/docs/identity-map). The following existing integration fragment is the next step for the larger course model, whose entity names differ from this fixture.


For the full model, use the [existing MikroORM 7.2.5 setup, entities and CRUD](../module-08-postgresql-mikroorm.md#_13-mikroorm-setup). The small reader above is a separate comparison exercise. Keep one chosen configuration in the final application and compatible versions of all `@mikro-orm/*` packages. Create request context before route handlers. Background jobs also need a fresh context/fork. A global EntityManager can retain entities and mix state between requests.

The following is an integration fragment with the existing `orm` and registered `Product` entity; its field names must match your actual model:

```ts [request-scoped-products.ts]
const em = orm.em.fork();
const product = await em.findOne(Product, { id: productId, ownerId: actor.id });
if (!product) throw new Error('not found');
product.name = validatedName;
await em.flush();
const response = { id: product.id, name: product.name };
```

Loading the same entity twice in one context may return the same object. It does not guarantee that only one SQL query runs. `flush()` finds and saves tracked changes; creating an object alone does not necessarily save it. Inside `em.transactional(async tx => ...)`, use the supplied `tx` EntityManager for every participating operation. Do not switch back to a global repository.

Use foreign keys for relationships and explicitly choose which related data to load. Loading 100 products and then fetching each owner separately can cause N+1 queries: one main query plus one per product. Load the needed relationship or use an intentional join/batch. Inspect the SQL and avoid loading a large object graph for a two-field response. An ORM can still run unsafe raw SQL if you insert input directly into query text.

Use a driver for direct SQL control, a query builder to assemble queries, or an ORM when entity tracking and units of work help. Do not independently mix all three within one use case without a shared transaction and clear pool owner. The connection pool, EntityManager context and transaction have related but different lifetimes.

<span class="notes-section-label">**Practice and acceptance**</span>

Implement create/read/update/delete and one relation in the existing workbench. Verify generated queries, request isolation, missing-row behavior, transaction rollback and migration output. Accept with bounded query count, explicit DTOs and no schema auto-update on startup. References: [MikroORM identity map](https://mikro-orm.io/docs/identity-map), [transactions](https://mikro-orm.io/docs/transactions), [migrations](https://mikro-orm.io/docs/migrations).

---

<!-- tech-check: t17-q07; level: 3 -->

## How do you diagnose a slow database query?

*Study depth: Intermediate*

Level Up: L2 — Software Engineer\
Tech Check level: ⭐⭐⭐

Source mapping: [R136](./requirements.md#r136).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**Measure where the time goes before changing the query.** The delay may be waiting for a pool connection, waiting for a lock, executing SQL, transferring rows or converting them into application objects.

Inspect the actual SQL and query plan using representative data. **An index helps particular access patterns and costs storage and write work.** It is not a switch that makes every query faster. Compare correct results and measured performance before and after a targeted change.

</div>

For a chronological tenant list, a B-tree on `(tenant_id, created_at, id)` may match the filter and order. A keyset cursor on `(created_at,id)` can then read the next range without skipping a large OFFSET. Results depend on column order, matching values, text comparison rules, NULL handling and the query expression. PostgreSQL can sometimes use later index columns; it is too absolute to say every query must use all leftmost columns.

Start with `EXPLAIN`. `EXPLAIN (ANALYZE, BUFFERS)` actually runs the statement, including writes. Compare estimated and actual row counts, repeated loops, scans, joins, sorting, disk use and buffers. A full-table scan can be reasonable for a small table or a query returning most rows. Keep statistics current and compare repeated realistic runs, including writes and cache differences. Do not force index use merely to produce a preferred plan.

A unique/primary key creates its supporting unique index. PostgreSQL does not automatically add an index on every referencing foreign-key column; inspect whether your joins/deletes need one. Extra indexes slow mutations and consume storage. Building on a large live table needs an operational plan; `CREATE INDEX CONCURRENTLY` has special transaction/cleanup constraints.

<span class="notes-section-label">**Practice and acceptance**</span>

Load a disposable representative dataset, capture baseline plan/latency and add one justified index. Accept with correct results, improved target workload, measured write/storage trade-off and no claim that a two-row fixture establishes capacity. Reference: [PostgreSQL EXPLAIN](https://www.postgresql.org/docs/18/using-explain.html), [multicolumn indexes](https://www.postgresql.org/docs/18/indexes-multicolumn.html).

---

<!-- tech-check: t17-q08; level: 3 -->

## How do APIs and jobs remain safe when the database is unhealthy?

*Study depth: Intermediate*

Level Up: L2 — Software Engineer\
Tech Check level: ⭐⭐⭐

Source mapping: [R137](./requirements.md#r137).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**Limit accepted work, database connections, statement duration and retries.** Classify failures so a conflict, a broken connection and an overloaded pool do not all trigger the same response. Keep clear responsibility for recovery, including checking uncertain outcomes before repeating effects.

**Adding API replicas can worsen a database outage.** Each new instance may add connections and retries to a database that is already struggling. Return controlled failures, retain safe diagnostics and verify recovery without duplicate effects or leaked connections.

</div>

Translate failures into the documented unavailable, conflict or missing-item response at the HTTP boundary. Log a request ID, operation, safe SQLSTATE code, duration and retry attempt. Leave out credentials and sensitive parameters. Distinguish constraint failures, network failures, lock timeouts, full pools and code bugs. After a statement error, roll back the failed transaction or recover through an appropriate savepoint before continuing.

For a job, claim a limited batch in a transaction and define who owns it and for how long. Release the database connection before slow external work. Save completion and duplicate-protection records. When a claim expires, prevent the old worker from committing later; version or fencing checks can protect supported resources. Do not hold every database client while waiting for a remote API.

Back up authoritative data and test restoration into a separate environment. A successful dump command or managed “backup enabled” flag does not prove recovery time or acceptable data loss. See [recovery exercises](../database-recovery.md) and [architecture outbox/saga](./18-architecture.md#t18-q27). Cache fallbacks must respect freshness and tenant permissions; do not return stale financial success during an authoritative-store outage.

<span class="notes-section-label">**Practice and acceptance**</span>

Stop only your owned database fixture during a bounded API/job run, restore it and show controlled failures followed by recovery without duplicate effects or leaked clients. Record retry/admission limits and sanitized logs. Restore a backup separately and compare counts/invariants. References: [PostgreSQL error codes](https://www.postgresql.org/docs/18/errcodes-appendix.html), [backup and restore](https://www.postgresql.org/docs/18/backup.html).

---

<!-- tech-check: t17-q09; level: 4 -->

## How do you prove an isolation level protects the actual invariant?

*Study depth: Advanced*

Level Up: L3 — Senior\
Tech Check level: ⭐⭐⭐⭐

Source mapping: [R138](./requirements.md#r138).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

An invariant is a business rule that must stay true, such as “at least one doctor remains on call.” **Test how separate transactions can overlap and break that rule.** Use controlled interleaving with independent database clients, not only a test that runs operations one after another.

**A stable snapshot does not prevent write skew:** two transactions can each make a reasonable decision from the same snapshot, update different rows and jointly break the rule. Serializable isolation can reject an unsafe combination. The application must then handle a bounded retry of the entire transaction, including fresh reads and a new decision.

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

<!-- tech-check: t17-q10; level: 4 -->

## How do you combine keyset pagination with an evidence-based index?

*Study depth: Advanced*

Level Up: L3 — Senior\
Tech Check level: ⭐⭐⭐⭐

Source mapping: [R136](./requirements.md#r136).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Keyset pagination asks for rows after the last ordering values from the previous page. **Use a stable, unambiguous order**, including a unique tie-breaker when values such as timestamps can be equal. Apply the caller's tenant restriction to every page; a cursor is not permission to read data.

Choose an index that matches the query's filter, range and ordering. **Verify the actual plan and results with representative data.** A plausible-looking index does not prove faster execution or correct pagination when rows change between requests.

</div>

This PostgreSQL 16-compatible fixture creates only a temporary table inside a rollback transaction. The generated data is large enough to inspect a scan/sort versus an ordered index access, but is not a production capacity benchmark. Run with `psql -X -v ON_ERROR_STOP=1` against the owned database.

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

<!-- tech-check: t17-q11; level: 4 -->

## How do you diagnose locks, pool exhaustion and risky migrations?

*Study depth: Advanced*

Level Up: L3 — Senior\
Tech Check level: ⭐⭐⭐⭐

Source mapping: [R137](./requirements.md#r137), [R138](./requirements.md#r138).



<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**Identify what is waiting before increasing the connection pool.** A request may be waiting to obtain a client, waiting for a database lock, running a query or holding a transaction open for too long. Measure those stages separately.

**More connections can increase competition instead of solving the delay.** For migrations, coordinate one clear execution owner, limit lock waits and keep old and new application versions compatible during the transition. Define how long rollback remains safe and what repair is needed afterward.

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
