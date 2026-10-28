# Query Rewriting, Reranking and Context Assembly

A search pipeline has distinct stages: preserve the user's question, produce bounded search variants, retrieve authorized candidates, resolve current source evidence, rerank that candidate set, and assemble a prompt that actually fits. A reranker cannot recover a relevant item retrieval never found. A longer prompt cannot repair a false or unauthorized passage. Use the existing lexical/vector/hybrid reference and [evidence resolver](./retrieval-context.md), rather than adding another orchestration framework.

## Rewrite for search without changing the question

Query rewriting can expand abbreviations, resolve an explicit conversational reference or turn verbose wording into search terms. It can also erase negation, alter dates/identifiers or invent an assumption. Keep the original query as a retrieval branch and as the answer question; log only safe version/decision metadata unless content retention is explicitly permitted. Do not let a rewrite choose tenant, ACL, date policy or arbitrary URL filters. Those come from trusted application context, not generated text.

The worked rewriter below only appends reviewed acronym expansions. For "CORS is not authentication ERR_42", the original words, negation and identifier remain intact. It is not a language model or general pronoun resolver. A model rewrite would need a bounded output schema, deadline/cost policy and labeled semantic-preservation checks; fluent output is not evidence of preserved intent. Search both original and expanded variants under the same server-owned filters, deduplicate IDs and fuse ranks as in the prior lesson.

## Rerank a bounded candidate set

A bi-encoder embeds query/documents independently for efficient retrieval. A cross-encoder jointly processes each query/passage pair and can model interactions at higher per-candidate cost. A listwise LLM reranker instead receives several candidates and needs strict known-ID/order output validation, injection defenses and a larger token/latency budget. Scores from any of these are not automatically probabilities or comparable with cosine/RRF scores.

The code exposes a synchronous pair-scoring port and supplies a transparent lexical-coverage scorer for the runnable baseline. It proves second-stage ordering, score validation and deterministic ties, not learned relevance. A real cross-encoder adapter can replace that port after measuring the selected model/corpus; isolate CPU/GPU work or use an owned async service boundary so it cannot block the request event loop. Never submit private candidates to a reranking provider without the same authorized-data policy as generation.

## Assemble evidence, not a wall of text

Resolve current permission/version/span **before** reranking text or assembling context. Each retained item has a stable chunk/source/version/locator/span and original text. Exact duplicate IDs are rejected; an optional per-source cap reduces one source monopolizing the prompt, but can remove needed supporting sections. Overlapping spans/duplicate meaning need a deliberate source-aware policy; this example preserves them rather than pretending all duplicates have been solved.

The assembler keeps at most8 items/6000 code points, applies a per-source cap, serializes metadata/text as JSON data with the original question, then counts the complete message+answer-schema representation. On overflow it drops the lowest-ranked remaining item and recounts, never silently truncating a verified span. This greedy policy can miss a useful smaller combination; evaluate alternative selection/grouping for multi-part questions. Empty retrieval and evidence dropped for budget are separate operational outcomes, neither an invented factual "no".

<<< ../workbench/applied-ai/python/study_ai/retrieval_pipeline.py


Evidence comes exclusively from the trusted current-source resolver; dataclass construction is not an access check. The pair scorer and counter are application-owned ports. The lexical scorer's scale is[0,1]; adapters with unbounded logits need their own explicitly calibrated interface/threshold, not arbitrary clipping. A scoring failure is a controlled operational failure at the service boundary, not permission to use unauthorized/unvalidated evidence. Synchronous scorer time is not bounded by the async context timer; use a separately enforced compute boundary for untrusted/slow models.

### Actual SDK counter adapter

Use the owned client from the SDK lesson, a reviewed available model ID and the same input/schema representation for counting and any later generation. The callback below is a factory-shaped wiring example; max_retries0/HTTP deadlines/client closure come from the existing owned client. The assembler's overall timer includes repeated counts. Provider failures should use the SDK lesson's safe operational mapping and must not become no_evidence. No generation is made by this assembler.

<<< ../workbench/applied-ai/python/study_ai/context_counter.py


Before generation, require ReadyContext, reuse answer_messages(plan.payload)/answer_format unchanged, the same model, reserved output cap and disabled automatic truncation. Keep tools/history/files absent unless they were included in the count. Then handle refusal/incomplete/error, bound raw output, validate the AnswerDraft and call check_answer against plan.evidence. This lesson does not implement or claim a complete answering endpoint. JSON quoting and an instruction/data distinction reduce ambiguity; they do not guarantee immunity to prompt injection or semantic claim support. Any future tool authority remains outside retrieved content.

## Worked checks and measurement

<<< ../workbench/applied-ai/python/lab_tests/test_retrieval_pipeline.py


The SDK integration fixture uses the installed OpenAI3.35.1 client with HTTPX2 mock transport. It checks the real counter request, including serialized source text and the answer schema, without contacting a provider.

<<< ../workbench/applied-ai/python/lab_tests/test_context_counter.py


Tests use fabricated evidence only inside the isolated contract fixture; they are not proof of source authorization. Earlier resolver tests cover that distinct boundary. The counter returns synthetic token counts to exercise admission decisions; they are not tokenizer measurements. With context1024/output256/margin64 the maximum input is704;900 rejects and600 admits. The count includes the serialized question, metadata, developer instructions and structured-answer schema, rather than summing text characters.

For a labeled query set, compare original-only versus expanded branches, pre/post-rerank Recall@k/MRR/nDCG, no-answer false positives, final answer support, p50/p95 latency, token/cost and permission errors. Label before tuning, retain a held-out split and inspect exact identifiers, negation, multilingual queries and contradictory sources. MRR measures the reciprocal rank of the first relevant item; Recall@k needs the set of relevant items; nDCG incorporates graded relevance/order. A reranker may improve order while losing relevant items under a threshold or source cap. Measure each stage so candidate recall and context selection failures remain distinguishable.

[Related learner criteria](../practice/applied-ai/chapters/retrieval-pipeline.md).

Official references checked2026-10-22: [OpenAI Retrieval rewriting/ranking](https://developers.openai.com/api/docs/guides/retrieval), [current Python vector-store search contract](https://developers.openai.com/api/reference/python/resources/vector_stores/methods/search), [actual token budgets](./token-budgets.md), [hybrid candidates](./embeddings-and-similarity.md), [source/citation verification](./retrieval-context.md). Hosted search rewrite_query/ranking_options are an alternative managed implementation; this local code does not reproduce its internal ranker or assert its quality. No paid API requests are made by these examples' tests.


## RAG as a whole system

Retrieval-augmented generation (RAG) supplies selected external evidence to a generation request. It does not retrain model weights. Search without generation is useful retrieval, not an obligation to add a generator. The primary implementation here keeps ingestion and answering as separate paths:

1. Ingest authorized source bytes, extract with provenance, chunk with recorded boundaries and index compatible representations. Version sources, extraction/chunk policy and embedding space together; a changed embedding model generally requires a compatible rebuilt index.
2. At query time derive scope from the authenticated application principal, search authorized candidates, recheck current source permission/version and then rerank verified text. A model rewrite cannot expand that scope.
3. Assemble the original question and bounded exact evidence, count the full request, reserve output and return an explicit no-context outcome when appropriate.
4. Generate a proposed answer under the fixed contract, handle refusal/incomplete/transport failures, then validate schema/citations and separately assess semantic support. The existing SDK shows the response-handling pattern; a complete bounded answer endpoint is a later integration exercise.
5. Render safe text and application-owned citation links; authorize again when opening a source. Update/delete and permission changes must invalidate stale index/cache artifacts under a durable lifecycle policy.

**Worked source-to-answer trace:** source s1/versionv1 says “Cancellation closes the client.” and source s2 says “Retries need a budget.” The query asks what cancellation does. The candidate stage returns references; the resolver confirms current s1 bytes/permission and exact line span. Reranking retains that evidence; the assembler counts the actual question/instructions/metadata/schema. A proposed “Cancellation closes the client” with a known s1 chunk ID and exact quote passes mechanical checks. A proposed “Cancellation leaves it open” with the genuine quote “client” also passes membership but fails semantic review.

If s1 has been deleted/revoked or only s2 remains, do not infer that cancellation is unsupported by the platform; return insufficient evidence under this corpus contract. If the source service times out, preserve outage status instead of manufacturing an empty-corpus answer.

| Symptom | Inspect first | Candidate repair / evidence |
|---|---|---|
| Correct passage absent from candidates | Extraction, index generation, filters, query vocabulary | Restore complete source/extraction or compare lexical/hybrid Recall@k |
| Relevant passage found but omitted | Rerank threshold, source caps, budget selection | Inspect stage IDs/counts; compare multi-part answer coverage |
| Fluent unsupported answer with valid quote | Claim/source entailment and instruction policy | Human-reviewed support rubric, abstention/failure fixtures |
| Private/stale excerpt appears | Principal/ACL checks, source versions, cache keys/invalidation | Fail closed and test revocation/update/delete races |
| Latency/cost excessive | Each stage, token payload, repeated attempts, queue wait | Bound stages/inputs/concurrency; compare total costs rather than token price alone |

Use RAG for current, private, attributable source knowledge when its retrieval/data lifecycle is justified. It adds indexing, ingestion, freshness, permissions, quality and operations work. A direct database query is usually better for a known deterministic field/aggregate; a long-context prompt can suffice for a small already-authorized corpus but still needs budgeting and source quality. Fine-tuning is a different behavioral adaptation choice, not a substitute for row-level permissions or reliable deletion. Hosted retrieval is an alternative implementation with its own ingestion/retention/availability constraints; this course does not require a managed vector-store upload.

[Related learner criteria](../practice/applied-ai/chapters/retrieval-pipeline.md).
