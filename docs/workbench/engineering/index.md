# Engineering workbench

These canonical sources are included by their original textbook pages. Use isolated copies for dependencies/build output; never alter a mentoring template or src/tests. [Practice](../../practice/engineering/) remains entirely outstanding.

## Collections and boundaries

| Collection | Setup/meaning |
|---|---|
| [State](./state/) | Toolkit 2.13.0, React/React Redux 19.3/9.3, Query 5.105, TypeScript 5.9.3. Relational snapshots, request-ID store, bounded HTTP, selectors/context/locale and cache confirmation. Keep the shared frontend note-projection helper at its relative workbench path. |
| [Performance](./performance/) | Debounce/search/DOM-ready and route-owner sources; browser scripts/config/Next page are consumer fragments. They do not form one application or establish measured speed. |
| [Security](./security/) | Pure contract/query/header/storage helpers and injected browser transports; no complete login/server or active external connection. |
| [Patterns](./patterns/) | Bounded local signal/history sources; no effect compensation or distributed queue. |
| [Testing](./testing/) | config-tdd/limit.mjs plus 8 tests run with node --test. coverage-counterexample intentionally contains defective arithmetic: weak passes, strong fails; neither is learner completion. |
| [Quality](./quality/) | standard/ has a complete isolated manifest/config/source/test set; npm run check. typed-gates/ is a compatible-consumer ESLint fragment. |
| [Delivery](./delivery/) | schema-model/ is a pure release-compatibility model. Actual PostgreSQL/artifact ownership stays in the completed Node workbench. No CI is published. |
| [Design](./design/) | Refactor and optional RxJS observable ownership; exact application/provider integration is separate. |
| [Specialists](./specialists/) | Optional modules/callbacks/memoization/RxJS/webpack contexts. Dependencies and responsibilities are stated by each textbook owner. |
| [AI engineering](./ai-engineering/) | retry/ is a complete strict TypeScript build + 7 Node checks; use npm run build then npm test in an isolated copy. No production transport/backoff or remote action. |

[Current verification](../../review/verification.md) names executed subsets versus unchanged historical evidence. Syntax parsing is explicitly weaker than typechecking, integration or native behavior checks. Installing dependencies may execute lifecycle code; use the chosen reviewed toolchain and lockfiles in owned environments.
