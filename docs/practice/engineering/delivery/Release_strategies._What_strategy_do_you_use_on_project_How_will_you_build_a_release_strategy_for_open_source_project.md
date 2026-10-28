# Practice: Release strategies. What strategy do you use on project? How will you build a release strategy for open source project?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/CD_CI/Release_strategies._What_strategy_do_you_use_on_project_How_will_you_build_a_release_strategy_for_open_source_project.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise acceptance:** show a V1 write leaves the expanded shadow stale, V2 still reads the correct canonical value, final backfill plus V3 dual write preserves V2 rollback, a V4-only write makes V2 stale even before contract, and V4 survives contract while V1/V2 reads and V3 writes fail. Then run the corresponding primary PostgreSQL migrations/old-new artifacts in an isolated integration lab, including a concurrent writer and a failed/restarted backfill. Require zero lost updates, verified constraints, bounded lock/statement time and an explicit point after which forward repair replaces old-artifact rollback. Keep the immutable build artifact/version, migration state, smoke results and recovery limits. The JavaScript model proves none of the database/deployment properties by itself; learner integration/recovery practice remains required.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
