# DynamoDB and RDS: choose persistence by access pattern

A database decision starts with the data and operations: what must be read together, which changes must be atomic, and how the application will find its records. “NoSQL scales” and “SQL has tables” are not enough to choose a design.

## The relational foundation

A relational database organizes rows into tables with defined columns and constraints. Primary keys identify rows; foreign keys describe valid references. A primary key need not be generated automatically. Joins combine related records; aggregates summarize groups. Indexes can accelerate selected queries while adding storage and write work.

Transactions group related changes with defined isolation behavior. For an order, inserting the order header and its items in one transaction prevents a partially saved order. Validate business rules too: a database cannot infer whether a particular customer is allowed to change that order.

Use exact decimal values or integer minor units for money with an explicit currency and rounding policy. A floating-point `price` from an introductory ORM example is not a general financial data model.

## DynamoDB's key-based model

A DynamoDB table has a partition key and optionally a sort key. Together they identify an item. Non-key attributes can vary between items, but flexible attributes do not remove the need for application validation and a deliberate model.

```text
PK            SK              title          stock
PRODUCT#42    DETAILS         Tea kettle
PRODUCT#42    STOCK                          12
PRODUCT#57    DETAILS         Coffee grinder
```

This is a conceptual single-table example, not a required schema. Separate product and stock tables, as in the course, are another choice. Start with the queries you need, then choose keys and indexes.

`GetItem` uses the full primary key. `Query` selects one partition-key value with optional sort-key conditions. `Scan` examines the table or index broadly. A filter expression is not a substitute for an efficient key condition: filtering happens after items are read.

## Indexes and consistency

An LSI keeps the table's partition key and offers another sort key; it is defined at table creation. A GSI can use a different partition and sort key. Projecting selected attributes can avoid some extra reads, but indexes cost storage and write maintenance.

Table and LSI reads can request strong consistency; GSI reads are eventually consistent. A read through a GSI may briefly lag a successful write. Choose the read path to match the user-visible promise. [DynamoDB consistency](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html).

Use conditional writes for statements such as “create only if absent” or “decrement only if sufficient stock remains.” Reading a value and later overwriting it without a condition can lose concurrent changes. Transactions can coordinate supported operations across items and tables. Retrying a batch API requires handling its reported unprocessed items, not assuming every submitted operation succeeded.

DynamoDB Streams exposes item changes for downstream processing. Stream consumers still need duplicate-safe effects and a recovery strategy. A stream is not an application database query endpoint.

## RDS and managed SQL

RDS manages supported relational database engines and infrastructure tasks. You still own schemas, queries, indexes, access, migrations and application behavior. PostgreSQL and MySQL differ; pick one engine and use its actual driver and types.

| Feature | Primary purpose |
|---|---|
| Automated backups / point-in-time recovery | Restore data to a supported recovery point |
| Snapshot | Preserve a database state for later restoration |
| Multi-AZ deployment | Improve availability and failover characteristics |
| Read replica | Serve suitable read workloads and reduce primary read load |

The exact Multi-AZ and replica behavior depends on deployment type. A standby in a traditional Multi-AZ DB instance deployment is not simply an extra read endpoint. Replication is also not a replacement for recovery from an accidental valid delete. [RDS deployment documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html).

## Lambda, NestJS and ORM connections

A NestJS adapter can initialize the application once per reusable environment and forward events through a serverless HTTP adapter. That makes an existing HTTP application runnable in Lambda; it does not remove startup time, connection limits or framework overhead.

ORM configuration needs the engine, endpoint, credentials, database and compatible TLS settings. Keep credentials in an approved secret store. Use reviewed migrations rather than automatic schema synchronization for production.

Each concurrent Lambda environment can create its own connection pool. A pool size that looks small locally can multiply into hundreds of connections. Bound concurrency and pooling, and consider RDS Proxy where appropriate. Database transactions must always use the intended connection/session.

For TLS failures, diagnose trust configuration and the actual error. Use the correct RDS CA bundle and server verification. `rejectUnauthorized: false` removes verification and is not the default solution to connection problems. A `pg_hba.conf`-style error does not uniquely diagnose one certificate issue. [RDS TLS guidance](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html).

## Broader database awareness

ElastiCache supports low-latency caching; DocumentDB targets document workloads; Neptune targets graphs; Redshift targets analytical warehousing; Athena queries data such as files in S3. These are awareness topics in the supplied slides, not evidence that every engine has been mastered. Existing [PostgreSQL notes](../node-js/module-08-postgresql-mikroorm.md) provide deeper SQL application context.

Next: [file imports](./file-imports.md).
