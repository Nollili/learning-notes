# Practice: Do you know some of the differences of non relational databases and relational databases?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/EngX_Quality/Do_you_know_some_of_the_differences_of_non_relational_databases_and_relational_databases.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise acceptance:** compare PostgreSQL and one documented MongoDB deployment using the same invariants, failure cases and access pattern. Record isolation/read/write concerns, primary-versus-replica path, transaction scope, retry policy and measured latency; distinguish a duplicate-write conflict from an outage. Predict behavior during an unavailable primary/network partition without calling a single-process test a partition simulation. Use the existing [PostgreSQL lab](../../../node-js/module-08-postgresql-mikroorm.md) and [MongoDB chapter](../../../node-js/module-07-mongodb-mongoose.md); advanced multi-node fault injection remains separate practice. No database benchmark/partition or learner evidence is claimed here.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
