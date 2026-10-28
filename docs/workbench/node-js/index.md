# Node.js workbench

Reference implementations support the [textbook](../../node-js/index.md); independent assignments live in [practice](../../practice/node-js/index.md). Reading or executing a reference is not learner completion.

See the [rendered runtime source collection and run instructions](./runtime/index.md).

## Runtime references

- [Module boundary and interoperability collection](./runtime/modules.md).
- `runtime/limiter.ts`: bounded admission, original failure, cooperative abort and active-worker drain.
- `runtime/worker.ts`: one-result worker, runtime result parser, termination and cleanup.
- `runtime/json-lines.ts`: bounded byte frames, strict UTF-8 and nonnull object output.
- `runtime/child.ts`: one owned child; settle at close, including startup/abort failure.

These sources are included directly in their teaching pages, so the displayed implementation and canonical source agree. Compile TypeScript using the documented compatible compiler/types, then run JavaScript; native type stripping is not a substitute for type checking.

Reference scope matters: the limiter is a bounded array batch, the worker is not a pool, the parser is not a domain validator, and the child helper does not own a process tree. Backend/database/deployment fixtures have separate dependency and environment requirements.

## Backend and persistence collections

- [Products API](./backend/products-api.md): one multi-file Express/in-memory architecture reference; public synthetic storage, not an authenticated production API.
- [Session application](./backend/session-app.md): includes the existing `examples/node-textbook/src/app.ts`; its sibling source/README/lock remain canonical and runnable together.
- [REST/OpenAPI](./backend/rest-contracts.md): generation, drift and actual HTTP checks; supporting files are under `backend/contract-lab/`.
- [SQL query collection](./database/sql-queries.md): one disposable schema, parameter binding and expected report results.
- `database/pagination/` and `database/redis/`: source included in their [pagination](../../node-js/cursor-pagination.md) and [Redis](../../node-js/redis-adapters.md) explanations. Redis remains an alternative.

## Security, messaging and deployment

- `security/csp/` and `security/uploads/`: typed sources included in the CSP/upload lessons.
- `security/upload-lab/` and `security/webhook-lab/`: runnable parser/HTTP/PostgreSQL fixtures with their existing checks.
- `messaging/jobs-lab/`: RabbitMQ/outbox and PostgreSQL scheduler examples. Run `node ownership.check.mjs` from that fixture directory after its locked install for startup/publication cleanup failure checks without a live broker. The [jobs lesson](../../node-js/jobs-and-schedules.md) defines dependencies, uncertain windows and operational limits.
- `deployment/container-lab/` and `deployment/full-stack-lab/`: copy both dependency-complete directories as directed by the [deployment lesson](../../node-js/full-stack-deployment.md). Setup creates only owned temporary fixture resources. Container locks/hidden setup files stay with their sources.

A directory of source is not automatically a complete application. Setup paths, exact dependencies, synthetic identities, integration ports and unimplemented deployment adapters are documented in the corresponding lesson. Real database, broker, browser, provider and cloud checks have separate evidence requirements. Do not run fixture reset/cleanup scripts against an existing user database or shared service.
