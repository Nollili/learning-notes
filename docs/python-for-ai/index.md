# Python for AI — Optional Deep Dive

**New to AI development? Start with [Build AI Apps — JavaScript First](../applied-ai/).** Python is optional: introduce it for a concrete document-processing, data or integration need after you understand the JavaScript request flow. These existing lessons and examples remain available as deeper study.

Python supplies one implementation path for the notes assistant. Learn deterministic typed data preparation and resource ownership before model integration. The established detailed lesson URLs remain stable; [the applied-AI home](../applied-ai/index.md) now organizes shared foundations, RAG, agent workflows and n8n.

<a id="python-for-applied-ai"></a>

## Python prerequisite order

- [Setup, syntax, collections and functions](./setup-and-basics.md).
- [Typed modules and explicit errors](./typed-modules-and-errors.md).
- [Configuration, safe logs and fixtures](./configuration-and-logging.md).
- [Bounded document streams](./bounded-document-streams.md).
- [Async HTTP and owned integrations](./async-http.md).
- [Pydantic/FastAPI boundaries](./fastapi-boundaries.md).
- [Deployment and recovery](./deployment.md) when running a service; local functions do not require deployment first.

## Continue by concept

| Goal | Canonical reading guide |
|---|---|
| Model integration, schemas, tools, security, budgets, evaluation and observability | [Shared foundations](../applied-ai/shared/index.md) |
| Ingestion, retrieval, supported citations and lifecycle | [RAG](../applied-ai/rag/index.md) |
| State, approvals, durable recovery and controlled autonomy | [Agent workflows](../applied-ai/workflows/index.md) |
| Visual triggers/dataflow/custom-service integration | [n8n](../applied-ai/n8n/index.md) |

## Optional depth and existing references

- [Model families/training/inference](./model-foundations.md), [attention/sampling](./attention-and-sampling.md), [prompting/modalities](./prompting-and-modalities.md): background and task-dependent extensions.
- MCP: [primitives](./mcp-primitives.md) → [connections](./mcp-connections.md) → [security](./mcp-security.md) → [lifecycle](./mcp-lifecycle.md). A protocol connection does not grant source/action authority.
- [Operations/ETL/Streamlit](./operations-and-data.md), [graph data/adaptation](./graphs-and-adaptation.md): role-dependent extensions; no mandatory training or graph-database deployment.
- [Cache/batch boundaries](./cache-and-batch.md): after shared task accounting and lifecycle; no billable batch is submitted by the fixtures.

[Coverage map](../applied-ai/coverage-map.md) · [Canonical workbench](../workbench/applied-ai/python/index.md) · [Separate practice](../practice/applied-ai/index.md)

Reading and supplied checks do not complete learner practice. Preserve any separate Autocode template/test/configuration restrictions and use the retained lockfile in an isolated owned project.
