# Python for Applied AI

Use Python as the companion implementation language for data preparation, model-service integration and evaluation. The primary path uses Python/uv/pytest, then Pydantic/FastAPI and one model SDK. Learn the underlying boundaries rather than several competing frameworks at once.

1. [Setup, Syntax, Collections and Functions](./setup-and-basics.md) — a locked environment and tested deterministic document preparation.

2. [Typed Modules and Explicit Errors](./typed-modules-and-errors.md) — validated domain records, adapter protocols and distinct failure categories.

3. [Configuration, Safe Logs and pytest Fixtures](./configuration-and-logging.md) — validated startup settings, owned JSON output and isolated tests.

4. [Bounded Document Streams](./bounded-document-streams.md) — lazy NDJSON, strict byte/schema limits and explicit file ownership.

5. [Async HTTP and Integration Boundaries](./async-http.md) — reusable clients, bounded streams, deadlines and structured task ownership.

6. [Pydantic and FastAPI Boundaries](./fastapi-boundaries.md) — strict DTOs, safe errors, authenticated byte limits and app-owned lifespan.

7. [Document Extraction and Provenance](./document-processing.md) — bounded text/CSV extraction, traceable chunks and complex-format decisions.

8. [Deployment and Recovery Boundaries](./deployment.md) — a locked ASGI release, real process smoke test and supervised rollout decisions.

9. [Typed Model SDK Boundary](./model-sdk.md) — one provider adapter, strict structured outputs and offline SDK integration tests.

10. [Tokens and Context Budgets](./token-budgets.md) — actual-payload counting, output reserves and explicit overflow recovery.

11. [Model Families, Training and Inference](./model-foundations.md) — a tested learning/inference distinction and hosted/open-weight trade-offs.

12. [Attention and Probabilistic Generation](./attention-and-sampling.md) — a worked masked-attention calculation and sampling boundaries.

13. [Embeddings and Similarity](./embeddings-and-similarity.md) — compatible spaces, bounded cosine ranking and permissions before top-k.

14. [Verified Evidence and Citations](./retrieval-context.md) — current authorized spans, exact source references and explicit abstention.

15. [Retrieval Pipeline and Context Assembly](./retrieval-pipeline.md) — conservative query variants, bounded reranking and final-payload token admission.

16. [Prompt Design, Modalities and Adaptation](./prompting-and-modalities.md) — versioned text/image requests, evidence limitations and prompt/retrieval/training decisions.

17. [Model Streaming and Deadlines](./model-streaming.md) — typed SSE lifecycle, terminal-only decisions, cancellation and distinct idle/overall budgets.

18. [Model Work Budgets](./model-work-budgets.md) — bounded admission, local request pacing and explicit retry/defer policies.

19. [History, Summaries and Checked Workflows](./history-and-workflows.md) — bounded complete exchanges, lossy-summary review and revision-aware stage recovery.

20. [Typed Tool Boundaries](./tool-boundaries.md) — bounded arguments, exact dispatch, current permissions and safe projected results.

21. [Tool Workflow State](./tool-workflow-state.md) — fixed routes, bounded read retries and local SQLite revision persistence.

22. [Approved Writes and Recovery](./approved-writes.md) — exact-command approvals, local atomic idempotency and uncertain-outcome recovery.

23. [Graph Framework and Scoped Memory](./graph-memory.md) — one pinned LangGraph fixture, current principal isolation and coordination trade-offs.

24. [Workflow Diagnostics](./workflow-diagnostics.md) — bounded projected traces, distinct failure categories and tested state transitions.

25. [Versioned Evaluation Lab](./evaluation-lab.md) — task criteria, curated slice/label ledger and deterministic dataset checks.

26. [Evaluation Measurements](./evaluation-measurements.md) — versioned baselines, latency conventions, usage subsets and explicit unknown cost.

27. [Vector Storage and Lifecycles](./vector-storage-lifecycle.md) — persistent exact scan, current ACL/version checks and staged updates/deletion/reindexing.

28. [Retrieval Debugging and Regressions](./retrieval-debugging.md) — duplicates, freshness, stage diagnosis and failures becoming checked cases.

29. [Model Task Economics](./model-economics.md) — whole-task amplification, quality-gated routing and shared local reservations.

30. [Caching and Batch Work](./cache-and-batch.md) — versioned private cache identity, unordered result correlation and cost/latency decisions.

31. [Prompt Injection Boundaries](./prompt-injection-boundaries.md) — direct/indirect attacks, task-scoped reads and data-leakage containment.

32. [Source and Output Security](./source-and-output-security.md) — tenant-scoped read-only sources, reviewed revisions and safe display sinks.

33. [Provenance and Oversight](./provenance-and-oversight.md) — source-to-decision references, meaningful human approval and durable audit records.

34. [Provider Data Lifecycle](./provider-data-lifecycle.md) — minimal export, derivative retention/deletion and verified provider boundaries.

35. [MCP Roles and Primitives](./mcp-primitives.md) — a pinned official-SDK catalogue with tools, resources, prompts and actual in-memory checks.

36. [MCP Schemas and Connections](./mcp-connections.md) — discovery/capability/version boundaries and an executed stdio subprocess lifecycle.

37. [MCP Security and Trust](./mcp-security.md) — actual HTTP-middleware token/scope/record-policy checks, minimal projection and untrusted tool-content boundaries.

38. [MCP Errors and Lifecycles](./mcp-lifecycle.md) — actual failure/cancellation/cleanup checks and explicit modern/legacy protocol behavior.

Later applied-AI lessons expand tool workflows and evaluation. Reading or running the supplied examples does not establish independent practice completion.
