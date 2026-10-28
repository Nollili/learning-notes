# Further topics: learning path and progress

Updated2026-10-26. This extension outline accompanies [the remediation tracker](./GAP_REMEDIATION_PROGRESS.md); it does not alter the original698 findings or the immutable review. Original remediation at this checkpoint:698 completed/0 pending. Those are documentation tasks, not files or demonstrated skills.

## Order and completion rules

Continue the original pending tasks in small topic batches. Finish critical AI security, then the original AI-assisted engineering workflow requirements, while retaining the existing front-end/backend priorities. Reconcile CS coverage before creating new lessons so existing explanations are expanded or linked rather than duplicated. The extension IDs below are separate planning milestones, not extra findings silently added to698.

A material milestone is completed only after full relevant-source reading, useful explanations/examples/failures/trade-offs, an exercise with acceptance criteria, official references, applicable executable checks and links/build validation. Learner practice remains **still required** until independently performed with retained evidence. “Mapped” means existing material has an identified home; it does not mean a new exhaustive audit or end-to-end integration has been completed.

## Topic outline

| Extension ID | Topic and target depth | Existing material / original references | Material status | Next evidence needed |
|---|---|---|---|---|
| AG-01 | Fixed workflows versus autonomous agents; intermediate applied AI | [Graph/memory lesson](./docs/python-for-ai/graph-memory.md); R-23.01–25 documentation complete | mapped | Use the project acceptance map to connect lessons; preserve single-owner baseline and avoid introductory learning-route blocks per user preference |
| AG-02 | Tool contracts, state, recovery, approvals and budgets | [State](./docs/python-for-ai/tool-workflow-state.md), [approved writes](./docs/python-for-ai/approved-writes.md), [economics](./docs/python-for-ai/model-economics.md) | mapped | Capstone must join the existing components with durable artifacts, current auth and explicit failed/unknown outcomes |
| AG-03 | Complete bounded agent project | Existing component exercises; original practice-project tasks remain in remediation tracker | specification documented in P-335; integrated learner build still required | One read→propose→human-confirm→write→receipt flow; interrupted recovery, revoked access, duplicate call, aggregate budget and safe traces |
| AG-04 | Multi-agent coordination; introductory material, optional advanced implementation | Graph/memory trade-off section | mapped | Compare a measured benefit against single-owner baseline; no requirement to master several frameworks or deploy multiple agents |
| RG-01 | Ingest→extract→chunk→index; intermediate RAG | [Extraction](./docs/python-for-ai/document-processing.md), [vector lifecycle](./docs/python-for-ai/vector-storage-lifecycle.md); R-22.01–27 documentation complete | mapped | Cross-check extraction/span/space/generation identities in one integrated implementation |
| RG-02 | Authorized retrieval→rerank→context→answer→citations | [Pipeline](./docs/python-for-ai/retrieval-pipeline.md), [evidence](./docs/python-for-ai/retrieval-context.md) | mapped | Integrate actual embedding/generation adapters and owned deadlines without bypassing current source checks |
| RG-03 | Quality, freshness and operations | [Debugging](./docs/python-for-ai/retrieval-debugging.md), [evaluation](./docs/python-for-ai/evaluation-lab.md) | mapped | Learner-labeled held-out queries, exact baseline, recall/support/latency/cost and update/delete/revocation cases |
| RG-04 | Complete document-assistant project | Existing component exercises; original practice-project tasks | specification documented in P-334; integrated learner build still required | Versioned corpus, reproducible local setup, safe UI, source lifecycle, failure drill and measured result ledger; no production-readiness inference |
| AE-01 | AI-assisted issue→specification→context→change | Original R-27.01–06, R-27.11–15 | original documentation complete: R-27.01–06/11–15 | Work through a real local fixture with clear scope, instructions, secrets/permissions and branch/worktree decisions |
| AE-02 | Independent review and evidence | Original R-27.07–10, R-27.16–18 | original documentation complete: R-27.07–10/16–18 | Detect invented API/incorrect code, trace acceptance to checks, review actual diff and record limitations; never auto-credit generated tests |
| CS-01 | Complexity and cost models; advanced practical front-end | Existing Big O/quicksort notes under senior_growth/Other | audit pending | Reconcile worst/average/amortized time, auxiliary space and measured JS/runtime costs; identify missing exercises |
| CS-02 | Data structures and algorithm selection | Existing Map/Set, queues and graph material distributed across notes | audit pending | Explicit arrays/lists/stacks/queues/hash maps/heaps/trees/graphs inventory, invariants, use cases and trade-offs |
| CS-03 | Search, sorting and traversal | Existing quicksort/queue/traversal material | audit pending | Binary search boundaries, stable sorting, BFS/DFS/visited sets and representative frontend/backend problems; avoid rote interview-only coverage |
| CS-04 | Runtime, memory and concurrency | JS execution, Node foundations/diagnostics, worker material | audit pending | Connect call stack/heap/GC, processes/threads, event loop, scheduling, races/locks and cancellation with debugging examples |
| CS-05 | Networking and distributed systems | Node modules5/12 and browser networking material | audit pending | Connect DNS/TCP/TLS/HTTP, partial failures, ordering, consistency, idempotency and queues; identify assumptions and actual test boundaries |
| CS-06 | Databases and data modeling | Node module8 and SQL workbench | audit pending | Reconcile relational modeling, indexes/query plans, transactions/isolation/locking and practical performance reasoning |
| CS-07 | Reasoning, correctness and testing | Existing type-boundary/testing/quality notes | audit pending | Explicit invariants, pre/postconditions, state machines, boundary/property tests and counterexamples across the primary stack |
| CS-08 | Coherent CS coverage map and project checkpoints | Existing notes are topic-distributed | planned after audit | Publish one navigable coverage map with links, only necessary missing lessons and evidence-based exercises; no introductory learning-route blocks |

## Learner practice backlog

| Practice milestone | Acceptance evidence | Learner status |
|---|---|---|
| LP-AG | Integrated bounded workflow, authorization/approval/recovery/budget failure tests and explanation of single versus multiple agents | still required |
| LP-RG | End-to-end authorized document assistant, corpus/label ledger, real adapter checks, current-source citations and measured retrieval/support quality | still required |
| LP-AE | One issue-to-reviewed-change record: acceptance criteria, actual diff, independently verified tests/build, review findings and corrected failures | still required |
| LP-CS | Implement/explain selected structures/algorithms and debug runtime/database/network failure cases; retain complexity reasoning and practical measurements | still required |

These practice milestones consolidate learning evidence; they do not mark overlapping original P-* practice tasks complete. No learner outcomes or professional readiness are claimed.

## Next checkpoint

Original remediation is complete:698/698 documentation tasks,0 pending/blocked. B184–193 closed the final28 tasks: component stories/release/communication, multipart uploads, authentication/path qualifications, actual RabbitMQ jobs/outbox/retry/DLQ/drain, PostgreSQL scheduling, signed webhooks, local full-stack HTTPS restore/rollback, all seven optional introductions and ten practical-project specifications.

The [practice hub](./docs/practice/learning-projects.md) now maps P-328–337 to detailed frontend, backend/runtime/deployment and AI/Python/engineering projects. Material completion does not mark any learner exercise done. AG-03/RG-04 now have integrated project specifications and authored fixture seeds; actual complete agent/RAG implementations, provider-quality runs and learner evidence remain required.

CS-01–07 still require the separate explicit corpus audit/reconciliation; CS-08 depends on that audit. This extension was not part of the final28 original tasks and is not silently marked complete. Existing runtime/database/network/invariant examples remain mapped material. Preserve the user's preference against opening learning-route sections.

## Latest validation checkpoint

B155–161 completed29 original documentation tasks. New security material passed strict Python checks and real-file/schema/mock-SDK tests; the engineering fixture retained a failing baseline, passing strict build/7 runtime tests,4 detected defect variants, Git isolation/refusal tests and source/emitted identities. Every batch passed internal-link checks and the documentation build. Eight embedded implementation/test blocks match the executed scratch sources. No native browser/provider account/remote PR/independent human review or learner completion is claimed. The existing documentation bundle-size warning remains.


B162–182 validation update: each completed batch passed its applicable executable/schema/type checks, internal links and documentation build. Real local Git, PostgreSQL, Docker, React/JSDOM, Node and MCP protocol/middleware examples are distinguished from static checks, adaptation sketches and unperformed native-browser/cloud/provider work. Build/link/test failures were corrected and retained in the remediation log. All learner practice remains outstanding; the original review is unchanged.


B184–193 final validation: actual React/JSDOM behavior and Storybook static build; real local PostgreSQL/HTTP upload and webhook checks; RabbitMQ confirms/outbox/dedup/retries/DLQ/redelivery/drain; scheduler overlap/rollback/checkpoint; HTTPS frontend/API/database, separate-target restore and failed-release rollback; Python SQLite/Streamlit AppTest/data-split/traversal checks; strict TypeScript boundary and controlled concurrency/stream failures passed. Storybook dependency declaration checking remains a recorded limitation; application checks were scoped explicitly. Kubernetes/Neo4j/model-training/cloud/native-browser/independent-human outcomes are not claimed. Owned runtime services were removed/stopped. The immutable original review hash is unchanged.
