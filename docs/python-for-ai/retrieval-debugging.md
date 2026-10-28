# Retrieval Debugging, Freshness and Regression Cases

Use this intermediate lesson after [persistent vector lifecycles](./vector-storage-lifecycle.md), [evidence verification](./retrieval-context.md) and the [evaluation lab](./evaluation-lab.md). Keep the same Python3.13/SQLite exact-scan fixture. A plausible wrong answer is an observed symptom; diagnose the pipeline stage before changing the prompt or buying a larger model. All incidents and numeric results below are **authored local fixtures**, not production outcomes or model-quality claims.

## Three different duplicate problems

| Duplicate | Example | Policy and trade-off |
|---|---|---|
| Same ingest operation/key | Retried source a/version H into generation g | Upsert the stable source/chunk identity; do not append another row. The store already tests this. |
| Exact equal content across sources | a and a_copy have identical UTF-8 text | Keep source identities/ACL/provenance distinct in storage. Optionally collapse authorized evidence groups for context diversity; retain a deterministic representative and explicit aliases. |
| Near duplicate/overlapping meaning | Two chunks repeat a definition but differ in date, exception or table row | Similarity is not equality. Compare structure/spans and evaluate loss of qualifiers; do not delete the only distinct exception because cosine is high. |

A content hash identifies byte equality under a declared extraction/normalization policy, not author identity or permission. A normalized hash may coalesce whitespace/format changes; preserve original bytes/locators and version the policy. Boilerplate stripping can accidentally remove legal conditions or code indentation. Scope any embedding-computation cache to a reviewed privacy policy; a cross-tenant hash lookup can itself expose content membership. Never merge ACLs or reveal another tenant's duplicate source names to save embedding cost.

The following bounded selector preserves the first ranked representative of each **exact** content hash. Input is current authorized resolved metadata. It does not fetch sources, check permissions, identify semantic duplicates or rewrite citations.

<<< ../workbench/applied-ai/python/study_ai/retrieval_debugging.py


For the fixture's whole-source chunk, the version hash is also the content hash. A multi-chunk adapter must use each exact chunk content hash and retain its source/version/span identity. Filtering duplicate hashes before resolving current access is unsafe. After choosing a representative, citation resolution still follows its original authorized provenance.

Deduplicating only top2 can leave one item and cannot recover a third source. Retrieve a bounded larger candidate set, resolve current authority/version, group equal evidence and select up to the context budget. Oversampling costs work and does not guarantee coverage; still honor maximum candidates, deadlines and token admission. For near duplicates, compare per-source caps/MMR-style diversity with the unmodified ranking on labeled questions. Diversity may hurt a task needing multiple adjacent chunks from the same source. Pin any algorithm/threshold and measure rather than treating it as a universal improvement.

## Freshness is an observable lifecycle

An index can be available and stale. Distinguish source publish time, observed ingestion time, embedding completion, active-generation time and query evidence-read time. Record safe source/version identifiers and event times under the retention policy; do not log private passages to debug lag. Define the workload's allowed freshness delay and what happens when it is exceeded. This fixture immediately excludes a vector whose source version is old, trading temporary answer availability for current evidence.

Useful measures include current authorized source/chunk count, matching active-version count, pending/failed indexing jobs, oldest pending age, update-to-ready latency, deleted-source residuals and revocation-to-denial checks. A coverage ratio with a zero denominator is undefined/empty-corpus, not100% success. A high global average can hide one stale tenant or a critical policy document; inspect scoped slices. Counts require a consistent snapshot. The test below computes current versus ready counts from one SQL statement; it does not measure ingestion latency because the fixture has no timestamped worker.

Do not repair staleness by appending another copy of old text, trusting cached snippets or relaxing version checks. Reconcile the authoritative source version with queued work, discard obsolete jobs, refresh current embeddings and check generation coverage before activation. A failed parser/embedding call is an operational failure category with a bounded retry/dead-letter path; a deleted source must not be resurrected by a delayed ingest job. Use tombstones/version fencing for a real asynchronous ingest pipeline. The local store rejects indexing a currently absent source but does not implement an external queue/tombstone service.

## Locate the failed stage with an oracle experiment

| Observation / controlled experiment | Likely boundary to investigate | Evidence and next action |
|---|---|---|
| Relevant current document absent from authoritative corpus | Ingestion/source availability | Verify authorized source/version/parser outcome; no prompt can retrieve missing bytes |
| Document exists but authorized candidate set misses it | Retrieval/query/index space/filter | Check current ACL, active generation/model/dimension, chunk boundaries and labeled Recall@k |
| Candidate found but discarded as stale/forbidden | Current authority/freshness | Preserve denial; fix index or expected permission policy rather than bypass the resolver |
| Relevant candidate found but not in final context | Reranking/dedup/token assembly | Trace safe retained IDs and drop categories; test with exactly the same token budget |
| Human-selected current evidence makes the answer correct | Retrieval/context contribution | Compare against original candidates; do not conclude the generator is always reliable |
| Human-selected evidence still produces an unsupported claim | Generation/instructions/task ambiguity | Review claim support/negation/conflict handling and repeat under the fixed model/settings |
| Quote/JSON checks pass but meaning is wrong | Semantic evaluation | Apply the human rubric; schema membership cannot prove entailment |
| Correct answer but expensive/slow | Work amplification/provider/service | Measure complete latency/failure/usage conventions from the measurement lesson |

An oracle context is a diagnostic upper-bound experiment, not the product's real retrieval score. Use only authorized reviewed evidence and keep the original question/model/settings fixed. If the task has conflicting sources or no sufficient answer, forcing a fluent answer is not a successful oracle. Distinguish empty retrieval, expected access denial, invalid output and provider/storage outage in traces and user-facing recovery states.

## A small measured comparison

The executable experiment creates a, a_copy and b. The first two are identical “Topic one”; b contributes “Topic two.” Both copies rank above b for an authored query vector. At context k2 the raw list a,a_copy covers one of two distinct labeled evidence groups: Recall=0.5. Taking three authorized candidates and selecting distinct hashes gives a,b: Recall=1 and nDCG=1 for the declared grades a=3,b=1. MRR stays1 in both because the first item was already relevant. That is why a single metric can miss duplicate crowding.

This is a declared **evidence-group** evaluation convention: equivalent copies count once, with the highest-ranked representative as the group ID. Do not label all duplicated IDs independently relevant and inflate the denominator or mark an equivalent copy irrelevant without explaining the grouping. In a real dataset, normalize candidate IDs to reviewed evidence groups before scoring and retain source-level provenance separately. The hand-authored toy labels/vectors are not a held-out semantic retrieval benchmark. Measure baseline and candidate on the same corpus, ACL snapshot, query set, k, group/grade policy and workload before rollout. Report per-query failures/slices and latency/cost as well as macro scores.

<<< ../workbench/applied-ai/python/lab_tests/test_retrieval_debugging.py


## Turn a failure into a durable regression

Synthetic case `RAG-STALE-001`: a candidate was retrieved, then its source changed before evidence publication. A tempting fallback would use the old cached quote when revalidation fails. The expected behavior is to reject that candidate and produce the explicit insufficient-evidence contract; never fabricate an answer from the stale excerpt. The test above demonstrates both the version rejection and empty answer/citations. It makes no provider call and does not claim the model chose the correct response.

For an actual reported failure, create a minimized authorized/sanitized fixture and a versioned case record:

- Stable case ID, symptom and affected user task; separate facts from hypotheses.
- Reproduction prerequisites: source/version/ACL snapshot, extraction/chunk/index generation, model/prompt/config versions and bounded input.
- Expected category and hard safety gates; reviewed relevance/answer-support labels with uncertainty recorded.
- Failing test or captured baseline, smallest repair and evidence of pass; check nearby slices rather than tune only the one case.
- Retention/privacy approval for any real data, owner and review trigger. Keep sensitive raw reports in their proper restricted system, not a public test repository.

Put deterministic authorization/version/schema regressions in ordinary CI. Put provider-dependent semantic cases in a versioned evaluation suite with declared repeat/budget policy, adjudication and rollback thresholds. A production failure added to development becomes known training/selection evidence: it is no longer an untouched held-out estimate. Keep a separate representative holdout and review aggregate/slice regressions before changing the release gate. An unresolved root cause remains an explicit hypothesis; writing a case does not prove the repair or professional experience.

[Related learner criteria](../practice/applied-ai/chapters/retrieval-debugging.md).

**Validation performed:** strict mypy passed the exact selector. Twenty-one offline tests passed:7 debugging cases and14 existing retrieval-metric cases. Actual SQLite checks demonstrate candidate crowding, distinct-content selection and declared score changes, stale coverage/version rejection, and explicit abstention. A mechanically valid contradictory answer remains a documented semantic failure. No real production incident, ANN/model benchmark, automated semantic judge, queue freshness SLO or live generation experiment was performed.

References: [existing evaluation criteria/metrics/rubric](./evaluation-lab.md), [latency/cost comparison conventions](./evaluation-measurements.md), [current-source evidence contract](./retrieval-context.md), [Python sqlite3 transaction documentation](https://docs.python.org/3.13/library/sqlite3.html). Runtime/source documentation checked2026-10-25; the local fixtures supply the measured results above.
