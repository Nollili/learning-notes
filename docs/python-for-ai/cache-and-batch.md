# Caching, Batch Work and the Cost–Latency Decision

Continue [task economics](./model-economics.md) and [measurement conventions](./evaluation-measurements.md). This intermediate lesson uses Python3.13 and the existing hypothetical rates. It supplies cache identity and result-correlation cores, not a deployed cache or live Batch adapter. Match the selected model/API's current contract rather than copy old cache/Batch assumptions.

## Distinguish three caches

| Cache | Reused artifact | Required correctness boundary |
|---|---|---|
| Embedding | Vector for exact content plus pinned embedding/preprocessing space | Source/version/provenance and privacy-scoped computation policy; not a cached permission grant |
| Provider prompt/KV | Eligible rendered input prefix | Model/settings/lookup-boundary and retention rules; generation still runs |
| Application response | Previously checked final answer | Current authenticated access, all answer-affecting inputs/source versions, TTL/invalidation and supported task semantics |

Provider prompt reuse does not return the previous answer. Output tokens are generated again and may differ. Stable instructions/shared material early in the request can help, but a matching text prefix alone is insufficient under some current models' lookup-boundary rules. Check the official model-specific implicit/explicit breakpoint behavior, minimum lengths, write/read charges and retention; measure actual cached usage. Do not assume an old automatic-caching recipe works unchanged. Do not add useless tokens merely to reach a threshold without evaluating total cost/quality. These API details were checked2026-10-25; no live hit rate was measured.

Application response caching is a product policy: a live stock price, mutable account balance or tool mutation is not interchangeable with a static document answer. TTL bounds age, not truth or current permission. Authorize before every cache read and before returning/opening citations. Reconstruct the key from current trusted revisions; never accept a client-supplied cache key as authority. A revoked user must not retrieve an old private answer even while its TTL is valid. Invalidate deleted/updated source derivatives and histories under the retention policy.

## A narrow, versioned response-cache identity

This stateless text endpoint has one question and at most8 ordered source versions. The trusted settings revision must cover locale, retrieval/reranking policy, generation settings and any other fixed answer-affecting configuration. History, personalized state, images or dynamic tools are **outside** this endpoint; add their reviewed identities to a versioned contract before caching them. Pin/record actual model revision rather than assume a mutable alias is a stable key. Preserve source order because it changes the rendered context. A sorted set would accidentally reuse an answer across different evidence orderings.

<<< ../workbench/applied-ai/python/study_ai/cache_batch.py


The hash avoids storing raw question text in the key string; it does not encrypt content, prevent guessing or make the cached value safe. Keep values/logs private. Use a bounded maintained TTL/LRU cache adapter with maximum entries, total serialized bytes, per-value bytes, eviction, owned clock and failure policy. Store only bounded accepted answer DTOs with provenance, never arbitrary provider objects or secrets. A miss or storage failure follows the normal authorized generation path under its budget; stale private data is not a fallback. Cache stampedes require bounded single-flight/admission, not unlimited identical calls.

This lesson intentionally supplies no cache storage/eviction implementation and makes no hit/TTL correctness claim.

A permission revision is an authoritative current ACL version, not a generated value. Even a perfect key cannot replace a fresh authorization decision. After a source update the new hash creates a miss; old cache entries still need expiry/deletion from storage. Current keys prevent accidental reuse, while lifecycle policy handles retained bytes. Test account switch, source deletion, key settings changes and citation access separately.

## Batch independent work with stable IDs

Use asynchronous batching for noninteractive independent tasks such as an authorized offline evaluation or index preparation. It is a different workload from an interactive answer. Current OpenAI Batch accepts JSONL requests with unique `custom_id` values and returns results whose line order may differ. Join by identity, never zip input and output positions. Preserve completed work and explicit failures/missing requests when a batch expires or partially finishes; reconcile before bounded retry. An upload/batch timeout is not proof submission failed. Persist provider batch/file IDs and the immutable input manifest; avoid blind resubmission and duplicate charges.

Conceptual Responses request row, with the **configured supported model** substituted during controlled manifest creation:

```json
{"custom_id":"case_a","method":"POST","url":"/v1/responses","body":{"model":"REPLACE_WITH_CONFIGURED_MODEL","input":"Classify this authorized fixture.","max_output_tokens":100}}
```

The placeholder is not a runnable model ID. Use the selected endpoint's validated body/schema/model support and current Batch limits. Never upload private evaluation/source data merely because it is convenient; provider/file retention and allowed processing must fit policy. This lesson makes no fixed discount/window/retention promise: verify current endpoint/tier documentation for a real run.

`correlate` above operates after a bounded provider adapter has parsed the exact envelope, checked HTTP/provider outcome and applied the normal answer schema/support/security acceptance. Its `accepted` status is an application judgment, not HTTP200. Its small DTOs are trusted projections; Python dataclasses do not validate arbitrary JSON. Bound file/line bytes before decoding and reject malformed/duplicate IDs. Preserve raw errors only in appropriately restricted operational storage if permitted; the projected failed outcome has empty text. A missing result is `None`, distinct from an explicit failed result and from a valid abstention.

For a cancelled/expired batch, reconcile its terminal output/error files and actual usage before deciding which IDs can retry. Re-authorize sources at publication: a job submitted yesterday does not preserve access indefinitely. For write-like work, keep approved-command/idempotency semantics; asynchronous throughput does not authorize external side effects. None of this code uploads a file, polls a provider, performs a tool mutation or submits a billable batch.

## Compare the complete workload

Under the hypothetical rates,1000 input/100 output tokens cost2800 micro-USD when none is cached. With800 of those input tokens marked cached, the same totals cost1600. Ten cold calls cost28000; two cold plus eight warm cost18400. Output still costs in every call. These numbers exclude cache-write pricing, storage, tools, retries and other fees; they illustrate the existing simple calculator, not current provider-cache economics. A full-response hit has a different processing/quality policy and must not be counted as a prompt-cache hit. Report both hit rates with their denominators and cold misses.

For a candidate compare total scheduled/completed/accepted/failed tasks, known/unknown spend, cost per accepted task, p50/p95/p99 end-to-end latency, cold/warm slices, queue delay and support/security outcomes. A batch may lower a unit cost while missing an interactive deadline. A response cache may improve p95 while five percent of misses remain slow or stale. A cheaper model with retries can cost more per accepted task. Keep quality gates from the previous lesson and evaluate these coupled effects before promotion.

**Tail example:**95 synthetic1ms hits and5 synthetic1000ms misses give nearest-rank p95=1ms and p99=1000ms. Reporting p95 alone hides the cold path. Small samples and different percentile conventions need explicit interpretation. No production distribution was sampled.

**Critical path example:** after20ms authorization, two independent authorized retrieval branches take40ms and60ms; generation takes300ms and validation10ms. Serial=430ms; parallel branches=390ms, excluding scheduling/queue overhead. Dependent rewrite→retrieval cannot be parallelized without changing semantics. Parallelizing everything may raise concurrency, cost and tail latency; cap fan-out and cancel only work no longer needed. Streaming can improve perceived draft arrival while leaving validated-final latency unchanged. Do not render unsafe partial output as an accepted result just to improve a timing number.

## Executable checks and learner acceptance

<<< ../workbench/applied-ai/python/lab_tests/test_cache_batch.py

[Separate learner criteria](../practice/applied-ai/chapters/cache-and-batch.md).

**Validation performed:** exact identity/correlation module passed strict mypy. Eleven offline tests passed:3 cache/batch/workload cases and8 existing measurement cases. Tests change every identity component and source order/version, reject duplicate source/manifest/outcome IDs and foreign results, preserve failed/missing outcomes, and check hypothetical token totals, declared tail percentiles and critical-path arithmetic. No actual cache storage/TTL/browser, provider cache/batch, current prices, billing or service performance was tested.

Official references checked2026-10-25: [prompt caching and model-specific lookup behavior](https://developers.openai.com/api/docs/guides/prompt-caching), [Batch request/result lifecycle](https://developers.openai.com/api/docs/guides/batch), [latency optimization](https://developers.openai.com/api/docs/guides/latency-optimization), [cost optimization](https://developers.openai.com/api/docs/guides/cost-optimization). Recheck current contracts before live use.
