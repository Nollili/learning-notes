# Applied-AI coverage and ownership map

Coverage below is based on actual explanations, contracts and worked source/tests, not headings alone. **Confirmed component coverage** means the boundary is taught and inspectable; it does not mean a full product, live provider or learner outcome was demonstrated. “Expanded” marks this round's connecting explanations; “new” marks the previously absent n8n material.

Prerequisites are typed functions, data/JSON validation, current application identity, owned async I/O and basic HTTP/transactions where used. [Python prerequisites](../python-for-ai/index.md) and the completed Node.js/CS courses retain those owners. Shared foundations precede RAG and tools; n8n begins with synthetic manual input rather than a model or deployed agent.

## Shared foundations

### Model integration, structured output and tool contracts

**Owner/depth:** [SDK boundary](../python-for-ai/model-sdk.md), [tokens](../python-for-ai/token-budgets.md), [streaming](../python-for-ai/model-streaming.md), [tools](../python-for-ai/tool-boundaries.md). Confirmed applied/intermediate component coverage; [shared index](./shared/index.md) reconciles the order.

**Inspected evidence:** real SDK/mock-transport serialization, required/extra-field schemas, refusal/incomplete/error vocabulary, complete call arguments and current-principal dispatch; client/stream cancellation and token/body-limit distinctions. Valid JSON is neither truth nor permission. The provider tool loop remains a separately specified adapter, not secretly implemented by the read dispatcher.

**Practice:** existing P-337 prerequisites, P-334 answer boundary, P-335 tool stages; [relocated chapter exercises](../practice/applied-ai/chapters/index.md). Offline fixtures do not measure model availability/quality.

### State, security, evaluation, observability and data handling

**Owner/depth:** [history](../python-for-ai/history-and-workflows.md), [task injection scope](../python-for-ai/prompt-injection-boundaries.md), [sources/output sinks](../python-for-ai/source-and-output-security.md), [evaluation](../python-for-ai/evaluation-lab.md), [measurements](../python-for-ai/evaluation-measurements.md), [safe traces](../python-for-ai/workflow-diagnostics.md), [provider lifecycle](../python-for-ai/provider-data-lifecycle.md). Confirmed applied coverage, shared across both tracks.

**Inspected evidence:** complete history windows and lossy-summary counterexample, hostile tool content with zero out-of-task reads, same-ID tenant isolation, current reviewed source/digest gates, fixed safe output sink, authored case/slice/label ledgers, separate schema/semantic/receipt gates, unknown usage and projected traces. Roles/serialization do not guarantee injection immunity. Retention/deletion applies to derivatives and provider features, not only source rows.

**Practice:** P-334/P-335 shared evidence/rubric, optional chapter refinements. Actual authentication UI, provider policy/account settings, native browser behavior and representative semantic measurements remain separate observations.

## RAG

### Parsing, normalization, chunks, metadata and provenance

**Owner/depth:** [extraction](../python-for-ai/document-processing.md), [evidence](../python-for-ai/retrieval-context.md). Confirmed bounded text/CSV baseline plus format/chunk-policy reasoning; PDF/OCR/HTML adapters optional when needed.

**Inspected evidence:** strict bytes/dialect/quoting/leading-zero behavior, normalized versus raw offsets/hash, source/extractor/locator/span identity and limits, overlap/structure tradeoffs, exact current-source reconstruction. Code-point chunks do not claim token fit or semantic completeness. Complex parsing needs isolation and fidelity review.

**Practice:** [RAG-1](../practice/applied-ai/rag-assistant.md#rag-1-ingestion-and-lexical-baseline), original extraction/span exercises. A structure-aware comparison is required practice, not a fabricated quality result.

### Embeddings, indexing, retrieval, filtering, hybrid and reranking

**Owner/depth:** [similarity/hybrid](../python-for-ai/embeddings-and-similarity.md), [vector lifecycle](../python-for-ai/vector-storage-lifecycle.md), [pipeline](../python-for-ai/retrieval-pipeline.md). Confirmed intermediate components; reading order now places storage/lifecycle before full composition.

**Inspected evidence:** compatible spaces and finite/zero handling, lexical Jaccard versus semantic fixture, rank fusion rather than score addition, current ACL/version filtering before limits, original-query branch, bounded pair scorer and deterministic ties. Exact SQLite scan is not ANN; hand vectors are not embeddings quality; lexical pair scoring is not a learned reranker.

**Practice:** [RAG-2](../practice/applied-ai/rag-assistant.md#rag-2-compatible-indexing-hybrid-and-reranking), comparing one fixed permitted corpus and explicit k/thresholds/labels. Production sparse/ANN/learned adapters remain optional until measured need.

### Context, answers, citations, abstention and evaluation

**Owner/depth:** [evidence/citations](../python-for-ai/retrieval-context.md), [pipeline](../python-for-ai/retrieval-pipeline.md), [new composition explanation](./rag/answering-and-failures.md), [evaluation](../python-for-ai/evaluation-lab.md), [retrieval debugging](../python-for-ai/retrieval-debugging.md). Expanded integration contract, with existing component coverage retained.

**Inspected evidence:** final messages/schema counted, source/version recheck, greedy selection/source caps, unknown IDs/quotes rejected, genuine-but-contradictory quote counterexample, no-evidence versus outage/budget loss, Recall/MRR/nDCG and support rubric, duplicate crowding and oracle-context diagnosis. Simpler lexical/direct-query alternatives are explicit in the [RAG home](./rag/index.md).

**Practice:** [RAG-3/4](../practice/applied-ai/rag-assistant.md), refining P-334. A multi-chunk repository and generated-answer adapter are learner integrations; the label classifier/context builder is not a complete assistant.

### Updates, deletion, access control and derived artifacts

**Owner/depth:** [persistent lifecycle](../python-for-ai/vector-storage-lifecycle.md), [cache/batch identity](../python-for-ai/cache-and-batch.md), [provider derivatives](../python-for-ai/provider-data-lifecycle.md). Confirmed intermediate local mechanism and operational design.

**Inspected evidence:** immediate stale-vector hiding, ACL filtering without re-embedding, raced/incomplete generation refusal, atomic activation, delete across generations, source revalidation and logical-versus-physical erasure distinctions. Restore/reingestion needs tombstones and in-flight publication fencing where required; one DELETE is not complete erasure.

**Practice:** RAG-4 and retained P-334 lifecycle cases. Local file/reopen tests establish narrower behavior than backup/provider deletion or hosted in-flight revocation guarantees.

## Agent workflows

### Fixed orchestration versus agent-directed steps

**Owner/depth:** [tool state](../python-for-ai/tool-workflow-state.md), [graph framework](../python-for-ai/graph-memory.md), [workflow home](./workflows/index.md). Expanded autonomy/routing distinction; one framework remains optional.

**Inspected evidence:** finite named routes, bounded temporary-read retries, terminal states, application-owned checked outcome, scoped RAM graph snapshots and single/multi-agent tradeoffs. A bounded lookup/finish proposal contract is explained; no live autonomous model loop is claimed.

**Practice:** [WF-1](../practice/applied-ai/resumable-workflow.md#wf-1-fixed-read-propose-validate), P-335 baseline comparison. Multi-agent coordination is optional and needs measured benefit plus independent aggregate limits.

### Persisted artifacts, approvals, receipts, partial failure and recovery

**Owner/depth:** [state/CAS](../python-for-ai/tool-workflow-state.md), [approved writes](../python-for-ai/approved-writes.md), [audit](../python-for-ai/provenance-and-oversight.md), [resumable runs](./workflows/resumable-runs.md). Existing local implementations plus expanded whole-run integration design.

**Inspected evidence:** real SQLite revisions/reopen/stale save, exact command digest/principal/expiry, current resource version, atomic local effect+receipt and same-key replay/rollback. Artifact references, staging transaction, unknown remote outcome and concurrent claim/fencing responsibilities are explicit; independent transactions do not compose automatically.

**Practice:** [WF-2/3](../practice/applied-ai/resumable-workflow.md), exact restart/revoke/lost-response evidence. Trusted human approval UI, complete artifact runner and distributed/remote reconciliation remain implementation tasks, not missing explanations.

### Cancellation, retry, observability and resource ceilings

**Owner/depth:** [admission/retries](../python-for-ai/model-work-budgets.md), [workflow budget](../python-for-ai/tool-workflow-state.md#whole-run-limits-and-a-serializable-checkpoint), [shared reservations](../python-for-ai/model-economics.md), [trace diagnostics](../python-for-ai/workflow-diagnostics.md). Confirmed local components and expanded restart ownership.

**Inspected evidence:** active/waiting caps, server-minimum/defer policy, nonretryable ambiguous stream/write failures, immutable remaining calls/bytes, UTC-versus-monotonic expiry, known/unknown spend reservation and safe events. Steps, time, memory and money are distinct; a graph recursion limit or one-process gate is not a global guarantee.

**Practice:** [WF-4](../practice/applied-ai/resumable-workflow.md#wf-4-time-retries-budgets-and-evaluation). Representative task-quality and real provider/production trace evidence stay separate.

## n8n

**Previous coverage:** absent in the audited local lesson corpus. **New scope:** bounded introductory-to-practical automation, not a second agent framework curriculum.

- [Items, expressions, triggers and control flow](./n8n/index.md): actual item envelopes, current versus linked items, per-item/all-items Code modes, branching/merge and subworkflow contract; prerequisite JSON/data ownership.
- [Webhook/service integration](./n8n/integration.md): test versus production URLs, separate inbound/outbound credentials, normalized body/projection, fixed destination and stable business-event identity; prerequisite HTTP and application authorization.
- [Errors/testing/operations](./n8n/operations.md): bounded retry/error workflow policy, execution history, pinning versus integration, timeout/replay, deployment database/key/backup ownership and edition/version limits.
- [Workbench](../workbench/applied-ai/n8n/index.md): executable transformation and local HTTP adapter checks. [N8N-P01](../practice/applied-ai/n8n-integration.md) requires actual test-webhook/credential/subworkflow/history observations separately. No n8n engine was installed, workflow published or paid/external action triggered.

Reference release 2.44.7 and official documentation were checked on 2026-10-27. Current docs may describe newer features; deployment must recheck the installed release/node/edition rather than assume this review tested every UI or hosting option.

## Boundaries of completion

All essential concepts above have an explanation, worked boundary and ready-to-use practice specification. Optional MCP, ETL/Streamlit, graph databases, multimodal/training/adaptation, distributed workers and hosted products retain their original scope; their source locations were preserved/moved without a new full integration claim. The [workbench](../workbench/applied-ai/index.md) records what actually runs. No learner mastery or historical task completion is inferred.
