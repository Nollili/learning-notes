# Learning notes: work completed, coverage and next practice

Updated: 2026-10-26.

The material now supports an advanced/senior frontend focus, intermediate Node/backend/full-stack work, intermediate applied AI, and strong AI-assisted engineering practices. These describe the intended depth of the study material, not an assessment of your demonstrated professional level. Job titles vary between organizations.

## What was done

- The original audit reviewed222 source files:221 text files and one image. That is the historical audit inventory, not today's expanded repository file count.
- The assessment reconciled710 requirements across29 areas. Its581 Partial/Mention-only/Missing requirements were mapped into remediation tasks;129 Covered-well qualifications and263 appendix observations were retained.
- All698 documentation tasks are now marked completed, with0 pending/blocked in the original remediation scope. Overlapping findings share tasks where appropriate, so requirement/task/file counts differ.
- Incorrect or outdated explanations were corrected, useful existing content preserved, and missing topics expanded with examples, failure cases, trade-offs, official references and exercises with acceptance criteria.
- Worked checks were added across TypeScript/React, Node/HTTP, PostgreSQL, RabbitMQ, Docker/HTTPS and Python. The final28-task phase updated8 existing files and created38 notes/supporting files; these figures apply to that phase only.
- Version-sensitive and security guidance was checked against official sources during the relevant batches. Pinned versions identify tested fixtures; they are not a promise that those versions stay current forever.
- The Task Board walkthrough page and its navigation were removed at your request. Introductory “Learning route” sections in Modules8–10 were removed; useful runnable source examples remain available.
- LEARNING_NOTES_REVIEW.md remains the unchanged original assessment. Later corrections and completion evidence live in the remediation tracker.

The latest documentation build passed, and316 internal links/206 anchors resolved across the final phase's checked notes. Executed examples, static checks and unperformed integrations are distinguished in the tracker. Those link/check counts are not a new exhaustive test of every file in the repository.

## How to interpret the levels

**Junior:** explain terminology and implement a small guided example. **Medior/intermediate:** independently implement and troubleshoot a bounded feature, validate inputs and handle common failures. **Senior:** reason about alternatives, edge cases, ownership, performance/security/reliability and wider change consequences. These are a working rubric for this summary, not universal hiring criteria.

A topic can include junior foundations and senior reasoning in the same notes. Introductory awareness of a specialist tool is not operational mastery of that tool.

## Topics and documentation depth

| Area | Topics now represented | Depth and boundary |
|---|---|---|
| HTML/browser/accessibility | Semantics, forms, tables, names/labels, focus, dialogs, keyboard interaction, responsive media, zoom/reflow, WCAG reasoning | Junior foundations through senior frontend reasoning; native-browser/assistive practice remains required |
| CSS/responsive UI | Cascade/specificity/layers, layout, units, responsive/container behavior, modern CSS, Sass modules, styling architecture | Medior–senior frontend material |
| JavaScript/runtime | Scope/closures, prototypes, modules, promises, event loop, scheduling, cancellation, memory and workers | Junior foundations through senior debugging/reasoning |
| TypeScript | Strict types, narrowing, generics, exhaustive unions, runtime JSON validation, API boundaries | Medior–senior frontend/full-stack material |
| React/state/forms | Rendering/identity, effects and cleanup, races, batching/closures, state ownership, query caches, forms/wizards, optimistic edits and navigation | Senior frontend target, supported by medior implementation examples |
| Next.js/rendering architecture | App Router, server/client boundaries, loading/error states, data/cache/security boundaries, SSR/CSR choices | Medior implementation plus senior boundary/design reasoning; not a complete hosted Next application |
| Design systems/UI architecture | Component APIs, tokens, stories, compatibility/releases, progressive enhancement, custom-element/microfrontend trade-offs | Medior–senior concepts and bounded examples; broad platform adoption remains practical work |
| Testing/quality/tooling | Unit/integration/E2E distinctions, meaningful oracles, controlled async tests, fault challenges, lint/type/build boundaries, CI artifacts | Medior–senior engineering material |
| Node.js/Express | Runtime/standard library, events/buffers/streams, networking, layered architecture, errors, startup/readiness/shutdown, diagnostics | Strong medior/intermediate backend target; selected advanced failure reasoning |
| Relational databases | PostgreSQL, SQL, modeling/normalization, joins/CTEs/windows, indexes/plans, ACID/isolation/locking, MikroORM, migrations/pagination/recovery | Medior/intermediate backend, with selected deeper concurrency/operations cases |
| Alternative data/API tools | MongoDB/Mongoose, Redis, GraphQL, transport alternatives | Medior bounded coverage; PostgreSQL/REST remain primary choices |
| Security | Sessions/passwords/JWT/OIDC/PKCE, CSRF/XSS/CSP, tenant/owner authorization, unsafe sinks, uploads, signed webhooks, dependency/secret boundaries | Medior backend through senior application-security reasoning; not a security-specialist qualification |
| Distributed backend | Idempotency, receipts/outbox, RabbitMQ acknowledgements/retries/DLQ, scheduling, caches, breakers, leases/fencing and reconciliation | Medior implementation with advanced concepts; replicated production operation remains separate |
| Deployment/operations | Docker, nonroot runtime, private databases, HTTPS, health/drain, artifacts/schema compatibility, backup/restore/rollback, AWS examples | Medior target; local exercises executed, cloud evidence limited/static where stated |
| Python companion | Language/types/errors, uv/pytest, async HTTP, bounded parsing, Pydantic/FastAPI, logs, lifespan and deployment | Junior foundations through medior applied implementation |
| Applied AI foundations | Model families, training/inference, embeddings, prompting/context, sampling/attention, structured outputs, streaming, evaluation/cost | Medior applied AI; not research-level ML or large-model training |
| RAG | Extraction/chunking/provenance, vector lifecycle, lexical/hybrid retrieval, reranking, current permissions, citations/abstention, freshness/deletion | Medior component material; integrated project/real quality measurements still required |
| Agent workflows/MCP | Typed tools, fixed versus dynamic workflows, scoped state/memory, approvals, budgets, idempotent writes, recovery, MCP primitives/transports/security | Medior applied workflows with advanced safety/reliability reasoning; multi-agent deployment is introductory/optional |
| AI-assisted engineering | Issue/acceptance/context, generated-code/API review, safe local Git/worktrees, failure reproduction, verification, traceability and handoff | Medior–senior engineering practices; independent judgment/human review must be demonstrated |
| Secondary topics | MLOps/LLMOps, Streamlit, ETL, graph databases/GraphRAG, Kubernetes, orchestration choices, fine-tuning/LoRA | Introductory awareness plus small worked examples; advanced administration/training intentionally deferred |
| Computer science | Existing complexity/algorithm material plus distributed runtime, data-structure, database and networking concepts | Mixed depth; dedicated CS-01–08 corpus audit/coverage reconciliation remains outstanding |
| Communication/ownership | ADRs, refactoring/estimation trade-offs, review, onboarding, mentoring and incident communication | Senior-oriented study material; actual team outcomes and leadership evidence are not established |

Main entry points: [frontend/senior material](./docs/senior_growth/index.md), [Node.js](./docs/node-js/index.md), [Python/applied AI](./docs/python-for-ai/index.md), and [AI-assisted engineering](./docs/ai-assisted-engineering/index.md).

## What would be useful to cover or deepen next

The highest-value next step is integrating and exercising the material. The original remediation is complete; that does not mean every possible subject or practical capability is complete.

1. **Finish the explicit CS coverage audit.** Reconcile complexity, arrays/lists/maps/sets, stacks/queues/heaps/trees/graphs, binary search, sorting, BFS/DFS, invariants and correctness. Connect them to practical workloads rather than adding disconnected interview definitions. Existing coverage should be reused before new lessons are written. [MIT6.006](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/) is a useful external scope reference, not a required additional course.
2. **Build the complete RAG and approved-tool workflows.** The component notes and project specifications exist; current-authority adapters, durable recovery, real quality evaluation and aggregate budgets need integrated evidence.
3. **Deepen browser/accessibility verification.** Record real keyboard, VoiceOver/screen-reader, focus, zoom/reflow, reduced-motion and cross-browser behavior. DOM simulation/build success cannot replace these observations.
4. **Add one observability/SLO case study.** Extend the existing logging/metrics material with a correlated frontend→API→database/job trace, redaction checks, a user-visible reliability objective and an actionable alert. This is a candidate deeper exercise, not a claim that all observability concepts are absent. References: [OpenTelemetry signals](https://opentelemetry.io/docs/concepts/signals/) and [Google SRE service-level objectives](https://sre.google/sre-book/service-level-objectives/).
5. **Collect integrated operational evidence.** Exercise authenticated deployment, concurrency/load, restore, rollback, proxy/TLS behavior, dependency outages and real artifact compatibility under a declared environment/workload.
6. **Keep specialist tools role-dependent.** Advanced Kubernetes, graph-database operation, distributed multi-agent systems, MLflow infrastructure and hands-on fine-tuning can wait until a project needs them. Their introductory coverage is present; mastering every alternative is unnecessary for the primary targets.

These priorities are based on the repository's remaining practice/extension work, not a claim that the notes cover every employer's requirements.

## Practical projects already specified

All ten remain **learner practice still required**. They can share one product and evidence ledger rather than become ten unrelated applications.

| ID | Project | Intended practice level |
|---|---|---|
| P-328 | Accessible management screen: URL filters, server pagination/sort, selection, wizard/draft, dialog, localization | Senior frontend |
| P-329 | Deterministic React race, stable-key identity, batching and stale-closure failure lab | Medior→senior React reasoning |
| P-330 | Type-safe API boundary with unknown JSON, runtime schemas, exhaustive states and negative compile cases | Medior→senior TypeScript |
| P-331 | Authenticated Node/PostgreSQL service with tenant policy, transactions, safe ingress and lifecycle | Medior backend/full-stack |
| P-332 | Concurrency/UTF-8/framing/backpressure/output-failure/cancellation lab | Strong medior runtime debugging |
| P-333 | Deploy the app, verify backup restore and roll back a failed compatible release | Medior operations |
| P-334 | Permission-aware document assistant with source lifecycle, retrieval comparison, citations and cancellation | Medior applied AI/RAG |
| P-335 | Versioned evaluation and approved agent-tool workflow with budgets, receipts and interrupted recovery | Medior applied AI with advanced boundary reasoning |
| P-336 | AI-assisted issue→reviewed local change record, including a failing baseline and rejected wrong patch | Medior→senior engineering |
| P-337 | Locked, validated, tested Python/FastAPI companion service | Medior Python/backend |

Setup, increments, failure scenarios and acceptance evidence are in the [practice hub](./docs/practice/learning-projects.md), [frontend specification](./docs/practice/frontend-project.md), [backend specification](./docs/practice/backend-project.md), and [AI/Python/engineering specification](./docs/practice/ai-project.md).

## Small additional drills worth adding

These would extend the existing projects; they are proposals, not new completed tasks or newly audited omissions.

| Drill | Concrete acceptance |
|---|---|
| Algorithm/data-structure decision lab | Implement an array-backed queue and heap for a bounded task scheduler; verify invariants/order, explain time/space costs and compare measured workloads without presenting tiny benchmarks as universal results |
| Observability game day | Inject one slow SQL query and one failed worker; follow the same safe operation ID across traces/logs, diagnose the cause and show the alert corresponds to user-visible impact without exporting credentials or document bodies |
| Accessibility regression session | Record a complete keyboard/screen-reader/zoom flow before and after a UI change; retain an actual failure, correction and repeated observation |
| RAG regression ledger | Label independent answerable/unanswerable/source-revoked cases, compare lexical/hybrid behavior, inspect unsupported answers and report sample size, latency and known/unknown cost |
| Resumable job crash drill | Interrupt an approved write at each boundary, restart the owner, and prove the retained command/approval/receipt prevents duplicated effects and rejects changed authority |

## Files used for tracking

| File | Purpose and interpretation |
|---|---|
| [LEARNING_NOTES_REVIEW.md](./LEARNING_NOTES_REVIEW.md) | Original immutable assessment: graded requirements, incorrect explanations, gaps and initial practical recommendations. Historical grades are not a current post-remediation reassessment. |
| [REVIEW_PROGRESS.md](./REVIEW_PROGRESS.md) | Original222-source inventory/read status, ranges and review findings; demonstrates original audit completeness. It is not a live inventory of every newly created file. |
| [GAP_REMEDIATION_PROGRESS.md](./GAP_REMEDIATION_PROGRESS.md) | Main698-task ledger: stable IDs, source references, destinations, priority/status, changes, checks, batches/checkpoints and final reconciliation/file inventory. |
| [FURTHER_TOPICS_PROGRESS.md](./FURTHER_TOPICS_PROGRESS.md) | Separate agent/RAG/AI-engineering/CS extension map and learner milestones; distinguishes mapped/specification material from integrated practice and the outstanding CS audit. |
| [docs/practice/learning-projects.md](./docs/practice/learning-projects.md) | Ten project specifications and evidence-record template. It does not contain completed learner evidence. |
| LEARNING_NOTES_SUMMARY.md | This overview; it summarizes the ledgers and does not replace their task-level evidence. |

The useful distinction is now: **original study-material remediation completed; independent practical learning and the separately tracked CS audit remain.** Improved notes do not establish professional readiness.
