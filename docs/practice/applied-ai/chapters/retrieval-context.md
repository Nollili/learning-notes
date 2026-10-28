# Verified Evidence Spans and Citation Boundaries — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/retrieval-context.md)

## Practice and acceptance

Read a two-section note with one cross-boundary fact and one code/table example. Compare baseline line chunks with structure-aware chunks, recording lost context, duplicated evidence and actual model-token counts. Reconstruct each retained citation from its immutable source version and exact locator/span. Simulate a source edit and a permission revocation between search and fetch; neither old private text nor a stale citation may reach the answer.

Add a genuine but irrelevant quote supporting an incorrect answer and demonstrate why mechanical validation passes while semantic evaluation must fail. Test empty/unknown/duplicate citations, invented quotations, wrong source/extractor versions, Unicode span boundaries, insufficient-evidence output and a user opening a citation after access changes. Preserve a recoverable job state for source/transport outages rather than report an invented factual conclusion.

**Acceptance:** strict checks/tests pass; every published citation resolves to supplied authorized evidence at the checked source version; no-evidence and malformed-answer cases remain distinct; unsupported semantic claims are assessed separately from schema/quote membership. Real generation, durable versioned storage, token-aware structure chunker, browser citation UI, ongoing authorization/deletion lifecycle and learner practice remain unperformed. This lesson provides the intermediate provenance/citation contract and chunk-design reasoning, not a complete production RAG service.
