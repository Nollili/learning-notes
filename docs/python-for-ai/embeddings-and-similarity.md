# Embeddings, Similarity and Compatible Search Spaces

An embedding maps input into a numeric vector using a learned model. Nearby vectors can represent related content under that model's training objective. Coordinates are not a list of human-readable facts, and a cosine score is not the probability that a passage answers a question. Negation, exact identifiers, rare terminology, language shifts and domain mismatch can defeat a plausible-looking similarity match.

## Keep the representation contract

Use the same reviewed model/revision, dimension configuration and preprocessing contract for queries and indexed documents. Equal vector length alone does not establish compatibility. A different model can rotate/rearrange the space; comparing its coordinates with an old index is meaningless even when both have1536 numbers. Store model/requested revision, actual provider model metadata, dimensions, preprocessing/chunk version and source version. A migration needs a new namespace/index plus re-embedding/relevance checks before cutover, not a silent overwrite of one metadata field.

A vector store accelerates matching and stores metadata; it does not establish access rights or freshness. Keep source/chunk IDs and provenance from the [extraction lesson](./document-processing.md). Embeddings are derived potentially sensitive data, not encrypted copies of text. Apply the same tenant/retention/deletion policy to vectors, caches, logs and source content. Do not expose a similarity score or source title from an unauthorized candidate.

## Cosine geometry

For nonzero vectors, cosine similarity is the dot product of their unit-normalized directions. Identical directions score1, orthogonal directions0 and opposite directions-1. Cosine distance is commonly1 minus similarity, so lower distance corresponds to higher similarity. A database operator may negate an inner product for ordering; check its actual convention before choosing descending/ascending or applying a threshold.

Dot product additionally depends on magnitude. It ranks the same as cosine when all compared vectors are unit length. Euclidean distance ranks equivalently on unit vectors because squared distance equals2 minus2 times the dot product. Do not assume normalization for every provider/model/postprocessing step. The checked OpenAI embedding guide documents unit normalization for its embeddings; the general function below does not rely on it.

<<< ../workbench/applied-ai/python/study_ai/vector_search.py


This exact scan is bounded to500 records, with deterministic chunk-ID tie breaking and explicit zero/mismatch/nonfinite rejection. math.hypot avoids a naive sum-of-squares norm overflow/underflow; dividing components separately also avoids multiplying tiny norms. It is a readable reference implementation, not a scalable approximate-nearest-neighbor index.

Principal/ACL records are server-owned inputs. Do not construct them directly from a client's claimed tenant/subject or permit a model to choose the scope. This fixture filters before scoring; an external approximate index must demonstrate its own filtered-search semantics and recheck authorization at source fetch/citation time. Permission revocation, membership changes and caches still need a complete application policy. That broader authorization workflow is a later retrieval task.

The stored source_version is available for provenance but this scan has no authoritative source lifecycle store. A later pipeline must reject stale/deleted records during fetch and retire old index generations. Namespacing compatible vector spaces does not solve stale permissions or deleted source text by itself.

## Real SDK serialization with fake embedding output

The following test calls the installed SDK through its offline HTTPX2 transport. The dimension3 response is deliberately hand-written, not evidence that a model placed these words at these coordinates. In a live adapter, validate batch response indices/counts, numeric values and dimensions before storage; do not assume response order alone maps every vector to its input. The requested model must support the selected dimensions, and source token limits require a model-appropriate counter rather than character length.

<<< ../workbench/applied-ai/python/lab_tests/test_vector_search.py


## Relevance and implementation trade-offs

A nearest-neighbor method usually returns a nearest available item even when nothing is useful. Thresholds and an explicit no-evidence path matter. A threshold0.8 is not universally "80% relevant"; calibrate it against labeled queries, languages, document types and false-positive costs for that embedding/index version. Hand-selected vectors prove arithmetic and authorization order, not semantic quality.

Lexical search can retain exact error codes/identifiers that semantic similarity misses. The hybrid reference below combines bounded branch rankings; learned reranking remains a separate extension. Neither requires mastery of several vector products. Begin with this bounded exact reference to validate a real index's ordering/filtering behavior on a small corpus. Approximate search can trade recall for speed; measure recall/latency under your actual metadata filters and update workload.

Do not arbitrarily truncate a vector and assume its coordinates remain meaningful. Use supported dimension reduction/model configuration and then verify normalization/index migration/relevance. A model-specific supported shortening method does not grant that property to every embedding family. Do not concatenate unrelated models' coordinates and apply an old threshold without evaluation.

## Lexical, semantic and hybrid ranking

Lexical retrieval compares terms and can preserve exact identifiers such as ERR_TIMEOUT. Semantic retrieval compares learned representations and can match paraphrases without shared words, but can miss exact distinctions or negation. Neither is universally better. Start with separately observable branch results and labeled relevant IDs so a missed candidate can be traced to extraction, authorization, candidate generation, ranking or final context selection.

The following lexical baseline uses NFC, Unicode casefold and Python word tokens, then Jaccard overlap of unique terms. It is deliberately not BM25: it has no term-frequency saturation, inverse-document-frequency weighting, phrase/proximity logic, stemming or language-aware segmentation. Underscores stay inside word tokens; hyphens split. Casefold can change identifiers, so a real code-search system may need an additional exact-case field. Keep query/document normalization versioned; do not rewrite original citation text.

Do not add a raw cosine score to a lexical score merely because both are numbers. Their distributions and calibration differ. Reciprocal rank fusion combines rank positions: each branch contributes `weight / (rank_constant + one_based_rank)`. A candidate appearing near the top in both branches can outrank a single-branch winner. The rank_constant is a smoothing parameter, not top-k or a relevance threshold. The default60 below is a teaching choice to tune, not a claim about any provider's implementation constant.

<<< ../workbench/applied-ai/python/study_ai/hybrid_search.py


The server-owned authorized_ids set comes from the authoritative permission policy, not request JSON or a model. Apply the same scope before each branch's retrieval/top-k; filtering only after an unfiltered approximate top-k can lose all authorized results and leak information through intermediate results. Fusion cannot recover a relevant candidate neither branch returned. A second allowlist check contains stale/incompatible branch results, but current source authorization still happens again in the evidence resolver.

Branch candidate depth, fused top-k and final context budget are different knobs. Retrieve enough candidates to measure recall, fuse/rerank a bounded union, then choose a prompt-sized set. Increasing top-k can improve recall while adding noise and latency. A higher branch threshold can suppress misleading matches but exclude relevant low-scoring passages. Calibrate these choices on held-out query slices; do not tune on your final test questions until every failure disappears and call that generalization.

The lexical threshold lies in[0,1], the vector reference uses cosine in[-1,1], and fused scores have a third scale determined by ranks/weights/constants. A vector threshold of0.8 must not be copied into the RRF result. Prefer separate branch policies plus an explicit evidence sufficiency check; a nonempty fused list alone does not establish that an answer exists.

<<< ../workbench/applied-ai/python/lab_tests/test_hybrid_search.py


### Worked branch disagreement

For query ERR_TIMEOUT, the lexical fixture retrieves a by the exact code token. A synthetic semantic branch could rank b first because it represents related cancellation language; without real embeddings that branch order is only a supplied test input. Fusion makes both candidates inspectable rather than pretending the semantic score proves an exact code match. The tests assert arithmetic/order/scope, not that the combined system has better relevance.

A production sparse retriever such as PostgreSQL full-text search/BM25-capable search infrastructure is an alternative when language/tokenization/ranking requirements exceed this baseline. Choose one implementation based on the existing primary backend and corpus needs; do not introduce several search products as prerequisites. Keep analyzers, stop words, stemming, exact identifier fields and update/deletion behavior under versioned tests. Reranking a bounded candidate union is a separate stage with its own model/budget/evaluation policy.

### Practice for hybrid search

[Separate exercises and acceptance criteria](../practice/applied-ai/chapters/embeddings-and-similarity.md).

## Practice and acceptance

[Separate exercises and acceptance criteria](../practice/applied-ai/chapters/embeddings-and-similarity.md).

Official references checked2026-10-21: [embedding representation, normalization and supported dimensions](https://developers.openai.com/api/docs/guides/embeddings), [Python embedding endpoint](https://developers.openai.com/api/reference/python/resources/embeddings), [bounded extraction and source provenance](./document-processing.md), [owned provider client and error policy](./model-sdk.md). No synthetic vector score here is a model-quality result.
