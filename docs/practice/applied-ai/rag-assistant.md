# P-334: staged access-aware RAG assistant

**Learner status: still required.** This refines [the existing P-334 contract](../ai-project.md#p-334), not a replacement that drops its lifecycle/security criteria. Use [shared evidence](./index.md#evidence-for-every-stage) and the [RAG reading order](../../applied-ai/rag/index.md).

## RAG-1: ingestion and lexical baseline

**Prerequisites/scope:** Python typed records/files, bounded text/CSV extractor and source authorization. Two small synthetic tenants, at most 20 documents/100 chunks, no PDF/OCR or provider required.

**Acceptance:** preserve exact bytes hash, source version, extractor/chunk policy, tenant/ACL and locator/span. Compare one line-based and one structure-aware chunk policy on a cross-boundary fact and a code/table example. Demonstrate quoted CSV/leading-zero IDs and UTF-8 boundaries. Implement deterministic lexical search first, returning references only under authenticated scope before candidate limits. Explain exact identifier and no-hit behavior.

**Failures:** unsupported/empty/malformed/oversize input; missing metadata; same ID in two tenants; source instructions attempting new reads. Rejected input causes zero model/provider calls. No source link is fetched merely because it appears in a document.

**Evidence:** exact source/chunk reconstruction, input/limit observations, permitted candidate sets, lexical labels and invalid-input results.

## RAG-2: compatible indexing, hybrid and reranking

**Prerequisites/scope:** RAG-1, compatible spaces and staged lifecycle. Use hand vectors to verify geometry; then select one permitted real embedding adapter only if available. Keep semantic results explicitly unmeasured until then.

**Acceptance:** version model/revision/dimensions/preprocessing and queries together. Implement current source/ACL filtering before top-k; compare lexical versus semantic/hybrid under identical permitted data. Retain branch IDs/scores/ranks; use rank fusion rather than uncalibrated score addition. Bound candidate/rerank count and score contract. A lexical pair scorer is an acceptable initial reranker; learned ranking is optional until quality evidence justifies it.

**Failures:** same dimensions/different space; zero/nonfinite vectors; incompatible query at cutover; forbidden high-scoring record; missing candidate; duplicate crowding; scorer/store failure. No stale/private fallback is allowed. Reranking cannot repair missing candidate recall.

**Evidence:** source/index-generation identities, Recall@k/MRR/nDCG with defined labels/denominators, per-stage failures, active versus pending version coverage. Real embedding/ANN/learned reranker tests remain unperformed if unavailable.

## RAG-3: checked answer and abstention

**Prerequisites/scope:** current exact-span resolver, token/schema/stream boundaries and the [answering composition contract](../../applied-ai/rag/answering-and-failures.md). Implement a multi-chunk repository adapter and an answer adapter; the existing label classifier is not that adapter.

**Acceptance:** count final instructions/question/evidence/schema/tools/history as actually sent, reserve output and keep count/generation identities consistent. A complete AnswerDraft has current known citations and exact quotes. Test a genuine-but-irrelevant quote that passes membership yet fails semantic review. No evidence abstains; outage/refusal/incomplete/budget-drop remain distinct. Render safe text and server-owned source links, reauthorizing on open.

**Failures:** invented/duplicate citations, stale span, omitted negation, conflicting sources, truncated JSON, partial stream, counter failure, cancellation and source revocation between search/context/display. Partial output never becomes a final accepted answer or action. A deterministic authored proposal can test gates but must not be reported as model quality.

**Evidence:** validated DTO/spans, per-claim human support rubric, original and final context IDs, cancellation/resource observations and all failed attempts.

## RAG-4: evaluation and lifecycle

**Prerequisites/scope:** previous stages; existing seed plus independently authored representative questions and held-out source families/time slices.

**Acceptance:** compare a frozen lexical baseline with the candidate, separately measuring retrieval, support/citations, answerable coverage/abstention, safety, complete latency and known/unknown cost. Include exact codes, paraphrases, negation, multilingual queries, no answer, injection and contradictory sources. A cheaper/faster result cannot waive cross-tenant leakage.

Update a source and reindex a staged generation; partial/raced coverage cannot activate. Revoke access after retrieval, delete a source across generations/caches and apply a deletion tombstone before restoring an isolated backup. Prove delayed ingest cannot resurrect the deleted revision. Identify which local/remote/backup derivatives are completed, pending or blocked rather than claiming erasure from one SQL DELETE.

**Failures/evidence:** inject parser/store/provider outage, stale cache, interrupted generation activation and remote deletion uncertainty. Retain paired case outcomes, exact labels/splits, real lifecycle observations and explicit unperformed provider/ANN/browser/deployment checks. No paid or external action is implied by this specification.
