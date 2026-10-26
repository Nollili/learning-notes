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

```python
# study_ai/cache_batch.py
from __future__ import annotations
import hashlib
import json
import re
from collections.abc import Sequence
from dataclasses import dataclass
from typing import Literal


def cache_identity(*, tenant: str, subject: str, permission_revision: str, model_revision: str,
                   prompt_revision: str, schema_revision: str, settings_revision: str,
                   sources: Sequence[tuple[str,str]], question: str) -> str:
    fields=[tenant,subject,permission_revision,model_revision,prompt_revision,schema_revision,settings_revision]
    if any(not value or len(value)>128 for value in fields) or not question.strip() or len(question)>512:
        raise ValueError('Invalid cache identity')
    if len(sources)>8 or len({name for name,_version in sources})!=len(sources):
        raise ValueError('Invalid source snapshot')
    for name,version in sources:
        if not re.fullmatch(r'[A-Za-z0-9_-]{1,64}',name) or not re.fullmatch(r'[a-f0-9]{64}',version):
            raise ValueError('Invalid source snapshot')
    payload=json.dumps(['answer-cache:v1',fields,list(sources),question],ensure_ascii=False,
                       separators=(',',':')).encode('utf-8',errors='strict')
    return hashlib.sha256(payload).hexdigest()


@dataclass(frozen=True, slots=True)
class BatchOutcome:
    custom_id: str
    status: Literal['accepted','failed']
    text: str


def correlate(expected: Sequence[str], outcomes: Sequence[BatchOutcome]) -> tuple[BatchOutcome | None,...]:
    if not 1<=len(expected)<=100 or len(set(expected))!=len(expected) or len(outcomes)>100:
        raise ValueError('Invalid batch budget')
    if any(not re.fullmatch(r'[A-Za-z0-9_-]{1,64}',identity) for identity in expected):
        raise ValueError('Invalid manifest')
    by_id: dict[str,BatchOutcome]={}
    for outcome in outcomes:
        if (outcome.custom_id not in expected or outcome.custom_id in by_id
                or outcome.status not in ('accepted','failed') or len(outcome.text)>1200
                or (outcome.status=='failed' and outcome.text)):
            raise ValueError('Invalid batch outcome')
        outcome.text.encode('utf-8',errors='strict')
        by_id[outcome.custom_id]=outcome
    return tuple(by_id.get(identity) for identity in expected)
```

The hash avoids storing raw question text in the key string; it does not encrypt content, prevent guessing or make the cached value safe. Keep values/logs private. Use a bounded maintained TTL/LRU cache adapter with maximum entries, total serialized bytes, per-value bytes, eviction, owned clock and failure policy. Store only bounded accepted answer DTOs with provenance, never arbitrary provider objects or secrets. A miss or storage failure follows the normal authorized generation path under its budget; stale private data is not a fallback. Cache stampedes require bounded single-flight/admission, not unlimited identical calls. This lesson intentionally supplies no cache storage/eviction implementation and makes no hit/TTL correctness claim.

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

```python
# lab_tests/test_cache_batch.py
from dataclasses import replace
from decimal import Decimal
import pytest
from study_ai.cache_batch import cache_identity,correlate,BatchOutcome
from study_ai.eval_measurements import Usage,Rates,token_micro_usd,nearest_rank_ms

BASE=dict(tenant='t',subject='alice',permission_revision='acl1',model_revision='model1',prompt_revision='p1',
 schema_revision='s1',settings_revision='settings1',sources=[('a','0'*64),('b','1'*64)],question='What changed?')

def test_cache_namespace_and_source_snapshot():
    key=cache_identity(**BASE)
    assert key!=cache_identity(**{**BASE,'sources':list(reversed(BASE['sources']))})
    for field in ['tenant','subject','permission_revision','model_revision','prompt_revision','schema_revision','settings_revision','question']:
        assert key!=cache_identity(**{**BASE,field:'different'})
    assert key!=cache_identity(**{**BASE,'sources':[('a','2'*64),('b','1'*64)]})
    assert key!=cache_identity(**{**BASE,'sources':[('a','0'*64)]})
    with pytest.raises(ValueError):cache_identity(**{**BASE,'sources':[('a','0'*64),('a','0'*64)]})


def test_unordered_partial_batch_is_joined_by_identity():
    a=BatchOutcome('a','accepted','Checked answer');b=BatchOutcome('b','failed','')
    assert correlate(['a','b','c'],[b,a])==(a,b,None)
    assert correlate(['a'],[])==(None,)
    with pytest.raises(ValueError):correlate(['a','b'],[a,a])
    with pytest.raises(ValueError):correlate(['a'],[replace(a,custom_id='unknown')])
    with pytest.raises(ValueError):correlate(['a','a'],[])
    with pytest.raises(ValueError):correlate(['b'],[replace(b,text='PRIVATE_ERROR')])


def test_synthetic_cost_tail_and_critical_path():
    rates=Rates(2_000_000,500_000,8_000_000)
    cold=token_micro_usd(Usage(input_tokens=1000,cached_input_tokens=0,output_tokens=100,reasoning_tokens=20),rates)
    warm=token_micro_usd(Usage(input_tokens=1000,cached_input_tokens=800,output_tokens=100,reasoning_tokens=20),rates)
    assert cold==Decimal(2800) and warm==Decimal(1600)
    # Prompt reuse still generates output; an authorized full-response hit is a different policy.
    assert 10*cold==Decimal(28000) and 2*cold+8*warm==Decimal(18400)
    samples=[1.0]*95+[1000.0]*5
    assert nearest_rank_ms(samples,0.95)==1 and nearest_rank_ms(samples,0.99)==1000
    serial=20+40+60+300+10;parallel=20+max(40,60)+300+10
    assert (serial,parallel)==(430,390)  # authored stage durations, not measured service timings
```

**Practice:** implement a private bounded cache adapter and prove current authorization/revision checks before reads, ordered context identity, TTL/byte/entry eviction and no cross-user response reuse. Compare a cold/warm workload with query/corpus/model/policy versions fixed. Build a disposable batch manifest and controlled shuffled/partial/error output fixtures; correlate every input exactly once and retain unresolved statuses. Reconcile an ambiguous submission before retrying. Measure complete task cost/latency under both interactive and background deadlines and explain one candidate rejected for quality or deadline failure despite lower unit cost. Live submissions require an authorized data/rate/budget plan; the provided tests themselves make no network calls. Learner implementation and measurements remain required.

**Validation performed:** exact identity/correlation module passed strict mypy. Eleven offline tests passed:3 cache/batch/workload cases and8 existing measurement cases. Tests change every identity component and source order/version, reject duplicate source/manifest/outcome IDs and foreign results, preserve failed/missing outcomes, and check hypothetical token totals, declared tail percentiles and critical-path arithmetic. No actual cache storage/TTL/browser, provider cache/batch, current prices, billing or service performance was tested.

Official references checked2026-10-25: [prompt caching and model-specific lookup behavior](https://developers.openai.com/api/docs/guides/prompt-caching), [Batch request/result lifecycle](https://developers.openai.com/api/docs/guides/batch), [latency optimization](https://developers.openai.com/api/docs/guides/latency-optimization), [cost optimization](https://developers.openai.com/api/docs/guides/cost-optimization). Recheck current contracts before live use.
