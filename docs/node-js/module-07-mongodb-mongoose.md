# NoSQL Databases, MongoDB, and Mongoose

## Contents

1. [NoSQL mental model](#1-nosql-mental-model)
2. [Relational and NoSQL databases](#2-relational-and-nosql-databases)
3. [The four main NoSQL types](#3-the-four-main-nosql-types)
4. [MongoDB fundamentals](#4-mongodb-fundamentals)
5. [Connecting to and exploring MongoDB](#5-connecting-to-and-exploring-mongodb)
6. [BSON, ObjectId, and indexes](#6-bson-objectid-and-indexes)
   - [Multi-field / composite indexes](#multi-field-indexes-compound-composite-indexes)
7. [ODM and Mongoose fundamentals](#7-odm-and-mongoose-fundamentals)
8. [Mongoose schemas and models](#8-mongoose-schemas-and-models)
9. [Connections and application lifecycle](#9-connections-and-application-lifecycle)
10. [CRUD repositories and queries](#10-crud-repositories-and-queries)
11. [Updates, validation, hooks, and virtuals](#11-updates-validation-hooks-and-virtuals)
12. [Aggregation pipelines](#12-aggregation-pipelines)
13. [Embedding and referencing](#13-embedding-and-referencing)
14. [`populate()` and `$lookup`](#14-populate-and-lookup)
15. [CAP theorem](#15-cap-theorem)
16. [ACID and BASE](#16-acid-and-base)
17. [Architecture, testing, and production readiness](#17-architecture-testing-and-production-readiness)
18. [Concurrency, atomicity, and transactions](#18-concurrency-atomicity-and-transactions)
19. [Read/write concerns and schema evolution](#19-read-write-concerns-and-schema-evolution)
20. [Diagnosing MongoDB applications](#20-diagnosing-mongodb-applications)
21. [Final review checklist](#21-final-review-checklist)

---

## NoSQL mental model {#_1-nosql-mental-model}

**NoSQL** means “not only SQL.” It is an umbrella term for databases that do not primarily use the traditional relational table model. Depending on the database, records may be documents, key-value entries, wide rows, or graph nodes and edges.

NoSQL is not one technology and does not imply one fixed set of guarantees.

```mermaid
flowchart TD
    Q["What does the data look like, and how is it accessed?"]
    Q --> D["Nested, object-shaped records\nDocument database"]
    Q --> K["Direct lookup by a known key\nKey-value database"]
    Q --> W["Large distributed sparse datasets\nWide-column database"]
    Q --> G["Relationship traversal is central\nGraph database"]
```

Database design begins with access patterns:

- What must be read together?
- What fields are filtered or sorted?
- Which writes must be atomic together?
- How large can each relationship grow?
- How much consistency, availability, and latency does the use case require?
- What failure and scaling behavior is acceptable?

The best database is the one whose model and guarantees fit these requirements. Many production systems use several database types for different workloads.

### Important corrections to common slogans

- “Schema-flexible” does not mean “no schema.” The application still depends on a shape, and MongoDB can enforce collection validators.
- NoSQL does not automatically mean eventual consistency. Many NoSQL systems offer strong or tunable consistency.
- Relational databases are not limited to vertical scaling; many support replicas, partitioning, and distributed deployments.
- NoSQL is not automatically faster. Performance depends on workload, model, indexes, queries, and deployment.
- Embedding does not eliminate data modeling. It makes access-pattern decisions even more important.

---

## Relational and NoSQL databases {#_2-relational-and-nosql-databases}

Relational databases organize data into tables with declared columns and relationships. Document databases organize it into nested records that resemble application objects. Neither model is universally superior.

| Concern | Relational database | Document-oriented NoSQL database |
| --- | --- | --- |
| Primary unit | Row in a table | Document in a collection |
| Structure | Declared table schema | Flexible document shape, optionally validated |
| Relationships | Foreign keys and joins | Embedding, references, application logic, `$lookup` |
| Query interface | SQL standard with vendor extensions | Database-specific query API/language |
| Normalization | Common default | Selective denormalization is common |
| Atomicity | Transactions are foundational | Single-document atomicity; multi-document transactions may exist |
| Scaling | Vertical and horizontal options | Often designed with horizontal distribution in mind |
| Best fit | Integrity-heavy, relationship-heavy data | Aggregate/document-shaped data and evolving records |

### Choose based on invariants and queries

A relational database is often a strong starting point when:

- relationships and cross-entity constraints are central;
- complex joins and ad hoc reporting are common;
- multi-record transactions protect critical invariants;
- the data shape is structured and shared by many workflows.

A document database is often a strong starting point when:

- data is naturally retrieved as self-contained aggregates;
- records have meaningful variations in optional fields;
- nested data is usually read and updated with its parent;
- application access patterns are known and map cleanly to documents.

Polyglot persistence uses more than one database model. An application might use PostgreSQL for payments, MongoDB for varied content, Redis for caching, and a search engine for full-text search. This adds operational cost, so use multiple systems only when the benefit justifies it.

---

## The four main NoSQL types {#_3-the-four-main-nosql-types}

### Document databases

A document database stores self-contained JSON-like records in collections.

```json
{
  "_id": "book-001",
  "title": "Node.js Cookbook",
  "author": { "name": "Bethany Griggs" },
  "tags": ["backend", "javascript"],
  "reviews": [{ "user": "alice", "rating": 5 }]
}
```

Strengths:

- maps naturally to application objects;
- supports nested arrays and objects;
- retrieves an aggregate in one operation when related data is embedded;
- allows documents in a collection to vary where the design permits it;
- supports rich filters, indexes, and aggregations.

Useful for content, catalogs, profiles, events, and other aggregate-shaped data. Examples include MongoDB and CouchDB.

### Key-value databases

A key-value database retrieves a value through a unique key.

```ts
// node-redis6.3.0 — standalone ownership, nonsecret demonstration value
import { createClient } from 'redis';
const url = process.env.REDIS_URL;
if (!url) throw new Error('REDIS_URL is required');
const client = createClient({
  url, socket: { connectTimeout: 1000, reconnectStrategy: false, socketTimeout: 1000 },
  disableOfflineQueue: true, commandsQueueMaxLength: 64,
});
client.on('error', () => console.warn('redis.connection_error')); // No raw credentials/error text.
try {
  await client.connect();
  const commands = client.withCommandOptions({ timeout: 250 });
  await commands.set('demo:feature-enabled', 'true', { EX: 60 });
  const enabled = await commands.get('demo:feature-enabled');
  console.log({ enabled: enabled === 'true' });
} finally {
  if (client.isOpen) {
    const deadline = setTimeout(() => { if (client.isOpen) client.destroy(); }, 1000);
    try { await client.close(); } finally { clearTimeout(deadline); }
  }
}
```

This model supports caching, sessions, rate limits, counters, and feature flags when the required durability, expiry and failure policy are supplied. This bounded standalone script is an illustration, not a session/authentication store. A command timeout can leave an uncertain server outcome; do not blindly retry non-idempotent writes. For schema-checked cache-aside, bounded fallback and shared atomic limits, use the [Redis adapter lab](./redis-adapters.md). Redis also offers hashes, sets, sorted sets, streams, and other structures. DynamoDB supports key-value and document access with managed persistence and scaling.

The simple model makes direct lookup efficient, but arbitrary queries over value contents may be unavailable or require specifically designed secondary indexes.

### Wide-column databases

Wide-column stores organize distributed data into rows and column families. Rows can be sparse and need not contain the same columns. Their design is driven heavily by partition keys and query patterns.

Useful for very large event, telemetry, time-series, and write-heavy distributed workloads. Examples include Apache Cassandra and HBase.

Do not confuse a wide-column store such as Cassandra with an analytical columnar warehouse such as Redshift. Both emphasize columns in some sense, but their architecture and workloads differ.

### Graph databases

A graph database stores entities as nodes and relationships as edges. Nodes and edges can have properties.

```text
(Alice)-[:FOLLOWS]->(Bob)-[:PURCHASED]->(Keyboard)
```

Graph databases are useful when traversing relationships is the main workload: social networks, fraud detection, recommendations, knowledge graphs, and authorization graphs. Examples include Neo4j and Amazon Neptune.

### Selection guide

| Dominant access pattern | Useful starting point | Examples |
| --- | --- | --- |
| Nested objects retrieved as aggregates | Document | MongoDB, CouchDB |
| Known key to value | Key-value | Redis, DynamoDB |
| Huge distributed sparse/write-heavy datasets | Wide-column | Cassandra, HBase |
| Multi-hop relationship traversal | Graph | Neo4j, Neptune |

---

## MongoDB fundamentals {#_4-mongodb-fundamentals}

MongoDB is a document database. Its hierarchy is:

```text
MongoDB deployment
└── application database
    ├── users collection
    │   ├── user document
    │   └── user document
    └── products collection
        └── product document
```

- A **database** groups related collections.
- A **collection** groups documents, roughly analogous to a relational table.
- A **document** is a BSON record containing fields and values.
- Every document has a unique `_id` within its collection.

```js
{
  _id: ObjectId('64a1f2c3b5e1a234d5e6f789'),
  name: 'Alice',
  email: 'alice@example.test',
  roles: ['user'],
  address: {
    city: 'Budapest',
    country: 'HU'
  },
  createdAt: ISODate('2026-09-25T10:00:00Z')
}
```

Documents in one collection may have different fields, but arbitrary inconsistency is usually undesirable. Enforce application expectations with Mongoose schemas, MongoDB collection validation, or both.

### Native driver versus Mongoose

The official MongoDB Node.js driver provides direct access to MongoDB:

```ts
const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
```

Mongoose adds schemas, casting, application-side validation, hooks, methods, virtuals, and reference population:

```ts
const user = await User.findById(id).lean();
```

Learn MongoDB concepts underneath Mongoose. An ODM does not remove the need to understand filters, indexes, update operators, aggregation, and database behavior.

---

## Connecting to and exploring MongoDB {#_5-connecting-to-and-exploring-mongodb}

A Node.js application reaches MongoDB through a connection URI. Keep the URI in configuration because hosts, credentials, and database names differ between development, testing, and production.

```ts
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI is required');

await mongoose.connect(uri);
```

**What it does:** reads the connection address from the environment, fails early when it is absent, and opens Mongoose's connection pool.

**When to use it:** connect once during application startup, before accepting work that needs the database. Close the connection during graceful shutdown. Do not open a new connection for every request.

For interactive learning and diagnosis, connect with MongoDB Shell:

```bash
mongosh "$MONGODB_URI"
```

**What it does:** starts an interactive client using the same URI as the application.

**When to use it:** inspect collections, try a query, or verify database state. Application behavior and repeatable schema/data changes should remain in code or migrations, not in undocumented shell history.

### Commands inside `mongosh`

[This reference collection now lives in the Node.js workbench](../workbench/node-js/database/mongo-shell.md).

### MongoDB Compass

MongoDB Compass is the official desktop GUI. It can browse collections, edit documents, run filters and aggregations, inspect schema variations, and analyze indexes. It is useful for exploration and debugging, but repeatable application changes should live in version-controlled code or migrations.

### Connection-string shape

```text
mongodb://username:password@localhost:27017/myapp?authSource=admin
```

Atlas commonly supplies a DNS seed-list URI beginning with `mongodb+srv://`. Treat every connection string as a secret because it may contain credentials and deployment details.

---

## BSON, ObjectId, and indexes {#_6-bson-objectid-and-indexes}

### BSON

MongoDB stores documents as **BSON** (Binary JSON). BSON supports types that plain JSON does not, including:

- `ObjectId`;
- `Date`;
- `Decimal128`;
- binary data;
- 32-bit, 64-bit, and decimal numeric representations;
- regular expressions and timestamps.

The driver serializes JavaScript values into BSON and deserializes results. Type distinctions still matter: the string `"42"`, number `42`, and `ObjectId("...")` are different values.

### ObjectId

If `_id` is omitted, MongoDB normally generates an `ObjectId`. It is a 12-byte identifier whose structure includes a timestamp, random value, and counter.

```ts
import { Types } from 'mongoose';

if (!Types.ObjectId.isValid(input)) {
  throw new Error('Invalid identifier');
}

const id = new Types.ObjectId(input);
```

Validation prevents cast failures, but syntactic validity does not mean a document exists.

ObjectIds are roughly creation-time ordered, but use an explicit `createdAt` field for business timestamps and sorting semantics.

### Indexes

Without a useful index, MongoDB may scan every document. MongoDB automatically creates a unique `_id` index.

```ts
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, createdAt: -1 });
```

- `1` is ascending order.
- `-1` is descending order.
- A unique index enforces uniqueness at the database level.
- A compound index supports specific filter/sort patterns.

### Multi-Field Indexes (Compound / Composite Indexes)

MongoDB calls an index over several fields a **compound index**. This is the document-database counterpart of a SQL multi-column/composite index. In the schema example above, `{ role: 1, createdAt: -1 }` orders by role first and then newest creation time within a role.

For `{ role: 1, createdAt: -1 }`, the left-prefix rule means the index can naturally support queries beginning with `role`, and queries using `role` plus `createdAt`. It generally does not efficiently support an unrelated query on `createdAt` alone.

For the relational version, including equality/range predicates, sort direction, and separate-index trade-offs, see [Multi-Column Indexes (Composite Indexes) in Module 8](./module-08-postgresql-mikroorm.md#multi-column-indexes-composite-indexes).

### Index design workflow

1. Start from real query and sort patterns.
2. Inspect execution with `explain()`.
3. Add the smallest useful index.
4. Re-measure query latency and scanned documents.
5. Monitor memory and write cost.

Every index consumes storage and memory and must be updated on writes. Do not index every field blindly.

`unique: true` in a Mongoose schema declares a unique index; it is not a Mongoose validator. Concurrent writes are safely protected only by the database constraint, and duplicate violations arrive as database errors.

---

## ODM and Mongoose fundamentals {#_7-odm-and-mongoose-fundamentals}

An **Object Document Mapper (ODM)** maps application objects to documents and provides a structured API around database operations. An **Object Relational Mapper (ORM)** serves a similar role for relational tables and rows.

Mongoose provides:

- schemas and type casting;
- application-side validation;
- models and chainable queries;
- middleware hooks;
- instance and static methods;
- virtual properties;
- reference population;
- TypeScript declarations and schema inference.

### Trade-offs

- Generated queries can be less obvious than raw driver calls.
- Developers must learn both MongoDB and Mongoose semantics.
- Mongoose validation is not the same as database-level enforcement.
- Some advanced MongoDB features are clearer through raw driver APIs.
- Hydrated documents add overhead when plain objects would be sufficient.

Use Mongoose because its features help the application, not because it replaces database knowledge.

### Install

```bash
npm install mongoose
```

Mongoose includes TypeScript declarations; a separate `@types/mongoose` package is not needed.

---

## Mongoose schemas and models {#_8-mongoose-schemas-and-models}

A **schema** declares document shape and behavior. A **model** is the query and construction API connected to a collection. A **document** is a hydrated instance returned or created by a model.

```ts
// users/user.model.ts
import { type InferSchemaType, Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'editor'],
      default: 'user',
    },
    age: { type: Number, min: 0, max: 130 },
    country: { type: String, uppercase: true, match: /^[A-Z]{2}$/ },
    loginCount: { type: Number, default: 0, min: 0, validate: Number.isSafeInteger },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

userSchema.index({ email: 1 }, { unique: true });

export type User = InferSchemaType<typeof userSchema>;
export const UserModel = model('User', userSchema);
```

`timestamps: true` manages `createdAt` and `updatedAt`. Mongoose normally pluralizes the model name `User` into the `users` collection.

### Common schema types

| Schema declaration | Application value |
| --- | --- |
| `String` | `string` |
| `Number` | `number` |
| `Boolean` | `boolean` |
| `Date` | `Date` |
| `Schema.Types.ObjectId` | ObjectId/reference |
| `[String]` | string array |
| nested `Schema` | embedded subdocument |
| `Schema.Types.Mixed` | arbitrary content; use sparingly |

`InferSchemaType` helps keep runtime schema and compile-time type aligned. Explicit interfaces remain useful for complex methods, virtuals, statics, and public domain types, but must be kept synchronized with the schema.

### Validation layers

```mermaid
flowchart LR
    R["HTTP request"] --> V["Request schema\nZod/Joi"]
    V --> S["Service\nbusiness rules"]
    S --> M["Mongoose schema\ncasting/validation"]
    M --> D["MongoDB\nindexes and validators"]
```

Each layer has a different role:

- Request validation returns clear client-facing errors.
- Services enforce business rules independent of transport/storage.
- Mongoose protects model writes performed through Mongoose.
- Database indexes and validators protect the database across clients and races.

---

## Connections and application lifecycle {#_9-connections-and-application-lifecycle}

Keep database connection code separate and fail startup before accepting requests.

```ts
// database.ts
import mongoose from 'mongoose';

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is required');

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5_000,
  });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
```

```ts
// shutdown.ts — HTTP and database errors remain one awaited completion path.
import type { Server } from 'node:http';
export function createShutdown(server: Server, disconnect: () => Promise<void>) {
  let pending: Promise<void> | undefined;
  return (): Promise<void> => pending ??= (async () => {
    const errors: unknown[] = [];
    try {
      await new Promise<void>((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
      });
    } catch (error) { errors.push(error); }
    // Still try DB cleanup when HTTP close failed.
    try { await disconnect(); } catch (error) { errors.push(error); }
    if (errors.length) throw new AggregateError(errors, 'Shutdown cleanup failed');
  })();
}
```

```ts
// server.ts
import { once } from 'node:events';
import { app } from './app.js';
import { connectDatabase, disconnectDatabase } from './database.js';
import { createShutdown } from './shutdown.js';
async function bootstrap(): Promise<void> {
  await connectDatabase();
  try {
    const server = app.listen(3000);
    await once(server, 'listening'); // Rejects if a startup error event occurs first.
    const shutdown = createShutdown(server, disconnectDatabase);
    const requestShutdown = () => {
      void shutdown().catch(error => {
        console.error('Application shutdown failed', error);
        process.exitCode = 1;
      });
    };
    process.once('SIGINT', requestShutdown);
    process.once('SIGTERM', requestShutdown);
  } catch (error) {
    try { await disconnectDatabase(); }
    catch (cleanupError) { throw new AggregateError([error, cleanupError], 'Startup cleanup failed'); }
    throw error;
  }
}
bootstrap().catch(error => {
  console.error('Application startup failed', error);
  process.exitCode = 1;
});
```

The HTTP close callback is not async: its result becomes a promise and database cleanup is awaited outside it. A rejection cannot escape as an unobserved callback promise. Repeated signals share one cleanup promise, errors from both resources are retained and a failed listener startup releases an already-connected database.

This is a focused lifecycle example: production readiness/drain deadlines, forced upgraded-socket handling, bounded database shutdown and removal of process listeners for reusable test fixtures belong to the full lifecycle lesson. An external supervisor still needs an ultimate process deadline; do not infer this helper bounds a stuck disconnect call.

Mongoose uses a default connection when calling `mongoose.connect()`, and models created on that connection share its pool. Advanced applications can create explicit connections for isolation or multiple databases.

### One-off scripts

Always disconnect in `finally` so seeds and migrations terminate.

```ts
async function seed(): Promise<void> {
  await connectDatabase();
  try {
    await UserModel.create([
      { name: 'Alice', email: 'alice@example.test' },
      { name: 'Bob', email: 'bob@example.test' },
    ]);
  } finally {
    await disconnectDatabase();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

---

## CRUD repositories and queries {#_10-crud-repositories-and-queries}

The repository isolates Mongoose and MongoDB details from services and controllers.

```ts
// users/user.repository.ts
import { UserModel, type User } from './user.model.js';

export type CreateUser = Pick<User, 'name' | 'email'> &
  Partial<Pick<User, 'role' | 'age'>>;

export async function createUser(input: CreateUser) {
  return UserModel.create(input);
}

export async function findUserById(id: string) {
  return UserModel.findById(id).lean().exec();
}

export async function findUserByEmail(email: string) {
  return UserModel.findOne({ email: email.toLowerCase() }).lean().exec();
}
```

### Query operators

```ts
const adults = await UserModel.find({ age: { $gte: 18 } }).lean();

const administratorsOrSeniors = await UserModel.find({
  $or: [{ role: 'admin' }, { age: { $gt: 65 } }],
}).lean();

const staff = await UserModel.find({
  role: { $in: ['admin', 'editor'] }, // Both are declared in this chapter's enum.
}).lean();
```

| Operator | Meaning |
| --- | --- |
| `$eq`, `$ne` | Equal, not equal |
| `$gt`, `$gte` | Greater than, greater than or equal |
| `$lt`, `$lte` | Less than, less than or equal |
| `$in`, `$nin` | In or not in a supplied set |
| `$exists` | Field exists or does not exist |
| `$and`, `$or`, `$nor` | Logical composition |
| `$elemMatch` | Array contains an element meeting multiple conditions |

Multiple top-level filter properties are implicitly combined with AND.

Never pass arbitrary client objects directly as MongoDB filters. Validate allowed fields and operators to prevent operator injection and uncontrolled queries.

### Sorting, projection, and pagination

```ts
const users = await UserModel.find({ role: 'user' })
  .sort({ createdAt: -1, _id: -1 })
  .limit(20)
  .select({ name: 1, email: 1, createdAt: 1 })
  .lean()
  .exec();
```

For small data, offset pagination is simple:

```ts
const page = await UserModel.find(filter)
  .sort({ createdAt: -1, _id: -1 })
  .skip((pageNumber - 1) * pageSize)
  .limit(pageSize)
  .lean();
```

Large offsets become expensive and can shift under concurrent writes. Cursor/range pagination uses the last seen indexed sort values instead.

### `lean()`

`lean()` returns plain JavaScript objects without Mongoose document methods and change tracking. It is often preferable for read-only API responses.

Do not use `lean()` when later code expects `.save()`, document methods, or document-specific behavior. Virtuals and getters may also need explicit lean configuration/plugins depending on the desired behavior.

### Deleting

```ts
export async function deleteUser(id: string): Promise<boolean> {
  const result = await UserModel.deleteOne({ _id: id }).exec();
  return result.deletedCount === 1;
}
```

Returning a meaningful result lets the service distinguish deletion from “not found.”

---

## Updates, validation, hooks, and virtuals {#_11-updates-validation-hooks-and-virtuals}

### Update operators

```ts
await UserModel.updateOne(
  { _id: id },
  { $set: { role: 'admin' }, $inc: { loginCount: 1 } },
  { runValidators: true },
);
```

Common operators:

| Operator | Purpose |
| --- | --- |
| `$set` | Set or create fields |
| `$unset` | Remove fields |
| `$inc` | Increment/decrement a number |
| `$push` | Append to an array |
| `$addToSet` | Add to an array only if absent |
| `$pull` | Remove matching array elements |

Allowlist update fields through runtime validation. Do not send `req.body` directly into an update.

### Return the updated document

```ts
const updated = await UserModel.findByIdAndUpdate(
  id,
  { $set: patch },
  { new: true, runValidators: true },
).lean();
```

Update validators are not identical to document validation and may behave differently by operation. `runValidators: true` is important for query updates.

Fetch-modify-save performs two database operations but runs document validation and document `save` hooks:

```ts
const user = await UserModel.findById(id);
if (user) {
  user.role = 'admin';
  await user.save();
}
```

### Error classification

```ts
import mongoose from 'mongoose';
import { MongoServerError } from 'mongodb';

function classify(error: unknown): string {
  if (error instanceof mongoose.Error.ValidationError) return 'VALIDATION';
  if (error instanceof mongoose.Error.CastError) return 'INVALID_ID';
  if (error instanceof MongoServerError && error.code === 11000) return 'DUPLICATE';
  return 'DATABASE';
}
```

Map storage errors to application errors in the repository/service boundary, then map application errors to HTTP in the presentation layer.

### Hooks

Define hooks before compiling the model.

```ts
userSchema.pre('save', function () {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
});

userSchema.post('save', function (document) {
  console.log(`Saved user ${document.id}`);
});
```

Document hooks and query hooks are different. A `pre('save')` hook does not run for `updateOne()` or `findOneAndUpdate()`. Choose hook types deliberately.

Avoid hiding unreliable external side effects in hooks. Sending an email after a database write can fail after the data is committed. Durable event/outbox patterns are safer for critical workflows.

### Instance methods, statics, and virtuals

```ts
userSchema.methods.isAdmin = function (): boolean {
  return this.role === 'admin';
};

userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.virtual('displayName').get(function () {
  return `${this.name} (${this.role})`;
});
```

- Instance methods operate on one hydrated document.
- Statics operate through the model/collection.
- Virtuals are computed and not stored.

Enable `{ toJSON: { virtuals: true } }` when virtuals should appear in JSON responses. Keep domain rules in services/domain code when they should not depend on Mongoose documents.

---

## Aggregation pipelines {#_12-aggregation-pipelines}

An aggregation pipeline sends documents through ordered transformation stages.

```mermaid
flowchart LR
    C["Collection"] --> M["$match\nfilter"]
    M --> G["$group\naggregate"]
    G --> S["$sort\norder"]
    S --> P["$project\nreshape"]
    P --> R["Result"]
```

```ts
const counts = await UserModel.aggregate([
  { $match: { age: { $gte: 18 } } },
  {
    $group: {
      _id: '$country',
      total: { $sum: 1 },
      averageAge: { $avg: '$age' },
    },
  },
  { $sort: { total: -1 } },
  {
    $project: {
      _id: 0,
      country: '$_id',
      total: 1,
      averageAge: 1,
    },
  },
]);
```

Common stages:

| Stage | Purpose |
| --- | --- |
| `$match` | Filter documents |
| `$project` | Include, exclude, compute, or rename fields |
| `$group` | Group and calculate accumulators |
| `$sort` | Sort documents |
| `$limit`, `$skip` | Restrict/window results |
| `$unwind` | Expand array elements into separate pipeline documents |
| `$lookup` | Join documents from another collection |
| `$count` | Count pipeline results |
| `$facet` | Run multiple sub-pipelines on the same input |

Place selective `$match` stages early when possible so later stages process fewer documents. Design indexes for early filters and sorts, and inspect explain plans for expensive pipelines.

Aggregation returns plain result objects shaped by the pipeline, not normal hydrated model documents. The country grouping uses the declared top-level country field, not address.country from the separate BSON illustration. Include {$match:{country:{$type:'string'}}} if records lacking country should be excluded; otherwise a missing value forms a null group. Keep those two schema shapes explicit rather than silently aggregate a field no model writes.

---

## Embedding and referencing {#_13-embedding-and-referencing}

MongoDB relationships are modeled by embedding related data inside a parent document, referencing other documents by ID, or combining both.

### Embedding

```js
{
  _id: ObjectId('...'),
  title: 'Getting started with MongoDB',
  comments: [
    { _id: ObjectId('...'), user: 'Alice', text: 'Great post!' }
  ]
}
```

Embed when:

- parent and child are usually read together;
- child data belongs to one parent;
- the nested collection is bounded;
- atomic modification with the parent is valuable.

Benefits include one-read retrieval, locality, and single-document atomic updates. Costs include duplication, document growth, and awkward independent child queries.

MongoDB documents have a 16 MiB BSON size limit. Unbounded arrays—comments, events, followers, transactions—should not grow forever inside one document.

### Referencing

```js
// posts
{ _id: ObjectId('...'), title: 'MongoDB', author: ObjectId('user-id') }

// users
{ _id: ObjectId('user-id'), name: 'Jane', email: 'jane@example.test' }
```

Reference when:

- related data is shared by many parents;
- it grows without a safe bound;
- it changes independently or frequently;
- it must be queried independently;
- duplication would be costly or inconsistent.

MongoDB does not automatically enforce foreign keys. Deletion policies, orphan handling, and referential integrity belong to application logic, workflows, or compensating jobs.

### Decision table

| Question | Embed tends to fit | Reference tends to fit |
| --- | :---: | :---: |
| Always read together? | Yes | |
| Small and bounded? | Yes | |
| Owned by exactly one parent? | Yes | |
| Shared by many documents? | | Yes |
| Grows without a safe limit? | | Yes |
| Changes independently? | | Yes |
| Queried independently? | | Yes |

### Hybrid Mongoose model

```ts
const commentSchema = new Schema(
  {
    user: { type: String, required: true, maxlength: 100 },
    text: { type: String, required: true, maxlength: 2_000 },
  },
  { timestamps: true },
);

const postSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 200 },
    content: { type: String, required: true, maxlength: 20_000 },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    comments: { type: [commentSchema], default: [],
      validate: { validator: (items: unknown[]) => items.length <= 100,
        message: 'Recent comments are limited to 100' } },
  },
  { timestamps: true },
);
```

The author is shared and referenced; comments are a bounded **recent100 snapshot**, not the full historical comment collection. If all comments must be retained, store them in a separate referenced/paginated comments collection and optionally keep this recent snapshot. String/array limits reduce growth but do not replace the BSON document-size limit. Query validators on $push do not guarantee the whole-array length rule runs; the atomic $slice update below enforces the retention policy for that write path. Database-level validation is needed when other writers can bypass Mongoose.

### Atomic embedded updates

```ts
await PostModel.findByIdAndUpdate(
  postId,
  { $push: { comments: { $each: [comment], $slice: -100 } } },
  { new: true, runValidators: true },
);

await PostModel.findByIdAndUpdate(
  postId,
  { $pull: { comments: { _id: commentId } } },
  { new: true },
);
```

MongoDB guarantees atomicity for a single-document write. This is a major reason to store data that must change together in one document when growth remains safe.

---

## `populate()` and `$lookup` {#_14-populate-and-lookup}

### Mongoose population

```ts
const post = await PostModel.findById(id)
  .populate('author', 'name email')
  .exec();
```

Without population, `author` is an ObjectId. With population, Mongoose resolves the referenced user and substitutes the selected result in application output.

Multiple or nested population requires every path/ref model to exist. The postSchema here declares only author; it does not declare reviewer, and User does not declare team. Keep the working author example above. For a nested reviewer/team variant, explicitly add reviewer:{type:Schema.Types.ObjectId,ref:'User'}, a User.team ref and the Team model before demonstrating that query. Do not copy a populate path into this base model and assume it exists; strictPopulate behavior depends on the declared schema/version.

Population is convenient, but inspect query counts and payload size. Depending on query shape, Mongoose may issue additional database queries. Deep population can create large, expensive responses.

### MongoDB `$lookup`

```ts
const posts = await PostModel.aggregate([
  {
    $lookup: {
      from: 'users',
      localField: 'author',
      foreignField: '_id',
      as: 'author',
    },
  },
  { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
  { $project: { title: 1, 'author.name': 1, 'author.email': 1 } },
]);
```

| Concern | `populate()` | `$lookup` |
| --- | --- | --- |
| Controlled by | Mongoose | MongoDB aggregation |
| API simplicity | High | More explicit |
| Query composition | Convenient references | Powerful pipeline joins/transforms |
| Result | Populated query result | Plain aggregation objects |
| Best fit | Straightforward application lookups | Complex server-side aggregation |

Neither is automatically faster. Measure with realistic cardinality, indexes, selected fields, and network latency.

---

## CAP theorem {#_15-cap-theorem}

CAP describes distributed data systems when a **network partition** prevents nodes from communicating.

- **Consistency (C):** every successful read observes the latest successful write, or the operation fails rather than returning an older value.
- **Availability (A):** every request received by a non-failing node eventually gets a non-error response, though it may not contain the latest data.
- **Partition tolerance (P):** the system continues operating despite messages being lost or delayed between groups of nodes.

```mermaid
flowchart TD
    P["Network partition separates replicas"] --> Q{"What happens to an operation\nthat cannot coordinate?"}
    Q -->|"Reject or delay it"| CP["Preserve consistency\nsacrifice availability"]
    Q -->|"Answer independently"| AP["Preserve availability\nrisk stale/conflicting data"]
```

### The real choice during a partition

In a genuinely distributed system, partitions cannot be ruled out. During a partition, an operation cannot guarantee both perfect availability and strong consistency across separated sides.

Imagine nodes A and B. A accepts a new price but cannot replicate it to B. When B receives a read:

- A consistency-first choice rejects/delays the read because B cannot prove it has the latest value.
- An availability-first choice responds from B, potentially with the old price.

Outside a partition, a system can normally provide both useful consistency and availability. CAP is not a statement that a database permanently has only two properties, nor is latency the same thing as CAP availability.

### Tunable behavior

Real systems are more nuanced than a permanent CP/AP label. MongoDB read preference, read concern, write concern, replication state, and operation type affect observed behavior. Cassandra and DynamoDB also expose consistency choices.

Classifications describe defaults and failure behavior, not every possible configuration. Evaluate the guarantees of the exact operation and deployment.

---

## ACID and BASE {#_16-acid-and-base}

CAP discusses distributed behavior during partitions. ACID discusses transaction guarantees. They answer different questions.

### ACID

| Property | Meaning |
| --- | --- |
| Atomicity | A transaction's changes all commit or all roll back |
| Consistency | A transaction preserves declared invariants and constraints |
| Isolation | Concurrent transactions behave according to an isolation model |
| Durability | Committed data survives the promised failure scenarios |

ACID consistency is not the same definition as CAP consistency.

MongoDB provides atomic single-document writes and supports multi-document transactions where needed. Transactions add coordination and cost, so good document modeling can keep related invariants inside one document.

### BASE

**BASE** is a loose design philosophy often contrasted with strict transactional systems:

- **Basically Available:** the system aims to remain responsive despite partial failures.
- **Soft state:** replicated state may change as updates propagate, even without a new client operation.
- **Eventual consistency:** if updates stop, replicas converge over time.

Eventual consistency does not mean random or permanently inconsistent. Applications need conflict, retry, idempotency, and user-experience strategies appropriate to the convergence model.

### ACID versus BASE

| Concern | ACID-oriented operation | BASE/eventual approach |
| --- | --- | --- |
| Goal | Transaction correctness | Availability and distributed scale |
| Visibility | Governed by transaction/isolation guarantees | Replicas may temporarily disagree |
| Failure response | Abort, roll back, or reject | Continue and reconcile/converge |
| Useful examples | Payments, inventory reservation | Feeds, analytics, caches |

This is not a strict SQL-versus-NoSQL divide. Relational systems can use asynchronous replicas, and NoSQL systems can support transactions and strong reads. Choose guarantees per invariant and operation.

---

## Architecture, testing, and production readiness {#_17-architecture-testing-and-production-readiness}

### Layer boundaries

```mermaid
flowchart TD
    C["Controller\nHTTP translation"] --> S["Service\nbusiness rules"]
    S --> R["Repository\nMongoose queries"]
    R --> M["Mongoose model"]
    M --> DB[("MongoDB")]
```

- Controllers validate/translate HTTP and select status codes.
- Services enforce business rules and orchestration.
- Repositories own persistence queries and translate storage errors.
- Models define storage schema and database-related behavior.

Do not leak Mongoose query objects or mutable hydrated documents through every layer. Return explicit domain/read-model types where decoupling matters.

### Test strategy

| Target | Test style |
| --- | --- |
| Service business rule | Unit test with repository fake |
| Schema validator/method | Focused model test |
| Repository query/index behavior | Integration test with real isolated MongoDB |
| Express endpoint | Supertest with controlled database state |
| Migration/transaction workflow | Integration or E2E test |

Mocking Mongoose chains tends to produce brittle tests that verify implementation details. Repository integration tests against a disposable database provide better confidence.

Always close Mongoose connections after tests so Jest can terminate. Isolate test data by database, collection cleanup, or unique test identifiers, and make cleanup survive failed assertions.

### Production checklist

- Validate environment variables and keep credentials out of source control.
- Use TLS and authentication for remote databases.
- Grant the application only required database privileges.
- Configure bounded connection and server-selection timeouts.
- Add indexes for measured query patterns and unique invariants.
- Inspect slow queries and aggregation explain plans.
- Validate and allowlist filters, sorts, projections, and updates.
- Bound pagination, embedded arrays, and response sizes.
- Handle duplicate keys, cast failures, validation errors, and transient failures distinctly.
- Make retried writes and workflows idempotent where necessary.
- Use transactions only for invariants spanning multiple documents.
- Plan backups, restore testing, retention, and disaster recovery.
- Monitor pool usage, replication health, query latency, errors, and storage growth.
- Shut down HTTP and database resources cleanly.

### Common mistakes

| Mistake | Consequence | Better approach |
| --- | --- | --- |
| Treating flexible schema as no schema | Inconsistent documents | Validate at application and/or database boundaries |
| `unique: true` treated as validation | Races and surprising duplicate errors | Create a database unique index and catch code `11000` |
| Passing `req.body` into `$set` | Mass assignment | Allowlist through a runtime schema |
| Passing arbitrary query objects | Operator injection/resource abuse | Build filters from validated fields |
| Unbounded embedded arrays | Large documents and 16 MiB limit | Reference/bucket/paginate growing children |
| Missing indexes | Collection scans | Index measured filters, sorts, and joins |
| Indexing every field | Slow writes and high memory/storage | Design indexes from access patterns |
| Forgetting `runValidators` on updates | Invalid updates | Enable it and understand update validation |
| Expecting `save` hooks on query updates | Logic silently skipped | Use matching query hooks or explicit service logic |
| Using `localhost` between containers | Connection failure | Use the Compose service name |
| Never closing connections | Hanging tests/shutdown | Disconnect in lifecycle cleanup |
| Assuming NoSQL means eventual consistency | Incorrect design choices | Check exact database and operation guarantees |

---

## Concurrency, atomicity, and transactions {#_18-concurrency-atomicity-and-transactions}

Application code often performs a read, makes a decision, and then writes. Another request can change the document between those steps.

The inventory snippets use this separate model/collection; it is not the User/Post schema:

```ts
const inventoryProductSchema = new Schema({
  name: { type: String, required: true, maxlength: 100 },
  stock: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
  version: { type: Number, default: 0, min: 0, validate: Number.isSafeInteger },
}, { collection: 'inventory_products' });
export const Product = model('InventoryProduct', inventoryProductSchema);
```

### Unsafe read-modify-write

```ts
requireQuantity(quantity); // Guard below; this example is still unsafe against concurrent writers.
const product = await Product.findById(id);

if (!product || product.stock < quantity) {
  throw new Error('Insufficient stock');
}

product.stock -= quantity;
await product.save();
```

Two requests can both observe enough stock and both save. The final value may be incorrect.

### Atomic conditional update

```ts
function requireQuantity(quantity: unknown): asserts quantity is number {
  if (typeof quantity !== 'number' || !Number.isSafeInteger(quantity) || quantity < 1)
    throw new TypeError('Quantity must be a positive safe integer');
}
requireQuantity(quantity);
const product = await Product.findOneAndUpdate(
  { _id: id, stock: { $gte: quantity } },
  { $inc: { stock: -quantity } },
  { new: true, runValidators: true },
).lean();

if (!product) {
  throw new Error('Product missing or stock insufficient');
}
```

**What it does:** combines the precondition and update in one atomic document operation.

**When to use it:** prefer one conditional update when a single document contains the complete invariant. It is simpler and cheaper than a multi-document transaction.

### Optimistic concurrency

Version-based concurrency rejects an update when another writer has changed the document since it was read.

```ts
// This Product variant must declare an integer version field (default0), and
// validate expectedVersion/nonempty nextName before building this conditional update.
const result = await Product.updateOne(
  { _id: id, version: expectedVersion },
  {
    $set: { name: nextName },
    $inc: { version: 1 },
  },
);

if (result.modifiedCount === 0) {
  throw new Error('Concurrent modification');
}
```

**When to use it:** optimistic concurrency works well when conflicts are uncommon and overwriting another writer would be incorrect.

### Multi-document transactions

```ts
requireQuantity(quantity); // Validate BEFORE starting the transaction or creating an order.
await mongoose.connection.transaction(async (session) => {
  const order = await Order.create([{ userId, status: 'pending' }], { session });

  const update = await Product.updateOne(
    { _id: productId, stock: { $gte: quantity } },
    { $inc: { stock: -quantity } },
    { session },
  );

  if (update.modifiedCount === 0) {
    throw new Error('Insufficient stock');
  }

  await Outbox.create([{
    type: 'OrderCreated',
    aggregateId: order[0]._id,
  }], { session });
});
```

**What it does:** commits the order, inventory change, and outbox record together or rolls them all back.

**When to use it:** use a transaction when one invariant spans multiple documents or collections. Keep it short. Do not call slow external services while holding it open.

Transactions require a suitable MongoDB deployment. They add coordination cost and do not make external systems atomic.

---

## Read/write concerns and schema evolution {#_19-read-write-concerns-and-schema-evolution}

### Write concern

Write concern controls what acknowledgement a write requires. Stronger acknowledgement can improve durability but usually adds latency.

Do not change it casually. Choose according to the consequence of losing an acknowledged write.

### Read concern and read preference

- **Read concern** controls the consistency/isolation level of returned data.
- **Read preference** controls which replica-set members may serve the read.

Reading from secondaries can reduce primary load or improve locality. It can also return stale data. Do not use a stale read for a decision that requires the latest committed state.

### Causal expectations

A user often expects to read their own recent write. Replica lag can violate that expectation if the next read goes to a secondary. Use the primary or a consistency/session strategy when read-your-own-write behavior matters.

### Schema evolution

MongoDB's flexible documents do not remove migration work. Old and new document shapes can coexist during deployment.

A safe sequence is:

1. Deploy readers that understand both old and new shapes.
2. Deploy writers that produce the new shape.
3. Backfill existing documents in bounded batches.
4. Measure remaining old documents.
5. Remove compatibility code later.

### Backfill pattern

```ts
// legacy-users.migration.ts — SEPARATE exercise collection/model, not UserModel above.
import { Schema, model } from 'mongoose';
const legacyUserSchema = new Schema({
  firstName: { type: String, maxlength: 100 },
  lastName: { type: String, maxlength: 100 },
  displayName: { type: String, maxlength: 201 },
}, { collection: 'legacy_users', strict: 'throw', versionKey: false });
export const LegacyUserMigration = model('LegacyUserMigration', legacyUserSchema);

export async function backfillDisplayNames({ signal, batchSize = 500, maxBatches = 100 }:
  { signal?: AbortSignal; batchSize?: number; maxBatches?: number } = {}) {
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 500 ||
      !Number.isInteger(maxBatches) || maxBatches < 1 || maxBatches > 1_000)
    throw new RangeError('Invalid migration batch limits');
  let modified = 0;
  for (let iteration = 0; iteration < maxBatches; iteration++) {
    signal?.throwIfAborted();
    const batch = await LegacyUserMigration.find({ displayName: { $exists: false } })
      .select({ _id: 1, firstName: 1, lastName: 1 }).sort({ _id: 1 })
      .limit(batchSize).maxTimeMS(5_000).lean();
    if (batch.length === 0) return { completed: true, modified };
    const operations = batch.map(user => {
      if (typeof user.firstName !== 'string' || typeof user.lastName !== 'string' ||
          !user.firstName.trim() || !user.lastName.trim() ||
          user.firstName.length > 100 || user.lastName.length > 100)
        throw new Error(`Invalid legacy name at id ${String(user._id)}`);
      return { updateOne: {
        filter: { _id: user._id, displayName: { $exists: false } },
        update: { $set: { displayName: `${user.firstName.trim()} ${user.lastName.trim()}` } },
      } };
    });
    signal?.throwIfAborted();
    const result = await LegacyUserMigration.bulkWrite(operations, { ordered: false });
    if (result.modifiedCount === 0)
      throw new Error('Migration made no progress; inspect schema/casting/concurrent writers');
    modified += result.modifiedCount;
  }
  return { completed: false, modified }; // Bounded run; resume to confirm no missing rows remain.
}
```

This historical firstName/lastName→stored displayName exercise uses **legacy_users**, not the main User schema's name field and computed displayName virtual. The migration schema declares every filter/read/write field and uses strict:'throw' to expose undeclared update fields rather than strip the update into a no-op. Do not combine a stored path and a same-named virtual in one schema. Test the exact model/collection mapping before running a migration.

The operation is idempotent for already-filled records, bounds work per run and detects a no-progress batch rather than looping forever. Conditional updates preserve a displayName another writer already set. Under a single migration owner, zero progress is suspicious; concurrent workers can also finish a selected batch first, so inspect/retry a bounded run rather than assume corruption.

Invalid legacy names stop before issuing that batch: quarantine/fix them deliberately, do not write literal undefined into a display name. Partial unordered bulk failure may leave some records updated; retain safe checkpoint/error details and resume from the missing-field predicate after diagnosis.

Cancellation is checked between database calls; it does not promise to cancel an in-flight bulkWrite. Configure supported driver/connection timeouts and an operational stop policy for the chosen version. maxTimeMS bounds the query's server execution, not all connection/queue/network waiting. Add measured pacing and metrics for modified/remaining rows; completed:false is not successful migration completion. Close the migration connection in finally, including when validation/DB errors occur. Actual strict-casting, resumability and partial-failure behavior require tests against a real isolated MongoDB deployment.

Build new indexes before code depends on them. Watch index-build impact and storage usage.

---

## Diagnosing MongoDB applications {#_20-diagnosing-mongodb-applications}

### Slow query workflow

1. Capture the actual filter, sort, projection, and limit without sensitive values.
2. Run `explain('executionStats')` on a representative query.
3. Compare documents examined with documents returned.
4. Check whether sort is supported by index order.
5. Check selectivity and compound-index prefix use.
6. Measure again with production-like data volume.

An index that exists is not necessarily the index the query needs.

### Common symptoms

| Symptom | Likely cause |
| --- | --- |
| High latency and documents examined | Missing or poorly ordered index |
| Fast query, slow API | Serialization, population, network, or pool wait |
| Sudden write slowdown | Too many indexes, large documents, lock/transaction pressure |
| Memory growth | Unbounded result, hydrated documents, aggregation, or buffering |
| Stale result | Secondary read or application cache |
| Duplicate records | Missing unique index or non-atomic check-then-insert |
| Connection timeout | Pool saturation, network issue, or long-held operations |
| Transaction abort | Conflict, timeout, topology change, or unsupported deployment |

### Pool sizing

The connection pool is a concurrency limit, not a performance dial that should always be increased.

Measure:

- active and waiting operations;
- wait duration;
- query duration;
- server connection capacity;
- number of application replicas.

Total possible connections equal roughly pool size multiplied by replica count. Coordinate this with database capacity.

### Diagnostic exercise

[Exercises and learner checklist](../practice/node-js/module-07-mongodb-mongoose.md).

## Final review checklist {#_21-final-review-checklist}

[Exercises and learner checklist](../practice/node-js/module-07-mongodb-mongoose.md).

### One-minute recap

NoSQL is a family of data models selected by access pattern, not a single replacement for SQL. MongoDB stores BSON documents in collections, provides atomic single-document updates, rich queries, indexes, aggregation, and optional multi-document transactions. Mongoose adds application-side schemas, validation, hooks, models, and population, while repositories keep storage details below the service layer. Embed bounded data owned by one aggregate; reference data that is shared, independent, or unbounded. CAP explains the consistency-versus-availability decision during a network partition, while ACID and BASE describe different approaches to transaction and convergence guarantees.


## Model, lifecycle and update acceptance labs

[Exercises and learner checklist](../practice/node-js/module-07-mongodb-mongoose.md).
