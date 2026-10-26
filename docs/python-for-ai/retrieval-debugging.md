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

```python
# study_ai/retrieval_debugging.py
from __future__ import annotations
from collections.abc import Sequence
from dataclasses import dataclass
import re

@dataclass(frozen=True, slots=True)
class Candidate:
    source_id: str
    content_sha256: str


def distinct_content(candidates: Sequence[Candidate], *, limit: int) -> tuple[Candidate, ...]:
    # Input comes only from current, authorized source resolution, never model JSON.
    if len(candidates) > 20 or type(limit) is not int or not 1 <= limit <= 8:
        raise ValueError('Invalid candidate budget')
    ids: set[str] = set()
    hashes: set[str] = set()
    result: list[Candidate] = []
    for item in candidates:
        if (not re.fullmatch(r'[A-Za-z0-9_-]{1,64}', item.source_id)
                or not re.fullmatch(r'[a-f0-9]{64}', item.content_sha256)
                or item.source_id in ids):
            raise ValueError('Invalid candidate')
        ids.add(item.source_id)
        if item.content_sha256 not in hashes:
            hashes.add(item.content_sha256)
            if len(result) < limit:
                result.append(item)
    return tuple(result)
```

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

```python
# lab_tests/test_retrieval_debugging.py
from pathlib import Path
import pytest
from study_ai.retrieval_debugging import Candidate, distinct_content
from study_ai.retrieval_metrics import score_retrieval
from study_ai.vector_store import VectorStore
from study_ai.vector_search import Principal, VectorSpace
from study_ai.extraction import extract, chunk
from study_ai.evidence import SourceSnapshot, EvidenceRejected, resolve_evidence, check_answer

SPACE=VectorSpace('fixture-v1',2,'whole-text-v1')
P=Principal('t','alice')

def test_duplicate_crowding_and_measured_change(tmp_path: Path):
    store=VectorStore(tmp_path/'duplicates.sqlite')
    try:
        versions={}
        for name,text,vector in [('a','Topic one',[1.0,0.0]),('a_copy','Topic one',[1.0,0.0]),('b','Topic two',[0.8,0.2])]:
            versions[name]=store.publish_source('t',name,text,['alice'])
        store.generation('g',SPACE)
        for name,vector in [('a',[1.0,0.0]),('a_copy',[1.0,0.0]),('b',[0.8,0.2])]:
            store.index('g','t',name,versions[name],vector,space=SPACE)
        store.activate('g')
        ranked=store.search([1,0],principal=P,space=SPACE,top_k=3)
        candidates=[Candidate(name,version) for name,version,_score in ranked]
        assert [c.source_id for c in candidates] == ['a','a_copy','b']
        selected=distinct_content(candidates,limit=2)
        assert [c.source_id for c in selected] == ['a','b']
        # Labels judge one representative per content/evidence group for this fixture.
        grades={'a':3,'b':1}
        before=score_retrieval([c.source_id for c in candidates[:2]],grades,k=2)
        after=score_retrieval([c.source_id for c in selected],grades,k=2)
        assert before.recall_at_k == 0.5 and after.recall_at_k == 1.0
        assert before.reciprocal_rank_at_k == after.reciprocal_rank_at_k == 1.0
        assert after.ndcg_at_k == 1.0
        # Removing duplicates from only the original top2 cannot recover missing b.
        assert len(distinct_content(candidates[:2],limit=2)) == 1
    finally:store.close()


def test_stale_coverage_and_incident_becomes_regression(tmp_path: Path):
    store=VectorStore(tmp_path/'stale.sqlite')
    try:
        raw=b'Cancellation closes the client.'
        old=store.publish_source('t','a',raw.decode(),['alice'])
        store.generation('g',SPACE);store.index('g','t','a',old,[1,0],space=SPACE);store.activate('g')
        candidate=chunk(extract(raw,source_id='a',kind='text'))[0]
        assert store.search([1,0],principal=P,space=SPACE)[0][1] == old
        current=b'Cancellation stops the client wait; it does not undo a committed write.'
        store.publish_source('t','a',current.decode(),['alice'])
        # Scope health to the authorized operator/user; no foreign source list leaks.
        current_count,ready_count=store.db.execute('''SELECT count(*),sum(CASE WHEN EXISTS(
          SELECT 1 FROM vectors v JOIN active a ON a.generation=v.generation
          WHERE v.tenant=s.tenant AND v.source=s.source AND v.version=s.version) THEN 1 ELSE 0 END)
          FROM sources s WHERE s.tenant=? AND EXISTS(SELECT 1 FROM acl x
          WHERE x.tenant=s.tenant AND x.source=s.source AND x.subject=?)''',('t','alice')).fetchone()
        assert (current_count,ready_count)==(1,0)
        assert store.search([1,0],principal=P,space=SPACE)==()
        snapshot=SourceSnapshot('t',frozenset({'alice'}),'a','text',current)
        # Synthetic regression RAG-STALE-001: never fall back to the old cached excerpt.
        with pytest.raises(EvidenceRejected,match='version'):
            resolve_evidence(candidate,principal=P,snapshot=snapshot)
        checked=check_answer({'status':'insufficient_evidence','answer':'','citations':[]},evidence=[])
        assert checked.answer=='' and checked.citations==()
    finally:store.close()


def test_oracle_evidence_separates_citation_from_support():
    raw=b'Cancellation does not undo a committed write.'
    snapshot=SourceSnapshot('t',frozenset({'alice'}),'a','text',raw)
    e=resolve_evidence(chunk(extract(raw,source_id='a',kind='text'))[0],principal=P,snapshot=snapshot)
    wrong=check_answer({'status':'answered','answer':'Cancellation undoes the committed write.',
      'citations':[{'chunk_id':e.chunk_id,'quote':'committed write'}]},evidence=[e])
    assert wrong.status=='answered'  # mechanical checks pass; human support rubric must fail
    assert 'does not undo' in e.text and 'undoes' in wrong.answer


@pytest.mark.parametrize('items,limit', [([Candidate('a','0'*64),Candidate('a','1'*64)],2),([Candidate('a','bad')],2),([],True),([],9)])
def test_invalid_dedup_contract(items,limit):
    with pytest.raises(ValueError):distinct_content(items,limit=limit)
```

## Turn a failure into a durable regression

Synthetic case `RAG-STALE-001`: a candidate was retrieved, then its source changed before evidence publication. A tempting fallback would use the old cached quote when revalidation fails. The expected behavior is to reject that candidate and produce the explicit insufficient-evidence contract; never fabricate an answer from the stale excerpt. The test above demonstrates both the version rejection and empty answer/citations. It makes no provider call and does not claim the model chose the correct response.

For an actual reported failure, create a minimized authorized/sanitized fixture and a versioned case record:

- Stable case ID, symptom and affected user task; separate facts from hypotheses.
- Reproduction prerequisites: source/version/ACL snapshot, extraction/chunk/index generation, model/prompt/config versions and bounded input.
- Expected category and hard safety gates; reviewed relevance/answer-support labels with uncertainty recorded.
- Failing test or captured baseline, smallest repair and evidence of pass; check nearby slices rather than tune only the one case.
- Retention/privacy approval for any real data, owner and review trigger. Keep sensitive raw reports in their proper restricted system, not a public test repository.

Put deterministic authorization/version/schema regressions in ordinary CI. Put provider-dependent semantic cases in a versioned evaluation suite with declared repeat/budget policy, adjudication and rollback thresholds. A production failure added to development becomes known training/selection evidence: it is no longer an untouched held-out estimate. Keep a separate representative holdout and review aggregate/slice regressions before changing the release gate. An unresolved root cause remains an explicit hypothesis; writing a case does not prove the repair or professional experience.

**Practice acceptance:** reproduce duplicate crowding and explain unchanged MRR; test an inaccessible exact duplicate and conflicting near duplicate without widening ACLs or losing the exception. Measure active-version coverage before/after update, demonstrate correct empty-corpus handling, and classify an outage separately. Run original versus oracle evidence under a fixed generation configuration and retain claim-level support judgments. Convert one independently observed learner-project failure into a minimized regression record and show the test fails with the bug and passes with the correction. The synthetic fixture above is learning material; your real case, held-out evaluation, model runs and operational freshness measurements remain required.

**Validation performed:** strict mypy passed the exact selector. Twenty-one offline tests passed:7 debugging cases and14 existing retrieval-metric cases. Actual SQLite checks demonstrate candidate crowding, distinct-content selection and declared score changes, stale coverage/version rejection, and explicit abstention. A mechanically valid contradictory answer remains a documented semantic failure. No real production incident, ANN/model benchmark, automated semantic judge, queue freshness SLO or live generation experiment was performed.

References: [existing evaluation criteria/metrics/rubric](./evaluation-lab.md), [latency/cost comparison conventions](./evaluation-measurements.md), [current-source evidence contract](./retrieval-context.md), [Python sqlite3 transaction documentation](https://docs.python.org/3.13/library/sqlite3.html). Runtime/source documentation checked2026-10-25; the local fixtures supply the measured results above.
