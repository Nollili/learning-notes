# Compose the answering boundary

The existing components stop at deliberately different boundaries. `VectorStore` models one bounded whole-source chunk and exact scan; extraction/evidence support richer spans. `prepare_context` produces a counted context but does not generate an answer. The SDK classifier returns labels, not the RAG answer DTO. **Do not wire them by renaming fields and claim a complete assistant.**

## One service contract

The composition root selects an authenticated principal, current source resolver, compatible retrievers, pair scorer, token counter and answer-model adapter. Only trusted settings choose provider/model/tool access. The answer adapter must use the counted `answer_messages(payload)` and `answer_format()` unchanged, with the same model and reserved output cap.

| Step | Checked handoff | Failure policy |
|---|---|---|
| Search | Bounded source/chunk references under current scope | Unavailable store is an outage, not an empty answer |
| Resolve | Current authorized bytes/version/extractor/locator/span → Evidence | Drop stale/denied/deleted candidates; never fall back to private cached text |
| Rank/select | Bounded verified set → exact context | Preserve original question; retain safe drop reasons for diagnosis |
| Count | Final messages/schema/settings → admitted request | Counter failure stops; budget exhaustion differs from genuine no evidence |
| Generate | One owned bounded request → complete AnswerDraft proposal | Refusal/incomplete/cancellation/outage remain distinct; partial drafts are not accepted |
| Validate | Schema, known IDs, exact quotes, current source policy and support rubric | Reject invented/misleading citations; mechanical checks cannot prove claim entailment |
| Publish/open | Safe text and server-owned citation targets | Reauthorize citation opening; define the in-flight revocation boundary |

The above is an integration contract and worked design, not a new executable generation endpoint. [P-334](../../practice/applied-ai/rag-assistant.md) asks the learner to implement the missing multi-chunk storage/answer adapter. Offline fixtures may inject proposals, but must label them synthetic rather than measured model answers.

## Worked success and misleading-answer case

An authorized note says “A timeout limits waiting; it does not prove a remote write failed.” Search finds its immutable version/span; resolution checks current ACL/hash. The prompt includes the original question and that exact excerpt. A proposed answer preserves the negation and points to the span.

A second proposal says “The write definitely failed” but quotes the genuine substring “write failed.” It can satisfy substring membership while contradicting the source. Citation resolution and claim support therefore need separate evidence. A human rubric assesses whether every material claim follows from the cited permitted text, including qualifications and conflicting sources.

## Abstention and recovery

- **No relevant permitted evidence:** return the explicit insufficient-evidence DTO, with no invented answer/citations. Do not imply the underlying fact is false.
- **Conflicting evidence:** compare supported claims or use a versioned review outcome. The existing two-state DTO must be extended explicitly if that outcome is needed.
- **Outage or invalid output:** preserve a recoverable operational/validation state. It is not a successful abstention.
- **Revocation/update during the run:** re-resolve or stop under the documented publication policy. Strong “no in-flight disclosure after revoke” requires coordinated fencing/cancellation, beyond a single lookup.
- **Cancellation or interrupted stream:** close local owners, reject stale completion and retain unknown remote usage. Do not concatenate a retry onto partial output.

## Evaluate the stages and the final task

Freeze query/corpus/ACL/label/configuration versions. Measure candidate recall, ranking quality, retained-context coverage, answer support/citation correctness, appropriate abstention and end-to-end time/known-unknown cost separately. Compare lexical-only before hybrid/learned reranking. Keep source-family/time-related near duplicates in one split to reduce leakage.

A selected oracle context can locate retrieval versus generation failure, but is not the product's real retrieval score. Add observed failures to development regressions while retaining a separate confirmation holdout. PDF/OCR fidelity, production ANN, hosted retrieval, multimodal grounding and automatic semantic judges remain optional adapters requiring their own evidence.
