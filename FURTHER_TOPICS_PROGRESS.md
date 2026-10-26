# Further topics: learning path and progress

Updated2026-10-25. This extension outline accompanies [the remediation tracker](./GAP_REMEDIATION_PROGRESS.md); it does not alter the original698 findings or the immutable review. Original remediation at this checkpoint:668 completed/30 pending. Those are documentation tasks, not files or demonstrated skills.

## Order and completion rules

Continue the original pending tasks in small topic batches. Finish critical AI security, then the original AI-assisted engineering workflow requirements, while retaining the existing front-end/backend priorities. Reconcile CS coverage before creating new lessons so existing explanations are expanded or linked rather than duplicated. The extension IDs below are separate planning milestones, not extra findings silently added to698.

A material milestone is completed only after full relevant-source reading, useful explanations/examples/failures/trade-offs, an exercise with acceptance criteria, official references, applicable executable checks and links/build validation. Learner practice remains **still required** until independently performed with retained evidence. “Mapped” means existing material has an identified home; it does not mean a new exhaustive audit or end-to-end integration has been completed.

## Topic outline

| Extension ID | Topic and target depth | Existing material / original references | Material status | Next evidence needed |
|---|---|---|---|---|
| AG-01 | Fixed workflows versus autonomous agents; intermediate applied AI | [Graph/memory lesson](./docs/python-for-ai/graph-memory.md); R-23.01–25 documentation complete | mapped | Reconcile the learning route into one sequence; preserve single-owner baseline and explain when dynamic routing is justified |
| AG-02 | Tool contracts, state, recovery, approvals and budgets | [State](./docs/python-for-ai/tool-workflow-state.md), [approved writes](./docs/python-for-ai/approved-writes.md), [economics](./docs/python-for-ai/model-economics.md) | mapped | Capstone must join the existing components with durable artifacts, current auth and explicit failed/unknown outcomes |
| AG-03 | Complete bounded agent project | Existing component exercises; original practice-project tasks remain in remediation tracker | planned | One read→propose→human-confirm→write→receipt flow; interrupted recovery, revoked access, duplicate call, aggregate budget and safe traces |
| AG-04 | Multi-agent coordination; introductory material, optional advanced implementation | Graph/memory trade-off section | mapped | Compare a measured benefit against single-owner baseline; no requirement to master several frameworks or deploy multiple agents |
| RG-01 | Ingest→extract→chunk→index; intermediate RAG | [Extraction](./docs/python-for-ai/document-processing.md), [vector lifecycle](./docs/python-for-ai/vector-storage-lifecycle.md); R-22.01–27 documentation complete | mapped | Cross-check extraction/span/space/generation identities in one integrated implementation |
| RG-02 | Authorized retrieval→rerank→context→answer→citations | [Pipeline](./docs/python-for-ai/retrieval-pipeline.md), [evidence](./docs/python-for-ai/retrieval-context.md) | mapped | Integrate actual embedding/generation adapters and owned deadlines without bypassing current source checks |
| RG-03 | Quality, freshness and operations | [Debugging](./docs/python-for-ai/retrieval-debugging.md), [evaluation](./docs/python-for-ai/evaluation-lab.md) | mapped | Learner-labeled held-out queries, exact baseline, recall/support/latency/cost and update/delete/revocation cases |
| RG-04 | Complete document-assistant project | Existing component exercises; original practice-project tasks | planned | Versioned corpus, reproducible local setup, safe UI, source lifecycle, failure drill and measured result ledger; no production-readiness inference |
| AE-01 | AI-assisted issue→specification→context→change | Original R-27.01–06, R-27.11–15 | original documentation complete: R-27.01–06/11–15 | Work through a real local fixture with clear scope, instructions, secrets/permissions and branch/worktree decisions |
| AE-02 | Independent review and evidence | Original R-27.07–10, R-27.16–18 | original documentation complete: R-27.07–10/16–18 | Detect invented API/incorrect code, trace acceptance to checks, review actual diff and record limitations; never auto-credit generated tests |
| CS-01 | Complexity and cost models; advanced practical front-end | Existing Big O/quicksort notes under senior_growth/Other | audit pending | Reconcile worst/average/amortized time, auxiliary space and measured JS/runtime costs; identify missing exercises |
| CS-02 | Data structures and algorithm selection | Existing Map/Set, queues and graph material distributed across notes | audit pending | Explicit arrays/lists/stacks/queues/hash maps/heaps/trees/graphs inventory, invariants, use cases and trade-offs |
| CS-03 | Search, sorting and traversal | Existing quicksort/queue/traversal material | audit pending | Binary search boundaries, stable sorting, BFS/DFS/visited sets and representative frontend/backend problems; avoid rote interview-only coverage |
| CS-04 | Runtime, memory and concurrency | JS execution, Node foundations/diagnostics, worker material | audit pending | Connect call stack/heap/GC, processes/threads, event loop, scheduling, races/locks and cancellation with debugging examples |
| CS-05 | Networking and distributed systems | Node modules5/12 and browser networking material | audit pending | Connect DNS/TCP/TLS/HTTP, partial failures, ordering, consistency, idempotency and queues; identify assumptions and actual test boundaries |
| CS-06 | Databases and data modeling | Node module8 and SQL workbench | audit pending | Reconcile relational modeling, indexes/query plans, transactions/isolation/locking and practical performance reasoning |
| CS-07 | Reasoning, correctness and testing | Existing type-boundary/testing/quality notes | audit pending | Explicit invariants, pre/postconditions, state machines, boundary/property tests and counterexamples across the primary stack |
| CS-08 | Coherent CS route and project checkpoints | Existing notes are topic-distributed | planned after audit | Publish one navigable route with prerequisites, links, only necessary missing lessons and evidence-based exercises |

## Learner practice backlog

| Practice milestone | Acceptance evidence | Learner status |
|---|---|---|
| LP-AG | Integrated bounded workflow, authorization/approval/recovery/budget failure tests and explanation of single versus multiple agents | still required |
| LP-RG | End-to-end authorized document assistant, corpus/label ledger, real adapter checks, current-source citations and measured retrieval/support quality | still required |
| LP-AE | One issue-to-reviewed-change record: acceptance criteria, actual diff, independently verified tests/build, review findings and corrected failures | still required |
| LP-CS | Implement/explain selected structures/algorithms and debug runtime/database/network failure cases; retain complexity reasoning and practical measurements | still required |

These practice milestones consolidate learning evidence; they do not mark overlapping original P-* practice tasks complete. No learner outcomes or professional readiness are claimed.

## Next checkpoint

B162–182 completed74 further original documentation tasks: Git/review/hooks, release artifacts, AWS/container boundaries, large-data UI/NFRs, patterns/ownership, testing/CI/runtime and all18 MCP requirements. The original tracker now has668 completed/30 pending. Continue the remaining original tasks in small batches; B179–182 added rendering/PWA, responsive enhancement, introductory microfrontend contracts, worker ownership/CDN/build boundaries, GraphQL and cross-layer cancellation/lifecycle reconciliation. Next: the remaining OpenAPI/project setup, backend, secondary-topic and practice specifications.

The primary [MCP route](./docs/python-for-ai/mcp-primitives.md) now has actual in-memory, stdio and HTTP-middleware fixtures, safe error/cancellation checks and explicit modern/legacy protocol versions. These strengthen AG tool integration material without marking the integrated agent/RAG capstones or learner evidence complete. No real OAuth issuer/TLS/provider/desktop-host workflow was exercised.

CS-01–07 still need their explicit corpus inventory/reconciliation; new runtime and invariant/substitution examples are useful mapped material, not a completed CS audit. Preserve separate original and extension counts and avoid duplicating existing lessons.

## Latest validation checkpoint

B155–161 completed29 original documentation tasks. New security material passed strict Python checks and real-file/schema/mock-SDK tests; the engineering fixture retained a failing baseline, passing strict build/7 runtime tests,4 detected defect variants, Git isolation/refusal tests and source/emitted identities. Every batch passed internal-link checks and the documentation build. Eight embedded implementation/test blocks match the executed scratch sources. No native browser/provider account/remote PR/independent human review or learner completion is claimed. The existing documentation bundle-size warning remains.


B162–182 validation update: each completed batch passed its applicable executable/schema/type checks, internal links and documentation build. Real local Git, PostgreSQL, Docker, React/JSDOM, Node and MCP protocol/middleware examples are distinguished from static checks, adaptation sketches and unperformed native-browser/cloud/provider work. Build/link/test failures were corrected and retained in the remediation log. All learner practice remains outstanding; the original review is unchanged.
