# Graph data, orchestration choices and fine-tuning concepts

These introductory extensions are optional until a project needs them. PostgreSQL stays the primary database, the existing bounded Python workflow stays the control baseline, and LangGraph is the single framework example. Do not learn every graph/agent/training product to finish the applied-AI path. Source and examples were reviewed2026-10-26; the Python helpers ran under3.13.11. No graph database, training job, model download or new provider account is required here.

## Graph databases answer relationship questions

A property graph represents entities as nodes, relationships as directed typed edges, and attributes on either. For the learning corpus, Concept nodes could represent cancellation/backpressure/streams; a RELATES_TO edge should retain the source span and extraction version supporting that relationship. A model-extracted edge is a proposed assertion, not a trusted fact or permission. Stable entity identity, ambiguous names, duplicate aliases, edge direction and source updates/deletion require explicit policy.

A relational schema with concepts and edges plus joins/recursive CTEs is often enough for bounded dependency traversal. A graph database can be useful when variable-hop patterns and relationship exploration dominate, but it adds a query language, deployment, indexes, backups, access policy and data synchronization. A vector index answers representation-similarity questions; a graph traversal answers explicit relationship questions. Neither guarantees factual support. A graph database is also distinct from a workflow graph or GraphQL API.

### A concrete parameterized traversal

In a disposable Neo4j-style property graph, A→B→C and C→A form a cycle; A→X→D passes through an unauthorized nodeX. A two-hop query should returnB/C for an authorizedA reader, notD merely becauseD itself is readable. An illustrative bounded Cypher pattern is:

```cypher
MATCH p=(start:Concept {tenant: $tenant, id: $root})
          -[:RELATES_TO*1..2]->(other:Concept)
WHERE all(n IN nodes(p) WHERE n.tenant = $tenant AND n.id IN $allowedNodeIds)
  AND all(r IN relationships(p)
          WHERE r.tenant = $tenant AND r.span_id IN $allowedSpanIds)
RETURN DISTINCT other.id AS id
LIMIT 20
```

Use fixed labels/relationship types and bound values from a trusted application resolver. Never interpolate a model-written Cypher string, node label, procedure or URL. Use a read-only database identity and driver query deadlines. `$allowedNodeIds`/`$allowedSpanIds` come from current server authorization, not a model/user's claimed access list. Authorization predicates and LIMIT bound returned results, not necessarily traversal work: high degree can still explode before LIMIT. Bound hops, seed/candidate counts and query runtime/memory; inspect plans and index `(tenant,id)`. Modern Cypher also offers quantified path patterns; verify syntax/driver against your selected server rather than assuming every dialect is interchangeable.

This query was reviewed against official documentation but **not executed on Neo4j**.

The executed Python baseline in `adaptation-lab/concepts.py` implements the same small fixture's node-scoped BFS with cycles/visited set and at most2hops/100edges. It returns IDs plus edge span references and blocks the hidden intermediate path. It accepts application-owned data, not raw database/model JSON. It does not validate current source spans; the real assistant must resolve each cited span/version under current access before assembling context. A reachable node is not evidence that a cited claim is supported.

### Graph-assisted retrieval with source evidence

Use the existing authorized lexical/vector search to select a small seed set, map stable entities, expand only allowed typed relationships within the budget, then resolve current source spans. Rerank actual passages and assemble the existing token-bounded citation context. Do not send graph labels alone to a model and invent citations afterward. Keep graph edge→source-version→span provenance and delete/rebuild edges when sources change or access is revoked. Querying a stale edge must not reveal a revoked source's title, relationship or text.

GraphRAG may help relationship-heavy questions but may harm simple lookup through extraction errors and extra latency. A direct SQL query remains preferable for authoritative structured facts. [Optional comparison exercise](../practice/applied-ai/chapters/graphs-and-adaptation.md).

[Related learner criteria](../practice/applied-ai/chapters/graphs-and-adaptation.md).

## Orchestration frameworks package control flow, not authority

The [existing LangGraph1.2.17 example](./graph-memory.md) is an actual START→lookup→END graph over the tested authorized tool dispatcher. Its source and validation remain the primary framework lab; no second agent SDK is introduced here. Ordinary functions are the best starting point for three fixed synchronous steps. An explicit persisted state machine is useful for retries/approval/unknown outcomes. A graph framework earns its cost when conditional stages, resumable state or a maintainable visual/control representation help the actual workflow.

| Choice | Useful capability | Still owned by your application |
|---|---|---|
| Ordinary functions | Simple deterministic call sequence, easy local testing | Cancellation, state, budgets, errors, permission checks |
| Persisted state machine | Explicit states and revision-aware recovery | Transaction ownership, idempotency, migration and unknown external effects |
| LangGraph | Graph execution, checkpoint/store integration and controlled branching | Current principal, approval binding, tool sandbox, aggregate spend/time and data retention |
| Alternative retrieval/agent framework | Prebuilt integrations for a specific need | Verify parser/SDK/version/security semantics; avoid duplicating the primary stack |

A checkpointer stores execution snapshots; a cross-thread store holds application memory. RAM savers disappear on restart. A thread ID is a lookup key, not authentication. A recursion/step limit is not a wall-clock or token-cost bound. Replaying a node can repeat an external effect unless it uses the existing idempotent operation/receipt contract. Human approval must bind an exact command and current revision; resuming an old “approved” checkpoint must not bypass revoked access or altered arguments.

**Worked recovery decision:** lookup succeeds, a proposed write is reviewed, and the process dies after sending that write but before its response. A new graph invocation must load the durable operation ID and resolve its receipt/status. It must not blindly replay the write or ask a model whether it probably succeeded. Distinguish pending, failed-before-effect and unknown-after-dispatch. Use the [approved-write implementation](./approved-writes.md) for that state transition; the framework changes execution mechanics, not its business contract.

Debug a framework by recording redacted node IDs/state revisions, tool outcome category and attempt/deadline/usage, then inspect the exact stage that failed. Do not export every checkpoint to a hosted tracer without a data/retention decision. Framework adapters can add hidden retries/caches/tracing; inspect their versioned configuration and compare end-to-end budgets with the plain implementation. A model choosing another node does not grant more authority.

[Related learner criteria](../practice/applied-ai/chapters/graphs-and-adaptation.md).

## Fine-tuning changes behavior through weight updates

Pretraining learns broad patterns; supervised fine-tuning continues from pretrained weights using task examples and a loss. Prompting changes one request, RAG supplies current attributable knowledge, and fine-tuning changes a model artifact's learned behavior. Prefer prompt/extraction/retrieval fixes when missing input or stale knowledge is the actual problem. Fine-tuning can be appropriate for repeated stable output conventions, domain language or a well-defined classification/task distribution with enough high-quality examples. It cannot serve as a reliable source deletion, permission system or current-fact database.

Full fine-tuning updates many/all model parameters and needs memory for activations, gradients and optimizer state as well as weights. LoRA trains low-rank adapter updates to selected weight modules, reducing trainable parameters/storage. It still needs a compatible base model, runtime, tokenizer/template, training data, compute and evaluation; it is not zero-cost or a guarantee against forgetting/leakage. Quantization changes numeric representation; quantizing inference weights alone is not a supervised training procedure. Parameter-efficient/quantized training combinations require supported library/model/hardware contracts.

### A worked experiment plan

Suppose a study-note classifier consistently confuses backend performance with browser performance. First verify labels/input extraction and compare a clarified prompt plus few-shot examples. If stable failures remain, propose an optional training experiment against that frozen baseline. Record licensed/consented dataset origin, redaction policy, base/tokenizer/adapter versions, code/environment, seed and training hyperparameters. Never train on private source material merely because it was retrievable for one user's request. Excluding secrets from logs does not remove them from training weights.

A local dataset row can be `{"group":"document-family-a","input":"A browser layout example…","output":"frontend"}`. For a real language-model trainer, serialize to its exact supported tokenizer/chat/task format, mask/weight target tokens deliberately and inspect tokenized examples before launch. Labels and formatting must match the actual inference task. Arbitrary JSONL is not automatically a supported provider/trainer upload format.

The helper below rejects exact duplicated inputs and assigns entire reviewed source families to one deterministic train/validation/test split. Family grouping is supplied by a human-reviewed data process; hashing cannot detect paraphrases/near duplicates or related users/time periods automatically. Preprocessing statistics must be fit only on training data. Hold out the test set from prompt/hyperparameter selection. For time-dependent tasks use an appropriate chronological split instead of random group buckets.

<<< ../workbench/applied-ai/adaptation-lab/concepts.py

The split requires all three sets to be nonempty. A tiny corpus may fail; gather independent groups instead of copying examples across splits. The function returns original text, never lowercases code/quotes silently, and emits fixed errors without source text. It is a local data-preparation demonstration, not a complete trainer or privacy audit.

**Overfitting example:** training loss decreases each epoch, while validation losses are0.50,0.40,0.45. `best_checkpoint` selects epoch2, not the last epoch. That is a checkpoint-selection illustration, not an observed language-model run. Lower validation token loss does not automatically improve the product's supported-answer/permission/task metric; compare the selected model on the held-out task set against the improved prompt baseline. Watch per-class false positives, output validity, abstention/coverage, source support, regressions, latency and total experiment/serving cost. Repeatedly peeking at the test set destroys its held-out role.

If eventually training, start with a bounded small authorized experiment, verify model/data licenses and hardware requirements, keep an explicit stop/budget criterion and retain a reproducible checkpoint/adapter manifest. Review generated failures and sensitive-data leakage; declining training loss alone is not release approval. Canary/rollback the whole base+adapter+tokenizer/template/config artifact. A LoRA file without its matching base/version is incomplete, and changing the base can invalidate it. Never deserialize an untrusted executable model artifact without its format/provenance/isolation policy.

**Validation performed:**3 offline Python tests passed for allowed/cyclic/foreign-intermediate BFS, source-family disjointness across100 synthetic examples, duplicate-input rejection, and validation-loss checkpoint selection/NaN rejection. The previous LangGraph lesson retains its actual pinned-framework tests; they were not silently rerun by this conceptual comparison. No Neo4j server, real embeddings, model training or provider quality measurement was performed.

[Related learner criteria](../practice/applied-ai/chapters/graphs-and-adaptation.md).

Official references checked2026-10-26: [Neo4j MATCH](https://neo4j.com/docs/cypher-manual/current/clauses/match/), [bounded path patterns](https://neo4j.com/docs/cypher-manual/current/patterns/variable-length-paths/), [LangGraph persistence](https://docs.langchain.com/oss/python/langgraph/persistence), [Transformers training workflow](https://huggingface.co/docs/transformers/training), [PEFT LoRA concepts](https://huggingface.co/docs/peft/main/en/conceptual_guides/lora). Training APIs change; no unverified trainer command or account capability is promised.
