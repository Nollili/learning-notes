# Runtime reference sources and checks

[Textbook](../../../node-js/index.md) · [Independent practice](../../../practice/node-js/index.md)

These are canonical source examples, included directly in the teaching pages. Their limits are part of the contract. A successful helper check does not complete learner practice or validate an entire deployed service.

## Bounded concurrency

<<< ./limiter.ts

The owner stops assigning work after observed failure, aborts cooperative siblings and waits for active work to drain. Inputs/results remain an explicitly bounded array batch; there is no streaming queue or fairness scheduler.

## One owned worker

<<< ./worker.ts

The result is runtime-validated. Exit without a result rejects even with code zero; selected outcome, deadline, termination and listener cleanup belong to one owner. This is not a pool or durable job queue.

## Byte-framed JSON records

<<< ./json-lines.ts

Framing precedes strict UTF-8 decoding and JSON/domain processing. Output contains nonnull objects; fields still require a separate domain validator. Frame/chunk/count bounds do not establish a universal process-memory ceiling.

## One owned child

<<< ./child.ts

The helper settles at `close` and does not expose a shell. A caller supplies a finite deadline. It forcefully terminates only its direct disposable child on abort; process trees, graceful escalation and OS/platform limits need separate ownership.

## Reproduce the focused checks

From the repository root, after installing the retained example application's locked dependencies, compile the runtime sources to a new owned temporary directory:

```sh
node examples/node-textbook/node_modules/typescript/bin/tsc \
  docs/workbench/node-js/runtime/limiter.ts \
  docs/workbench/node-js/runtime/worker.ts \
  docs/workbench/node-js/runtime/json-lines.ts \
  docs/workbench/node-js/runtime/child.ts \
  docs/workbench/node-js/runtime/operations/*.ts \
  docs/workbench/node-js/runtime/diagnostics/*.ts \
  docs/workbench/node-js/runtime/dates/*.ts \
  --target ES2022 --module NodeNext --moduleResolution NodeNext \
  --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes \
  --types node --typeRoots examples/node-textbook/node_modules/@types \
  --skipLibCheck --outDir /tmp/my-node-runtime-build
NODE_RUNTIME_BUILD=/tmp/my-node-runtime-build node docs/workbench/node-js/runtime/check.mjs
NODE_RUNTIME_BUILD=/tmp/my-node-runtime-build node docs/workbench/node-js/runtime/check-lifecycle.cjs
```

Choose your own unused output directory. `skipLibCheck` scopes checking of dependency declarations; strict source checks remain enabled. The runner loads the emitted sources from the supplied absolute directory, uses standard-library fixtures and does not need a database or internet access. It checks failure/drain ordering, split UTF-8 and parser rejection, real worker outcomes, missing/nonzero child commands, abort and natural termination.

## Related reference collections

- [CJS/ESM interoperability](./modules.md): small source files and expected outcomes; not an installable package.
- `dates/`: strict instant/date helpers and explicit-zone/DST observations, explained in [dates and time zones](../../../node-js/dates-and-time-zones.md).
- `operations/`: listen-ready, safe diagnostic projection and combined close/shutdown sources, explained in [lifecycle](../../../node-js/module-10-production-ready-applications.md).
- `diagnostics/`: event-loop sampler and measured database port, explained in [diagnostics](../../../node-js/module-11-performance-diagnostics.md). A port test is distinct from a real database measurement.
- [Historical verification notes](./historical-verification.md) retain earlier author observations with their original date and limits.

The lifecycle runner additionally opens one temporary loopback HTTP listener and checks repeated shutdown, drain-before-database ordering, timer-budget rejection, safe error projection, instrumentation failure ownership and calendar edge cases. It closes its listener before exit.
