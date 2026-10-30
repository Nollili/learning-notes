# Reading and homework by track

[Guide home](./) · [Current Node route](./node-start.md) · [Full topic mapping](./topics.md)

These sequences reuse existing assignments. Reading readiness is lighter than implementation readiness: start a pure function, HTML document, item transform or lexical search as soon as its bounded contract makes sense. Before integrating later stages, satisfy their earlier observable behavior. Each linked specification supplies the exact negative cases; summaries here do not replace it. Keep revision/environment, expected/actual results, a failure→correction→retest and remaining uncertainty at every step.

## Frontend

**Entry/readiness:** basic files/browser use for F01; you can explain semantic labels and a native form before enhancing it. JS functions/promises become implementation prerequisites at F03, rather than prerequisites to reading HTML.

Read [HTML/browser](../frontend/html-browser.md) → [accessibility](../senior_growth/A11y/) → [CSS](../senior_growth/CSS/) → [JavaScript](../frontend/javascript.md) → [TypeScript](../frontend/typescript.md) → [React](../frontend/react.md) → [Next/UI architecture](../frontend/next.md). The [coverage map](../frontend/coverage-map.md) links detailed lesson owners. Consult [browser](../workbench/frontend/browser/), [JS](../workbench/frontend/javascript/), [TS](../workbench/frontend/typescript/), [React](../workbench/frontend/react/), [Next](../workbench/frontend/next/) and [architecture](../workbench/frontend/architecture/) references after predicting their behavior.

| Order / homework | Implementation dependency and move-on criterion | Retain |
|---|---|---|
| [F01](../practice/frontend/f01-document.md) | Basic HTML; no-JS search/dialog task, names, focus and recovery work | Actual keyboard/focus and no-JS observations |
| [F02](../practice/frontend/f02-layout.md) | F01; narrow/wide layout preserves long content and focus | Viewports, screenshots and layout failures |
| [F03](../practice/frontend/f03-javascript.md) | Working document plus functions/closures/promises; late work cannot overwrite intent | Controlled B-before-A schedule and cleanup |
| [F04](../practice/frontend/f04-typescript.md) | F03; malformed payloads reject and impossible states fail compile | Runtime negative cases and actual diagnostics |
| [F05](../practice/frontend/f05-react.md) | F01–04; stable drafts, truthful forms and effect cleanup | P-329 race/key/batching/closure failures and corrections |
| [F06](../practice/frontend/f06-next.md) | F05 + HTTP + server authority; explicit freshness and authorized mutations | UI/API allowed/denied results and ownership boundaries |

[P-328](../practice/frontend-project.md#p-328) integrates URL filters, pages/selection, drafts, accessibility, localization and recovery into one management screen. [P-329](../practice/frontend-project.md#p-329) isolates React failures within it; [P-330](../practice/frontend-project.md#p-330) spans compile-time contracts and hostile runtime input. P-330 concepts begin at F04; F06 integrates them with server authority. Do not wait for the entire P-328 product before trying F01. Optional Redux, advanced typing, virtualization or custom widgets follow the primary flow and an observed need.

## Node, databases, distributed systems and deployment

**Entry/readiness:** trace promise/error/module behavior and operate a terminal. Follow [N-01–06](./node-start.md) and then [P-332](../practice/backend-project.md#p-332). Read modules 1, 2, 3, the relevant 4/5 sections, 11 and lifecycle sections of 10; these numbers intentionally differ from a numerical sweep.

For a service, read [Express](../node-js/module-06-express-architecture.md) → [PostgreSQL/MikroORM](../node-js/module-08-postgresql-mikroorm.md) → [authentication/authorization](../node-js/module-09-authentication-authorization.md). Start the first validated use case before finishing every supplement. Use [SQL queries](../workbench/node-js/database/sql-queries.md), [products API](../workbench/node-js/backend/products-api.md), [session app](../workbench/node-js/backend/session-app.md) and [REST contracts](../workbench/node-js/backend/rest-contracts.md) only within their stated setup boundaries.

| Milestone | Prerequisites and move-on criterion | Retain |
|---|---|---|
| P-332 | Analyzer recommended; controlled workers stop admission/drain, strict byte framing and pipeline failures behave correctly | Exact schedules, abort identity, peak work, memory workload and natural process exit |
| [P-331](../practice/backend-project.md#p-331) | HTTP/validation + disposable SQL database + current identity; independent owner/tenant checks, transactional race/duplicate/rollback invariants and one upload **or** webhook ingress | Real DB state, safe HTTP results, negative/interleaving tests, authority diagram and lifecycle evidence |
| Service hardening | P-331 vertical slice; revisit [lifecycle](../node-js/module-10-production-ready-applications.md), [diagnostics](../node-js/module-11-performance-diagnostics.md) and [distributed failures](../node-js/module-12-resilient-distributed-systems.md) | Dependency outage, safe logs, admission/drain, uncertainty/idempotency decision |
| [P-333](../practice/backend-project.md#p-333) | Integrated frontend/API/DB plus [containers](../node-js/container-deployment-lab.md), [recovery](../node-js/database-recovery.md), [artifact compatibility](../node-js/release-artifact-compatibility.md), [whole-stack runbook](../node-js/full-stack-deployment.md) | Failed-candidate detection, exact artifact rollback, accepted-write preservation, isolated restore and shutdown |

The [Node practice map](../practice/node-js/) attaches every supplement to these projects. Cursor/date/retention/REST/secure-ingress practice deepens P-331. Durable jobs and shared limits need a real durability or multi-owner requirement. MongoDB, GraphQL, Redis, OIDC and alternative transports follow a stated comparison goal. AWS/Kubernetes are optional platform scope. Local container mechanics are not hosted authenticated-product completion.

## CS foundations

**Entry/readiness:** trace loops, arrays, reference mutation and basic TS. Explain one finite loop's progress before moving to recursion. Read [cost](../cs-foundations/complexity-and-cost.md) → [reasoning/recursion](../cs-foundations/reasoning-and-recursion.md) → [structures](../cs-foundations/data-structures.md) → [binary search](../cs-foundations/binary-search.md) → [sorting](../cs-foundations/sorting.md) → [trees/graphs](../cs-foundations/trees-graphs-traversal.md) → [priority queues](../cs-foundations/priority-queues.md).

Use the [CS workbench](../workbench/cs-foundations/) after an independent trace. [CS-P01](../practice/cs-foundations/cost-and-search.md#cs-p01-cost-and-membership) membership costs → [CS-P02](../practice/cs-foundations/cost-and-search.md#cs-p02-lower-bound) half-open lookup → [CS-P03](../practice/cs-foundations/sorting.md) sort comparison → [CS-P04](../practice/cs-foundations/collections-and-queues.md#cs-p04-bounded-fifo) FIFO → [CS-P05](../practice/cs-foundations/dependency-explorer.md#cs-p05-note-dependency-explorer) explorer → [CS-P06](../practice/cs-foundations/dependency-explorer.md#cs-p06-priority-scheduler) scheduler.

These are recommended checkpoints, with concrete capability dependencies: search/sort need cost/reasoning; FIFO needs structure/ownership; explorer needs traversal; scheduler needs heap/FIFO invariants. An independent FIFO exercise need not wait for sorting mastery. Move on when small/empty/boundary cases, mutation policy, invariant and termination argument hold; retain operation counts before timings, fixed seeds and counterexamples. Cache/memoization are optional extensions after collection/identity contracts. Weighted paths, balanced trees, consensus and advanced DP are optional further depth, not hidden Node gates.

## Python and applied AI

**Entry/readiness:** basic programming is helpful; begin deterministic Python setup without a provider. You are ready for integration when you can parse a typed record, reject invalid input, await bounded I/O and name the owner that closes it.

For your beginner AI route, use [Build AI Apps — JavaScript First](../applied-ai/) and [JS-00–09](../practice/applied-ai/javascript-assistant.md). Learn console→app chatbot→schemas/tools→RAG→MCP→graphs. The Python sequence below is an **optional deeper implementation route**, not the required first step.

Read [setup](../python-for-ai/setup-and-basics.md) → [typed modules/errors](../python-for-ai/typed-modules-and-errors.md) → [configuration/logging](../python-for-ai/configuration-and-logging.md) → [bounded streams](../python-for-ai/bounded-document-streams.md) → [async HTTP](../python-for-ai/async-http.md) → [FastAPI](../python-for-ai/fastapi-boundaries.md); [deployment](../python-for-ai/deployment.md) follows a working service. Begin P-337 pure preparation during the first lessons; add DTOs, injected repository, lifespan and HTTP in that order. Its full acceptance additionally requires durable-adapter/restart and process evidence—an in-memory reference is insufficient.

Next use [shared AI foundations](../applied-ai/shared/) → [RAG](../applied-ai/rag/) → [workflows](../applied-ai/workflows/) → [n8n](../applied-ai/n8n/). These guides link the detailed Python lessons in concept order. The [chapter practice index](../practice/applied-ai/chapters/) pairs detailed reading with bounded exercises; consult [Python reference sources](../workbench/applied-ai/python/) after predicting inputs/outcomes.

| Stage | Minimum concepts / dependency | Observable exit and evidence |
|---|---|---|
| [P-337](../practice/ai-project.md#p-337) | Typed Python → strict DTO → owned async/lifespan → HTTP | Invalid/oversize/foreign input denied, safe logging, real process shutdown; locked checks, source/runtime and durable restart observations |
| [RAG-1](../practice/applied-ai/rag-assistant.md#rag-1-ingestion-and-lexical-baseline) | Typed records/files, extraction and current ACL | Reconstruct exact spans; scoped lexical baseline; reject invalid input before provider calls |
| [RAG-2](../practice/applied-ai/rag-assistant.md#rag-2-compatible-indexing-hybrid-and-reranking) | RAG-1; embedding-space and index lifecycle | Same permitted corpus comparison, compatible versions, bounded ranking; keep labels/ranks/metrics and unavailable real-adapter gaps |
| [RAG-3](../practice/applied-ai/rag-assistant.md#rag-3-checked-answer-and-abstention) | Current span resolver, tokens/schema/streaming; [answer composition](../applied-ai/rag/answering-and-failures.md) | Supported citations versus mere membership, honest abstention/unavailable/partial states; per-claim judgments and cancellation |
| [RAG-4](../practice/applied-ai/rag-assistant.md#rag-4-evaluation-and-lifecycle) | Prior RAG stages and independent evaluation set | Frozen comparison, revocation/delete/update/restore behavior; retain split/rubric and lifecycle records |
| [WF-1](../practice/applied-ai/resumable-workflow.md#wf-1-fixed-read-propose-validate) | Typed tools, current identity and bounded dispatch | Fixed read/propose; invalid routing causes zero disallowed I/O; call/effect counts |
| [WF-2](../practice/applied-ai/resumable-workflow.md#wf-2-artifacts-and-durable-approval) | WF-1; SQLite/CAS and immutable artifacts | Real restart, current source validation and exact-command approval binding; revision/denial/UI records |
| [WF-3](../practice/applied-ai/resumable-workflow.md#wf-3-receipt-and-interrupted-recovery) | WF-2; transaction/receipt semantics | Interrupted resume and duplicates yield one local effect; preserve command IDs, receipts and unknown-outcome reconciliation |
| [WF-4](../practice/applied-ai/resumable-workflow.md#wf-4-time-retries-budgets-and-evaluation) | Prior workflow stages | Limits survive restart, classified retries/cancel settle honestly; full attempt/usage/trace ledger |
| [N8N-P01 N-1 → N-4](../practice/applied-ai/n8n-integration.md) | N-1 item transforms first; JSON/HTTP/scoped service for N-2; failures/replay for N-3; operational record N-4 | Actual engine/test-webhook, replay/no-duplicate-effect and subworkflow observations; separate workbench-only results |

P-334 spans RAG-1–4; P-335 spans WF-1–4 plus evaluation. The reading order places RAG first, but fixed tools need shared authority/state foundations rather than a completed RAG engine. [n8n integration](../applied-ai/n8n/integration.md) and [operations](../applied-ai/n8n/operations.md) become necessary as you connect the transform to a service. Keep workflows manual/test-only. Model theory/modalities, MCP, graphs/adaptation, ETL/Streamlit and cache/batch are optional after their relevant primary boundary; no training, paid model or hosted vector store is required to start.

## Engineering and AI-assisted development

**Entry/readiness:** an owned small contract is enough for quality and P-336; shared state requires JS/React; measured performance requires a working flow; security requires HTTP/identity; delivery/architecture require an actual vertical slice. Read just the relevant guide first, then its detailed links.

| Order / increment | Read and consult | Move-on behavior and retained evidence |
|---|---|---|
| [E01](../practice/engineering/e01.md), after F05 | [State](../engineering/state.md), state workbench | Coherent normalized snapshots, account isolation, B-before-A safety; assertions plus UI/cleanup |
| [E02](../practice/engineering/e02.md), after working UI | [Performance](../engineering/performance.md) | One measured cause corrected without losing behavior; comparable repeated traces/cache/device conditions |
| [E03](../practice/engineering/e03.md), at P-330/P-331 | [Security](../engineering/security.md) | Real operation denies foreign/stale/unsafe writes; safe HTTP/DB threat→test evidence |
| [E04](../practice/engineering/e04.md), can begin early | [Quality](../engineering/quality.md) | Detected baseline defect, negative controls for gates, justified refactor; exact diff/check results |
| [E05](../practice/engineering/e05.md), after artifact/DB basics | [Delivery](../engineering/delivery.md) | Local conflict recovery and same-artifact promotion; identities/compatibility and unsafe-rollback refusal |
| [E06](../practice/engineering/e06.md), after vertical slice | [Design](../engineering/design.md) | ADR/quality scenario/recovery rehearsal trace to real results; decision alternatives and actual handoff |
| [E07](../practice/engineering/e07.md), optional after primary path | Design specialist scope, [specialist references](../workbench/engineering/specialists/) | One justified comparison, bounded failure/cleanup and adopt/defer decision |

Use [engineering workbench collections](../workbench/engineering/) and [focused requirements](../practice/engineering/) to deepen the same projects. E01–E07 are a recommended deepening order, not a rule to postpone tests/security until state/performance is finished. Testing/quality/patterns, Git/CI, design/requirements/estimation/onboarding/incident decisions and specialist comparisons are all mapped; organizational folders do not become separate courses.

Start with [AI for Software Development](../ai-assisted-engineering/) and [DEV-01–05](../practice/engineering/ai-engineering/development-project.md) for beginner bug/feature work.

[P-336](../practice/ai-project.md#p-336): read [issue→change](../ai-assisted-engineering/issue-to-reviewed-change.md) → [verification/permissions](../ai-assisted-engineering/verification-and-permissions.md) → [local Git workflow](../ai-assisted-engineering/local-workflow-and-git.md) → [traceability](../ai-assisted-engineering/traceability-and-evaluation.md). Attempt a distinct real or labeled study issue; reproduce defect → minimal local correction → meaningful/fault checks → actual diff review → factual handoff. Retain requirement-to-check mapping and review outcome only if it actually occurred. This complements E04/E05; it does not require RAG or agents. Never push remotely.
