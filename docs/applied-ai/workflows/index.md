# Bounded agent and tool workflows

A fixed workflow chooses steps in application code. An agent-directed workflow lets a model propose some next steps **within application-owned limits**. A graph, a chatbot or an n8n canvas can implement either; the tool names or framework do not determine autonomy.

## Reading order

- [Typed tool boundary](../../python-for-ai/tool-boundaries.md): exact allowlist, bounded complete arguments/results, authenticated current resource checks and call/result identity.
- [History/checkpoints](../../python-for-ai/history-and-workflows.md): lossy summaries remain data; persist checked artifact references rather than promises.
- [State and budgets](../../python-for-ai/tool-workflow-state.md): validated finite routes, local SQLite revisions and resource counters.
- [Approved writes](../../python-for-ai/approved-writes.md): command-bound trusted approval and local atomic effect/receipt.
- [Resumable runs](./resumable-runs.md): connect state, artifacts, approval, recovery, deadlines and reservations.
- [Diagnostics](../../python-for-ai/workflow-diagnostics.md), [oversight/audit](../../python-for-ai/provenance-and-oversight.md), [evaluation](../../python-for-ai/evaluation-lab.md): attempted steps, committed effects and supported task results are different evidence.
- Optional [LangGraph](../../python-for-ai/graph-memory.md) and [MCP](../../python-for-ai/mcp-primitives.md): framework/protocol adapters after the plain owner works.

## Fixed versus model-directed execution

| Task shape | Suitable baseline | Additional responsibility if model-directed |
|---|---|---|
| Lookup → answer → validate | Fixed sequence | Usually no missing routing need |
| Choose one of several bounded searches | Validated enum proposal | Name/argument/scope checks; charge every attempted branch |
| Rename a note | Proposal → trusted human approval → exact executor | Model cannot approve its own proposal or change it after approval |
| Unknown open-ended investigation | Bounded iterative policy, if justified | Stop conditions, repeated-call detection, aggregate costs, recovery and a stronger evaluation suite |

For a bounded routing example the permitted proposal is `lookup_note(source_id)` or `finish(answer_draft)`. The application validates the complete proposal, derives identity/scope independently and reserves a call before dispatch. Unknown names, extra owner fields, repeated calls beyond the cap and malformed outputs stop without a fallback shell/URL tool. `finish` still needs the normal evidence/answer checks; it cannot assert `checked=true`.

This is the contract for an optional model-directed branch, not a claim the existing graph runs an autonomous model. The current executable graph is START→lookup→END with RAM snapshots. Its value is demonstrating scoped tool composition, not crash durability or model reasoning.

## Keep every transition observable and bounded

Bound steps/fan-out/attempts, input/result bytes, model context/output, per-call and overall time, queue/admission and money separately. One owner accounts retries, fallback, counting, grading and resumed work. Persist remaining limits; a restart, forgotten graph thread or expired lease must not grant a fresh allocation.

Tool output, retrieved text and summaries can contain instructions, fake approvals or exfiltration URLs. Keep them in data fields, use task-limited current permissions and never promote them into trusted routing/configuration. Safe projections/traces reduce collection; they do not detect every secret or prove semantic truth.

[Practice: staged P-335](../../practice/applied-ai/resumable-workflow.md) · [Runnable components](../../workbench/applied-ai/python/index.md)
