# Embeddings, Similarity and Compatible Search Spaces — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/embeddings-and-similarity.md)

### Practice for hybrid search

Create a labeled set containing an exact error-code query, a paraphrase, a negation, a multilingual query and a no-answer query. Compare lexical-only, semantic-only and hybrid rankings while retaining per-branch candidate IDs. Vary candidate depth, top-k, branch thresholds and fusion weights one factor at a time. Measure relevant-item recall and misleading retrieved items under the actual permission filters, then evaluate the final cited answer separately.

**Acceptance:** baseline/fusion tests and strict checks pass; empty branches, ties, duplicate IDs, forbidden candidates, invalid policies and nonfinite thresholds are explicit; exact identifiers/Unicode normalization behave as documented; you can explain why raw score addition and copying thresholds between stages are invalid. Real embedding relevance, production sparse/ANN adapters, learned reranking and learner measurements remain unperformed. The current official hosted Retrieval guide also describes hybrid weighting, but this local formula is an independent reference, not a claim to reproduce its internals. [Official retrieval ranking guidance](https://developers.openai.com/api/docs/guides/retrieval).

## Practice and acceptance

Compute cosine for identical, orthogonal and opposite vectors; explain why scaling one vector changes dot product but not cosine. Run the tiny search tests, then add zero/nonfinite/wrong-dimension store records, empty authorized results, invalid thresholds/top_k, dimension-equivalent incompatible model versions and permission revocation fixtures. No unauthorized ID/title/content should leave the retrieval boundary or consume the top-k limit.

Build a small reviewed set of real queries and relevant source/chunk IDs. Generate embeddings only in a separately authorized, budgeted integration with non-sensitive fixtures; record model/preprocessing/dimension/source versions. Compare lexical and semantic results by relevant-item recall and misleading matches, including negation, Hungarian/English variants and exact code identifiers. Keep quality measurements separate from these hand-vector tests.

**Acceptance:** strict checks/tests pass; normalization/finite/dimension/zero handling is explicit; compatible namespaces and permission-before-top-k behavior match the reference; the real SDK emits the embedding request through a fake transport and closes. Real provider embeddings/token limits, semantic relevance, durable/approximate vector storage, live permission changes/deletion/caching and learner practice remain required. Those later lessons complete the retrieval system; this note supplies its intermediate representation/similarity boundary.
