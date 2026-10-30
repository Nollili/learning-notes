# NoSQL Databases, MongoDB, and Mongoose — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/module-07-mongodb-mongoose.md) · [Node.js practice map](./index.md)

### Diagnostic exercise

Create an inventory reservation workflow.

Prove that:

- stock never becomes negative under concurrent requests;
- duplicate order commands return one logical result;
- the query uses the intended index;
- transaction retries do not duplicate external side effects;
- a schema backfill can stop and resume;
- pool saturation fails within a bounded time instead of hanging indefinitely.

---

## Final review checklist {#_21-final-review-checklist}

### Concurrency and operations

- [ ] Replace unsafe read-modify-write code with atomic conditional updates where possible.
- [ ] Use optimistic concurrency when conflicting overwrites must be detected.
- [ ] Keep multi-document transactions short and free of external side effects.
- [ ] Explain read concern, write concern, read preference, and stale-read consequences.
- [ ] Evolve document shapes with compatible readers, new writers, and resumable backfills.
- [ ] Separate pool wait time from query execution time during diagnosis.

### NoSQL selection

- [ ] Explain document, key-value, wide-column, and graph models.
- [ ] Choose a database from data shape, access patterns, and guarantees.
- [ ] Compare relational and document models without relying on slogans.
- [ ] Explain why production systems sometimes use multiple database types.

### MongoDB

- [ ] Explain databases, collections, documents, BSON, and `_id`.
- [ ] Validate and construct ObjectIds safely.
- [ ] Use `mongosh` or Compass to explore data.
- [ ] Design single-field, unique, and compound indexes from queries.
- [ ] Explain index costs and the compound-index left-prefix rule.

### Mongoose

- [ ] Distinguish schema, model, document, query, and repository.
- [ ] Connect before listening and disconnect during shutdown/tests.
- [ ] Implement CRUD, filters, projections, sorting, and pagination.
- [ ] Use `lean()` for appropriate read-only queries.
- [ ] Use safe update operators and `runValidators`.
- [ ] Classify validation, cast, duplicate-key, and unexpected errors.
- [ ] Explain document hooks versus query hooks.
- [ ] Build aggregation pipelines with ordered stages.

### Data modeling

- [ ] Embed small, bounded, owned data that is read with its parent.
- [ ] Reference shared, independent, or unbounded data.
- [ ] Account for the 16 MiB document limit and array growth.
- [ ] Resolve references with `populate()` or `$lookup` deliberately.
- [ ] Plan referential integrity and deletion behavior in application workflows.

### Distributed-system theory

- [ ] Define CAP consistency, availability, and partition tolerance.
- [ ] Explain why the C/A trade-off matters specifically during a partition.
- [ ] Avoid treating CP/AP labels as immutable database identities.
- [ ] Define ACID and BASE.
- [ ] Distinguish ACID consistency from CAP consistency.
- [ ] Explain why SQL/NoSQL and ACID/BASE are not exact synonyms.

## Model, lifecycle and update acceptance labs

Primary backend study stack remains PostgreSQL; MongoDB/Mongoose is the document-model alternative. Examples here use Mongoose9.11.2/Node24.18.0 for the local schema/control-flow checks; verify server compatibility separately. Do not assume an offline schema test exercises a MongoDB server.

**Model consistency:** validate user/editor/country/loginCount examples against the declared main schema; confirm invalid roles/negative or fractional loginCount fail on document validation. Understand that $inc query update validators do not enforce every numeric invariant: protect critical increments with validated operations/conditional filters, and database validation where required. Base author population works with the declared ref; nested reviewer/team needs its explicit model variant. Aggregation country comes from the top-level declared field, with a documented missing-country policy.

**Bounded comments:** create a valid small post; document validation rejects over100 embedded comments and overlong text. The update path must use $each+$slice:-100, so repeated/concurrent writes preserve at most the recent100 snapshot. Keep full history in a separate paginated collection when required. Test other writers/database validation and maximum BSON size separately; a Mongoose array validator alone does not guarantee every query update is bounded.

**Inventory:** reject0, negatives, fractions, nonnumbers, Infinity and unsafe integers before decrementing stock or beginning the transaction. A negative decrement would otherwise increase stock. Race two valid reservations against the real conditional filter and require nonnegative remaining stock/one accepted reservation when capacity fits only one. Declare the Product stock/version fields and verify transaction-capable topology and outbox schemas before treating the snippets as a complete service.

**Migration and lifecycle:** use only legacy_users fixtures for this backfill, verify declared displayName survives strict casting and a missing destination field fails loudly; test empty/completed/bounded/resumed/invalid-name/no-progress/partial-error/cancel cases. Trigger HTTP-close and disconnect failures and require one awaited rejected cleanup result, no unhandled rejection and no second disconnect on repeated signals. Real Mongo transaction/index/pool/startup/shutdown deadlines and learner practice remain separate required evidence.

References checked2026-10-21: [Mongoose strict schema](https://mongoosejs.com/docs/guide.html#strict), [update validator limits](https://mongoosejs.com/docs/validation.html#update-validators), [Mongo atomicity](https://www.mongodb.com/docs/manual/core/write-operations-atomicity/), [$push/$slice](https://www.mongodb.com/docs/manual/reference/operator/update/slice/), [Mongoose9 migration](https://mongoosejs.com/docs/migrating_to_9.html).
