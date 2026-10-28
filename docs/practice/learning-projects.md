# Practical learning projects and evidence

These are ten scoped project specifications from the original review. They consolidate the notes into independent implementation/debugging work. Documentation status and learner completion are separate: **every learner project is still required**. Passing supplied helper examples does not mean you completed an application, measured its quality or established professional readiness.

Use one coherent product: an accessible course/notes management app with a TypeScript/React frontend, Express/PostgreSQL backend, and Python companion for a permission-aware document assistant. A project may reuse an existing compatible course app or an isolated copy of the supplied examples; no need for ten unrelated products or several competing frameworks. Do not reintroduce the removed Task Board walkthrough page. Retained source examples are supporting material, not a mandatory UI theme.

| ID | Deliverable | Specification | Learner status |
|---|---|---|---|
| P-328 | Accessible management screen | [Frontend project](./frontend-project.md#p-328) | still required |
| P-329 | React races, identity, batching and closures | [Frontend project](./frontend-project.md#p-329) | still required |
| P-330 | Validated type-safe API boundary | [Frontend project](./frontend-project.md#p-330) | still required |
| P-331 | Authenticated Node/PostgreSQL service | [Backend project](./backend-project.md#p-331) | still required |
| P-332 | Concurrency/streaming failure lab | [Backend project](./backend-project.md#p-332) | still required |
| P-333 | Deploy, restore and roll back | [Backend project](./backend-project.md#p-333) | still required |
| P-334 | Permission-aware document assistant | [AI project](./ai-project.md#p-334) | still required |
| P-335 | Evaluation and approved tool workflow | [AI project](./ai-project.md#p-335) | still required |
| P-336 | AI-assisted issue/change record | [AI project](./ai-project.md#p-336) | still required |
| P-337 | Python companion service | [AI project](./ai-project.md#p-337) | still required |

All ten specifications are now available. They can share one product and evidence ledger; each criterion still needs its own observed result. Supplied fixtures and documentation completion do not complete learner practice.

## Node.js starting point

The [Node.js practice map](./node-js/index.md) starts with a small [log-analyzer project](./node-js/core-project.md), then maps chapter exercises to P-331–333. Core runtime learning precedes the database/deployment continuations. All of this learner practice remains still required.

## CS foundations checkpoints

The [CS-P01–06 sequence](./cs-foundations/index.md) starts with cost/search/sort experiments and builds a bounded queue, note dependency explorer and priority scheduler. Existing algorithm/cache exercises are mapped there before new work is added. All independent learner practice remains **still required**.

## RAG, workflows and n8n checkpoints

Use the [integrated sequence](./applied-ai/index.md) to stage existing P-334/P-335 work and one N8N-P01 integration with the same synthetic notes. Shared foundations and current-source/approval boundaries remain explicit; all learner work is still required.

## Retain a real evidence record

Use a private, appropriately redacted practice ledger. For each ID retain this shape; paths refer to your actual artifacts, never imaginary output:

```json
{
  "project_id": "P-328",
  "learner_status": "not_started",
  "source_revision": null,
  "runtime_and_lock": null,
  "acceptance_to_checks": [],
  "failing_case_and_correction": [],
  "actual_commands_and_results": [],
  "manual_observations": [],
  "unperformed_checks": [],
  "remaining_risks": [],
  "review_and_decision": null
}
```

Progress can move from not_started→in_progress→evidence_ready→reviewed after the work actually happens. Do not prefill success, a reviewer, timings, costs or production deployment. A record should distinguish supplied fixture results from independently implemented results. Keep source snippets, synthetic/private data and credentials under their actual retention/access policy; no secrets or whole private prompts in a public portfolio.

For every project, start from explicit acceptance, keep scope/ownership small, reproduce one failure, make a focused correction and explain why it works. Tests need meaningful counterexamples and correct boundaries; a snapshot, type assertion or mocked success alone is insufficient. Preserve any applicable submission build/Jest/coverage configuration, never edit restricted `src/tests`, close owned resources and never push remote changes from an assistant workflow.


## Frontend increments

The [F01–F06 sequence](./frontend/) breaks P-328–P-330 into native document, responsive layout, JavaScript lifetime, typed boundary, React ownership and Next/UI-contract increments. [UI architecture practice](./frontend/ui-architecture.md) refines the same bounded data screen. All learner practice remains outstanding.


## Cross-topic increments

[Engineering E01–E07](./engineering/) refines the same existing projects for Redux, performance, security, quality/patterns, Git/CI, decisions and bounded optional comparisons. All learner practice remains outstanding. [The complete file inventory](../review/) keeps textbook completion separate from exercise execution.
