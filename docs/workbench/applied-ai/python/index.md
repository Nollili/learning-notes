# Runnable Python component collection

The canonical `study_ai/` modules and `lab_tests/` checks were extracted from existing teaching examples. The lessons display these exact files through includes. Earlier companion checks and their locked project were retained alongside them; `eval-fixture-v1.json` and `safe-log.json` are required fixture assets, not secrets.

## Reproduce verification

Copy this directory to an owned practice location, then from that copied project:

```sh
uv sync --locked
LANGSMITH_TRACING=false LANGCHAIN_TRACING_V2=false uv run --locked python -m mypy --strict basics.py study_ai
LANGSMITH_TRACING=false LANGCHAIN_TRACING_V2=false uv run --locked python -m pytest
```

The lock selects Python 3.13.11, SDK 3.35.1, Pydantic 2.14.1, pytest 9.1.1 and LangGraph 1.2.17. Runtime/dev tools share a study environment here; do not install it into an Autocode template. The project is loose modules run from its root, not an already-built distributable wheel. Each copied fixture must keep its runtime/schema/library assumptions together.

Tests use synthetic keys, SDK mock transports, temporary local files and owned loopback listeners/processes. They do not require a real provider key. Leave tracing export off. Tests in `lab_tests/` are reference checks; **never modify a submission's `src/tests`**. A constrained environment may need explicit permission for the local socket/process cases; do not claim those passed if only in-process tests ran.

## Source groups and limits

| Modules / tests | Contract demonstrated |
|---|---|
| `extraction`, `vector_search`, `hybrid_search`, `vector_store`, `evidence`, `retrieval_pipeline`, `context_counter` | Bounded parsing, synthetic vector geometry, current authority/version, staged SQLite index lifecycle, exact citations and context admission |
| `model_sdk`, `model_streaming`, `token_budgets` | Real pinned SDK serialization/parsing through fake transport; no live model output/token measurement |
| `note_tool`, `task_scope`, `secure_note_reader`, `provider_export` | Complete bounded arguments, exact capabilities, current scoped reads, safe projection/output and trusted export policy |
| `tool_state`, `workflow_budget`, `approved_write`, `spend_ledger`, `lookup_graph` | Local persistence/CAS, exact approval/effect receipt, atomic local reservations and separately RAM-only graph snapshots |
| `eval_cases`, `retrieval_metrics`, `eval_measurements`, `judge_checks`, `workflow_trace`, `audit_record` | Authored dataset/metric arithmetic, fixed events, local audit invariants; not representative model quality or production tracing |
| Setup/domain/API/logging/deployment modules | Typed prerequisite boundaries and owned service lifecycle, with real local process checks |

`evidence_messages.py` is a retained small context-serialization helper; the later `retrieval_pipeline` is the primary budgeted assembly path. `basics.py` and prerequisite modules remain because service checks import them. No duplicate production package was copied from another repository.

This collection does not supply an integrated generated-answer endpoint, multi-chunk persistent RAG service, authenticated approval UI, full artifact/checkpoint transaction, distributed worker claim/lease, live provider, ANN service or n8n engine. Those boundaries are explained and specified in [P-334/P-335](../../../practice/applied-ai/index.md). A narrow component test cannot certify a complete deployment.
