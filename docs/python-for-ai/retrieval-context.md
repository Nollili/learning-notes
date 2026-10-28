# Verified Evidence Spans and Citation Boundaries

A retrieval result is a candidate reference, not permission to publish its text or proof that it supports an answer. This lesson joins the bounded extraction/provenance and similarity lessons. It verifies authorized current source spans, then validates citation references in a proposed answer. It makes no model/provider call and does not add another orchestration framework.

## Pick chunks to preserve meaning

The existing line/record code-point chunker is a deterministic baseline. It preserves a locator and bounded span; it can still split a definition, omit a table header or separate a code example from its explanation. Use heading/paragraph/code-block/table structure when those units matter. Token-aware splitting must use the selected embedding/generation representation rather than count characters. If a single structural unit exceeds the budget, split with recorded subspans and required context rather than silently truncate it.

Smaller chunks can improve precise matching but lose context and increase index/citation fragmentation. Larger chunks can preserve relationships while diluting relevance and consuming the prompt budget. Overlap can retain boundary context but creates duplicate evidence and storage. Tune chunk size/overlap on labeled retrieval/answer questions, including cross-boundary facts and multi-step comparisons; no universal size establishes quality. Keep extractor/chunk settings versioned and rebuild the index generation after a policy change.

A retrieval candidate's chunk ID should resolve to a current source version and exact extracted span. A citation UI can show the authorized source/locator and excerpt; it must not convert model-supplied arbitrary URLs into trusted links. The authoritative source adapter owns tenant/subject permissions and immutable bytes/version at fetch time. A source permission can change after indexing, so recheck before evidence enters the prompt or response.

## Worked source-span verification

<<< ../workbench/applied-ai/python/study_ai/evidence.py


The code re-extracts bounded authorized bytes and compares exact source version, extraction version, locator, code-point boundaries and text. This is intentionally more expensive than trusting an old indexed snippet. A real adapter can use an authenticated versioned extracted artifact instead, provided its integrity/provenance and permission lookup are preserved. The SourceSnapshot is application-owned; accepting a user-provided "snapshot" with invented ACLs would erase the trust boundary.

Evidence objects must come from this resolver, not directly from model/client JSON. Python dataclass types alone do not prove that ownership. Treat stale/deleted/unavailable source results as unavailable evidence; do not replace them with a cached private excerpt. A storage outage should retain its operational category for the job/recovery policy rather than become a factual answer of "no". This small module does not implement the storage adapter's outage/delete behavior.

The6000-character/8-item input cap bounds this mechanical validation step; it is not a model-token budget. Before any future generation request, assemble the final authorized evidence payload, count its actual request representation and reserve output capacity as in the token-budget lesson. Raw model output needs a byte cap before parsing at its transport boundary too. Pydantic field lengths operate after raw input already exists.

## Citation validity is only one check

check_answer verifies schema, known IDs, exact quotes and explicit abstention. It does not prove that answer claims are entailed by the cited passage, that quotations are representative, or that source content is true/current. A misleading answer can quote a genuine but irrelevant sentence. Evaluate claim support, conflicts, relevance and completeness with a human rubric and representative labeled cases; do not rename a citation-membership pass "groundedness proven".

Render answer/quotes as untrusted text using safe text rendering. Build source links on the server from authorized source IDs and locators; the model supplies no URL/HTML fields in this schema. Recheck access if the user opens a citation later. Do not disclose rejected source IDs/titles in an error. This example returns safe fixed error categories, while protected job metadata can record non-content failure codes for troubleshooting.

No evidence and negative evidence are different. Empty retrieval results should produce insufficient_evidence with an empty answer/citation list in this contract, not "the feature does not exist". Conflicting sources may require a comparison with separately supported claims or an explicit review state. The two-state teaching DTO is intentionally narrower; extend it/version it when the product needs a conflict/review outcome rather than smuggling that outcome into an apparently successful answer.

## Executable provenance and citation checks

<<< ../workbench/applied-ai/python/lab_tests/test_evidence.py


## Practice and acceptance

[Separate exercises and acceptance criteria](../practice/applied-ai/chapters/retrieval-context.md).

Official references checked2026-10-21: [retrieval and synthesis context](https://developers.openai.com/api/docs/guides/retrieval), [citation source/locator behavior](https://developers.openai.com/api/docs/guides/citation-formatting), [extraction/identity baseline](./document-processing.md), [compatible similarity spaces](./embeddings-and-similarity.md), [actual-payload token admission](./token-budgets.md). The application uses its own typed citation DTO rather than provider-specific inline marker syntax.
